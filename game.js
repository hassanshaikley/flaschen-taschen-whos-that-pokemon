var exec = require('child_process').exec;

function puts(error, stdout, stderr) { console.log(stdout) }

function Game(){
  this.current_pokemon;
  this.already_asked = [];
}


Game.prototype.newPokemon = function(){
  //if generation == 151
  var num = (Math.floor(Math.random()*150 + 0)) // number between 0 and 150
  var correct_pokemon = num+1;
  if (this.already_asked.indexOf(correct_pokemon) != -1){
    this.newPokemon();
  }
    //for num 50 the correct answer is 51
  var pokemon_file =  "images/pokemon_" + num +".png";
  var str = "./../flaschen-taschen/client/send-image -h localhost -g 32x32-3-3 ";
  str+=pokemon_file;
  exec(str, puts);
  console.log("Pokemon num is " + correct_pokemon);

  this.already_asked.push(correct_pokemon);
}


exports.Game = Game;
