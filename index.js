var util = require('util')

var express = require('express');
var app = express();

var Game = require('./game').Game;

var bodyParser = require('body-parser')

app.game; //Global for the current game

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
  console.log("Guess received: "+req.body.pokemon);
  app.game.checkPokemon(req.body.pokemon);
  res.redirect('/');
});

app.listen(3000, function () {
  console.log('Who\'s that Pokemon listening on port 3000!');
  app.game = new Game();
});
