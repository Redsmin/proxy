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
    this.redis_uri = config.redis.uri;
    this.key = config.redis.key;
    this.auth = config.redis.auth;

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

    console.log('config.redsmin.key', config.redsmin.key);

    this.redsmin = new Endpoint(writeFromEndpointToRedis, config.redsmin.key, {
      auth: this.auth
    });
    this.redis = new RedisClient(writeFromRedisToEndpoint);

    // Start redis connection
    this.redis.connect(this.redis_uri);
    // Start endpoint connection
    this.redsmin.connect(config.redsmin.port, config.redsmin.hostname);
  };

  return Proxy;
};
