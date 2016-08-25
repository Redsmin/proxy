##
# NAME             : redsmin/proxy
# VERSION          : latest
# DOCKER-VERSION   : 1.5+
# DESCRIPTION      : Sends emails using a JSON message sent through RabbitMQ and a template.
# DEPENDENCIES     : node:0.12.7-slim
# TO_BUILD         : docker build --no-cache --rm -t redsmin/proxy:latest .
# TO_SHIP          : docker push redsmin/proxy:latest
# TO_RUN           : docker run -it --rm --name redsmin --link redis:redis -e REDSMIN_KEY=YOUR_REDMIN_KEY -e REDIS_URI="redis://redis:6379" redsmin-proxy
##

FROM node:6-slim

MAINTAINER Francois-Guillaume Ribreau <docker@fgribreau.com>

RUN npm install redsmin -g

ENV REDSMIN_KEY="" REDIS_URI=redis://redis:6379 REDIS_AUTH=""

CMD REDSMIN_KEY=$REDSMIN_KEY REDIS_URI=$REDIS_URI REDIS_AUTH=$REDIS_AUTH redsmin
