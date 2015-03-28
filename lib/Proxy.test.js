'use strict';
var Proxy = require('../lib/Proxy');
var _ = require('lodash');
var sinon = require('sinon');

// Quiet console output
Proxy.log = sinon.stub(_.clone(console));

describe('Proxy', function () {

});
