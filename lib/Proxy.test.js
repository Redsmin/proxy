'use strict';
var _ = require('lodash');
var sinon = require('sinon');
var tls = require('tls');
var fs = require('fs');
var path = require('path');
var net = require('net');
var log = require('./log')('debug');
var jsonPackage = require('../package.json');
var ProxyFactory = require('./Proxy');
var RedisClient = require('./RedisClient')(log, net, tls);
var Endpoint = require('./Endpoint')(log, jsonPackage, tls, process);
var debug = require('debug')('Proxy.test');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
describe('Proxy', function () {
  var address;
  var redsminServer;

  beforeEach(function(done) {

    redsminServer = tls.createServer({
      key: fs.readFileSync(path.resolve(__dirname, 'server-key.fixtures.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'server-cert.fixtures.pem')),
    }, function (socket) {
      socket.on('data', function(data){
        console.log('got data', data);
      });
      debug('got a new socket');
    }).on('error', function(err) {
      // handle errors here
      throw err;
    });

    redsminServer.listen(function(){
      address = redsminServer.address();
      debug('opened redsminServer on %j', address);

      done();
    });
  });

  afterEach(function(done) {
    redsminServer.close(done);
  });

  it('should start', function () {
    var config = {
      debug: true,
      redsmin: {
        port: address.port,
        hostname: '127.0.0.1',
        key: 'REDSMIN_KEY',
        auth: 'auth'
      },
      redis:{
        auth: 'plop',
        uri: '127.0.0.1:10'
      }
    };

    var Proxy = ProxyFactory(config, RedisClient, Endpoint);
    var proxy = new Proxy();
    proxy.start();

    setTimeout(function(){
      proxy._stop();
    }, 1000);
  });
});
