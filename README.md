[Redsmin](https://redsmin.com) proxy [![Build Status](https://drone.io/github.com/Redsmin/redsmin/status.png)](https://drone.io/github.com/Redsmin/redsmin/latest) [![Deps](https://david-dm.org/Redsmin/redsmin.png)](https://david-dm.org/Redsmin/redsmin) [![Version](http://badge.fury.io/js/redsmin.png)](http://badge.fury.io/js/redsmin) [![Stack Share](http://img.shields.io/badge/tech-stack-0690fa.svg?style=flat)](http://stackshare.io/redsmin/redsmin)
===============

![npm](https://nodei.co/npm/redsmin.png)

Redsmin proxy securely connects one or more(https://redsmin.uservoice.com/knowledgebase/articles/169404-how-to-run-multiple-redsmin-daemons-on-the-same-se) locally available Redis instance to [Redsmin](https://redsmin.com).

We announce changes on our Twitter account [@redsmin](https://twitter.com/redsmin) and our [Facebook page](https://www.facebook.com/redis.redsmin).

#### [Installation - Getting started](https://redsmin.uservoice.com/knowledgebase/articles/121169-can-i-manage-redis-instances-only-accessible-from-)

#### [Changelog](/CHANGELOG.md)

#### Environment variables options:

- `CONFIG_FILE`: configuration file to read (if any), default: `/path/to/redsmin-proxy/etc/redsmin.json`

- `REDIS_URI`: Redis URI or socket path, default `redis://127.0.0.1:6379`
- `REDIS_AUTH`: Redis authenticat password, default `null`

- `REDSMIN_KEY`: your Redsmin server connection key, default `''`

Advanced configuration:

- `REDSMIN_PORT`: where redsmin proxy should connect, default: `993`
- `REDSMIN_HOSTNAME`: where redsmin proxy should connect, default `ssl.redsmin.com`
- `DEBUG`: debug mode, default `false`

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

#### How to keep redsmin proxy up once I disconnect

On MacOS, Ubuntu/Debian, the simplest way is to use [screen](http://www.rackaid.com/blog/linux-screen-tutorial-and-how-to/):

```
# start screen
screen
# start redsmin-proxy
REDIS_URI="redis://127.0.0.1:6379" REDSMIN_KEY="redsmin-token1" redsmin 
# Ctrl+A+D to detach from screen
# and then to reattach to the screen session:
screen -r 
```

But you could also use [Upstart](http://upstart.ubuntu.com/), [systemd](http://www.freedesktop.org/wiki/Software/systemd/), [supervisord](http://supervisord.org/) or [pm2](https://github.com/Unitech/PM2) on these system.

On Windows you will need to [create a service](http://support.microsoft.com/en-us/kb/251192) or use [pm2](https://github.com/Unitech/PM2).

**We will happily merge into this repository any pull-request describing a configuration file for one of the above process runner (or any other one).**

#### I'm behind a firewall, what rule should I add ?

Redsmin proxy connects to `ssl.redsmin.com` on port `993` with a secure [TLS socket connection](https://en.wikipedia.org/wiki/Transport_Layer_Security). For troubleshooting: [What ip/port should I locally open to use Redsmin proxy](https://redsmin.uservoice.com/knowledgebase/articles/274294-what-ip-port-should-i-locally-open-to-use-redsmin-).


#### Uninstall

```bash
npm uninstall redsmin -g
```


