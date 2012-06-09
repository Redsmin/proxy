var RedisClient = require('../lib/RedisClient')
,   _           = require('lodash')
,   sinon       = require('sinon');

function tcreateConnection(t, host, hostname){
  return function(_host, _hostname, cb){
    if(t){
      t.equal(_host, host);
      t.equal(_hostname, hostname);
    }
    cb();
    return new (require('events').EventEmitter)();
  };
}

function stubRedsminEndpoint(fn){
  return {
    write:fn || function(){}
  };
}


var R = null;
exports['RedisClient'] = {
  setUp: function(done) {
    // setup here
    // R = RedisClient.connect('127.0.0.1');
    RedisClient.log = sinon.stub(_.clone(console));
    done();
  },
  tearDown: function (callback) {
    // clean up
    RedisClient.log = console;
    callback();
  },

  global: function(t) {
    t.expect(2);
    t.equal(typeof RedisClient, 'function', 'should be a function.');
    t.equal(typeof RedisClient.net, 'object', '.net should be a object.');
    t.done();
  },

  constructor:function(t){
    var R = new RedisClient(stubRedsminEndpoint());
    t.done();
  },

  connect:function(t){
    t.expect(5);

    var host = 6379;
    var hostname = '127.0.0.1';

    RedisClient.net.createConnection = tcreateConnection(t, host, hostname);
    var R = new RedisClient(stubRedsminEndpoint());

    R.on('connect', function(){
      t.ok(true, 'connected');
      t.equal(R.connected, true);
      t.done();
    });

    t.equal(R.connected, false);
    R.connect('redis://127.0.0.1:6379');
  },

  'onData': function(t){
    t.expect(1);

    var R = new RedisClient(stubRedsminEndpoint(function fnWrite(data){
      t.equal(data, 'test data');
      t.done();
    }));

    R.onData('test data');
  },

  'onClose': function(t){
    t.expect(1);

    RedisClient.net.createConnection = tcreateConnection();
    var R = new RedisClient(stubRedsminEndpoint());

    R.on('close', function(){
      t.equal(R.connected, false);
      t.done();
    });

    R.on('connect', _.once(function(){
      R.onClose(new Error('close'));
    }));

    R.connect('redis://127.0.0.1:6379');
  },

  'onClose (reconnect)': function(t){
    t.expect(2);

    RedisClient.net.createConnection = tcreateConnection();

    var R = new RedisClient(stubRedsminEndpoint(), {initialTimeout: 1,maxTimeout: 10});

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

    R.connect('redis://127.0.0.1:6379');
  },

  'onError': function(t){
    var R = new RedisClient(stubRedsminEndpoint());
    R.onError();
    t.done();
  }
};
