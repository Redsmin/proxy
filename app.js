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

var log = require('./lib/log')('debug');
var Config = require('./lib/config')(log);
var config = new Config(Config.DEFAULT_CONFIG_PATH);

var jsonPackage = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json')));

var Endpoint = require('./lib/Endpoint')(log, jsonPackage, tls, process);

var RedisClient = require('./lib/RedisClient')(log, net);

var RedsminProxy = require('./lib/Proxy')(config, RedisClient, Endpoint);

// Start the proxy
new RedsminProxy().start();
