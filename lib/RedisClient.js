'use strict';

var _ = require('lodash');
var url = require('url');
var backoff = require('backoff');
var EventEmitter = require('events').EventEmitter;
var assert = require('assert');

module.exports = function (log, net) {
  assert(_.isObject(log));
  assert(_.isObject(net));


  /**
   * @class Redis client
   * @param {Function} fnWrite `callback(data)` where to write datas from redis
   */
  function RedisClient(fnWrite, endpoint) {
    _.extend(this, EventEmitter);
    _.bindAll(this, _.functionsIn(this));

    if (!fnWrite || typeof fnWrite !== 'function') {
      throw new Error("RedisClient `fnWrite` parameter is not defined or is not a function");
    }

    this.connected = false;
    this.endpoint = endpoint;

    /**
     * Endpoint instance
     * @type {Endpoint}
     */
    this.fnWrite = fnWrite;

    this.port = null;
    this.hostname = null;
    this.socket = null;

    this.backoff = backoff.fibonacci({
      initialTimeout: 1,
      maxTimeout: 1000
    });

    this.backoff.on('backoff', this.reconnect);
  }

  _.extend(RedisClient.prototype, require('events').EventEmitter.prototype, {
    PREFIX: 'redis://',

    updatePortAndHostname: function (uri) {
      uri = uri || this.PREFIX + '127.0.0.1:6379';

      if (uri[0] !== '/' && uri.indexOf(this.PREFIX) !== 0) { // add "redis://" if it was not specified
        uri = this.PREFIX + uri;
      }

      if (uri[0] !== '/') { // not a socket path
        var parsedUri = url.parse(uri);
        this.uri = uri;
        this.port = parsedUri.port ||  6379;
        this.hostname = parsedUri.hostname || '127.0.0.1';
      } else {
        this.uri = uri; // a socket path
        this.port = null;
        this.hostname = null;
      }

    },

    connect: function (uri) {
      this.updatePortAndHostname(uri);
      this._connect();
    },

    _connect: function () {
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.destroy();
      }

      if (this.port && this.hostname) {
        // port
        this.socket = net.createConnection(this.port, this.hostname, this.onConnected);
      } else {
        // socket
        this.socket = net.createConnection({
          path: this.uri
        }, this.onConnected);
      }

      /**
       * Enable/disable keep-alive functionality, and optionally set the initial delay
       * before the first keepalive probe is sent on an idle socket. enable defaults to false.
       */
      this.socket.setKeepAlive(true);

      /**
       * Disables the Nagle algorithm. By default TCP connections use the Nagle algorithm,
       * they buffer data before sending it off. Setting true for noDelay will immediately
       * fire off data each time socket.write() is called. noDelay defaults to true.
       */
      this.socket.setNoDelay(true);

      this.socket.setTimeout(0);

      this.socket.on('data', this.onData);
      this.socket.on('close', this.onClose);
      this.socket.on('error', this.onError);
    },

    reconnect: function ( /*number , delay*/ ) {
      if (this.connected) {
        return this.backoff.reset();
      }

      log.info("[RedisClient] Reconnecting...");
      this._connect();
    },

    onConnected: function () {
      this.connected = true;
      this.backoff.reset();
      log.info("[RedisClient] Redis client connected to " + this.uri);
      this.emit('connect');
    },

    /**
     * Forward data from Redis to the fnWrite
     * @param  {String} data data from redis
     */
    onData: function (data) {
      this.fnWrite(data);
    },

    /**
     * Forward data from elsewhere to Redis
     */
    write: function (data) {
      this.socket.write(data);
    },

    /**
     * If the connection to redis just closed, try to reconnect
     * @param  {Error} err
     */
    onClose: function (err) {
      log.error("Redis client closed " + (err ? err.message : ''));
      this.connected = false;
      this.emit('close', err);
      this.backoff.reset();
      this.backoff.backoff();
    },

    onError: function (err) {
      if (!err) {
        return;
      }

      log.error('Redis client error ' + (err ? err.message : ''));
    }
  });

  return RedisClient;
};
