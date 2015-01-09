var express = require('express');
var api     = require('./api');

var server  = express();

server.use('/db', api);
server.use(express.static(__dirname + '/client'));

server.listen(3141);
