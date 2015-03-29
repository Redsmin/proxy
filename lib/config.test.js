'use strict';
var configFactory = require('./config');
var t = require('chai').assert;
var fs = require('fs');
var path = require('path');

describe('config', function () {
  var Config;

  beforeEach(function (done) {
    delete process.env.REDIS_URI;
    delete process.env.REDIS_AUTH;
    Config = configFactory(console);
    done();
  });

  it('should return a configuration', function () {
    var config = new Config(path.resolve(__dirname, '../test/fixtures/redsmin_default.json'));
    t.strictEqual(config.redis.auth, null);
    t.strictEqual(config.redis.uri, 'redis://127.0.0.1:6379');

    t.strictEqual(config.redsmin.key, '5331e06500617e0b0a0000aa');
    t.strictEqual(config.redsmin.port, 993);
    t.strictEqual(config.redsmin.hostname, 'ssl.redsmin.com');
  });

  it('should use env vars if defined', function () {
    process.env.REDIS_URI = '/tmp/redis.sock';
    process.env.REDIS_AUTH = 'aaaa';
    var config = new Config(path.resolve(__dirname, '../test/fixtures/redsmin_default.json'));
    t.strictEqual(config.redis.uri, process.env.REDIS_URI);
    t.strictEqual(config.redis.auth, process.env.REDIS_AUTH);
  });
});
