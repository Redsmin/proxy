'use strict';
/**
 * Configuration loader
 */

var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var assert = require('assert');

var KEY_REGEX = /^[a-f0-9]{24}$/i;
module.exports = function (log) {
  assert(_.isObject(log));

  var config = require('common-env')(log).getOrElseAll({
    debug: false,
    config_file: path.resolve(__dirname, '../etc/redsmin.json'),

    redsmin: {
      port: 993,
      hostname: 'ssl.redsmin.com',
      reject_unauthorized: 1,
      // overridable key
      key: ''
    },
    redis: {
      uri: '',
      key: null,
      auth: null
    }
  });

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = config.redsmin.reject_unauthorized;
  var FILEPATH = config.config_file;
  assert(_.isString(FILEPATH));

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
    _.extend(this, config);
    this.jsonFilename = fs.realpathSync(jsonFilename);

    var fileContent = fs.readFileSync(this.jsonFilename, 'UTF-8');
    var json = null;

    try {
      json = JSON.parse(stripComments(fileContent));

    } catch (e) {
      log.error("Error parsing " + this.jsonFilename, e);
      return false;
    }

    // valid the connection key
    json.key = config.redsmin.key || json.key;
    this.checkKey(json.key);
    this.json = json;
  }

  /**
   *
   * @param  {String} key   redsmin key
   * @param  {String} redis redis string connection
   * @optional
   * @param  {String} auth  redis auth
   */
  Config.prototype.write = function (key, redis, auth, cb) {
    var newConfig = _.extend({}, {
      key: key || json.key,
      redis: redis || json.redis,
      auth: auth || json.auth
    });

    fs.writeFile(this.jsonFilename, JSON.stringify(newConfig), 'utf-8', function (err) {
      if (!err) {
        this.key = newConfig.key;
        this.redis = newConfig.redis;
        this.auth = newConfig.auth;
      }
      cb(err);
    }.bind(this));
  };

  Config.prototype.checkKey = function (key) {
    if (!KEY_REGEX.test(key)) {
      log.error('Invalid connection key "' + key + '", please browse http://bit.ly/YAIeAM');
      return false;
    }

    return true;
  };

  return new Config(FILEPATH);
};
