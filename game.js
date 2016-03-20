var exec = require('child_process').exec;
var fs = require('fs');

var flaschen_client_dir = process.env.FLASCHEN_CLIENT_DIR

function puts(error, stdout, stderr) { 
  //console.log(stdout) 
}

function Game(){
  this.already_asked = [];
  this.state = 0; // 1 means good, can guess
  this.target = "localhost";
  this.current_pokemon = -1;
};

Game.prototype.start = function(){

  //clear canvas
  str = "./bin/send-image -C -l 5 -h " +this.target +" -g 50x50 ";
  exec(str, puts);
  
  var str='./bin/send-text -l 10 -o -c FF0000 -f bin/5x5.bdf -g 40x20+0+3 -h '+this.target+ ' "Who\'s That Pokemon!"'
  exec(str, puts);

  var that = this;
  setTimeout(function() {
    that.state = 1;
    that.newPokemon();
  }, 8000);

  setInterval(function() {
    that.loop();
  }, 500);
}

Game.prototype.loop = function(){
  var str = "./bin/send-image -l 1 -h " +this.target +" -g 40x40 images/";
  str+= "blueray.png";
  exec(str, puts);
  if (this.current_pokemon != -1){
    var pokemon_file =  "images/pokemon_v2_" + (this.current_pokemon-1) +".png";
    if (this.state == 0){
      pokemon_file =  "images/c_pokemon_v2_" + (this.current_pokemon-1) +".png";
    }
    str = "./bin/send-image -l 5 -h " + this.target +" -g 28x28+5+0 ";
    str+=pokemon_file;
    exec(str, puts);
  }
};

Game.prototype.newPokemon = function(){
  //if generation == 151
  var num = (Math.floor(Math.random()*150 + 0)); // number between 0 and 150
  this.current_pokemon = num+1;
  if (this.already_asked.indexOf(this.current_pokemon) != -1){
    this.newPokemon();
  }
  //for num 50 the correct answer is 51
  console.log("Pokemon num is " + this.current_pokemon);

  this.already_asked.push(this.current_pokemon);
};

//Given a number checks if the number matches the current pokemon
Game.prototype.checkPokemon = function(pokemon){
  if (this.state == 0){
    console.log("not ready to check pokemon, state is 0");
    return;
  }
  var that = this;
  get_line('bin/pokemon_list.txt', this.current_pokemon-1, function(err, line){
      console.log('The line: ' + line + ", the pokemon: " + pokemon);

      if (line.toLowerCase() == pokemon.toLowerCase()){
      that.correctAnswer(pokemon);
      }
      });

};

Game.prototype.correctAnswer = function(guess){
  if (this.state === 0){
    console.log("You got this right but it ain't the time");
    return;
  }
  this.state = 0;
  
  str='./bin/send-text -l 10 -o -c FF0000 -f bin/5x5.bdf -g 40x20+0+3 -h ' + this.target + ' "It\'s ' + guess + '!"'
    exec(str, puts);
  console.log(">>>" +str); 
  this.loop();
  var that = this;
  setTimeout(function(){ 
      that.state = 1;
      that.newPokemon();
      }, 8000);
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
