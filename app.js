//jshint esversion:6
require("dotenv").config();

// level 1 of socurity (Encryption)
// const mongooseEncryption = require("mongoose-encryption");

// level 2 of socurity (hashing)
// const md5 = require("md5");

// level 3 of socurity (hashing with salting)
const bcrypt =require("bcrypt");
const saltRounds= 10;

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/secretsDB", {useNewUrlParser: true});
const userSchema = new mongoose.Schema({
    name : String,
    password: String
});

// level 1 of socurity (Encryption)
// userSchema.plugin(mongooseEncryption,{secret:process.env.SECRET , encryptedFields:["password"]});

const User = mongoose.model("User", userSchema);
  
app.get("/",function(req,res){
    res.render("home");
});

app.get("/register",function(req,res){
    res.render("register");
})

app.post("/register",function(req,res){

    // level 3 of socurity (hashing with salting)
    bcrypt.hash(req.body.password,saltRounds,function(err,hash){
        const newUser = new User ({
            name : req.body.username,
    
            // level 2 of socurity (hashing)
            // password : md5(req.body.password)
    
            // level 3 of socurity (hashing with salting)
            password:hash
    
        });
        newUser.save(function(err){
            if(err){
                res.send(err);
            }else{
                res.render("secrets");
            }
        })
    });
})

app.get("/login",function(req,res){
    res.render("login");
});

app.post("/login",function(req,res){
    const userName = req.body.username;
    
    // level 2 of socurity (hashing)
    // const password =md5(req.body.password);

    User.findOne({name:userName},function(err,user){
        if (err){
            res.send(err);
        }else{
            if (user){

                // level 3 of socurity (hashing with salting)
                bcrypt.compare(req.body.password,user.password,function(err,result){
                    if (result){
                        res.render("secrets");
                    }
                })

                // level 1,2
                // if (user.password === password ) {
                //     res.render("secrets");
                // }

            }
        }
    })
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

