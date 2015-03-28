'use strict';
var Endpoint = require('../lib/Endpoint');
var _ = require('lodash');
var fs = require('fs');
var sinon = require('sinon');
var jsonPackage = JSON.parse(fs.readFileSync(__dirname + '/../package.json'));
var Socket = require('../test/helpers/Socket');

function tconnect(t, host, hostname, fnWriteStub) {
  return function (_host, _hostname, cb) {
    if (t) {
      t.equal(_host, host);
      t.equal(_hostname, hostname);
    }

    process.nextTick(cb);

    return new Socket(fnWriteStub);
  };
}


function stubLocalClient(fn) {
  return fn || _.noop;
}

// Quiet console output
Endpoint.log = sinon.stub(_.clone(console));

exports['Endpoint'] = {
  setUp: function (done) {
    // setup here
    Endpoint.tls.connect = tconnect();
    this.E = new Endpoint(stubLocalClient(), 'myKey');

    // Mock console
    Endpoint.log = _.reduce(console, function (m, v, k) {
      m[k] = _.noop;
      return m;
    }, {
      debug: _.noop
    });

    done();
  },

  tearDown: function (callback) {
    // clean up
    //Endpoint.log = console;
    callback();
  },

  'constructor': function (t) {
    t.done();
  },

  'connect (without handshake)': function (t) {
    t.expect(4);

    var E = this.E,
      hostname = 'ssl.redsmin.dev',
      port = 433,
      stub = sinon.stub();

    Endpoint.tls.connect = tconnect();

    t.equal(E.handshaken, false);
    t.equal(E.connected, false);

    E.on('connect', function () {
      t.equal(E.hostname, hostname);
      t.equal(E.port, port);
      t.done();
    });

    E.connect(port, hostname);

  },
  'connect without arguments shoudl throw an error': function (t) {
    t.expect(2);
    t.throws(function () {
      this.E.connect();
    })

    t.throws(function () {
      this.E.connect(443);
    })
    t.done();
  },
  'connect (with handshake)': function (t) {
    t.expect(3);

    var E = this.E,
      hostname = 'ssl.redsmin.dev',
      port = 433,
      stub = sinon.stub();

    Endpoint.tls.connect = tconnect(null, null, null, function fnWrite(data) {
      t.equal(data, JSON.stringify({
        version: jsonPackage.version,
        key: E.key
      }));
      t.equal(E.connected, true);
    });

    E.key = 'myKey';

    E.on('connect', function () {
      t.ok(true);
      t.done();
    });

    E.connect(port, hostname);
  },

  'connect with auth (with handshake)': function (t) {
    t.expect(3);

    var E = new Endpoint(stubLocalClient(), 'myKey', {
        auth: "passw_or_d"
      }),
      hostname = 'ssl.redsmin.dev',
      port = 433;

    Endpoint.tls.connect = tconnect(null, null, null, function fnWrite(data) {
      t.equal(data, JSON.stringify({
        version: jsonPackage.version,
        key: E.key,
        auth: "passw_or_d"
      }));
      t.equal(E.connected, true);
    });

    E.key = 'myKey';

    E.on('connect', function () {
      t.ok(true);
      t.done();
    });

    E.connect(port, hostname);
  },

  'connect (with handshake backoff)': function (t) {
    t.expect(5);

    var spyWrite = null;

    var iConnect = 0;
    var iWrite = 0;

    function fnWriteToRedsmin(data) {
      iWrite++;

      if (iWrite === 2) {
        t.ok(!this.handshaken, 'handshaken');
        t.equal(data, JSON.stringify({
          version: jsonPackage.version,
          key: E.key
        }));
        t.equal(E.connected, true);
        t.done();
      }
    }

    var E = new Endpoint(stubLocalClient(), 'myKey', {
        initialTimeout: 1,
        maxTimeout: 10
      }),
      hostname = 'ssl.redsmin.dev',
      port = 433,
      stub = sinon.stub();

    spyWrite = sinon.spy(fnWriteToRedsmin);

    Endpoint.tls.connect = tconnect(null, null, null, fnWriteToRedsmin);

    E.key = 'myKey';

    E.on('connect', function () {
      ++iConnect;

      if (iConnect === 1) {
        t.ok(this.connected, 'connected');
        t.ok(!this.handshaken, 'handshaken');
        // Simulate a disconnection
        E.onClose();

      }
    });

    E.connect(port, hostname);
  },

  'onData (handhsake with error)': function (t) {
    t.expect(2);

    var E = this.E,
      hostname = 'ssl.redsmin.dev',
      port = 433;

    Endpoint.tls.connect = tconnect();

    var processExit = Endpoint.process.exit = sinon.spy();

    E.on('connect', function () {
      E.onData('{"error":"oups user not found"}');

      t.equal(E.handshaken, false);

      t.ok(processExit.calledOnce, "backoff called");
      t.done();
    });

    E.connect(port, hostname);
  },

  'onData (handshake)': function (t) {
    t.expect(3);

    var E = this.E,
      hostname = 'ssl.redsmin.dev',
      port = 433;

    Endpoint.tls.connect = tconnect();

    E.on('connect', function () {
      var spy = sinon.spy(E.fnWrite);

      t.equal(E.handshaken, false, "shouldn't be handshaken at this stage");
      E.onData('{"status":"ok"}');

      t.equal(E.handshaken, true, "should now be handshaken");

      t.ok(!spy.called, "it's the handshake datas shouldn't be written to the client");

      t.done();
    });

    E.connect(port, hostname);
  },

  'onData (handshake merge with info)': function (t) {
    t.expect(3);

    var E = this.E,
      hostname = 'ssl.redsmin.dev',
      port = 433,
      redisInfo = "*1\n$4\ninfo";

    Endpoint.tls.connect = tconnect();

    E.on('connect', function () {
      var spy = sinon.spy(E, 'fnWrite');

      t.equal(E.handshaken, false, "shouldn't be handshaken at this stage");

      E.onData("{\"success\":\"true\"}" + redisInfo);

      t.equal(E.handshaken, true, "should now be handshaken");

      t.ok(spy.calledWith(redisInfo), "the command has the right arguments");

      t.done();
    });

    E.connect(port, hostname);
  },


  'onData (handshaken)': function (t) {
    t.expect(1);

    var spyFnWrite = sinon.spy(),
      E = new Endpoint(spyFnWrite, 'myKey'),
      hostname = 'ssl.redsmin.dev',
      port = 433;

    Endpoint.tls.connect = tconnect();

    E.on('connect', function () {

      E.onData('KEYS *');

      t.ok(spyFnWrite.calledWith('KEYS *'), "localclient write called");

      t.done();
    });

    // Simulate that handshake as already be done
    E.handshaken = true;
    E.connect(port, hostname);
  },

  'onClose': function (t) {
    t.expect(1);

    var E = this.E,
      hostname = 'ssl.redsmin.dev',
      port = 433;

    Endpoint.tls.connect = tconnect();

    E.on('close', function () {
      t.equal(E.connected, false);
      t.done();
    });

    E.on('connect', _.once(function () {
      // Emulate an "on close" event
      E.onClose(new Error('close'));
    }));

    E.connect(port, hostname);
  },

  'onClose (reconnect)': function (t) {
    t.expect(3);

    Endpoint.tls.connect = tconnect();

    var E = new Endpoint(stubLocalClient(), 'myKey', {
        initialTimeout: 1,
        maxTimeout: 10
      }),
      hostname = 'ssl.redsmin.dev',
      port = 433;

    var spy = sinon.spy(E, "onConnected");

    E.on('connect', function () {

      t.ok(true, "connect called");

      if (spy.callCount === 0) {
        t.ok(!this.handshaken, "handshake");
      }

      if (spy.callCount === 2) {
        t.ok(!this.handshaken, "handshake");
        E._connect = function () {};
        t.done();
        return;
      }

      process.nextTick(_.bind(E.onClose, E, new Error('close')));
    });

    // Simulate that the handshake was already done
    E.handshaken = true;
    E.connect(port, hostname);
  },

  'onError': function (t) {
    t.expect(1);

    var E = this.E,
      hostname = 'ssl.redsmin.dev',
      port = 433;

    E.on('connect', function () {
      var spy = sinon.spy(E.socket, "destroy");
      E.socket.emit('error');

      E.removeAllListeners();
      E.socket.removeAllListeners();

      t.ok(spy.called, 'destroy called');
      t.done();
    });

    E.handshaken = true;
    E.connect(port, hostname);
  }
};
