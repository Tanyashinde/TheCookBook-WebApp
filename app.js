var express = require('express');
var path = require('path');
const fetch = require('node-fetch');
var firebase = require("firebase/app");
require("firebase/auth");
require('firebase/storage');
require('firebase/database');
var alert = require("alert-node");
var app = express();
bb = require("express-busboy");
fs = require("fs");

const XMLHttpRequest = require("xhr2");
global.XMLHttpRequest = XMLHttpRequest;

app.use(
    require("express-session")({
      secret: "Random text",
      resave: false,
      saveUninitialized: false,
    })
  );
  
  app.set("view engine", "ejs");
  app.set('views', path.join(__dirname, 'views'));
  bb.extend(app, {
    upload: true,
  });//make a view folder

//app.use(bodyparser.json());
//app.use(bodyparser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public'))); //make a public folder

const firebaseConfig = {
    apiKey: "AIzaSyAzRDDBYo-pDcpSyMBAmiy_Ks-50T8_AY8",
    authDomain: "the-cook-book-b4fe4.firebaseapp.com",
    databaseURL: "https://the-cook-book-b4fe4.firebaseio.com",
    projectId: "the-cook-book-b4fe4",
    storageBucket: "the-cook-book-b4fe4.appspot.com",
    messagingSenderId: "319112120238",
    appId: "1:319112120238:web:953561a1b073e5116c2a3f",
    measurementId: "G-XSXYLQM1CY"
};
firebase.initializeApp(firebaseConfig);
//var storageRef = firebase.storage().ref();
var user= null;

app.get('/', function (req, response) {
        if(user==null){
            alert("please login first");
            response.render('login', {
                title: 'login screen'
            });
        }
        else{
            response.render('index', {
                title: 'The cook book'
            });
        }
});


app.get('/filter', function (req, response) {
    response.render('filter', {});
});
app.get('/login', function (req, response) {
    response.render('login', {});
});
app.get('/signup', function (req, response) {
    response.render('signup', {});
});
app.get('/addr',function(req,response){
    response.render('addr',{});
})

app.get('/profile', function (req, response) {
    user = firebase.auth().currentUser;
    var email, uid;
    var username;
    if (user != null) {
        email = user.email;
        uid = user.uid;
    }
    var img;
    firebase.database().ref('/users/' + uid).once('value').then(function(snapshot) {
        username = (snapshot.val() && snapshot.val().username);
        img = 'data:image/png;base64,' + snapshot.val().imgStr;
        console.log(username);
        response.render('profile', {
            title: 'profile page',
            email: email,
            user: uid,
            url: img,
            username: username
        });
        
      });
    
    
});


app.post('/search', function (req, response) {
    console.log(req.body.search);

    const url = "https://www.themealdb.com/api/json/v1/1/search.php?s="
    const apiurl = url + req.body.search;

    fetch(apiurl)
        .then(res => res.json())
        .then(json => {
            response.render('searchdata', {
                title: 'Meals', data: json['meals']
            });

        })
        .catch(err => {
            response.redirect('/');
        });

})

app.post('/filters', function (req, response) {
    console.log(req.body.category);
    console.log(req.body.Area);

    /*const urlc="https://www.themealdb.com/api/json/v1/1/filter.php?c=";
    const urla= "https://www.themealdb.com/api/json/v1/1/filter.php?a=";

    const urlcc= urlc+ req.body.category;
    const urlaa= urla+ req.body.Area;*/

});

app.post('/loginaction', function (req, response) {
    if(user==null){
        firebase.auth().signInWithEmailAndPassword(req.body.Email, req.body.psw)
    .then((userData) => {
        user= userData.user.uid;
    })
    .then(() =>{
        response.render('index', {
            title :'Home'
        }),
        alert("Login Success");
    })
    .catch(function (error) {
        console.log("unsuccessfull login")
        alert("error.....");
    });
    }
    else{
        alert("You are already logged in");
        response.render('index',{
            title: 'Home'
        });
    }
    

})

app.post('/signupaction', function (req, response) {

    console.log(req.body.username);
    console.log(req.files.image);  
    var filename = req.files.image.filename;
    var filepath = req.files.image.file;

    var file = fs.readFileSync(filepath);
    file = new Buffer(file).toString('base64');

    if(user==null)
    {
        firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.psw)
        .then((userData) =>{
            user= userData.user.uid;

        })
        .then(() => {
            console.log(firebase.auth().currentUser.uid);
            firebase
              .database()
              .ref("users/" + user)
              .set({
                username: req.body.username,
                email: req.body.email,
                imgStr: file
              });
      
            // ref.child(filename)
            //   .put(file)
            //   .then(uploadDetails => console.log(uploadDetails))
            //   .catch(err => console.log(err.message));
              
          })
        .then(() => {response.render('index', {
                title: 'signupsuccess'
        })})
        .catch(function (error) {
            console.log(error)
        });
    }
    else{
        alert("You are already logged in");
        response.render('index',{
            title: 'Home'
        });
    }
        

})

app.post('/add_recipe',function(req,response){
    console.log(req.body.Rname)
    console.log(req.body.category)
    console.log(req.body.description)
    console.log(req.files.Rpic)
    console.log(user)


    //var filename = req.files.Rpic.filename;
    var filepath = req.files.Rpic.file;

    var file = fs.readFileSync(filepath);
    file = new Buffer(file).toString('base64');

    if(user){
        firebase
              .database()
              .ref("Recipies/" + user)
              .set({
                RecipeName: req.body.Rname,
                Category: req.body.category,
                Description: req.body.description,
                imgStr: file
              })
              .then(() =>{response.render('index',{})});
    }
})

app.listen(8080, function () {
    console.log("server started on 8080...");
})