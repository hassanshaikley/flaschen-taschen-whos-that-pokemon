var util = require('util')
var express = require('express');
var bodyParser = require('body-parser')

var Game = require('./game').Game;

var app = express();

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use( bodyParser.json() );       // to support JSON-encoded bodies

app.set("view options", {layout: false});
app.use(express.static(__dirname + '/lib/views'));

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
  var args = process.argv.slice(2);
  if (args[0]){
    app.game.target = args[0];
  }
  app.game.start();
});
