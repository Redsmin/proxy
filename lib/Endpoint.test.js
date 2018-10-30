'use strict';
var EndpointFactory = require('../lib/Endpoint');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var net = require('net');
var tls = require('tls');
var sinon = require('sinon');
var Socket = require('../test/helpers/Socket');
var t = require('chai').assert;
var debug = require('debug')('Endpoint.test');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
describe('Endpoint', function() {

  var Endpoint, E, log, jsonPackage, tlsOverride, process;
  // dummy values
  var HOSTNAME = 'ssl.redsmin.dev';
  var PORT = 433;

  beforeEach(function(done) {
    jsonPackage = {
      version: '1.2.1'
    };
    tlsOverride = {
      connect: tconnect()
    };
    log = console;
    log.debug = console.log.bind(console, '[debug]');
    // log = {
    //   debug: sinon.spy(),
    //   info: sinon.spy(),
    //   error: sinon.spy()
    // };
    process = {
      exit: sinon.spy()
    };
    Endpoint = EndpointFactory(log, jsonPackage, tlsOverride, process);
    E = new Endpoint(stubLocalClient(), 'myKey', PORT, HOSTNAME, {
      initialTimeout: 1,
      maxTimeout: 10
    });

    done();
  });

  describe('with a socket server', function() {
    var address;
    var server;

    beforeEach(function(done) {
      server = tls.createServer({
        key: fs.readFileSync(path.resolve(__dirname, 'server-key.fixtures.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, 'server-cert.fixtures.pem')),
      }, function (socket) {
        debug('got a new socket');
        setTimeout(function() {
          try{
            socket.end('goodbye\n');
          }catch(err){
            console.log(err);
          }
        }, 200);
      }).on('error', function(err) {
        // handle errors here
        throw err;
      });

      server.listen(function(){
        address = server.address();
        debug('opened server on %j', address);
        done();
      });
    });

    afterEach(function(done) {
      server.close();
      done();
    });

    it('should handle race connect/disconnect', function(done) {
      function fnWrite() {}
      var E = new Endpoint(fnWrite, 'myKey', address.port, address.address);

      var called = 0;
      // first connect
      E.on('connect', function() {
        t.strictEqual(called++, 0);
        E.on('close', function() {
          E.disconnect();
          done();
        });
        E.disconnect();
        E.disconnect();
        E.disconnect();
      });

      E.disconnect(); // should not trigger an error
      E.connect();
      E.connect(); // should do nothing
    });

    it('should handle async connect disconnect', function(done) {
      function fnWrite() {
        console.log('fnWrite called');
      }
      var Endpoint = EndpointFactory(log, jsonPackage, tls, process);
      var E = new Endpoint(fnWrite, 'myKey', address.port, '127.0.0.1');

      E.once('close', function() {
        E.disconnect();
        done();
      });

      // first connect
      var called = 0;
      E.on('connect', function() {
        t.strictEqual(called++, 0);
      });

      E.connect();
    });

    // it('should handle async connect disconnect', function(done) {
    //   function fnWrite() {
    //     console.log('fnWrite called');
    //   }
    //   var Endpoint = EndpointFactory(log, jsonPackage, tls, process);
    //   var E = new Endpoint(fnWrite, 'myKey', address.port, '127.0.0.1');
    //
    //   var called = 0;
    //   E.on('close', function() {
    //     done();
    //   });
    //
    //   // first connect
    //   E.on('connect', function() {
    //     t.strictEqual(called++, 0);
    //   });
    //
    //   // E.connect();
    //   // E.disconnect(); // should not trigger an error
    //   E.connect();
    // });
  });

  it('should connect (without handshake)', function(done) {
    var stub = sinon.stub();

    tlsOverride.connect = tconnect();

    t.equal(E.handshaken, false);
    t.equal(E.connected, false);

    E.on('connect', function() {
      t.equal(E.hostname, HOSTNAME);
      t.equal(E.port, PORT);
      done();
    });

    E.connect();

  });

  it('should connect (with handshake)', function(done) {
    var stub = sinon.stub();

    var fnWrite = sinon.spy(function(data) {
      t.equal(data, JSON.stringify({
        version: jsonPackage.version,
        key: E.key
      }));
      t.equal(E.connected, true);
    });

    tlsOverride.connect = tconnect(null, null, null, fnWrite);

    E.key = 'myKey';

    E.on('connect', function() {
      t.strictEqual(fnWrite.called, true, 'fnWrite was called');
      t.ok(true);
      done();
    });

    E.connect();
  });

  it('should connect with auth (with handshake)', function(done) {
    var E = new Endpoint(stubLocalClient(), 'myKey', PORT, HOSTNAME, {
      auth: "passw_or_d"
    });

    var fnWrite = sinon.spy(function(data) {
      t.equal(data, JSON.stringify({
        version: jsonPackage.version,
        key: E.key,
        auth: "passw_or_d"
      }));
      t.equal(E.connected, true);
    });

    tlsOverride.connect = tconnect(null, null, null, fnWrite);

    E.key = 'myKey';

    E.on('connect', function() {
      t.strictEqual(fnWrite.called, true, 'fnWrite was called');
      t.ok(true);
      done();
    });

    E.connect();
  });

  it('should connect (with handshake backoff)', function(done) {
    var iConnect = 0;
    var iWrite = 0;
    var stub = sinon.stub();

    tlsOverride.connect = tconnect(null, null, null, function fnWriteToRedsmin(data) {
      iWrite++;
      if (iWrite === 1) {
        t.strictEqual(data, JSON.stringify({
          "version": jsonPackage.version,
          "key": E.key
        }));
      }
      if (iWrite === 2) {
        t.strictEqual(iConnect, 1);
        t.ok(!this.handshaken, 'handshaken');
        t.equal(data, JSON.stringify({
          version: jsonPackage.version,
          key: E.key
        }));
        t.equal(E.connected, true);
        done();
      }
    });

    E.key = 'myKey';
    E.on('connect', function() {
      ++iConnect;
      if (iConnect === 1) {
        t.ok(this.connected, 'connected');
        t.ok(!this.handshaken, 'handshaken');
        // Simulate a disconnection
        E.onClose();
      }
    });

    E.connect();
  });

  it('should onData (handhsake with error)', function(done) {
    tlsOverride.connect = tconnect();

    var processExit = process.exit = sinon.spy();

    E.on('connect', function() {
      E.onData('{"error":"oups user not found"}');
      t.equal(E.handshaken, false);
      t.ok(processExit.calledOnce, "backoff called");
      done();
    });

    E.connect();
  });

  it('should onData (handshake)', function(done) {
    tlsOverride.connect = tconnect();

    E.on('connect', function() {
      var spy = sinon.spy(E.fnWrite);
      t.equal(E.handshaken, false, "shouldn't be handshaken at this stage");
      E.onData('{"status":"ok"}');
      t.equal(E.handshaken, true, "should now be handshaken");
      t.ok(!spy.called, "it's the handshake datas shouldn't be written to the client");
      done();
    });

    E.connect();
  });

  it('should onData (handshake merge with info)', function(done) {
    var redisInfo = "*1\n$4\ninfo";

    tlsOverride.connect = tconnect();

    E.on('connect', function() {
      var spy = sinon.spy(E, 'fnWrite');
      t.equal(E.handshaken, false, "shouldn't be handshaken at this stage");
      E.onData("{\"success\":\"true\"}" + redisInfo);
      t.equal(E.handshaken, true, "should now be handshaken");
      t.ok(spy.calledWith(redisInfo), "the command has the right arguments");
      done();
    });

    E.connect();
  });

  it('should onData (handshaken)', function(done) {
    var spyFnWrite = sinon.spy(),
      E = new Endpoint(spyFnWrite, 'myKey', PORT, HOSTNAME);

    tlsOverride.connect = tconnect();

    E.on('connect', function() {
      E.onData('KEYS *');
      t.ok(spyFnWrite.calledWith('KEYS *'), "localclient write called");
      done();
    });

    // Simulate that handshake as already be done
    E.handshaken = true;
    E.connect();
  });

  it('should onClose', function(done) {
    tlsOverride.connect = tconnect();

    E.on('close', function() {
      t.equal(E.connected, false);
      done();
    });

    E.on('connect', _.once(function() {
      // Emulate an "on close" event
      E.onClose(new Error('close'));
    }));

    E.connect();
  });

  it('should onClose (reconnect)', function(done) {

    tlsOverride.connect = tconnect();

    var E = new Endpoint(stubLocalClient(), 'myKey', PORT, HOSTNAME, {
      initialTimeout: 1,
      maxTimeout: 10
    });

    var spy = sinon.spy(E, "onConnected");

    E.on('connect', function() {
      t.ok(true, "connect called");

      if (spy.callCount === 0) {
        t.ok(!this.handshaken, "handshake");
      }

      if (spy.callCount === 2) {
        t.ok(!this.handshaken, "handshake");
        E._connect = function() {};
        done();
        return;
      }

      setImmediate(_.bind(E.onClose, E, new Error('close')));
    });

    // Simulate that the handshake was already done
    E.handshaken = true;
    E.connect();
  });

  it('should reconnect after a connect', function(done) {
    tlsOverride.connect = tconnect();

    var E = new Endpoint(stubLocalClient(), 'myKey', PORT, HOSTNAME);

    // 1 - the first connect to ssl.redsmin.com will pass as well as the handshake
    tlsOverride.connect = tconnect(null, null, null, function(data) {
      E.socket.emit('data', JSON.stringify({}));

      function simulateCloseEvent() {
        var step = 0;
        // 2 - now override the connection to ssl.redsmin.com in order to simulate an connect error
        tlsOverride.connect = function() {
          simulateECONNREFUSED();

          if (++step === 2) {
            tlsOverride.connect = tconnect(null, null, null, function(data) {
              E.socket.emit('data', JSON.stringify({}));
              // 3 - connect should be called again
              done();
            });
          }

          return new Socket(_.noop);
        };

        E.socket.emit('close');
      }

      function simulateECONNREFUSED() {
        setTimeout(function() {
          var err = new Error('ECONNREFUSED');
          err.message = 'ECONNREFUSED';
          E.socket.emit('error', err);
        }, 50);
      }

      setTimeout(simulateCloseEvent, 50);
    });

    E.connect();
  });

  it('should onError', function(done) {
    E.on('connect', function() {
      var spy = sinon.spy(E.socket, "destroy");
      E.socket.emit('error');

      E.removeAllListeners();
      E.socket.removeAllListeners();

      t.ok(spy.called, 'destroy called');
      done();
    });

    E.handshaken = true;
    E.connect();
  });
});

function tconnect(t, host, hostname, fnWriteStub) {
  return function(_host, _hostname, cb) {
    if (t) {
      t.strictEqual(_host, host);
      t.strictEqual(_hostname, hostname);
    }

    process.nextTick(cb);
    return new Socket(fnWriteStub);
  };
}

function stubLocalClient(fn) {
  return fn || _.noop;
}
