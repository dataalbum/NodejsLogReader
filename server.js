#!/usr/bin/env node

var amqp = require('amqplib');
var MongoClient = require('mongodb').MongoClient;
var dbUri = process.env.MONGOLAB_URI || 'mongodb://127.0.0.1:27017/logs';

amqp.connect('amqp://ontpcbos:7G7Ilh2wbERfJNHZMhfHTHJPaj4GDGu1@bunny.cloudamqp.com/ontpcbos').then(function (conn) {
    process.once('SIGINT', function () { conn.close(); });
    return conn.createChannel().then(function (ch) {
        var ex = 'logs';
        var ok = ch.assertExchange(ex, 'topic', { durable: true });
        
        ok = ok.then(function () {
            return ch.assertQueue('', { exclusive: true, durable: true });
        });
        
        ok = ok.then(function (qok) {
            var queue = qok.queue
            var rk = 'Temperature'
            return ch.bindQueue(queue, ex, rk).then(function () {
                return qok.queue;
            });
        });
        
        ok = ok.then(function (queue) {
            return ch.consume(queue, logMessage, { noAck: true });
        });
        return ok.then(function () {
            console.log(' [*] Waiting for logs. To exit press CTRL+C');
        });
        
        function logMessage(msg) {
            console.log(" [x] %s: '%s'", 
                msg.fields.routingKey,
                msg.content.toString());
            
            console.log(" Type: ", typeof msg.content);
            
            var sensorData = JSON.parse(msg.content.toString('utf-8'));
            
            console.log(" Message: ", sensorData)
            //console.log(" Lenght: ", sensorData.length)
            
            //MongoDB connetion
            //MongoClient.connect('mongodb://127.0.0.1:27017/logs', function (err, db) {
            MongoClient.connect(dbUri, function (err, db) {
                if (err) throw err;
                console.log(" Connected to Database");
                
                // insert multiple documents
                db.collection('templog').insert(sensorData, function (err, result) {
                    if (err) throw err;
                    console.log(" Record added as " + sensorData[0]._id);
                });
            });
        }
    });
}).then(null, console.warn);