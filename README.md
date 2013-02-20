Redsmin proxy [![Build Status](https://secure.travis-ci.org/Redsmin/redsmin.png)](http://travis-ci.org/Redsmin/redsmin)
=============

Redsmin proxy expose one [or more](https://redsmin.uservoice.com/knowledgebase/articles/169404-how-to-run-multiple-redsmin-daemons-on-the-same-se) local redis instance to the Redis GUI [Redsmin](https://redsmin.com).

We're still actively developing this proxy and the Redsmin service so please update often.

We'll announce changes on our Twitter account [@redsmin](https://twitter.com/redsmin).

[Installation](https://redsmin.uservoice.com/knowledgebase/articles/121169-can-i-manage-redis-instances-only-accessible-from-)
------------

`set_key` options
---------------

```bash
RKEY=REDSMIN_CONNECTION_KEY [RURL=redis://127.0.0.1:6379] [RAUTH=password] redsmin set_key
```
