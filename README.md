[Redsmin](https://redsmin.com) proxy [![Build Status](https://drone.io/github.com/Redsmin/redsmin/status.png)](https://drone.io/github.com/Redsmin/redsmin/latest) [![Deps](https://david-dm.org/Redsmin/redsmin.png)](https://david-dm.org/Redsmin/redsmin) [![Version](http://badge.fury.io/js/redsmin.png)](http://badge.fury.io/js/redsmin) [![Stack Share](http://img.shields.io/badge/tech-stack-0690fa.svg?style=flat)](http://stackshare.io/redsmin/redsmin)
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

[Changelog](/CHANGELOG.md)
