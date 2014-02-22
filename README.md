Redsmin proxy [![Build Status](https://drone.io/github.com/Redsmin/redsmin/status.png)](https://drone.io/github.com/Redsmin/redsmin/latest) [![Gittip](http://badgr.co/gittip/fgribreau.png)](https://www.gittip.com/fgribreau/) [![Deps](https://david-dm.org/Redsmin/redsmin.png)](https://david-dm.org/Redsmin/redsmin) [![Version](http://badge.fury.io/js/redsmin.png)](http://badge.fury.io/js/redsmin)
===============

![npm](https://nodei.co/npm/redsmin.png)

Redsmin proxy securely expose one [or more](https://redsmin.uservoice.com/knowledgebase/articles/169404-how-to-run-multiple-redsmin-daemons-on-the-same-se) local Redis instance to [Redsmin](https://redsmin.com).

We announce changes on our Twitter account [@redsmin](https://twitter.com/redsmin) and our [Facebook page](https://www.facebook.com/redis.redsmin).

### [Installation](https://redsmin.uservoice.com/knowledgebase/articles/121169-can-i-manage-redis-instances-only-accessible-from-)

### CLI options

```bash
RKEY=REDSMIN_CONNECTION_KEY [RURL=redis://127.0.0.1:6379] [RAUTH=password] redsmin set_key
```

### I'm behind a firewall, what rule should I add ?

Redsmin proxy connects to `ssl.redsmin.com` on port `993` with a secure [TLS socket connection](https://en.wikipedia.org/wiki/Transport_Layer_Security). For troubleshooting: [What ip/port should I locally open to use Redsmin proxy](https://redsmin.uservoice.com/knowledgebase/articles/274294-what-ip-port-should-i-locally-open-to-use-redsmin-).

------------------

### Edit configuration

```bash
vim "`npm prefix -g`/lib/node_modules/redsmin/etc/redsmin.json"
```

See: [How to change Redsmin proxy Redis host/port](https://redsmin.uservoice.com/knowledgebase/articles/166408-how-to-change-redsmin-proxy-redis-host-port).

### Uninstall

```bash
npm uninstall redsmin -g
```

### Changelog

#### v1.1.2 (22/02/2014)
 * Handle both connection string format, with or without redis://
 * Refactored unit-tests

#### v1.1.1 (22/02/2014)
 * Fix unit-tests

#### v1.1.0 (03/09/2013)
 * Fix another rare case of missing reconnection

#### v1.0.4 (11/08/2013)
 * Fix rare case of missing reconnection

#### v1.0.0 (07/21/2013)
 * TLS support
 * Redsmin proxy now connects on ssl.redsmin.com:993

#### v0.3.3 (02/20/2013)
 * Support for `RAUTH` env variable, must be used with `set_key` to setup an authentication.
 * Support for `REDSMIN_CONFIG` env variable
 * Support for `REDSMIN_DEBUG` env variable, if it exists, in/out will be written on screen.
