'use strict';
/*
    For Get Response
    req.query.parameters

    For Post Response
    req.body.parameters
*/
var connection = require('../../dbconnection');
var format = require('pg-format');

var moment = require('moment-timezone');
moment().format();

var multer = require('multer');
var fs = require('fs');
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '_' + file.originalname);
    }
});
var upload = multer({storage: storage}).single('img');
const axios = require('axios');

var randomstring = require("randomstring");

exports.globalRequest = function (req, res) {
    connection.connect(function (err, client, done) {
        var getData = JSON.parse(req.body.data);
        var responseData = [];
        if (err) {
            responseData = {"action": getData.action, "status": "0", "body": {"msg": err}};
            res.json(responseData);
        }
        else if (getData.action == "registration") {
            client.query("SELECT * FROM ah_users where status='A' and mobile_number = $1", [getData.body.mobile_number], function (err, result) {
                done();
                if (err) {
                    responseData = {"action": getData.action, "status": "0", "body": {"msg": err}};
                    res.json(responseData);
                } else {
                    if (result.rowCount > 0) {
                        responseData = {
                            "action": getData.action,
                            "status": "0",
                            "body": {"msg": "User Already Exist...!"}
                        };
                        res.json(responseData);
                    } else {
                        var OTP = randomstring.generate({length: 6, charset: '0123456789'});
                        var insertData = {
                            mobile_number: getData.body.mobile_number,
                            otp: OTP,
                            create_date: moment.tz('Asia/Kolkata').format(),
                            type: getData.body.type
                        };
                        var smsScriptPath = "" + getData.body.mobile_number + "&msg=OTP is " + OTP;
                        console.log(smsScriptPath);
                        axios.get(smsScriptPath).then(response => {
                            var arr = response.data.split(":");
                        var arr1 = arr[0].split(" ");
                        if (['API01', 'API03', 'API04', 'API06', 'API07', 'API08', 'API10', 'API10', 'API11'].includes(arr1[arr1.length - 2])) {
                            responseData = {
                                "action": getData.action,
                                "status": "0",
                                "body": {"msg": arr[1]}
                            };
                            res.json(responseData);
                        } else {
                            client.query("INSERT INTO ah_users(mobile_number,otp,create_date,type) values($1,$2,$3,$4) RETURNING ah_users_id", [insertData.mobile_number, insertData.otp, insertData.create_date, insertData.type], function (err, result) {
                                if (err) {
                                    responseData = {"action": getData.action, "status": "0", "body": {"msg": err}};
                                } else {
                                    if (result.rowCount > 0) {
                                        responseData = {
                                            "action": getData.action,
                                            "status": "1",
                                            "body": {
                                                "msg": "Successfully.",
                                                "ah_users_id": result.rows[0]["ah_users_id"],
                                                "type": getData.body.type,
                                                "OTP": OTP
                                            }
                                        };
                                    } else {
                                        responseData = {
                                            "action": getData.action,
                                            "status": "0",
                                            "body": {"msg": "User Not Added"}
                                        };
                                    }
                                }
                                done();
                                res.json(responseData);
                            });
                        }
                    }).
                        catch(error => {
                            console.log(error);
                        res.status(812).send({
                            url: 'Error not found'
                        });
                    })
                        ;
                    }
                }
            });
        }
        else {
            responseData = {
                "action": getData.action,
                "status": "0",
                "body": {"msg": "Action Not Found."}
            };
            res.json(responseData);
        }
        function makeChain(data,parent) {
            if(parent==""){parent=0};
            var tree = {};
            for (var dt in data) {
                if (data[dt]['reply_id'] == parent) {
                    var fd=data[dt];
                    var children = makeChain(data, data[dt]['ah_feedback_id']);
                    if (!Array.isArray(children) || !children.length) {
                        fd['_children']=children;
                    }
                     tree=fd;
                }
            }
            return tree;
        }
    });
};

exports.send_msg_data = function (req, res) {

    try {
        upload(req, res, function (err) {
            // console.log("body", req.body);
            //console.log("file",req.file.filename);
            if (err) {
                res.send("Error uploading file.");
            }
            if (!("filename" in req.body)) {
                if (typeof req.file != "undefined") {
                    // console.log(req.file);
                    if ("filename" in req.file) {
                        var d = {'status': 1, 'name': req.file.filename};
                        // console.log(d);
                        res.send(d);
                    } else {
                        try {
                            var d = {'status': 0, 'msg': "Image Not Proper"};
                            console.log(d);
                            res.send(d);
                        } catch (err) {
                            console.log("Got Error");
                            return;
                        }
                    }
                } else {
                    try {
                        var d = {'status': 0, 'msg': "Image Not Proper"};
                        console.log(d);
                        res.send(d);
                    } catch (err) {
                        console.log("Got Error");
                        return;
                    }
                }
            } else {
                try {
                    var d = {'status': 0, 'msg': "Image Not Proper"};
                    console.log(d);
                    res.send(d);
                } catch (err) {
                    console.log("Got Error");
                    return;
                }
            }
        });
    } catch (err) {
        console.log("Got Error");
        return;
    }
};
    if (err) console.log(err);
    results = [];
    var data = {
        numbers_id : 4
    };
    client.query("update ah_city set age=10 where numbers_id=$1", [data.numbers_id]);
    var query = client.query(format("SELECT * FROM numbers ORDER BY numbers_id ASC"));
    query.on('row', function (row) {
        results.push(row);
    });
    query.on('end', function () {
        client.end();
        /*return res.json(results);
    });
});

pool.connect(function (err, client, done) {
    if (err) console.log(err);
    results = [];
    var data = {
        numbers_id : 5
    };
    client.query("delete from numbers where numbers_id=$1", [data.numbers_id]);
    var query = client.query(format("SELECT * FROM numbers ORDER BY numbers_id ASC"));
    query.on('row', function (row) {
        results.push(row);
    });
    query.on('end', function () {
        client.end();
        /*return res.json(results);
    });
});*/