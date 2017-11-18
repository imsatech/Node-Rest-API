var connection = require('./dbconnection');
var restify = require('restify');
var bodyParser = require('body-parser');
var server = restify.createServer({
    name: 'Nodeapp',
    version: '1.0.0'
});
server.pre(restify.pre.sanitizePath());
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser({
    requestBodyOnGet: true
}));
server.use(bodyParser.json({limit: '50mb'}));
server.use(bodyParser.urlencoded({
    limit: '25mb',
    extended: true
}));

var routes = require('./api/routes/Routes');
routes(server);

var app=server.listen(80, function () {
    console.log('%s listening at %s', server.name, server.url)
});

server.get(/\/?.*/, restify.plugins.serveStatic({
    directory: './',
    default: 'index.html'
}))