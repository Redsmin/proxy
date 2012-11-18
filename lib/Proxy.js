// Redsmin connection details
var REDSMIN_PORT               = 8100
,   DEBUG_MODE                 = process.env.REDSMIN_ENV === 'development'
,   REDSMIN_HOSTNAME           = 'ssl.redsmin.'+ (DEBUG_MODE ? 'dev':'com');


function Proxy(config){
  if(!config){
    throw new Error("Invalid config file");
  }

  this.redis_uri               = config.redis;
  this.key                     = config.key;

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
    if(DEBUG_MODE){console.log('Endpoint#write', data.toString());}
    this.redis.write(data);
  }.bind(this);

  var writeFromRedisToEndpoint = function(data){
    if(DEBUG_MODE){console.log('Redis#write', data.toString());}
    this.redsmin.write(data);
  }.bind(this);

  this.redsmin                 = new Endpoint(writeFromEndpointToRedis, this.key);
  this.redis                   = new RedisClient(writeFromRedisToEndpoint);

  // Start redis connection
  this.redis.connect(this.redis_uri);
  // Start endpoint connection
  this.redsmin.connect(REDSMIN_PORT, REDSMIN_HOSTNAME);
};

module.exports                 = Proxy;
