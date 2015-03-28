'use strict';
var RedisClient = require('../lib/RedisClient');
var _ = require('lodash');
var sinon = require('sinon');
var Socket = require('../test/helpers/Socket');
var t = require('chai').assert;

function tcreateConnection(t, host, hostname) {
  return function (_host, _hostname, cb) {
    if (t) {
      t.equal(_host, host);
      t.equal(_hostname, hostname);
    }
    cb();

    return new Socket();
  };
}

function stubRedsminEndpoint(fn) {
  return fn || function () {};
}

// Quiet console output
RedisClient.log = sinon.stub(_.clone(console));


describe('RedisClient', function () {
  var R, endpoint;
  var HOST = '127.0.1.1';
  var PORT = 6378;

  beforeEach(function () {
    endpoint = stubRedsminEndpoint();
    R = new RedisClient(endpoint);
  });

  afterEach(function (done) {
    done();
  });

  it('should global', function (done) {
    t.equal(typeof RedisClient, 'function', 'should be a function.');
    t.equal(typeof RedisClient.net, 'object', '.net should be a object.');
    done();
  });

  it('should constructor', function (done) {
    done();
  });

  it('should connect', function (done) {
    RedisClient.net.createConnection = tcreateConnection(t, PORT, HOST);

    R.on('connect', function () {
      t.ok(true, 'connected');
      t.equal(R.connected, true);
      done();
    });

    t.equal(R.connected, false);
    R.connect('redis://' + HOST + ':' + PORT);
  });

  it('should updatePortAndHostname', function (done) {
    R.updatePortAndHostname(HOST + ':' + PORT);
    t.equal(R.port, PORT);
    t.equal(R.hostname, HOST);
    done();
  });

  it('should forward data', function (done) {
    R = new RedisClient(stubRedsminEndpoint(function fnWrite(data) {
      t.equal(data, 'test data');
      done();
    }));

    R.onData('test data');
  });

  it('should write data to redis', function (done) {
    RedisClient.net.createConnection = tcreateConnection();

    R.connect('redis://127.0.0.1:6378');

    var spy = sinon.spy(R.socket, 'write');

    R.write('KEYS *');

    t.ok(spy.calledWith('KEYS *'), "write to redis");
    done();
  });

  it('should not be in connected state if the redis connection is closed', function (done) {
    RedisClient.net.createConnection = tcreateConnection();

    R.on('close', function () {
      t.equal(R.connected, false);
      done();
    });

    R.on('connect', _.once(function () {
      R.onClose(new Error('close'));
    }));

    R.connect('redis://127.0.0.1:6378');
  });

  it('should try to connect to redis with backoff', function (done) {
    RedisClient.net.createConnection = tcreateConnection();

    R = new RedisClient(stubRedsminEndpoint(), {
      initialTimeout: 1,
      maxTimeout: 10
    });

    var spy = sinon.spy(R, "onConnected");

    R.on('connect', function () {
      t.ok(true, "connect called");

      if (spy.callCount === 2) {
        R._connect = function () {};
        done();
        return;
      }

      process.nextTick(_.bind(R.onClose, R, new Error('close')));
    });

    R.connect('redis://127.0.0.1:6378');
  });

  it('should use the backoff', function (done) {
    // Simulate that the backoff will always directly hit reconnect
    R.backoff.backoff = function () {
      R.reconnect();
    };

    R._connect = function () {
      t.equal(R.connected, false);
      done();
    };

    R.onClose();
  });

  it('should not throw when onError is called', function (done) {
    var R = new RedisClient(stubRedsminEndpoint());
    t.doesNotThrow(function () {
      R.onError();
    });
    done();
  });
});
