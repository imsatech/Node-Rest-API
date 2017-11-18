'use strict';
var routes = require('restify-route');
var fs = require('fs');
module.exports = function (server) {
    var chatList = require('../controllers/Controller');
    routes
        .use(server)
        .jwt({
            secretOrPrivateKey: 'SM812',
            allwaysVerifyAuthentication: false,
            callback: function (req, next, decoded) {
                req.user = decoded;
                next();
            }
        })
        .set('/request', 'post', chatList.globalRequest)
        .set('/chatview', 'get', function (req, res, next) {
            fs.readFile("index.html", function (error, pgResp) {
                if (error) {
                    res.writeHead(404);
                    res.write('Contents you are looking are Not Found');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(pgResp);
                }
                res.end();
            });
        });
};
