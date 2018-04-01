var app = {
  startGame: function() {
    velX = 0;
    velY = 0;

    app.determinaDispositivo();
    app.snakeGame();
  },

  snakeGame: function() {
    alert("El juego se iniciara.\nPara mover la víbora: Inclina hacia la derecha o la izquierda el dispositivo o apreta las flechas de izquierda o derecha.");
    var width = document.documentElement.clientWidth;
    var height = document.documentElement.clientHeight;

    var game = new Phaser.Game(width, height, Phaser.CANVAS, 'snake', {
      preload: preload,
      create: create,
      update: update
    });

    function preload() {
      game.load.image('bg', 'assets/bg.png');
      game.load.image('snakebody', 'assets/snakebody.png');
      game.load.image('snakehead', 'assets/snakehead.png');
      game.load.image('bunny', 'assets/bunny.png');
    }

    var snakeHead;
    var headSize = 30;
    var snakeBody = new Array();
    var snakePath = new Array();
    var snakeSize = 2;
    var snakePadding = 2;
    var difficulty = 200;
    var score = 0;
    var scoreText;

    function create() {
      game.physics.startSystem(Phaser.Physics.ARCADE);

      game.world.setBounds(0, 0, width, height);

      cursors = game.input.keyboard.createCursorKeys();

      bg = game.add.sprite(0, 0, 'bg');

      snakeHead = game.add.sprite(width / 2, height / 2, 'snakehead');

      for (var i = 1; i <= snakeSize - 1; i++) {
        snakeBody[i] = game.add.sprite(snakeHead.world.x, snakeHead.world.y, 'snakebody');
        snakeBody[i].anchor.setTo(0.5, 0.5);
      }

      for (var i = 0; i <= snakeSize * snakePadding; i++) {
        snakePath[i] = new Phaser.Point(snakeHead.world.x, snakeHead.world.y);
      }

      bunny = game.add.sprite(randomX(), randomY(), 'bunny');
      snakeHead.anchor.setTo(0.5, 0.5);

      game.physics.enable(snakeHead, Phaser.Physics.ARCADE);
      game.physics.enable(bunny, Phaser.Physics.ARCADE);
      snakeHead.body.collideWorldBounds = true;
      snakeHead.body.onWorldBounds = new Phaser.Signal();
      snakeHead.body.onWorldBounds.add(endGame)

      scoreText = game.add.text(16, 16, '', {
        fontSize: '40px',
        fill: '#fff'
      });
    }

    function update() {
      snakeHead.body.velocity.setTo(0, 0);
      snakeHead.body.angularVelocity = 0;
      snakeHead.body.velocity.copyFrom(game.physics.arcade.velocityFromAngle(snakeHead.angle, difficulty));
      var part = snakePath.pop();
      part.setTo(snakeHead.x, snakeHead.y);
      snakePath.unshift(part);

      for (var i = 1; i <= snakeSize - 1; i++) {
        snakeBody[i].x = (snakePath[i * snakePadding]).x;
        snakeBody[i].y = (snakePath[i * snakePadding]).y;
      }

      if (navigator.userAgent.match(/Android/i) == "Android") {
        if (velX > 2) {
            snakeHead.body.angularVelocity = -300;
        } 
        else if (velX < -2){
            snakeHead.body.angularVelocity = 300;
        }
      }
      else {
        if (cursors.left.isDown) {
          snakeHead.body.angularVelocity = -300;
        } 
        else if (cursors.right.isDown) {
          snakeHead.body.angularVelocity = 300;
        }
      }

      scoreText.text = 'Puntuación: ' + score;

      game.physics.arcade.overlap(snakeHead, bunny, createFood, null, this);
      game.physics.arcade.overlap(snakeHead, snakeBody, endGame, null, this);
    }

    function getRandom(limit) {
      return Math.floor(Math.random() * limit);
    }

    function randomX() {
      return getRandom(width - headSize);
    }

    function randomY() {
      return getRandom(height - headSize);
    }

    function createFood() {
      snakeSize += 1;
      score += 1;
      difficulty += 10;
      bunny.body.x = randomX();
      bunny.body.y = randomY();

      if (snakeSize > 10) {
        snakeBody[snakeSize - 1] = game.add.sprite(snakeBody[snakeSize - 2].world.x, snakeBody[snakeSize - 2].world.y, 'snakebody');
        game.physics.enable(snakeBody[snakeSize - 1], Phaser.Physics.ARCADE);

      } else {
        snakeBody[snakeSize - 1] = game.add.sprite(snakeHead.world.x, snakeHead.world.y, 'snakebody');
      }

      snakeBody[snakeSize - 1].anchor.setTo(0.5, 0.5);

      for (var i = -1; i < 2; i++) {
        snakePath[(snakeSize * snakePadding) + i] = new Phaser.Point(snakeHead.world.x, snakeHead.world.y);
      }
    }

    function endGame() {
      game.destroy();
      alert("Terminaste! Puntuación final: " + score);
      location.reload();
    }
  },

  vigilaSensores: function(){
    
    function onError() {
        console.log('onError!');
    }

    function onSuccess(datosAceleracion){
      app.registraDireccion(datosAceleracion);
    }

    navigator.accelerometer.watchAcceleration(onSuccess, onError,{ frequency: 50 });
  },

  determinaDispositivo: function() {
    if (navigator.userAgent.match(/Android/i) == "Android") {
      app.vigilaSensores();
    }
  },

  registraDireccion: function(datosAceleracion){
    velX = datosAceleracion.x ;
    velY = datosAceleracion.y ;
  }
};

if ('addEventListener' in document) {
  document.addEventListener('deviceready', function() {
    app.startGame();
  }, false);
};