## Redsmin Proxy — Securely connect behind the firewall (or localhost) Redis servers to [Redsmin](https://redsmin.com)

[![Build Status](https://img.shields.io/circleci/project/github/Redsmin/proxy.svg)](https://circleci.com/gh/Redsmin/proxy/) [![Coverage Status](https://img.shields.io/coveralls/Redsmin/proxy/master.svg)](https://coveralls.io/github/Redsmin/proxy?branch=master) [![Support](http://img.shields.io/badge/redsmin-support-0690fa.svg?style=flat)](https://redsmin.uservoice.com/) [![Follow](https://img.shields.io/twitter/follow/redsmin.svg?style=social)](https://twitter.com/Redsmin)

[![Docker Hub](http://img.shields.io/badge/docker-hub-22b8eb.svg?style=flat)](https://hub.docker.com/r/redsmin/proxy/) [![Docker hub](https://img.shields.io/docker/pulls/redsmin/proxy.svg)](https://hub.docker.com/r/redsmin/proxy/) [![NPM version](https://img.shields.io/npm/v/redsmin.svg)](http://badge.fury.io/js/redsmin) [![Downloads](http://img.shields.io/npm/dm/redsmin.svg)](https://www.npmjs.com/package/redsmin)


<p align="center">
<a target="_blank" href="https://redsmin.com"><img style="width:100%" src="docs/redsmin-proxy.png"></a>
</p>



- [Installation - Getting started](https://redsmin.uservoice.com/knowledgebase/articles/121169-can-i-manage-redis-instances-only-accessible-from-)
- [Environment variables options](#environment-variables-options)
- [Is the communication safe between my server and Redsmin? (Yes)](#is-the-communication-safe-between-my-server-and-redsmin-yes)
- How to start Redsmin proxy
  - [on Docker](#docker)
    -  [Start and connect Redsmin proxy to a local Redis server](#start-and-connect-redsmin-proxy-to-a-local-redis-server)
    -  [Start and connect Redsmin proxy to an network-wide available Redis](#start-and-connect-redsmin-proxy-to-an-network-wide-available-redis)
    -  [Start and connect Redsmin proxy to a Redis container](#start-and-connect-redsmin-proxy-to-a-redis-container)
    -  [Docker auto-restart](#docker-auto-restart)
  - [on Mac OS X](#macos-debianubuntu)
  - [on Debian/Ubuntu, *nix](#macos-debianubuntu)
  - [on Windows](#windows-powershell)
  - with a password protected redis
    - [Mac OS X](#StartWithPasswordProtectedRedisUnix)
    - [Debian/Ubuntu, *nix](#StartWithPasswordProtectedRedisUnix)
    - [Windows](#StartWithPasswordProtectedRedisWindows)
  - with a redis listening on a unix-socket
    - [Mac OS X](#how-to-start-redsmin-proxy-with-a-redis-listening-on-a-unix-socket)
    - [Debian/Ubuntu, *nix](#how-to-start-redsmin-proxy-with-a-redis-listening-on-a-unix-socket)
    - [Windows](#how-to-start-redsmin-proxy-with-a-redis-listening-on-a-unix-socket)
  - [reading a configuration file](#how-to-start-redsmin-proxy-reading-a-configuration-file)
- [How to connect multiple Redis from the same server to Redsmin](#macos-debianubuntu-4)
- How to keep redsmin proxy up once I disconnect
  - [with nohup](#with-nohup)
  - [with screen](#with-screen)
  - [with a process manager](#with-a-process-manager)
  - [with systemd](#with-systemd)
- [I'm behind a firewall, what rule should I add?](#im-behind-a-firewall-what-rule-should-i-add)
- [How to uninstall Redsmin Proxy](#how-to-uninstall-redsmin-proxy)
- [Throubleshooting](#throubleshooting)
  - [Ready check failed: NOAUTH Authentication required.](#ready-check-failed-noauth-authentication-required)
- [Changelog](/CHANGELOG.md)

We announce changes on our Twitter account [@redsmin](https://twitter.com/redsmin), our [Facebook page](https://www.facebook.com/redis.redsmin).

--------------------------------------------------------------------------------------------------

<a name="EnvironmentVariablesOptions"></a>
####  Environment variables options:  ####

- `CONFIG_FILE`: configuration file to read (if any), default: `/path/to/redsmin-proxy/etc/redsmin.json`
- `REDIS_URI`: Redis URI or socket path, default `redis://127.0.0.1:6379`
- `REDIS_AUTH`: Redis authentication password, default `null`
- `REDSMIN_KEY`: your Redsmin server connection key, default `''`

Advanced configuration:

- `REDSMIN_PORT`: where redsmin proxy should connect, default: `993`
- `REDSMIN_HOSTNAME`: where redsmin proxy should connect, default `ssl.redsmin.com`
- `DEBUG`: debug mode, default `false`
- Prefix `REDIS_URI` with `rediss://` to connect to Redis using TLS encryption

--------------------------------------------------------------------------------------------------

<a name="CommunicationSafety"></a>
#### Is the communication safe between my server and Redsmin? (Yes)

Yes, Redsmin and Redsmin proxy communicate through a secure connection using the [TLS 1.2 protocol](https://en.wikipedia.org/wiki/Transport_Layer_Security) so no one will be able to inspect the data looking at the traffic.

--------------------------------------------------------------------------------------------------


#### How to start Redsmin proxy

<a name="StartWithDocker"></a>
##### Docker


<a name="StartWithDockerAndConnectToALocalRedis"></a>
###### Start and connect Redsmin proxy to a local Redis server

Let say you started `redis-server` on your machine and then want to start redsmin-proxy from docker. **If you are on MacOSX or Windows the following command won't work** (if you are on Linux the following line will work):

```bash
docker run -it --rm --net=host --name redsmin-proxy -e REDSMIN_KEY=YOUR_REDSMIN_KEY -e REDIS_URI="redis://127.0.0.1:6379" redsmin/proxy
```

It does not work because on non-linux environment the docker daemon is running inside a VM and your `redis-server` is running on your host machine, thus accessing 127.0.0.1 from the docker daemon will simply hit the VM loopback.

So we simply need to specify the `HOST_IP` (replace it with your own local IP, you may want to use `ifconfig` to find it) instead of `127.0.0.1`:

```bash
docker run -it --rm --name redsmin-proxy -e REDSMIN_KEY=YOUR_REDSMIN_KEY -e REDIS_URI="redis://HOST_IP:6379" redsmin/proxy
```

On MacOSX, this should work and let redsmin-proxy connect to a Redis container on the same host:

```bash
docker run -it --rm --name redsmin-proxy -e REDSMIN_KEY=YOUR_REDSMIN_KEY -e REDIS_URI="redis://docker.for.mac.localhost:6379" redsmin/proxy
```

<a name="StartWithDockerAndConnectToNetworkWideRedis"></a>
###### Start and connect Redsmin proxy to an network-wide available Redis

```bash
docker run -it --rm --name redsmin-proxy -e REDSMIN_KEY=YOUR_REDSMIN_KEY -e REDIS_URI="redis://192.168.3.50:6379" redsmin/proxy
```

Where `redis://192.168.3.50:6379` will be the ip address and port of the running Redis server and `YOUR_REDSMIN_KEY` is your [Redsmin key](https://redsmin.uservoice.com/knowledgebase/articles/121169-can-i-manage-redis-instances-only-accessible-from).

<a name="StartWithDockerAndConnectToARedisContainer"></a>
###### Start and connect Redsmin proxy to a Redis container

Let first say you've started a Redis container:

```bash
docker run --name my-redis --rm redis
```

You can [link](https://docs.docker.com/userguide/dockerlinks/) redsmin proxy container to the redis one with `--link:

```bash
docker run -it --rm --name redsmin-proxy --link my-redis:local-redis -e REDSMIN_KEY=YOUR_KEY -e REDIS_URI="redis://local-redis:6379" redsmin/proxy
```

<a name="StartWithDockerAndUseAutoRestart"></a>
###### Docker auto-restart

If you want to leverage docker [auto-restart docker feature](https://docs.docker.com/reference/run/#restart-policies-restart), use the `--restart=always` command.


<a name="StartOnMacOSDebianUbuntu"></a>
##### MacOS, Debian/Ubuntu

```bash
npm install redsmin --global
REDIS_URI="redis://127.0.0.1:6379" REDSMIN_KEY="redsmin-token" redsmin
```

<a name="StartOnWindows"></a>
##### Windows (PowerShell)

```bash
npm install redsmin --global
$env:REDIS_URI="redis://127.0.0.1:6379"
$env:REDSMIN_KEY="redsmin-token"
redsmin
```

##### Windows (CMD.exe)

```bash
npm install redsmin --global
set REDIS_URI="redis://127.0.0.1:6379"
set REDSMIN_KEY="redsmin-token"
redsmin
```

--------------------------------------------------------------------------------------------------

<a name="StartWithPasswordProtectedRedis"></a>
#### How to start Redsmin proxy with a password protected redis

<a name="StartWithPasswordProtectedRedisUnix"></a>
##### MacOS, Debian/Ubuntu

```bash
npm install redsmin --global
REDIS_URI="redis://127.0.0.1:6379" REDIS_AUTH="auth-pass" REDSMIN_KEY="redsmin-token" redsmin
```

<a name="StartWithPasswordProtectedRedisWindows"></a>
##### Windows

```bash
npm install redsmin --global
set REDIS_URI="redis://127.0.0.1:6379"
set REDIS_AUTH="auth-pass"
set REDSMIN_KEY="redsmin-token"
redsmin
```

--------------------------------------------------------------------------------------------------

<a name="StartWithRedisUnixSocket"></a>
#### How to start Redsmin proxy with a redis listening on a unix-socket

<a name="StartWithRedisUnixSocketUnix"></a>
##### MacOS, Debian/Ubuntu

```bash
npm install redsmin --global
REDIS_URI="/tmp/redis.sock" REDSMIN_KEY="5517e20046f4c7530d000357" redsmin
```

<a name="StartWithRedisUnixSocketWindows"></a>
##### Windows

```bash
npm install redsmin --global
set REDIS_URI="/tmp/redis.sock"
set REDSMIN_KEY="5517e20046f4c7530d000357"
redsmin
```

Note: you may need to use `sudo` to access to the socket.

--------------------------------------------------------------------------------------------------

<a name="startWithConfigurationFile"></a>
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

<a name="connectMultipleRedis">
  
#### How to connect multiple Redis from the same server to Redsmin

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

<a name="keepRedsminProxyUpWithNohup"></a>
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

<a name="keepRedsminProxyUpWithScreen"></a>
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

<a name="keepRedsminProxyUpWithAProcessManager"></a>
## With a process manager

But you could also use [Upstart](http://upstart.ubuntu.com/), [systemd](http://www.freedesktop.org/wiki/Software/systemd/), [supervisord](http://supervisord.org/) or [pm2](https://github.com/Unitech/PM2) on these system.

On Windows you will need to [create a service](http://support.microsoft.com/en-us/kb/251192) or use [pm2](https://github.com/Unitech/PM2).

## With Systemd

Create the service at `/etc/systemd/system/redsmin.service`

```
[Unit]
Description = Redsmin Proxy
After = network.target

[Service]
Type = simple
Environment = REDIS_URI=redis://127.0.0.1:6379 REDSMIN_KEY=your-token-here
ExecStart = /usr/bin/redsmin $REDIS_URI $REDSMIN_KEY
TimeoutStartSec = infinity
Restart = on-abort

[Install]
WantedBy = multi-user.target
```

Reload systemd by `systemctl daemon-reload`.

You can now start/stop/restart redsmin like any other systemd service, like `systemctl start redsmin`.

## With Supervisord

Create a config file with these contents:

```
[program:redsmin]
command = /usr/bin/redsmin
autostart = true
autorestart = true
environment = REDIS_URI="redis://127.0.0.1:6379",REDSMIN_KEY="your-token-here"
```

Reload supervisord config by `supervisorctl reread && supervisorctl update`

**We will happily merge into this repository any pull-request describing a configuration file for any other process runner.**

--------------------------------------------------------------------------------------------------

<a name="RuleBehindTheFirewall"></a>
#### I'm behind a firewall, what rule should I add?

Redsmin proxy connects to `ssl.redsmin.com` on port `993` with a secure [TLS socket connection](https://en.wikipedia.org/wiki/Transport_Layer_Security). For troubleshooting: [What ip/port should I locally open to use Redsmin proxy](https://redsmin.uservoice.com/knowledgebase/articles/274294-what-ip-port-should-i-locally-open-to-use-redsmin-).

--------------------------------------------------------------------------------------------------

<a name="Uninstall"></a>
#### How to uninstall Redsmin Proxy

##### MacOS, Debian/Ubuntu

```bash
npm uninstall redsmin -g
```

<a name="troubleshooting"></a>
#### Throubleshooting

<a name="noauth"></a>
##### Ready check failed: NOAUTH Authentication required

It means that your Redis server required a password and that no password is configured in Redsmin Proxy. To fix this start Redsmin proxy with the [`REDIS_AUTH`](#environment-variables-options) environment variable.
