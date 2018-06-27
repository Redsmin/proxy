'use strict';

/**
 * Redsmin proxy daemon
 * Francois-Guillaume Ribreau - @FGRibreau
 * redsmin.com
 */

var fs = require('fs');
var net = require('net');
var tls = require('tls');
var path = require('path');
var updateNotifier = require('update-notifier');
var pkg = require('./package.json');

var log = require('./lib/log')('debug');
var Config = require('./lib/config')(log);
var config = new Config(Config.DEFAULT_CONFIG_PATH);

var jsonPackage = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json')));

var Endpoint = require('./lib/Endpoint')(log, jsonPackage, tls, process);

var RedisClient = require('./lib/RedisClient')(log, net, tls);

var RedsminProxy = require('./lib/Proxy')(config, RedisClient, Endpoint);

updateNotifier({
  pkg:pkg,
  updateCheckInterval: 1000*60 //  1 minute
}).notify();

// Start the proxy
new RedsminProxy().start();
