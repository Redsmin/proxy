/**
 * Redsmin proxy daemon
 * Francois-Guillaume Ribreau - @FGRibreau
 * redsmin.com
 *
 */

// Dependencies
var config     = require(__dirname+'/lib/config')()
,   Proxy      = require(__dirname+'/lib/Proxy');


// Start the proxy
new Proxy(config.redis, config.key).start();
