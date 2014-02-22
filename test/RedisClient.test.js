var RedisClient = require('../lib/RedisClient')
,   _           = require('lodash')
,   sinon       = require('sinon')
,   Socket      = require('./helpers/Socket');

function tcreateConnection(t, host, hostname){
  return function(_host, _hostname, cb){
    if(t){
      t.equal(_host, host);
      t.equal(_hostname, hostname);
    }
    cb();

    return new Socket();
  };
}

function stubRedsminEndpoint(fn){
  return fn || function(){};
}

// Quiet console output
RedisClient.log = sinon.stub(_.clone(console));

var R = null;
var endpoint = null;
exports['RedisClient'] = {
  setUp: function(done) {
    // setup here
    endpoint = stubRedsminEndpoint();
    R = new RedisClient(endpoint);
    done();
  },
  tearDown: function (callback) {
    // clean up
    //RedisClient.log = console;
    callback();
  },

  global: function(t) {
    t.expect(2);
    t.equal(typeof RedisClient, 'function', 'should be a function.');
    t.equal(typeof RedisClient.net, 'object', '.net should be a object.');
    t.done();
  },

  constructor:function(t){
    t.done();
  },

  connect:function(t){
    t.expect(5);

    var host = 6378;
    var hostname = '127.0.0.1';

    RedisClient.net.createConnection = tcreateConnection(t, host, hostname);

    R.on('connect', function(){
      t.ok(true, 'connected');
      t.equal(R.connected, true);
      t.done();
    });

    t.equal(R.connected, false);
    R.connect('redis://127.0.0.1:6378');
  },

  /**
   * onData from redis
   * @param  {[type]} t [description]
   * @return {[type]}   [description]
   */
  'onData': function(t){
    t.expect(1);

    R = new RedisClient(stubRedsminEndpoint(function fnWrite(data){
      t.equal(data, 'test data');
      t.done();
    }));

    R.onData('test data');
  },

  /**
   * write data to redis
   */
   'write': function(t){
    t.expect(1);

    RedisClient.net.createConnection = tcreateConnection();

    R.connect('redis://127.0.0.1:6378');

    var spy = sinon.spy(R.socket, 'write');

    R.write('KEYS *');

    t.ok(spy.calledWith('KEYS *'),"write to redis");
    t.done();
   },

  'onClose': function(t){
    t.expect(1);

    RedisClient.net.createConnection = tcreateConnection();

    R.on('close', function(){
      t.equal(R.connected, false);
      t.done();
    });

    R.on('connect', _.once(function(){
      R.onClose(new Error('close'));
    }));

    R.connect('redis://127.0.0.1:6378');
  },

  'onClose (reconnect)': function(t){
    t.expect(2);

    RedisClient.net.createConnection = tcreateConnection();

    R = new RedisClient(stubRedsminEndpoint(), {initialTimeout: 1,maxTimeout: 10});

    var spy = sinon.spy(R, "onConnected");

    R.on('connect', function(){

      t.ok(true, "connect called");

      if(spy.callCount === 2){
        R._connect = function(){};
        t.done();
        return;
      }

      process.nextTick(_.bind(R.onClose, R, new Error('close')));
    });

    R.connect('redis://127.0.0.1:6378');
  },

  'Reconnect': function(t){
    t.expect(1);
    // Simulate that the backoff will always directly hit reconnect
    R.backoff.backoff = function(){R.reconnect();};

    R._connect = function(){
      t.equal(R.connected, false);
      t.done();
    };

    R.onClose();
  },

  'onError': function(t){
    var R = new RedisClient(stubRedsminEndpoint());
    t.expect(1);
    t.doesNotThrow(function(){R.onError();});
    t.done();
  }
};
