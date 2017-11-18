restify-route
=============

A lazy way to create restify routes with support jwt.

[![Build Status](https://secure.travis-ci.org/gustavohenrique/restify-route.svg?branch=master)](http://travis-ci.org/gustavohenrique/restify-route)
[![Dependency Status](https://gemnasium.com/gustavohenrique/restify-route.png)](https://gemnasium.com/gustavohenrique/restify-route)


## Quick start

```javascript
var restify = require('restify');
var routes = require('restify-route');

var server = restify.createServer();

routes
    .use(server)
    .set('/contact/:id', 'get', function (req, res) {
        res.send('The sent ID: ' + req.params.id);
    })
    .set('/contact/create', 'post', function (req, res) {
        // validation code here
        res.send(201, 'created');
    })
    .set('/contact/delete/:id', 'del', function (req, res) {
        res.send('deleted');
    })
    .set('/contact/update', 'put', function (req, res) {
        res.send('updated');
    });

server.listen(3000, '127.0.0.1', function () {
    console.log('Running on http://127.0.0.1:3000');
});
```

## Using with Json Web Token (JWT)

The example below requires an user authenticated to consume the endpoint `/contact/delete/:id`.  
You can set `allwaysVerifyAuthentication: true` and all endpoints will require an user authenticated, except the endpoint with `false` as fourth parameter.

```javascript
var restify = require('restify');
var routes = require('restify-route');

var server = restify.createServer();

routes
    .use(server)
    .jwt({
        secretOrPrivateKey: 'mysecret',
        allwaysVerifyAuthentication: false,
        callback: function (req, next, decoded) {
            // register the data decoded from token
            req.user = decoded;
            next();
        }
    })
    .set('/contact/:id', 'get', function (req, res) {
        res.send('The sent ID: ' + req.params.id);
    })
    .set('/contact/create', 'post', function (req, res) {
        // validation code here
        res.send(201, 'created');
    })
    .set('/contact/delete/:id', 'del', function (req, res) {
        res.send('deleted');
    }, true)
    .set('/contact/update', 'put', function (req, res) {
        res.send('updated');
    });

server.listen(3000, '127.0.0.1', function () {
    console.log('Running on http://127.0.0.1:3000');
});
```

See the `tests` for more information.

