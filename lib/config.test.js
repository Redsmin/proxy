'use strict';
var configFactory = require('./config');
var t = require('chai').assert;
var fs = require('fs');
var path = require('path');

describe('config', function () {
  var Config;

  beforeEach(function (done) {
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

  describe('write', function () {
    it('should check the key', function (done) {
      var config = new Config(path.resolve(__dirname, '../test/fixtures/redsmin_default.json'));
      config.write('invalid-key', '', '', function (err) {
        t.include(err, 'Invalid connection key');
        done();
      });
    });

    it('should rewrite the configuration file', function (done) {
      var FILE = path.resolve(__dirname, '../test/fixtures/redsmin.json');
      var jsonConfig = {
        "key": "5331e06500617e0b090000aa",
        "redis": "redis://127.0.0.1:6379",
        "auth": "aa"
      };
      var KEY = 'aaaae06500617e0b090000aa';
      var REDIS = '10.10.10.10:2939';
      var AUTH = 'bb';

      fs.writeFileSync(FILE, JSON.stringify(jsonConfig), 'utf-8');
      var config = new Config(FILE);

      config.write(KEY, REDIS, AUTH, function (err) {
        t.strictEqual(err, null);

        t.strictEqual(config.redis.auth, AUTH);
        t.strictEqual(config.redis.uri, REDIS);
        t.strictEqual(config.redsmin.key, KEY);
        t.strictEqual(config.redsmin.port, 993);
        t.strictEqual(config.redsmin.hostname, 'ssl.redsmin.com');

        t.strictEqual(fs.readFileSync(FILE, 'utf-8'), JSON.stringify({
          key: KEY,
          redis: REDIS,
          auth: AUTH
        }));
        done();
      });
    });
  });

});
