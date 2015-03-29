[Redsmin](https://redsmin.com) proxy [![Build Status](https://drone.io/github.com/Redsmin/redsmin/status.png)](https://drone.io/github.com/Redsmin/redsmin/latest) [![Deps](https://david-dm.org/Redsmin/redsmin.png)](https://david-dm.org/Redsmin/redsmin) [![Version](http://badge.fury.io/js/redsmin.png)](http://badge.fury.io/js/redsmin) [![Stack Share](http://img.shields.io/badge/tech-stack-0690fa.svg?style=flat)](http://stackshare.io/redsmin/redsmin)
===============

![npm](https://nodei.co/npm/redsmin.png)

Redsmin proxy securely expose one [or more](https://redsmin.uservoice.com/knowledgebase/articles/169404-how-to-run-multiple-redsmin-daemons-on-the-same-se) local Redis instance to [Redsmin](https://redsmin.com).

We announce changes on our Twitter account [@redsmin](https://twitter.com/redsmin) and our [Facebook page](https://www.facebook.com/redis.redsmin).

#### [Installation - Getting started](https://redsmin.uservoice.com/knowledgebase/articles/121169-can-i-manage-redis-instances-only-accessible-from-)

#### [Changelog](/CHANGELOG.md)

#### How to start Redsmin proxy

- MacOS, Debian/Ubuntu: 

```bash
REDIS_URI="redis://127.0.0.1:6379" REDSMIN_KEY="redsmin-token" redsmin
```

- Windows:

```bash
set REDIS_URI="redis://127.0.0.1:6379" 
set REDSMIN_KEY="redsmin-token"
redsmin
```

#### How to start Redsmin proxy with a password protected redis

- MacOS, Debian/Ubuntu: 

```bash
REDIS_URI="redis://127.0.0.1:6379" REDIS_AUTH="auth-pass" REDSMIN_KEY="redsmin-token" redsmin
```

- Windows:

```bash
set REDIS_URI="redis://127.0.0.1:6379" 
set REDIS_AUTH="auth-pass" 
set REDSMIN_KEY="redsmin-token"
redsmin
```

#### How to start Redsmin proxy with a redis listening on a unix-socket

- MacOS, Debian/Ubuntu: 

```bash
REDIS_URI="/tmp/redis.sock" REDSMIN_KEY="5517e20046f4c7530d000357" redsmin
```

- Windows:

```bash
set REDIS_URI="/tmp/redis.sock" 
set REDSMIN_KEY="5517e20046f4c7530d000357"
redsmin
```

Note: you may need to use `sudo` to access to the socket.

#### How to start Redsmin proxy reading a configuration file

First create a json configuration file, for instance  `/etc/redsmin.json`:

```json
{
  "key": "redsmin-token",
  "redis": "redis://127.0.0.1:6379",
  "auth": ""
}
```

Then start redsmin proxy with: 

- MacOS, Debian/Ubuntu: 

```bash
CONFIG_FILE="/etc/redsmin.json" redsmin
```

- Windows:

```bash
set CONFIG_FILE="/etc/redsmin.json"
redsmin
```

#### How to run multiple Redsmin proxy daemons on the same server

- MacOS, Debian/Ubuntu: 

```bash
REDIS_URI="redis://127.0.0.1:6379" REDSMIN_KEY="redsmin-token1" redsmin &
REDIS_URI="redis://127.0.0.1:6380" REDSMIN_KEY="redsmin-token2" redsmin &
REDIS_URI="redis://127.0.0.1:6381" REDSMIN_KEY="redsmin-token3" redsmin &
REDIS_URI="redis://127.0.0.1:6382" REDSMIN_KEY="redsmin-token4" redsmin &
```

- Windows:

```bash
set REDIS_URI="redis://127.0.0.1:6379" 
set REDSMIN_KEY="redsmin-token1"
START /B redsmin

set REDIS_URI="redis://127.0.0.1:6380" 
set REDSMIN_KEY="redsmin-token2"
START /B redsmin

set REDIS_URI="redis://127.0.0.1:6381" 
set REDSMIN_KEY="redsmin-token3"
START /B redsmin

set REDIS_URI="redis://127.0.0.1:6382" 
set REDSMIN_KEY="redsmin-token4"
START /B redsmin
```


Note: of course we could have used multiple `CONFIG_FILE` instead of environment variables.

#### I'm behind a firewall, what rule should I add ?

Redsmin proxy connects to `ssl.redsmin.com` on port `993` with a secure [TLS socket connection](https://en.wikipedia.org/wiki/Transport_Layer_Security). For troubleshooting: [What ip/port should I locally open to use Redsmin proxy](https://redsmin.uservoice.com/knowledgebase/articles/274294-what-ip-port-should-i-locally-open-to-use-redsmin-).


#### Uninstall

```bash
npm uninstall redsmin -g
```


