const Ship = require("./game_objects/ship/ship");
const Walls = require("./game_objects/Walls/walls")
const Overlay = require("./game_objects/Overlay/overlay")
const Grid = require("./game_objects/particles/Grid/grid")
const BoxBox = require("./game_objects/enemies/BoxBox/boxbox");
const Pinwheel = require("./game_objects/enemies/Pinwheel/pinwheel");
const Arrow = require("./game_objects/enemies/Arrow/arrow");
const Grunt = require("./game_objects/enemies/Grunt/grunt");
const Weaver = require("./game_objects/enemies/Weaver/weaver");
const Singularity = require("./game_objects/enemies/Singularity/singularity");
const AlienShip = require("./game_objects/enemies/Singularity/alien_ship")
const ParticleExplosion = require("./game_objects/particles/particle_explosion")
const ShipExplosion = require("./game_objects/particles/ship_explosion")

const Util = require("./game_engine/util");
const Sound = require("./game_engine/sound")
const StateMachine = require("./game_engine/state_machine")

class GameScript {
  constructor(engine) {
    this.theme = new Sound("GEOWars/sounds/Geometry_OST.mp3", 1)
    this.gameOverSound = new Sound("GEOWars/sounds/Game_over.wav")
    this.gameStartSound = new Sound("GEOWars/sounds/Game_start.wav")
    this.shipDeathSound = new Sound("GEOWars/sounds/Ship_explode.wav")
    this.DIM_X = 1000;
    this.DIM_Y = 600;
    this.BG_COLOR = "#000000";
    this.gameTime = 0;
    this.score = 0;
    this.engine = engine
    this.arrowAdded = false
    this.startPosition = [500,300]
    this.ship = this.createShip();
    this.walls = this.createWalls();
    this.grid = this.createGrid();
    this.overlay = this.createOverlay();
    this.enemyCreatorList = this.createEnemyCreatorList()
    this.engine.addxButtonListener(this)
    this.aliveEnemies = [];
    this.sequenceTypes = this.addSequenceTypes()
    this.spawnStateMachine = this.createSpawnStateMachine()
    this.deathPausedTime = 0;
    this.deathPaused = true;
    this.deathPauseTime = 2500;
    // this.deathSound = new Audio("GEOWars/sounds/Enemy_explode.wav")
    // this.deathSound.volume = 0.5;
    
    this.intervalTiming = 1;
    this.intervalTime = 0;
    this.hugeSequenceTime = 0;
    this.sequenceCount = 0;
    this.lives = 3;
    this.soundsToPlay = {}
    this.scoreMultiplier = 1

    this.spawnthing = false;
    this.explosionColorWheel = 0;
  }

  updatexButtonListener(xButton) {
    if(xButton[0]){

      if(this.engine.paused){
        var modal = document.getElementById('endModal');

        modal.style.display = "none";
        this.engine.paused = false;
        if (!this.engine.muted) {
          this.engine.gameScript.theme.play()
        }
      }
    }
  }

  update(deltaTime) {

    this.spawnSequence(deltaTime)
    this.changeExplosionColor()
  }

  changeExplosionColor() {
    this.explosionColorWheel += 1 / 2
    this.explosionColorWheel = this.explosionColorWheel % 360
  }

  tallyScore(gameObject) {
    this.score += gameObject.points * this.scoreMultiplier
    if (this.score){
    }
  }

  resetGame() {
    this.deathPaused = true
    this.desplayEndScore = this.score
    this.score = 0
    this.lives = 3
    this.ship.transform.pos = this.startPosition
    this.sequenceCount = 0
    this.deathPauseTime = 2500;
    this.ship.powerLevel = 1;
    this.intervalTiming = 1;
    this.intervalTime = 0;
    this.hugeSequenceTime = 0;
    this.lives = 3;
    this.scoreMultiplier = 1
    this.spawnthing = false;
    this.engine.paused = true;
    var modal = document.getElementById('endModal');
    modal.style.display = "block";
    var scoreDisplay = document.getElementById('score');
    scoreDisplay.innerHTML = `score: ${this.desplayEndScore}`;


    // Get the button that opens the modal
    // var btn = document.getElementById("myBtn");

    // Get the <span> element that closes the modal
    var xclose = document.getElementsByClassName("endClose")[0];

    // When the user clicks on <span> (x), close the modal
    xclose.onclick = (e) => {
      e.stopPropagation()
      modal.style.display = "none";
      this.engine.paused = false;
      window.removeEventListener('click', closeModalWithClick, false)
      if (!this.engine.muted) {
        this.engine.gameScript.theme.play()
        this.engine.gameScript.gameStartSound.play()
      }
    }

    let closeModalWithClick = (e) => {
      if (event.target == modal) {
        this.engine.paused = false;
        if (!this.engine.muted) {
          this.engine.gameScript.theme.play()
          this.engine.gameScript.gameStartSound.play()
        }
        modal.style.display = "none";
        window.removeEventListener('click', closeModalWithClick, false)
      }
    }

    // When the user clicks anywhere outside of the modal, close it
     window.addEventListener('click', closeModalWithClick, false)

  }

  death() { 

    this.lives -= 1
    this.deathPaused = true
    this.explodeEverything()
    this.deathPauseTime = 4000;
    if (!this.engine.muted) {
      this.engine.gameScript.shipDeathSound.play()
    }
    this.grid.Playerdies(this.ship.transform.absolutePosition())
    if(this.lives === 0){
      try {
        this.theme.pause()

      } catch(err) {

      }
      if (!this.engine.muted) {
        this.engine.gameScript.gameOverSound.play()
      }
      // this.playSoundthis.gameOverSound
      window.setTimeout(this.resetGame.bind(this), 2000)
    }

  }

  gameOver() {
    // end the game here
  }

  explodeEverything(){
    let removeList = []
    let typesToRemove = ["Grunt", "Pinwheel", "BoxBox", "Arrow", "Singularity", "Weaver", "AlienShip"]
    this.engine.gameObjects.forEach((object) => {
      if (object.constructor.name === "Ship") {
        let objectTransform = object.transform
        let pos = objectTransform.absolutePosition()
        let explosion = new ShipExplosion(this.engine, pos, [0,0])
      } else if (object.constructor.name === "Bullet") {
        removeList.push(object)
      }
      else if (typesToRemove.includes(object.constructor.name)) {
        let objectTransform = object.transform
        let pos = objectTransform.absolutePosition()
        let vel = objectTransform.absoluteVelocity()
        let explosion = new ParticleExplosion(this.engine, pos, vel)
        removeList.push(object)
      }
    })
    removeList.forEach((removeThis) => {
      removeThis.remove()
    })

  }

  onPause(){
    try {
      this.theme.pause()
    } catch (error) {
    }
    
    var modal = document.getElementById('pauseModal');
    modal.style.display = "block";
  }

  onUnPause(){
    try {
      this.theme.unPause()
    } catch (error) {}
    
    var modal = document.getElementById('pauseModal');
    modal.style.display = "none";
  }

  randomArrowDirection() {
    let angles = [0, Math.PI / 2, Math.PI, Math.PI * 3 / 2]
    return angles[Math.floor(Math.random() * angles.length) % angles.length]
  }

  createEnemyCreatorList() {
    let engine = this.engine 
    return {
      BoxBox:      (pos)        => (new BoxBox(engine, pos)),
      Pinwheel:    (pos)        => (new Pinwheel(engine, pos)),
      Arrow:       (pos, angle) => (new Arrow(engine, pos, angle)),
      Grunt:       (pos)        => (new Grunt(engine, pos, this.ship.transform)),
      Weaver:      (pos)        => (new Weaver(engine, pos, this.ship.transform)),
      Singularity: (pos)        => (new Singularity(engine, pos)),
      AlienShip:   (pos)        => (new AlienShip(engine, pos, [0,0], this.ship.transform)),
    };
  }



  randomSpawnEnemy(enemy) {
    let pos = this.randomPosition();
    let enemyCreators = Object.values(this.enemyCreatorList)
    enemyCreators[Math.floor(Math.random() * enemyCreators.length) % enemyCreators.length](pos);
    // this.enemyCreatorList["BoxBox"](pos)
  }

  addSequenceTypes() {
    return {
      Singularity: () => {
        this.enemyCreatorList["Singularity"]([700, 300])
      },
      EasyGroups: () => {
        let randomPositions = []
        for (let i = 0; i < 5; i++) {
          let pos = this.randomPosition();
          randomPositions.push(pos)
        }
        randomPositions.forEach((pos) => {
          let possibleSpawns = ["BoxBox", "Pinwheel"] //, "Singularity"]
          this.enemyCreatorList[possibleSpawns[Math.floor(Math.random() * possibleSpawns.length) % possibleSpawns.length]](pos)
        })
      },
      EasyGroupsArrows: () => {
        let randomPositions = []
        for (let i = 0; i < 5; i++) {
          let pos = this.randomPosition();
          randomPositions.push(pos)
        }
        randomPositions.forEach((pos) => {
          let possibleSpawns = ["BoxBox", "Pinwheel", "Arrow", "Singularity"]
          this.enemyCreatorList[possibleSpawns[Math.floor(Math.random() * possibleSpawns.length) % possibleSpawns.length]](pos)
        })
      },
      ArrowsAttack: () => {
        let somePositions = [[200,300], [1000, 300], [600, 100]]
        let pos = somePositions[Math.floor(Math.random() * somePositions.length) % somePositions.length]
        for (let i = 0; i < 5; i++) {
          pos[1] += i * 80
          this.enemyCreatorList["Arrow"](pos)
        }
      },
      GruntGroups: () => {
        let randomPos = this.randomPosition();
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
              this.enemyCreatorList["Grunt"]([i * 40 + randomPos[0], j * 40 + randomPos[1]])
          }
        }
      },
      GreenGroups: () => {
        let randomPos = this.randomPosition();
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            this.enemyCreatorList["Weaver"]([i * 40 + randomPos[0], j * 40 + randomPos[1]])
          }
        }
      }

    }
  }

  createSpawnStateMachine(){
    // let events = this.sequenceTypes 
    // let stateIndex = {i: 0}
    // // these are the events
    // // times will be hard coded for each state in the queue
    // let spawnQueue = []
    // let singularityState = new StateMachine(this.engine, {stateIndex, event: events.Singularity})
    // let easyGroupsState = new StateMachine(this.engine, undefined)
  }

  randomPosition() {
    return [
      this.DIM_X * 0.70 * Math.random(),
      this.DIM_Y * 0.70 * Math.random(),
      // 500,300
    ];
  }

  spawnSequence(delta) {

    if (this.deathPaused) {
      this.deathPausedTime += delta
      if (this.deathPausedTime > this.deathPauseTime){
        this.deathPausedTime = 0
        this.deathPaused = false
      }
    } else {
      this.intervalTime += delta;
    }




    this.testing = false
    if (this.testing) {
      if (this.sequenceCount === 0){
        this.enemyCreatorList["AlienShip"]([500,100])
        this.sequenceCount += 1
      }
    } else {
      
    
    this.gameTime += delta;
    if(this.sequenceCount === 1) {
      this.enemyCreatorList["Singularity"]([700,300])
      this.sequenceCount += 1
    }
                                   // wait time              //parentIndex   // repeat count
    if (this.intervalTime > (2500 * this.intervalTiming) && this.sequenceCount < 5) {
      this.intervalTime = 0;
      this.sequenceTypes["EasyGroups"]() // event
      // this.randomSpawnEnemy();
      this.sequenceCount += 1

    } else if ( this.sequenceCount === 5 && this.intervalTime > 5000 ) {
      this.sequenceCount += 1
    } else if (this.intervalTime > (2500 * this.intervalTiming) && this.sequenceCount > 5 && this.sequenceCount < 10) {
      this.sequenceCount += 1
      this.intervalTime = 0;
      this.sequenceTypes["EasyGroupsArrows"]()
    } else if (this.sequenceCount === 10 && this.intervalTime > 5000) {
      this.sequenceCount += 1
    } else if (this.intervalTime > (1500 * this.intervalTiming) && this.sequenceCount > 10 && this.sequenceCount < 15) {
      this.sequenceCount += 1;
      this.intervalTime = 0;
      this.sequenceTypes["GruntGroups"]()
    } else if (this.sequenceCount === 15 && this.intervalTime > 2000) {
      this.sequenceCount += 1
    } else if (this.intervalTime > (2000 * this.intervalTiming) && this.sequenceCount > 15 && this.sequenceCount < 20) {
      this.sequenceCount += 1;
      this.intervalTime = 0;
      this.sequenceTypes["GreenGroups"]()
    } else if (this.sequenceCount === 20 && this.intervalTime > 3000) {
      this.sequenceCount += 1
    } 
    // else if (this.intervalTime > (2500 * this.intervalTiming) && this.sequenceCount === 10 && this.hugeSequenceTime % 2 === 1) {
    //   this.intervalTime = 0
    //   this.sequenceCount += 1
    //   let enemies_to_spawn = []
    //   let randomPos = this.randomPosition();
    //   for (let i = 0; i < 2; i++) {
    //     for (let j = 0; j < 2; j++) {
    //       this.enemyCreatorList["Weaver"]([i * 40 + randomPos[0], j * 40 + randomPos[1]])
    //     }
    //   }

    // } else if (this.intervalTime > (5000 * this.intervalTiming) && this.sequenceCount === 11) {
    //   this.intervalTime = 0;
    //   this.sequenceCount += 1;
    //}
    else if (this.intervalTime > 375 && this.sequenceCount > 20 && this.sequenceCount < 30 && this.hugeSequenceTime % 2 === 0) {
        this.ship.upgradeBullets()
        this.intervalTime = 0;
        this.sequenceCount += 1;

      let fourCorners = [
        [40, 40],
        [GameScript.DIM_X - 40, 40],
        [40, GameScript.DIM_Y - 40],
        [GameScript.DIM_X - 40, GameScript.DIM_Y - 40]
      ]
      fourCorners.forEach((corner) => {
        this.enemyCreatorList["Grunt"](corner)
      })
    } else if (this.intervalTime > 375 && this.sequenceCount > 20 && this.sequenceCount < 30 && this.hugeSequenceTime % 2 === 1) {
      this.intervalTime = 0;
      this.sequenceCount += 10;
      let arrowWallPositions = []
      let arrowDirection = Math.PI * 3 / 2 + Math.PI
      for (let i = 40; i < GameScript.DIM_X; i += 40) {
        arrowWallPositions.push([i, 50])
      }

      arrowWallPositions.forEach((position) => {
        this.enemyCreatorList["Arrow"](position, arrowDirection)
      })

    } 
              // this is the spawner event. 
              // it runs through all the child states
              // for the event to be triggered
    else if  (this.sequenceCount >= 30) {
      this.sequenceCount = 0;
      if (!(this.intervalTiming < 0.5)) {
        this.intervalTiming *= 0.9;
      }
      this.hugeSequenceTime += 1;
    }
  
    }




    // if (this.gameTime % 2000 === 0){
    //   this.spawned = false
    // }
  }

  createShip() {
    return new Ship(this.engine, this.startPosition)
  }

  createWalls(){
    return new Walls(this.engine, this)
  }
  
  createGrid(){
    return new Grid(this.engine, this)
  }

  createOverlay(){
    return new Overlay(this.engine, this, this.ship.transform)
  }

  isOutOfBounds(pos, radius) {
    let max = [GameScript.DIM_X - radius, GameScript.DIM_Y - radius]
    if (radius) {
      return(
        (pos[0] <= radius || pos[0] >= max[0]) || 
        (pos[1] <= radius || pos[1] >= max[1]) 
      )
    } else {
      return (pos[0] < 0) || (pos[1] < 0) ||
        (pos[0] > GameScript.DIM_X) || (pos[1] > GameScript.DIM_Y);
    }
    
  }

  updateShipFireAngle() {
    this.ships[0].setFireAngle()
  }

  // bounce(pos){
  //   return [
  //     Util.bounce(pos[0], GameScript.DIM_X), Util.bounce(pos[1], GameScript.DIM_Y)
  //   ];
  // }

  bounce(transform, radius = 0) {
    let max = [this.DIM_X - radius, this.DIM_Y - radius]
    let pos = transform.absolutePosition()
    if (pos[0] <= radius || pos[0] >= max[0]) {
      transform.vel[0] = -transform.vel[0];
    }
    if (pos[1] <= radius || pos[1] >= max[1]) {
      transform.vel[1] = -transform.vel[1];
    }
  }

  wallGraze(transform, radius = 0){
    let max = [this.DIM_X - radius, this.DIM_Y - radius]
    let pos = transform.absolutePosition()
    let vel = transform.absoluteVelocity()

    // X bounds, left right
    if (pos[0] <= radius && vel[0] < 0){
      transform.vel[0] = 0.1;
    } else if (pos[0] >= max[0] && vel[0] > 0){
      transform.vel[0] = -0.1;
    }

    // Y bounds, top bottom
    if(pos[1] <= radius && vel[1] < 0) {
      transform.vel[1] = 0.1
    } else if (pos[1] >= max[1] && vel[1] > 0){
      transform.vel[1] = -0.1
    }

  }

  redirect(transform) {
    let max = [this.DIM_X, this.DIM_Y]
    let pos = transform.absolutePosition()
    
    if (pos[0] <= 0 || pos[0] >= max[0]) {
      if (pos[0] <= 0) {
        pos[0] = 1

        
      }
      if (pos[0] >= max[0]) {
        pos[0] = max[0] - 1

      }
    }
    if (pos[1] <= 0 || pos[1] >= max[1]) {
      if (pos[1] <= 0) {
        pos[1] = 1

      }
      if (pos[1] >= max[1]) {
        pos[1] = max[1] - 1

      }
    }

    transform.vel[0] = -transform.vel[0];
    transform.vel[1] = -transform.vel[1];
  }

}

GameScript.BG_COLOR = "#000000";

GameScript.DIM_X = 1000;
GameScript.DIM_Y = 600;
// GameScript.FPS = 32;
// GameScript.NUM_BOXES = 10;
// GameScript.NUM_PINWHEELS = 0;
// GameScript.NUM_ARROWS = 0;
// GameScript.NUM_GRUNTS = 0;
// GameScript.NUM_WEAVERS = 0;
// GameScript.NUM_SINGULARITIES = 1;
module.exports = GameScript;

GameScript.Spawn1 = {
  BoxBox: 50,
}

GameScript.spawnListList = [
  GameScript.Spawn1
]