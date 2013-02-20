/**
 * Redsmin proxy daemon
 * Francois-Guillaume Ribreau - @FGRibreau
 * redsmin.com
 */

var config = require(__dirname+'/lib/config')();
var Proxy  = require(__dirname+'/lib/Proxy');

// Start the proxy
new Proxy(config).start();
