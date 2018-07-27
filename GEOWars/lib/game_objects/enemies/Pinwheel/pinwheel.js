const GameObject = require("../../game_engine/game_object")
// const Bullet = require("../bullet")
// const Ship = require("../ship")
// const Singularity = require("./singularity")
const Sound = require("../../game_engine/sound")
const Util = require("../../game_engine/util")
class Pinwheel extends GameObject {
  constructor(pos, engine) {
    super(engine)
    this.rotation_speed = 0.05;
    let speed = 1;
    this.transform.pos = pos
    this.transform.vel = Util.randomVec(speed);
    this.spawnSound = new Sound("GEOWars/sounds/Enemy_spawn_blue.wav", 0.5);
    this.addLineSprite(new GruntSprite(this.transform))
    this.addChildGameObject(new EnemySpawn)
  }
  
  exist() {
    // leaving off subscriptions means that things will subscribe to it
    this.addCollider("general", this, 3)
    // now it will move
    this.addPhysicsComponent()
  }

  update(deltaTime){
    let rotationSpeedScale = timeDelta / NORMAL_FRAME_TIME_DELTA;
    this.transform.angle = (this.transform.angle + this.rotation_speed * rotationSpeedScale) % (Math.PI * 2)

    if (this.gameEngine.gameScript.isOutOfBounds(this.transform.pos)) {
      Util.bounce(this, [1000, 600]) // HARD CODED
    }
  }

}



const NORMAL_FRAME_TIME_DELTA = 1000 / 60;
module.exports = Pinwheel;