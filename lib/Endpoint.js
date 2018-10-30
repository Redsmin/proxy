'use strict';
var _ = require('lodash');
var backoff = require('backoff');
var EventEmitter = require('events').EventEmitter;
var assert = require('assert');

module.exports = function(log, jsonPackage, tls, process) {
  assert(_.isObject(log));
  assert(_.isPlainObject(jsonPackage));
  assert(_.isObject(tls));
  assert(_.isFunction(tls.connect));
  assert(_.isObject(process));

  /**
   * Endpoint (redsmin)
   * @param {Function} fnWrite `callback(data)` where to write datas from the endpoint
   * @param {String} key             Connection key
   * @param {Number,String} port     Connection-server port
   * @param {String} hostname     Connection-server hostname
   * @param {Object} opts    Optional parameters
   */
  function Endpoint(fnWrite, key, port, hostname, opts) {
    assert(_.isFunction(fnWrite));
    assert(_.isString(key));

    _.extend(this, EventEmitter);
    _.bindAll(this, _.functionsIn(this));
    opts = opts || {};

    if (!fnWrite || typeof fnWrite !== 'function') {
      throw new Error("Endpoint `fnWrite` parameter is not defined or is not a function");
    }

    if (!key) {
      throw new Error("Endpoint `key` parameter is not defined");
    }

    if (!port) {
      throw new Error("connect(port, hostname) port must be defined");
    }
    if (!hostname) {
      throw new Error("connect(port, hostname) hostname must be defined");
    }

    this.key = key;

    /**
     * redsmin ssl connection server hostname
     * @type {String}
     */
    this.hostname = hostname;

    /**
     * redsmin ssl connection server hostname
     * @type {String}
     */
    this.port = port;

    /**
     * redsmin ssl connection server hostname
     * @type {String}
     */
    this.uri = this.hostname + ':' + this.port;

    this.auth = opts.auth;
    this.handshaken = false;
    this.connected = false;
    this.connecting = false;
    this.socket = null;
    this.fnWrite = fnWrite;

    this.handshakenBackoff = backoff.fibonacci({
      initialDelay: opts.initialTimeout || 500,
      maxDelay: opts.maxTimeout || 10000
    });

    this.handshakenBackoff.on('backoff', this.reconnect);

    this.reconnectBackoff = backOff(this.reconnect, {
      min: 500,
      max: 4000,
      inc: 250
    });
  }

  _.extend(Endpoint.prototype, EventEmitter.prototype, {

    connect: function() {
      if(this.connected){
        log.debug('connect():: already connected, doing nothing');
        return;
      }

      this._connect();
    },

    disconnect: function() {
      log.debug(JSON.stringify({
        connected: this.connected,
        connecting: this.connecting,
        handshaken: this.handshaken,
        socket: !!this.socket
      }));

      if(!this.connected && !this.connecting && !this.socket){
        log.debug('disconnect():: socket already not connected, doing nothing');
        return;
      }

      // beware socket could be in connecting (this.connecting === true) state!
      if (this.socket) {
        log.debug('disconnect():: removing listeners and destroying socket');
        this.socket.removeAllListeners();
        this.socket.destroy();
        this.socket = null;
        this.onClose(new Error('Disconnect'), true);
      }
    },

    _connect: function() {
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.destroy();
      }

      if(this.connecting){
        log.debug('_connect():: already connecting, doing nothing');
        return;
      }

      this.connecting = true;
      log.info("[Endpoint] Connecting to " + this.uri + "...");

      this.socket = tls.connect(this.port, this.hostname, this.onConnected);
      this.socket.on('data', this.onData);
      this.socket.on('close', this.onClose);
      this.socket.on('error', this.onError);

      this.socket.setTimeout(0, function() {
        log.error('timeout');
      });

      this.socket.setNoDelay(true);
      this.socket.setKeepAlive(true, 30);
    },

    reconnect: function( /*number, delay*/ ) {
      if (this.connected) {
        // If, between the .backoff() call and the call to reconnect
        // we are already back online, don't do anything else
        return this.reconnectBackoff.reset();
      }

      log.info("[Endpoint] Reconnecting...");
      this._connect();
    },

    onConnected: function() {
      log.debug("[Endpoint] Connected");

      this.connecting = false;
      this.connected = true;
      this.reconnectBackoff.reset();

      if (!this.handshaken) {
        this._sendHandshake();
      }

      this.emit('connect');
    },

    _sendHandshake: function() {
      if (this.handshaken) {
        return this.handshakenBackoff.reset();
      }
      log.debug("[Endpoint] Handshaking...");
      this.socket.write(JSON.stringify({
        version: jsonPackage.version,
        key: this.key,
        auth: this.auth
      }));
    },

    onData: function(data) {
      if (!this.handshaken) {
        data = (data || '').toString();
        var handshake = data;

        if (data.indexOf('*') === -1) {
          data = null;
        } else { // in case of multiple messages after the handshake
          var idx = handshake.indexOf('*');
          handshake = data.substr(0, idx);
          data = data.substr(idx);
        }

        try {
          var json = JSON.parse(handshake);

          if (json && json.error) {
            log.error('[Endpoint] Handshake failed: ' + json.error);
            log.error('Edit configuration file with `redsmin set_key`, see http://bit.ly/YAIeAM');
            log.error('Exiting...');
            process.exit(1);
            return;
          }

        } catch (err) {
          log.error('[Endpoint] Bad handshake response:' + handshake);
          log.error(err);
          this.handshakenBackoff.reset();
          return this.handshakenBackoff.backoff();
        }

        log.debug('[Endpoint] Handshake succeeded');
        this.handshaken = true;

        if (!data) {
          return;
        }
      }

      this.fnWrite(data);
    },

    /**
     * Forward data from redis to the endpoint
     */
    write: function(data) {
      this.socket.write(data);
    },

    /**
     * If the connection to redsmin just closed, try to reconnect
     * @param  {Error} err
     * @param {Boolean} true if after the on close the Endpoint should not reconnect
     */
    onClose: function(sourceWasAnError, shouldNotReconnect) {
      log.error("[Endpoint] Connection closed " + (sourceWasAnError ? 'because of an error:' + sourceWasAnError : ''));

      this.connected = false;
      this.handshaken = false;
      this.connecting = false;

      if (!shouldNotReconnect) {
        log.debug('onClose():: reconnecting...');
        this.handshakenBackoff.reset();
        this.reconnectBackoff.backoff();
      } else {
        log.debug('onClose():: don\'t reconnect');
        this.handshakenBackoff.reset();
        this.reconnectBackoff.reset();
      }

      this.emit('close', sourceWasAnError);
    },

    onError: function(err) {
      log.error('[Endpoint] Error ' + (err ? err.message : ''));
      this.socket.destroy(); // End the socket
      try {
        this.onClose(err ? err.message : '');
      } catch (err) {
        log.error('err::onError', err);
      }
    }
  });

  return Endpoint;
};

/**
 * @param  {function} onBackoff
 * @param  {Object} options   {min, max, inc}
 * @return {object}
 */
function backOff(onBackoff, options) {
  var _timeout, _next;

  function reset() {
    clearTimeout(_timeout);
    _next = options.min;
  }

  function backoff() {
    clearTimeout(_timeout); // if backoff was called multiple times
    _timeout = setTimeout(onBackoff, Math.min(_next += options.inc, options.max));
  }

  reset();

  return {
    backoff: backoff,
    reset: reset
  };
}
