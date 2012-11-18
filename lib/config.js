/**
 * Configuration loader
 */

var fs = require('fs')
,   log = require('./log')('debug')
,   key_regex  = /^[a-f0-9]{24}$/i;

function Config(jsonFilename, checkKey) {
  if(jsonFilename){Config.jsonFilename = fs.realpathSync(jsonFilename);}

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

  var fileContent = fs.readFileSync(Config.jsonFilename, 'UTF-8')
  ,   json = null;

  try {
    json = JSON.parse(stripComments(fileContent));

  } catch (e) {
    log.error("Error parsing " + Config.jsonFilename, e);
    process.exit(1);
  }

  json.key = process.env.REDSMIN_KEY || json.key;

  // valid the connection key
  if(!!checkKey && Config.checkKey(json.key)){
    process.exit(1);
  }

  return json;
}

Config.checkKey = function(key){
  // @todo insert link to the FAQ
  if(!key_regex.test(key)){
    log.error('invalid connection key: "' + key + '" please edit "' + Config.jsonFilename+'"');
    return false;
  }

  return true;
};

Config.write = function(){

};

Config.jsonFilename = fs.realpathSync(__dirname+'/../etc/redsmin'+(process.env.REDSMIN_ENV ? '_dev' : '')+'.json');

module.exports = Config;
