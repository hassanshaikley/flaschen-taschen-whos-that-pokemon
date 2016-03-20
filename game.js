var exec = require('child_process').exec;

var fs = require('fs');

function puts(error, stdout, stderr) { console.log(stdout) }

function Game(){
  this.current_pokemon;
  this.already_asked = [];
  this.state = 1; // 1 means good, can guess
};


Game.prototype.newPokemon = function(){
  //if generation == 151
  var num = (Math.floor(Math.random()*150 + 0)); // number between 0 and 150
  this.current_pokemon = num+1;
  if (this.already_asked.indexOf(this.current_pokemon) != -1){
    this.newPokemon();
  }
  //for num 50 the correct answer is 51
  var pokemon_file =  "images/pokemon_" + num +".png";
  var str = "./../flaschen-taschen/client/send-image -h localhost -g 32x32-3-3 ";
  str+=pokemon_file;
  exec(str, puts);
  console.log("Pokemon num is " + this.current_pokemon);

  this.already_asked.push(this.current_pokemon);
};

//Given a number checks if the number matches the current pokemon
Game.prototype.checkPokemon = function(pokemon){
  var that = this;
  get_line('pokemon_list.txt', this.current_pokemon-1, function(err, line){
      console.log('The line: ' + line + ", the pokemon: " + pokemon);

      if (line.toLowerCase() == pokemon.toLowerCase()){
      console.log("SHIT MATCHES BIATCH");
      that.correctAnswer(pokemon);
      }
      });

};

Game.prototype.correctAnswer = function(guess){
  //SHIT YOU GOT THE RIGHT ANSWER! PASS AN ANIMATION THEN WRITE "YES IT WAS ABRA"
  if (this.state === 0){
    console.log("You got this right but it ain't the time");
    return;
  }
  this.state = 0;
  var str = './../flaschen-taschen/client/send-text -c 100000 -f fonts/5x5.bdf -g 40x20+0+3 -h localhost "YES!! '+ guess +'!!"'
  var str='./../flaschen-taschen/client/send-text -o -c FF0000 -f ../flaschen-taschen/client/fonts/5x5.bdf -g 40x20+0+3 -h localhost "YES!! ' + guess + '!!!"'
    exec(str, puts);
  var that = this;
  setTimeout(function(){ 
      that.state = 1;
      that.newPokemon();
      }, 3000);
};

function get_line(filename, line_no, callback) {
  fs.readFile(filename, function (err, data) {
      if (err) throw err;

      // Data is a buffer that we need to convert to a string
      // Improvement: loop over the buffer and stop when the line is reached
      var lines = data.toString('utf-8').split("\n");

      if(+line_no > lines.length){
      return callback('File end reached without finding line', null);
      }

      callback(null, lines[+line_no]);
      });
}


exports.Game = Game;
