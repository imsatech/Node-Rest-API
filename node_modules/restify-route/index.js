var jsonwebtoken = require('jsonwebtoken');
var restify = require('restify');

(function () {

    function Route () {

        var self = this;
        var HTTP_METHODS = ['del', 'get', 'head', 'options', 'patch', 'post', 'put'];
        
        self.server = {};
        self.routes = {};
        self.jwtConfig = {
            options: null,
            allwaysVerifyAuthentication: false
        };

        this.use = function (server) {
            self.server = server;
            return self;
        };

        this.on = function (evt, func) {
            self.server.on(evt, func);
            return self;
        };

        this.jwt = function (config) {
            checkIfServerIsDefined();

            if (! config || ! config.secretOrPrivateKey || ! config.callback) {
                throw new Error('secretOrPrivateKey string and callback function are obrigatories.');
            }
            if (config.cors) {
                self.on('MethodNotAllowed', unknownMethodHandler);
            }

            self.jwtConfig = config;
            self.server.use(authMiddleware);

            function isPathNeedsAuthentication (req) {
                var httpVerb = req.route.method.toLowerCase();
                if (httpVerb === 'delete') {
                    httpVerb = 'del'
                }
                if (httpVerb === 'options') {
                    httpVerb = 'opts'
                }
                var key = req.route.path + '_' + httpVerb;
                return self.routes[key].needsAuthentication;
            }

            function authMiddleware (req, res, next) {
                
                if (isPathNeedsAuthentication(req)) {
                    if (req.headers && req.headers.authorization) {
                        var config = self.jwtConfig;
                        var test = req.headers.authorization.match(/^Bearer (.*)$/);
                        if (test) {
                            jsonwebtoken.verify(test[1], config.secretOrPrivateKey, function(err, decoded) {
                                if (err) {
                                    return next(new restify.NotAuthorizedError('Invalid token'));
                                }
                                if (config.callback) {
                                    config.callback(req, next, decoded);
                                }
                                else {
                                    next();
                                }
                            });
                        } else {
                            return next(new restify.NotAuthorizedError('Format is authorization: Bearer [token]'));
                        }
                    } else {
                        return next(new restify.NotAuthorizedError('No authorization header was found'));
                    }
                }
                else {
                    next();
                }
            }

            function unknownMethodHandler(req, res) {
                if (req.method.toLowerCase() === 'options') {
                    var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'Origin', 'Authorization']; // added Origin & X-Requested-With

                    if (res.methods.indexOf('OPTIONS') === -1) {
                        res.methods.push('OPTIONS');
                    }

                    res.header('Access-Control-Allow-Credentials', true);
                    res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
                    res.header('Access-Control-Allow-Methods', res.methods.join(', '));
                    res.header('Access-Control-Allow-Origin', req.headers.origin);

                    return res.send(204);
                }
                else {
                    return res.send(new restify.MethodNotAllowedError());
                }
            }
            return self;
        };

        this.set = function (path, httpMethod, callback, needsAuthentication) {
            checkIfServerIsDefined();

            httpMethod = httpMethod || 'get';
            var httpVerb = httpMethod.toLowerCase();

            if (HTTP_METHODS.indexOf(httpVerb) === -1) {
                httpVerb = 'get';
            }
            if (typeof(callback) !== 'function') {
                callback = function (req, res) {
                    res.status(204);
                    res.end();
                }
            }

            if (needsAuthentication === undefined) {
                needsAuthentication = self.jwtConfig.allwaysVerifyAuthentication;
            }
            var key = path + '_' + httpVerb;
            self.routes[key] = {needsAuthentication: needsAuthentication};
            self.server[httpVerb](path, callback);

            return self;
        };

        function checkIfServerIsDefined () {
            if (! self.server || Object.keys(self.server).length === 0) {
                throw new Error('The specified server is invalid.');
            }
        }

    }

    module.exports = new Route();

})();
