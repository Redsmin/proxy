## [Redsmin](https://redsmin.com) proxy 

[![Circle CI](https://img.shields.io/circleci/project/Redsmin/proxy/master.svg)](https://circleci.com/gh/Redsmin/proxy) ![Dl](https://img.shields.io/npm/dt/redsmin.svg) ![Version](https://img.shields.io/npm/v/redsmin.svg)
[![Support](http://img.shields.io/badge/redsmin-support-0690fa.svg?style=flat)](https://redsmin.uservoice.com/) [![Follow](https://img.shields.io/twitter/follow/redsmin.svg?style=social)](https://twitter.com/Redsmin)

<p align="center">
<a target="_blank" href="https://redsmin.com"><img style="width:100%" src="docs/redsmin-proxy.png"></a>
</p>


> Redsmin proxy securely connects one or more locally available Redis instance to [Redsmin](https://redsmin.com).


#### [Installation - Getting started](https://redsmin.uservoice.com/knowledgebase/articles/121169-can-i-manage-redis-instances-only-accessible-from-)

#### [Changelog](/CHANGELOG.md)

We announce changes on our Twitter account [@redsmin](https://twitter.com/redsmin), our [Facebook page](https://www.facebook.com/redis.redsmin) and [Redis Weekly Newsletter](http://redisweekly.com).

#### Environment variables options:

- `CONFIG_FILE`: configuration file to read (if any), default: `/path/to/redsmin-proxy/etc/redsmin.json`
- `REDIS_URI`: Redis URI or socket path, default `redis://127.0.0.1:6379`
- `REDIS_AUTH`: Redis authenticat password, default `null`
- `REDSMIN_KEY`: your Redsmin server connection key, default `''`

Advanced configuration:

- `REDSMIN_PORT`: where redsmin proxy should connect, default: `993`
- `REDSMIN_HOSTNAME`: where redsmin proxy should connect, default `ssl.redsmin.com`
- `DEBUG`: debug mode, default `false`

--------------------------------------------------------------------------------------------------

#### How to start Redsmin proxy

##### Docker

###### Start and connect Redsmin proxy to an network-wide available Redis

```bash
docker run -it --rm --name redsmin-proxy -e REDSMIN_KEY=YOUR_REDSMIN_KEY -e REDIS_URI="redis://192.168.3.50:6379" redsmin/proxy
```

Where `redis://192.168.3.50:6379` will be the ip address and port of the running Redis server and `YOUR_REDSMIN_KEY` is your [Redsmin key](https://redsmin.uservoice.com/knowledgebase/articles/121169-can-i-manage-redis-instances-only-accessible-from).

###### Start and connect Redsmin proxy to an Redis container

Let first say you've started a Redis container:

```bash
docker run --name my-redis --rm redis
```

You can [link](https://docs.docker.com/userguide/dockerlinks/) redsmin proxy container to the redis one with `--link:

```bash
docker run -it --rm --name redsmin-proxy --link my-redis:local-redis -e REDSMIN_KEY=YOUR_KEY -e REDIS_URI="redis://local-redis:6379" redsmin/proxy
```

###### Docker auto-restart

If you want to leverage docker [auto-restart docker feature](https://docs.docker.com/reference/run/#restart-policies-restart), use the `--restart=always` command.


##### MacOS, Debian/Ubuntu 

```bash
REDIS_URI="redis://127.0.0.1:6379" REDSMIN_KEY="redsmin-token" redsmin
```

##### Windows

```bash
set REDIS_URI="redis://127.0.0.1:6379" 
set REDSMIN_KEY="redsmin-token"
redsmin

```

--------------------------------------------------------------------------------------------------

#### How to start Redsmin proxy with a password protected redis

##### MacOS, Debian/Ubuntu 

```bash
REDIS_URI="redis://127.0.0.1:6379" REDIS_AUTH="auth-pass" REDSMIN_KEY="redsmin-token" redsmin
```

##### Windows

```bash
set REDIS_URI="redis://127.0.0.1:6379" 
set REDIS_AUTH="auth-pass" 
set REDSMIN_KEY="redsmin-token"
redsmin
```

--------------------------------------------------------------------------------------------------

#### How to start Redsmin proxy with a redis listening on a unix-socket

##### MacOS, Debian/Ubuntu 

```bash
REDIS_URI="/tmp/redis.sock" REDSMIN_KEY="5517e20046f4c7530d000357" redsmin
```

##### Windows

```bash
set REDIS_URI="/tmp/redis.sock" 
set REDSMIN_KEY="5517e20046f4c7530d000357"
redsmin
```

Note: you may need to use `sudo` to access to the socket.

--------------------------------------------------------------------------------------------------

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

##### MacOS, Debian/Ubuntu 

```bash
CONFIG_FILE="/etc/redsmin.json" redsmin
```

##### Windows

```bash
set CONFIG_FILE="/etc/redsmin.json"
redsmin
```

--------------------------------------------------------------------------------------------------

#### How to run multiple Redsmin proxy daemons on the same server

##### MacOS, Debian/Ubuntu 

```bash
REDIS_URI="redis://127.0.0.1:6379" REDSMIN_KEY="redsmin-token1" redsmin &
REDIS_URI="redis://127.0.0.1:6380" REDSMIN_KEY="redsmin-token2" redsmin &
REDIS_URI="redis://127.0.0.1:6381" REDSMIN_KEY="redsmin-token3" redsmin &
REDIS_URI="redis://127.0.0.1:6382" REDSMIN_KEY="redsmin-token4" redsmin &
```

##### Windows

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

--------------------------------------------------------------------------------------------------

#### How to keep redsmin proxy up once I disconnect

## With nohup

The easiest way is to use [nohup](http://linux.die.net/man/1/nohup) that will keep redsmin-proxy running even once the SSH session is closed. Simply connect to the server that contains Redis, run the commands below, don't forget to replace `YOUR_REDSMIN_TOKEN` with the `REDSMIN_TOKEN` you had when creating the proxy connection from Redsmin app.

```shell
echo '#!/usr/bin/env bash' >> redsmin-proxy.sh
echo 'while true; do REDSMIN_KEY=YOUR_REDSMIN_TOKEN redsmin; sleep 1; done;' >> redsmin-proxy.sh
chmod +x redsmin-proxy.sh
nohup ./redsmin-proxy.sh &
```

To check that everything is alright or to debug Redsmin proxy, you can use `tail -f nohup.out`.

## With nohup (one-liner)

```
nohup bash -c "while true; do REDSMIN_KEY=YOUR_REDSMIN_TOKEN redsmin; sleep 1; done" &
```

## With screen

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

## With a process manager

But you could also use [Upstart](http://upstart.ubuntu.com/), [systemd](http://www.freedesktop.org/wiki/Software/systemd/), [supervisord](http://supervisord.org/) or [pm2](https://github.com/Unitech/PM2) on these system.

On Windows you will need to [create a service](http://support.microsoft.com/en-us/kb/251192) or use [pm2](https://github.com/Unitech/PM2).

**We will happily merge into this repository any pull-request describing a configuration file for one of the above process runner (or any other one).**

--------------------------------------------------------------------------------------------------

#### I'm behind a firewall, what rule should I add ?

Redsmin proxy connects to `ssl.redsmin.com` on port `993` with a secure [TLS socket connection](https://en.wikipedia.org/wiki/Transport_Layer_Security). For troubleshooting: [What ip/port should I locally open to use Redsmin proxy](https://redsmin.uservoice.com/knowledgebase/articles/274294-what-ip-port-should-i-locally-open-to-use-redsmin-).

--------------------------------------------------------------------------------------------------

#### Uninstalling Redsmin Proxy

##### MacOS, Debian/Ubuntu 

```bash
npm uninstall redsmin -g
```
