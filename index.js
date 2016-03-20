var util = require('util')

var express = require('express');
var app = express();

var Game = require('./game').Game;

var bodyParser = require('body-parser')

var game; //Global for the current game

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use( bodyParser.json() );       // to support JSON-encoded bodies

app.set("view options", {layout: false});
app.use(express.static(__dirname + '/views'));

app.get('/', function (req, res) {
  res.render('index.html');
});

app.post('/guess', function (req, res) {
  console.log(">>"+req.body.pokemon);
  
  //call this if they got it right
  game.newPokemon();
  res.redirect('/');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
  game = new Game();
  game.newPokemon();
});
