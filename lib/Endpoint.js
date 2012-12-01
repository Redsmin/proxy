var url     = require('url')
,   _       = require('lodash')
,   fs      = require('fs')
,   Backoff = require('backoff')
,   jsonPackage = JSON.parse(fs.readFileSync(__dirname + '/../package.json'));

/**
 * Endpoint (redsmin)
 * @param {Function} fnWrite `callback(data)` where to write datas from the endpoint
 * @param {String} key     Connection key
 * @param {Object} opts    Optional parameters
 */
function Endpoint(fnWrite, key, opts){
  _.extend(this, require('events').EventEmitter);
  _.bindAll(this);
  opts = opts || {};

  if(!fnWrite || typeof fnWrite !== 'function'){
    throw new Error("Endpoint `fnWrite` parameter is not defined or is not a function");
  }

  if(!key){
    throw new Error("Endpoint `key` parameter is not defined");
  }

  this.uri = null;
  this.key = key;
  this.port = null;
  this.hostname = null;
  this.handshaken = false;
  this.connected = false;
  this.socket = null;
  this.fnWrite = fnWrite;

  this.handshakenBackoff = new Backoff({
      initialTimeout: opts.initialTimeout || 500,
      maxTimeout: opts.maxTimeout || 10000
  });

  this.handshakenBackoff.on('backoff', this.reconnect);

  this.reconnectBackoff = new Backoff({
      initialTimeout: opts.initialTimeout || 500,
      maxTimeout: opts.maxTimeout || 10000
  });

  this.reconnectBackoff.on('backoff', this.reconnect);
}

Endpoint.tls = require('net'); //require('tls');
Endpoint.log = _.extend(console, {debug: console.log.bind(console)});
Endpoint.process = process;

_.extend(Endpoint.prototype, require('events').EventEmitter.prototype, {

  connect:function(port, hostname){
    this.port = port || 443;
    this.hostname = hostname || 'ssl.redsmin.com';
    this.uri = this.hostname + ':' + this.port;
    this._connect();
  },

  _connect:function(){
    if(this.socket){
      this.socket.removeAllListeners();
      this.socket.destroy();
    }

    Endpoint.log.info("[Endpoint] Connecting to "+this.uri+"...");

    //this.port = 8100;
    //this.hostname = '127.0.0.1';
    this.socket = Endpoint.tls.connect(this.port, this.hostname, this.onConnected);
    this.socket.on('data', this.onData);
    this.socket.on('close', this.onClose);
    this.socket.on('error', this.onError);

    this.socket.setTimeout(0);
    this.socket.setNoDelay();
    this.socket.setKeepAlive(true);
  },

  reconnect:function(number, delay){
    if(this.connected){
      // If, between the .backoff() call and the call to reconnect
      // we are already back online, don't do anything else
      return this.reconnectBackoff.reset();
    }

    Endpoint.log.info("[Endpoint] Reconnecting...");
    this._connect();
  },

  onConnected: function(){
    // callback called only after successful socket connection
    // if (this.socket.authorized) {
    //   // authorization successful
    //   this.socket.setEncoding('utf-8');

    //   //connected(this.socket);
    // } else {
    //   // authorization failed
    //   console.log('authorizationError', this.socket.authorizationError);
    //   // @todo reconnectBackoff.backoff();
    //   //return;
    // }
    Endpoint.log.debug("[Endpoint] Connected");

    this.connected = true;
    this.reconnectBackoff.reset();

    // Todo penser à remettre hanshaken à false si
    if(!this.handshaken){
      this._sendHandshake();
    }

    this.emit('connect');
  },

  _sendHandshake: function(){
    if(this.handshaken){return this.handshakenBackoff.reset();}
    Endpoint.log.debug("[Endpoint] Handshaking...");
    this.socket.write(JSON.stringify({version:jsonPackage.version, key: this.key}));
  },

  onData:function(data){
    if(!this.handshaken){
      data = (data || '').toString();
      var handshake = data;

      if(data.indexOf('*') === -1){
        data = null;
      } else { // in case of multiple messages after the handshake
        var idx = handshake.indexOf('*');
        handshake = data.substr(0, idx);
        data = data.substr(idx);
      }

      try{
        var json = JSON.parse(handshake);

        if(json && json.error){
          Endpoint.log.error('[Endpoint] Handshake failed: ' + json.error);
          Endpoint.log.error('Find and edit the configuration file with "redsmin edit"');
          Endpoint.log.error('Exiting...');
          Endpoint.process.exit(1);
          return;
        }


      } catch(err){
        Endpoint.log.error('[Endpoint] Bad handshake response:' + handshake);
        return this.handshakenBackoff.backoff();
      }

      Endpoint.log.debug('[Endpoint] Handshake succeeded');
      this.handshaken = true;

      if(!data){return;}
    }

    this.fnWrite(data);
  },

  /**
   * Forward data from redis to the endpoint
   */
  write: function(data){
    this.socket.write(data);
  },

  /**
   * If the connection to redsmin just closed, try to reconnect
   * @param  {Error} err
   */
  onClose: function(sourceWasAnError){
    Endpoint.log.error("[Endpoint] Connection closed " + (sourceWasAnError ? 'because of an error' : ''));

    this.handshakenBackoff.reset();
    this.reconnectBackoff.backoff();

    this.connected = false;
    this.handshaken = false;

    this.emit('close', sourceWasAnError);
  },

  onError: function(err){
    if(!err){
      return;
    }

    Endpoint.log.error('[Endpoint] Error ' + (err ? err.message : ''));
  }

});

module.exports = Endpoint;
