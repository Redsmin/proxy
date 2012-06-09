var _       = require('lodash')
,   url     = require('url')
,   Backoff = require('backoff');

/**
 * @class Redis client
 * @param {Endpoint} endpoint The endpoint that will receive data from redis
 * @param {Object} opts [optiona] optionals parameters
 */
function RedisClient(endpoint, opts){
    _.extend(this, require('events').EventEmitter);
    _.bindAll(this);

    opts = opts || {};
    if(!endpoint){
      throw new Error("A endpoint instance is required");
    }

    this.connected = false;

    this.endpoint = endpoint;

    this.port = null;
    this.hostname = null;
    this.socket = null;

    this.backoff = new Backoff({
        initialTimeout: opts.initialTimeout || 100,
        maxTimeout: opts.maxTimeout || 1000
    });

    this.backoff.on('backoff', this.reconnect);
}

RedisClient.net = require('net');
RedisClient.log = console;

_.extend(RedisClient.prototype, require('events').EventEmitter.prototype, {
  updatePortAndHostname:function(uri){
    this.uri = uri || 'redis://127.0.0.1:6379';
    var parsedUri = url.parse(uri);
    this.port = parsedUri.port || 6379;
    this.hostname = parsedUri.hostname || '127.0.0.1';
  },

  connect:function(uri){
    this.updatePortAndHostname(uri);
    this._connect();
  },

  _connect: function(){
    if(this.socket){
      this.socket.removeAllListeners();
    }

    this.socket = RedisClient.net.createConnection(this.port, this.hostname, this.onConnected);
    this.socket.on('data', this.onData);
    this.socket.on('close', this.onClose);
    this.socket.on('error', this.onError);
  },

  reconnect:function(number, delay){
    if(this.connected){return this.backoff.reset();}

    RedisClient.log.info("Redis client reconnecting...");
    this._connect();
  },

  onConnected: function(){
    this.connected = true;
    RedisClient.log.info("Redis client connected to " + this.uri);
    this.emit('connect');
  },

  /**
   * Forward data from Redis to the endpoint
   * @param  {String} data data from redis
   */
  onData: function(data){
    this.endpoint.write(data);
  },

  /**
   * If the connection to redis just closed, try to reconnect
   * @param  {Error} err
   */
  onClose: function(err){
    RedisClient.log.error("Redis client closed " + err ? err.message :'');

    if(this.connected){
      this.backoff.backoff();
    }

    this.connected = false;
    this.emit('close', err);
  },

  onError: function(err){
    if(!err){
      return;
    }

    RedisClient.log.error('Redis client error ' + err ? err.message : '');
  }
});

module.exports = RedisClient;
