/**
 * Configuration loader
 */

var fs               = require('fs')
,   log              = require('./log')('debug')
,   _                = require('lodash')
,   path             = require('path');

var env              = {};
env.REDSMIN_PORT     =     993;
env.REDSMIN_DEBUG    =    !!process.env.REDSMIN_DEBUG;
env.REDSMIN_PROD     =     !process.env.REDSMIN_ENV || process.env.REDSMIN_ENV === "production";
env.REDSMIN_HOSTNAME = 'ssl.redsmin.'+ (env.REDSMIN_PROD ? 'com':'dev');
env.REDSMIN_CONFIG   =   process.env.REDSMIN_CONFIG || path.resolve(__dirname, '../etc/redsmin'+(!env.REDSMIN_PROD ? '_dev' : '')+'.json');
env.REDSMIN_KEY      =      process.env.REDSMIN_KEY;

if(!env.REDSMIN_PROD){
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
}

var   key_regex = /^[a-f0-9]{24}$/i
,   filepath  = env.REDSMIN_CONFIG;
/**
 * Strip all Javascript type comments from the string.
 * (extracted from http://lorenwest.github.com/node-config/ )
 *
 * The string is usually a file loaded from the O/S, containing
 * newlines and javascript type comments.
 *
 * Thanks to James Padolsey, and all who conributed to this implementation.
 * http://james.padolsey.com/javascript/javascript-comment-removal-revisted/
 *
 * @protected
 * @method _stripComments
 * @param fileString {string} The string to strip comments from
 * @return {string} The string with comments stripped.
 */
function stripComments(fileStr) {

  var uid = '_' + Date.now(),
    primitives = [],
    primIndex = 0;

  return (
  fileStr

  /* Remove strings */ .replace(/(['"])(\\\1|.)+?\1/g, function(match) {
    primitives[primIndex] = match;
    return (uid + '') + primIndex++;
  })

  /* Remove Regexes */ .replace(/([^\/])(\/(?!\*|\/)(\\\/|.)+?\/[gim]{0,3})/g, function(match, $1, $2) {
    primitives[primIndex] = $2;
    return $1 + (uid + '') + primIndex++;
  })

  /*
    - Remove single-line comments that contain would-be multi-line delimiters
    - Remove multi-line comments that contain would be single-line delimiters
   */
  .replace(/\/\/.*?\/?\*.+?(?=\n|\r|$)|\/\*[\s\S]*?\/\/[\s\S]*?\*\//g, '')

  /*
    Remove single and multi-line comments,
    no consideration of inner-contents
   */
  .replace(/\/\/.+?(?=\n|\r|$)|\/\*[\s\S]+?\*\//g, '')

  /*
    Remove multi-line comments that have a replaced ending (string/regex)
    Greedy, so no inner strings/regexes will stop it.
   */
  .replace(RegExp('\\/\\*[\\s\\S]+' + uid + '\\d+', 'g'), '')

  /* Bring back strings & regexes */ .replace(RegExp(uid + '(\\d+)', 'g'), function(match, n) {
    return primitives[n];
  }));

}

function Config(jsonFilename, checkKey) {
  if(jsonFilename){Config.jsonFilename = fs.realpathSync(jsonFilename);}

  var fileContent = fs.readFileSync(Config.jsonFilename, 'UTF-8')
  ,   json = null;

  try {
    json = JSON.parse(stripComments(fileContent));

  } catch (e) {
    log.error("Error parsing " + Config.jsonFilename, e);
    return false;
  }

  json.key = env.REDSMIN_KEY || json.key;

  // valid the connection key
  if(!!checkKey && Config.checkKey(json.key)){
    return false;
  }

  return json;
}

/**
 *
 * @param  {String} key   redsmin key
 * @param  {String} redis redis string connection
 * @optional
 * @param  {String} auth  redis auth
 */
Config.write = function(key, redis, auth, cb){
  var json = Config(Config.jsonFilename, false);
  var newConfig = _.extend({}, json, {
    key:   key    || json.key,
    redis: redis  || json.redis,
    auth:  auth   || json.auth
  });

  fs.writeFile(Config.jsonFilename, JSON.stringify(newConfig), 'UTF8', cb);
};

Config.checkKey = function(key){
  if(!key_regex.test(key)){
    log.error('Invalid connection key: "' + key + '", browse http://bit.ly/YAIeAM');
    return false;
  }

  return true;
};

Config.jsonFilename = fs.realpathSync(filepath);

module.exports = Config;
module.exports.env = env;
