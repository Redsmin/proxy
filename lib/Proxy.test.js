'use strict';
var Proxy = require('../lib/Proxy');
var _ = require('lodash');
var sinon = require('sinon');

// Quiet console output
Proxy.log = sinon.stub(_.clone(console));

exports['Proxy'] = {
  setUp: function (done) {
    done();
  },

  tearDown: function (callback) {
    // clean up
    //Endpoint.log = console;
    callback();
  },

  'constructor': function (t) {
    t.done();
  }
};
