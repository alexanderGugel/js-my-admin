'use strict';

var express = require('express');
var api     = require('./api');

var server  = express();
server.use('/db', api);
server.use(express.static(__dirname + '/client'));

server.get('*', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});


server.listen(1337);
