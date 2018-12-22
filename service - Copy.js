var express = require('express');
var MongoClient1 = require('mongoose');
var body=require('body-parser');

var app = express();

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://trade:a00000@ds049486.mlab.com:49486/mongodbuploads';

var Database = MongoClient.connect(url, function(err , db)
    {
            if(err) console.log("Error is connecting with mongodb.");
            console.log("Connection success")

    })
app.use(body.json());

app.use(body());

app.use(body.urlencoded({extended: false}));
module.exports = (function(app){
	app.get('/', function(req, res){
		console.log("GET Method");
		res.end("GET Method");
	});

    app.post('/log', function(req, res){
        console.log("username: "+req.body.username);
        console.log("password: "+req.body.password);

        MongoClient.connect(url, function(err, database){
            const myDB = database.db('mongodbuploads');
            myDB.collection('user').findOne({ username:req.body.username},
            function(err, user){
                if(user == null){
                    res.end("User Invalid");
                }else if(user.username === req.body.username && 
                    user.password === req.body.password)
                    {
                        res.render('index');
                }else{
                    console.log("Credentials wrong");
                    res.end("Password incorrect");
                }
            });
        });
    //    loginService(app);
    });
});