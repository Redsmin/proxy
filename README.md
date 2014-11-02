[Redsmin](https://redsmin.com) proxy [![Build Status](https://drone.io/github.com/Redsmin/redsmin/status.png)](https://drone.io/github.com/Redsmin/redsmin/latest) [![Deps](https://david-dm.org/Redsmin/redsmin.png)](https://david-dm.org/Redsmin/redsmin) [![Version](http://badge.fury.io/js/redsmin.png)](http://badge.fury.io/js/redsmin)
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

### v1.1.6 2014-04-26
 * Fixed an exception from Backoff library

### v1.1.4 2014-02-23
### v1.1.3 2014-02-22
### v1.1.2 2014-02-22
 * Handle both connection string format, with or without redis://
 * Refactored unit-tests

### v1.1.0 2013-09-03
 * Fix unit-tests
 * Fix another rare case of missing reconnection

### v1.0.5 2013-08-11
 * Fix rare case of missing reconnection

### v1.0.0 2013-07-21
   * TLS support
   * Redsmin proxy now connects on ssl.redsmin.com:993

### v0.3.5 2013-05-13
### v0.3.4 2013-02-20
### v0.3.3 2013-02-20
 * Support for `RAUTH` env variable, must be used with `set_key` to setup an authentication.
 * Support for `REDSMIN_CONFIG` env variable
 * Support for `REDSMIN_DEBUG` env variable, if it exists, in/out will be written on screen.

### v0.3.2 2013-01-10
### v0.3.0 2012-11-18
### v0.2.1 2012-11-18
### v0.1.9 2012-10-01
### v0.1.8 2012-10-01
### v0.1.7 2012-09-30
### v0.1.6 2012-09-29
### v0.1.5 2012-06-30
### v0.1.4 2012-06-30
### v0.1.3 2012-06-29
### v0.1.2 2012-06-29
### v0.1.0 2012-06-09

-----------------------

[![logo](https://redsmin.com/logo/rect-large-color-white@256.png)](https://redsmin.com)
