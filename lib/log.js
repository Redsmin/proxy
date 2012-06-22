/**
 * Logger factory
 * @param  {String} level Level of log
 */
var inst = null;

module.exports = function(level){
  var Winston = require('winston');

  if(inst){return inst;}

  var transports = [];

  if (module.parent && module.parent.parent && module.parent.parent.filename.indexOf('wrapper') > 0){
    // Daemon mode
    transports.push(new (Winston.transports.File)({ filename: '../log/log.log'}));
  } else {
    // Debug mode
    transports.push(new Winston.transports.Console({
      colorize: true,
      timestamp: true
    }));
  }

  inst = new Winston.Logger({
    transports: transports,
    timestamp: true,
    level: level || 'debug'
  });

  return inst;
};
