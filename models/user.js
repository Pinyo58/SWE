var MongoClient = require('mongoose');

var userSchema = MongoClient.Schema(
    {
        username: {type:String, require:true},
        password: {type:String, require:true},
        confrimpassword: {type:String, require:true},
        email: {type:String, require:true}
    })

    var User = module.exports = MongoClient.model('User', userSchema);