//jshint esversion:6
require("dotenv").config();

// level 1 of socurity (Encryption)
// const mongooseEncryption = require("mongoose-encryption");

// level 2 of socurity (hashing)
// const md5 = require("md5");

// level 3 of socurity (hashing with salting)
// const bcrypt =require("bcrypt");
// const saltRounds= 10;

// level 4 (cookies)
const session = require ("express-session"); // come first
const passport =require("passport"); 
const passportLocalMongoose = require("passport-local-mongoose");


const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// level 4 (cookies)
app.use(session({
    secret:"my secret code.",
    resave:false ,
    saveUninitialized:false 
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/secretsDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    name : String,
    password: String,
    secret:String
});

// level 1 of socurity (Encryption)
// userSchema.plugin(mongooseEncryption,{secret:process.env.SECRET , encryptedFields:["password"]});

// level 4 (cookies)
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

// level 4 (cookies)
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("home");
});

app.get("/register",function(req,res){
    res.render("register");
});
app.get("/secrets",function(req,res){
    User.find({"secret":{$ne:null}},function(err,user){
        if (err){
            console.log(err);
        }else {
            if (user){
                res.render("secrets",{usersWithSecrets:user});
            }
        }
    });
    // if(req.isAuthenticated()){
    //     res.render("secrets");
    // }else{
    //     res.redirect("/login");
    // }
    
});
app.get("/logout",function(req,res){
    req.logOut();
    res.redirect("/");
});
app.get("/submit",function(req,res){
    if(req.isAuthenticated()){
        res.render("submit");
    }else{
        res.redirect("/login");
    }
});

app.post("/submit",function(req,res){
    const reqSecret = req.body.secret ;
    User.findById(req.user._id,function(err,user){
        if(err){
            console.log(err);
        }else{
            if (user){
                user.secret=reqSecret ;
                user.save(function(){
                    res.redirect("/secrets");
                })
            }
        }
    });
});
app.post("/register",function(req,res){

    /*  level 1 of socurity
    const newUser = new User ({
        name : req.body.username,
        password:req.body.password
    });
    newUser.save(function(err){
        if(err){
            res.send(err);
        }else{
            res.render("secrets");
        }
    })
    */  

    /* level 2 of socurity (hashing)
        const newUser = new User ({
            name : req.body.username,
            password : md5(req.body.password)
        });
        newUser.save(function(err){
            if(err){
                res.send(err);
            }else{
                res.render("secrets");
            }
        })
    */

    /* level 3 of socurity (hashing with salting)
    bcrypt.hash(req.body.password,saltRounds,function(err,hash){
        const newUser = new User ({
            name : req.body.username,
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
     */

     // level 4 (cookies)
     User.register({username:req.body.username},req.body.password,function(err,user){
         if(err){
             console.log(err);
             res.redirect("/register");
         }else{
             passport.authenticate("local")(req,res,function(){
                 res.redirect("/secrets");
             })
         }
     })

});

app.get("/login",function(req,res){
    res.render("login");
});

app.post("/login",function(req,res){
    const userName = req.body;

    /*  level 1 of socurity
    const password =req.body.password;
    User.findOne({name:userName},function(err,user){
        if (err){
            res.send(err);
        }else{
            if (user){
                if (user.password === password ) {
                    res.render("secrets");
                }
            }
        }
    })
    */

    /* level 2 of socurity (hashing)
    const password =md5(req.body.password);
    User.findOne({name:userName},function(err,user){
        if (err){
            res.send(err);
        }else{
            if (user){
                if (user.password === password ) {
                    res.render("secrets");
                }
            }
        }
    })
    */

    /* level 3 of socurity (hashing with salting)
    User.findOne({name:userName},function(err,user){
        if (err){
            res.send(err);
        }else{
            if (user){
                bcrypt.compare(req.body.password,user.password,function(err,result){
                    if (result){
                        res.render("secrets");
                    }
                })
            }
        }
    })
    */

    // level 4 (cookies)
    const newUser = new User ({
        username:req.body.username ,
        password:req.body.password 
    });
    req.logIn(newUser,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate('local')(req,res,function(){
                res.redirect("/secrets");
            });
        }
    })
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

