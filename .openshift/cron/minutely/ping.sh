#!/bin/bash
PATH=/bin:/usr/bin:/usr/sbin
app_url=http://$OPENSHIFT_APP_DNS/
date >> $OPENSHIFT_NODEJS_LOG_DIR/ping.log
curl --insecure --location --silent --fail "$app_url" >> $OPENSHIFT_NODEJS_LOG_DIR/ping.log
