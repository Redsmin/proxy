var _       = require('lodash')
,   url     = require('url')
,   Backoff = require('backoff');

/**
 * @class Redis client
 * @param {Function} fnWrite `callback(data)` where to write datas from redis
 * @param {Object} opts [optiona] optionals parameters
 */
function RedisClient(fnWrite, opts){
    _.extend(this, require('events').EventEmitter);
    _.bindAll(this);
    opts = opts || {};

    if(!fnWrite || typeof fnWrite !== 'function'){
      throw new Error("RedisClient `fnWrite` parameter is not defined or is not a function");
    }

    this.connected = false;

    /**
     * Endpoint instance
     * @type {Endpoint}
     */
    this.fnWrite   = fnWrite;

    this.port      = null;
    this.hostname  = null;
    this.socket    = null;

    this.backoff   = new Backoff({
        initialTimeout: opts.initialTimeout || 1,
        maxTimeout: opts.maxTimeout || 1000
    });

    this.backoff.on('backoff', this.reconnect);
}

RedisClient.net = require('net');
RedisClient.log = console;

_.extend(RedisClient.prototype, require('events').EventEmitter.prototype, {
  PREFIX:'redis://',

  updatePortAndHostname:function(uri){
    uri = uri || this.PREFIX + '127.0.0.1:6379';

    if(uri.indexOf(this.PREFIX) !== 0){ // add "redis://" if it was not specified
      uri = this.PREFIX + uri;
    }

    var parsedUri = url.parse(uri);
    this.uri      = uri;
    this.port     = parsedUri.port || 6379;
    this.hostname = parsedUri.hostname || '127.0.0.1';
  },

  connect:function(uri){
    this.updatePortAndHostname(uri);
    this._connect();
  },

  _connect: function(){
    if(this.socket){
      this.socket.removeAllListeners();
      this.socket.destroy();
    }

    this.socket = RedisClient.net.createConnection(this.port, this.hostname, this.onConnected);
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

  reconnect:function(number, delay){
    if(this.connected){return this.backoff.reset();}

    RedisClient.log.info("[RedisClient] Reconnecting...");
    this._connect();
  },

  onConnected: function(){
    this.connected = true;
    this.backoff.reset();
    RedisClient.log.info("[RedisClient] Redis client connected to " + this.uri);
    this.emit('connect');
  },

  /**
   * Forward data from Redis to the fnWrite
   * @param  {String} data data from redis
   */
  onData: function(data){
    this.fnWrite(data);
  },

  /**
   * Forward data from elsewhere to Redis
   */
  write: function(data){
    this.socket.write(data);
  },

  /**
   * If the connection to redis just closed, try to reconnect
   * @param  {Error} err
   */
  onClose: function(err){
    RedisClient.log.error("Redis client closed " + (err ? err.message :''));
    this.connected = false;
    this.backoff.backoff();
    this.emit('close', err);
  },

  onError: function(err){
    if(!err){
      return;
    }

    RedisClient.log.error('Redis client error ' + (err ? err.message : ''));
  }
});

module.exports = RedisClient;
