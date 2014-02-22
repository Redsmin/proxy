var EventEmitter = require('events').EventEmitter
,   _            = require('lodash')
,   util         = require('util');

function Socket(fnWriteStub){
  EventEmitter.call(this);
  this.write        = fnWriteStub || _.noop;
  this.setTimeout   = _.noop;
  this.setNoDelay   = _.noop;
  this.destroy      = _.noop;
  this.setKeepAlive = _.noop;
}

util.inherits(Socket, EventEmitter);

module.exports = Socket;
