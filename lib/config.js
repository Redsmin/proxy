'use strict';
/**
 * Configuration loader
 */

var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var assert = require('assert');

var KEY_REGEX = /^[a-f0-9]{24}$/i;
module.exports = function (log, DISPLAY_LOG) {
  assert(_.isObject(log));

  var commonEnv = require('common-env/withLogger');
  var DEFAULT_REDIS_URI = 'redis://127.0.0.1:6379';
  var DEFAULT_CONFIG_PATH = path.resolve(__dirname, '../etc/redsmin.json');

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

      /* Remove strings */
      .replace(/(['"])(\\\1|.)+?\1/g, function (match) {
        primitives[primIndex] = match;
        return (uid + '') + primIndex++;
      })

      /* Remove Regexes */
      .replace(/([^\/])(\/(?!\*|\/)(\\\/|.)+?\/[gim]{0,3})/g, function (match, $1, $2) {
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

      /* Bring back strings & regexes */
      .replace(RegExp(uid + '(\\d+)', 'g'), function (match, n) {
        return primitives[n];
      }));

  }

  function Config(jsonFilename) {
    var envConfig = commonEnv(DISPLAY_LOG ? log : {
      info: _.noop
    }).getOrElseAll({
      debug: false,
      config_file: DEFAULT_CONFIG_PATH,

      redsmin: {
        port: 993,
        hostname: 'ssl.redsmin.com',
        reject_unauthorized: 1,
        // overridable key
        key: ''
      },
      redis: {
        uri: DEFAULT_REDIS_URI,
        auth: null
      }
    });

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = envConfig.redsmin.reject_unauthorized;
    assert(_.isString(envConfig.config_file));

    assert(_.isString(jsonFilename));
    this.debug = envConfig.debug;


    this.jsonFilename = fs.realpathSync(jsonFilename);
    var fileContent = fs.readFileSync(this.jsonFilename, 'UTF-8');
    var json = null;

    try {
      json = JSON.parse(stripComments(fileContent));

    } catch (e) {
      log.error("Error parsing " + this.jsonFilename, e);
      return false;
    }


    this.redsmin = {
      port: envConfig.redsmin.port,
      hostname: envConfig.redsmin.hostname,
      key: envConfig.redsmin.key || json.key
    };

    this.redis = {
      uri: envConfig.redis.uri !== DEFAULT_REDIS_URI ? envConfig.redis.uri : json.redis,
      auth: envConfig.redis.auth || json.auth || null
    };

    // valid the connection key
    this.checkKey(this.redsmin.key, function (err) {
      if (err) {
        log.error(err);
        process.exit(1);
      }
    });
  }

  Config.prototype.checkKey = function (key, f) {
    if (!KEY_REGEX.test(key)) {
      return f(Config.INVALID_KEY.replace('{key}', key));
    }

    return f(null, key);
  };

  Config.INVALID_KEY = 'Invalid connection key "{key}", please browse http://bit.ly/YAIeAM';
  Config.DEFAULT_CONFIG_PATH = DEFAULT_CONFIG_PATH;
  return Config;
};
