// Redsmin connection details
var REDSMIN_PORT     = 993  // Standard TLS port for "IMAP"
,   REDSMIN_DEBUG    = !!process.env.REDSMIN_DEBUG
,   REDSMIN_PROD     = !process.env.REDSMIN_ENV || process.env.REDSMIN_ENV === "production"
,   REDSMIN_HOSTNAME = 'ssl.redsmin.'+ (REDSMIN_PROD ? 'com':'dev');


function Proxy(config){
  if(!config){
    throw new Error("Invalid config file");
  }

  this.redis_uri               = config.redis;
  this.key                     = config.key;
  this.auth                    = config.auth;

  this.log                     = require('./log')('debug');

  this.redis                   = null;
  this.redsmin                 = null;
}

Proxy.RedisClient              = require('./RedisClient');
Proxy.Endpoint                 = require('./Endpoint');


Proxy.prototype.start          = function(){
  var Endpoint                 = Proxy.Endpoint
  ,   RedisClient              = Proxy.RedisClient;

  // Set logger
  Proxy.Endpoint.log           = this.log;
  Proxy.RedisClient.log        = this.log;

  // This will allow multiplexing in the future
  var writeFromEndpointToRedis = function(data){
    if(REDSMIN_DEBUG){console.log('Endpoint#write', data.toString());}
    this.redis.write(data);
  }.bind(this);

  var writeFromRedisToEndpoint = function(data){
    if(REDSMIN_DEBUG){console.log('Redis#write', data.toString());}
    this.redsmin.write(data);
  }.bind(this);

  this.redsmin                 = new Endpoint(writeFromEndpointToRedis, this.key, {auth:this.auth});
  this.redis                   = new RedisClient(writeFromRedisToEndpoint);

  // Start redis connection
  this.redis.connect(this.redis_uri);
  // Start endpoint connection
  this.redsmin.connect(REDSMIN_PORT, REDSMIN_HOSTNAME);
};

module.exports                 = Proxy;
