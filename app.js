
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");


 
const app = express();

console.log(process.env.SECRET);
 
const port = process.env.PORT || 3000;
 
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true,useUnifiedTopology: true });

const userSchema = new mongoose.Schema({ //Encrpyt addition  -no longer simple JS object
    email: String,
    password: String
});

// const secret = "Thisisourlittlesecret."; //Encrpytion Key addition taken out
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });//Encrypt addition - encrypt just password

const User = mongoose.model("User", userSchema);

 
app.get('/', (req, res) => { //home root route
  res.render('home');
});
 
app.get('/login', (req, res) => { //login route
  res.render('login');
});
 
app.post("/login", (req, res) => {  //login credentials check
  const username = req.body.username;// derive props from req body
  const password = req.body.password;

  ///////////SEARCH DB FOR PASSWORD MATCH///////////////////

  User.findOne({ email: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) { //if email exists take to secrets page
        if (foundUser.password === password) { //SHOULD DECRYPT HERE!!!!
          res.render("secrets");
        }
      }
    }
  });
});

app.get('/register', (req, res) => { //register route
  res.render('register');
});

 
app.post("/register", (req, res) => {  //register route
  const newUser = new User({ //construct new user object from props
    email: req.body.username,
    password: req.body.password,
  });

  newUser.save(function (err) { //save new user via encryption
    if (err) {
      console.log(err);
    } else {
      res.render("secrets"); //render only if registered or logged in
    }
  });
});

 
app.listen(port, () => console.log(`Server started at port: ${port}`)
);