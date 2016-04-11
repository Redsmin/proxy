'use strict';

var assert = require('assert');
var _ = require('lodash');

module.exports = function (config, RedisClient, Endpoint) {
  assert(_.isObject(config));
  assert(_.isNumber(config.redsmin.port));
  assert(_.isString(config.redsmin.hostname));
  assert(_.isString(config.redsmin.key));
  assert(_.isBoolean(config.debug));
  assert(_.isFunction(RedisClient));
  assert(_.isFunction(Endpoint));

  function Proxy() {
    this.redis = null;
    this.redsmin = null;
  }

  Proxy.prototype.start = function () {
    // This will allow multiplexing in the future
    var writeFromEndpointToRedis = function (data) {
      if (config.debug) {
        console.log('Endpoint#write', data.toString());
      }
      this.redis.write(data);
    }.bind(this);

    var writeFromRedisToEndpoint = function (data) {
      if (config.debug) {
        console.log('Redis#write', data.toString());
      }
      this.redsmin.write(data);
    }.bind(this);

    this.redsmin = new Endpoint(writeFromEndpointToRedis, config.redsmin.key, config.redsmin.port, config.redsmin.hostname, {
      auth: config.redis.auth
    });

    // we pass here the endpoint, because it will be the redisclient that will handle the endpoint connection
    this.redis = new RedisClient(writeFromRedisToEndpoint);

    // Start redis connection
    this.redis.connect(config.redis.uri);

    this.redis.on('close', function(){
      this.redsmin.disconnect();
    }.bind(this));

    this.redis.on('connect', function(){
      this.redsmin.connect();
    }.bind(this));

  };

  return Proxy;
};
