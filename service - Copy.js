var express = require('express');
var body=require('body-parser');
const mongoose = require('mongoose');

var app = express();
const mongoURI = 'mongodb://trade:a00000@ds049486.mlab.com:49486/mongodbuploads';

// var loginService = require('./service - Copy')
// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// var MongoClient = require('mongodb').MongoClient;
// var url = 'mongodb://trade:a00000@ds049486.mlab.com:49486/mongodbuploads';
app.use(body.json());


app.use(body.urlencoded({extended: false}));
module.exports = (function(app){
	app.get('/', function(req, res){
		console.log("GET Method");
		res.end("GET Method");
	});

    app.post('/login', function(req, res){
        console.log("username: "+req.body.username);
        console.log("password: "+req.body.password);

            conn.collection('user').findOne({ username:req.body.username},
            function(err, user){
                if(user == null){
                    res.end("User Invalid");
                }else if(user.username === req.body.username && 
                    user.password === req.body.password)
                    {
                        res.redirect('/index');
                }else{
                    console.log("Credentials wrong");
                    res.end("Password incorrect");
                }
            });
    });
});