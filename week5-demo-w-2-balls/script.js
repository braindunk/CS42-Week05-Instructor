"use strict";

// simplified steps for making a Phaser-based game with one scene

// 1. defining a set of game configuration properties
const config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    physics: {
      default: 'arcade'
    },
    scene: {
      preload: myPreload,
      create: myCreate,
      update: myUpdate
    }
  };

// 2. define global variables
  // simple numbers to track game economy metrics like score, how balls the player has
let score_value, balls_available;
  // reference to game objects we create that we need to do stuff with from time to time
let ball, paddle, bricks;
  // create a second ball: global variable
let ball2;

// 3. We have at least three functions to successfully create a single scene in our game: preload
function myPreload() {
    // load 3 assets
    this.load.image('ball_image','img/ball.png');
    this.load.image('brick_image','img/brick.png');
    this.load.image('paddle_image','img/paddle.png');
}

// 4. create
function myCreate() {
    // make the edges of stage collidable so ball bounces off them
    this.physics.world.setBoundsCollision( true, true, true, false );

    // create the first game object: ball
    ball = this.physics.add.sprite( 400, 500, 'ball_image' );
    ball.setCollideWorldBounds( true );
    ball.setBounce(1); // 0-1 where 1=100% of the inertial energy goes back into the ball

    // create a second ball: make game object off screen
    ball2 = this.physics.add.sprite( 900, 500, 'ball_image' );
    ball2.setCollideWorldBounds( false );
    ball2.setBounce(1);

    // make the paddle
    paddle = this.physics.add.sprite( 400, 550, 'paddle_image' );
    paddle.setScale( 2, 1 );
    paddle.setImmovable();

    // make a group of bricks
    bricks = this.physics.add.group(
        {
            key: 'brick_image',
            quantity: 120,
            gridAlign: {
                width: 20,
                height: 6,
                cellWidth: 32,
                cellHeight: 48,
                x: 112,
                y: 100
            }
        }
    );

    // Phaser 4.2.1 syntax for iterating over a group of objects (replaces iterate)
    bricks.children.forEach(
        function(one_brick) {
            one_brick.setImmovable();
        }
    );

    // now establish the collisions we care about detecting: 

        // ball touches paddle
        this.physics.add.collider( ball, paddle, hitPaddle, null, this );

        // ball touches a brick in the bricks group
        this.physics.add.collider( ball, bricks, hitBrick, null, this );

        // create a second ball: add collision detection
        this.physics.add.collider( ball2, paddle, hitPaddle, null, this );
        this.physics.add.collider( ball2, bricks, hitBrick, null, this );

    // manage user input using on() event handler (pointer)
    this.input.on( 'pointermove', movePaddle, this );
    this.input.on( 'pointerup', launchBall, this );

    // initialze some numeric values for score, and balls
    score_value = 0;
    balls_available = 3;
}

// 5. update (run every frame of game loop)
function myUpdate() {
    if ( ball.y > 600 ) {
        console.log('ball lost!');
        balls_available--;
        if (balls_available > 0) {
            ball.x = 400;
            ball.y = 500;
            ball.setVelocity(0,0);
        } else {
            console.log('game over!');
            ball.y = 600;
            ball.setVelocity(0,0);
        }
    }
    // create a second ball: check if ball went past paddle
    if ( ball2.y > 600 ) {
        console.log('ball2 lost!');
        ball2.setVelocity(0,0);
        ball2.setCollideWorldBounds( false );
        ball2.x = 900;
        ball2.y = 500;
    }
}

// 6. Create a new phaser game object
const mygame = new Phaser.Game( config );

// 7. We might also define other custom functions
function hitPaddle() {
    console.log('ball hit paddle');
}
function hitBrick( ball_hit, brick_hit ) {
    brick_hit.disableBody(true, true);
    score_value = score_value + 10;
    // create a second ball: put ball in play if score is 100
    if (score_value === 100) {
        ball2.x = 400;
        ball2.y = 500;
        ball2.setVelocity( 75, -300 );
        ball2.setCollideWorldBounds( true );
    }
    console.log(score_value);
}
function movePaddle( pointer ) {
    paddle.x = pointer.x;
}
function launchBall() {
    if (balls_available > 0) {
        ball.setVelocity( -75, -300 );
    }
}
