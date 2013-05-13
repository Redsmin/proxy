Redsmin proxy [![Build Status](https://secure.travis-ci.org/Redsmin/redsmin.png)](http://travis-ci.org/Redsmin/redsmin)  [![Build Status](https://drone.io/github.com/FGRibreau/redsmin/status.png)](https://drone.io/github.com/FGRibreau/redsmin/latest)
===============

Redsmin proxy expose one [or more](https://redsmin.uservoice.com/knowledgebase/articles/169404-how-to-run-multiple-redsmin-daemons-on-the-same-se) local Redis instance to [Redsmin](https://redsmin.com).

We're still actively developing this proxy and the Redsmin service so please update often.

We'll announce changes on our Twitter account [@redsmin](https://twitter.com/redsmin).

### [Installation](https://redsmin.uservoice.com/knowledgebase/articles/121169-can-i-manage-redis-instances-only-accessible-from-)


### CLI options

```bash
RKEY=REDSMIN_CONNECTION_KEY [RURL=redis://127.0.0.1:6379] [RAUTH=password] redsmin set_key
```

### I'm behind a firewall, what rule should I add ?

Redsmin proxy connects to `ssl.redsmin.com` on port `443`, currently the socket connection is in plain text but SSL/TLS will be added really soon.

------------------

### History

v0.3.3 (02/20/2013)
 * Support for `RAUTH` env variable, must be used with `set_key` to setup an authentication.
 * Support for `REDSMIN_CONFIG` env variable
 * Support for `REDSMIN_DEBUG` env variable, if it exists, in/out will be written on screen.
