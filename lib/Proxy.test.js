'use strict';
var ProxyFactory = require('./Proxy');
var _ = require('lodash');
var sinon = require('sinon');

describe('Proxy', function () {
  var Proxy, config, RedisClient, Endpoint;
  beforeEach(function () {
    config = {
      debug: false,
      redsmin: {
        port: 10,
        hostname: 'ok.dev',
        key: ''
      }
    };
    RedisClient = function () {};
    Endpoint = function () {};
    Proxy = ProxyFactory(config, RedisClient, Endpoint);
  });

  it('should do what...', function () {

  });
});
