const MovingObject = require("../moving_object")
const Bullet = require("../bullet")
const Ship = require("../ship")
const Singularity = require("./singularity")
const Sound = require("../sound")
const Util = require("../util")
class BoxBox extends MovingObject {
  constructor(options) {
    super(options)
    this.pos = options.pos || options.game.randomPosition();
    this.vel = [0,0]
    this.acc = [0,0];
    this.spawnSound = new Sound("GEOWars/sounds/Enemy_spawn_blue.wav", 0.5);
  }

  move(timeDelta) {
    // let speed = 1.5;
   
    
    const timeScale = timeDelta / NORMAL_FRAME_TIME_DELTA;
    this.pos[0] += this.vel[0] * timeScale + this.acc[0] * (timeScale * timeScale) / 2;
    this.pos[1] += this.vel[1] * timeScale + this.acc[1] * (timeScale * timeScale) / 2;
    this.vel[0] += this.acc[0] * timeScale;
    this.vel[1] += this.acc[1] * timeScale;

    if (this.game.isOutOfBounds(this.pos)) {
      Util.bounce(this, [1000, 600]) // HARD CODED
    }
  }

  draw(ctx, spawningScale) {
    this.acc = [0, 0];
    spawningScale = spawningScale || 1;
    let pos = this.pos
    let boxsize = 10 * spawningScale;
    // ctx.fillStyle = "#98f517";
    // ctx.fillRect(pos[0] - (7 / 8 * boxsize), pos[1] - (1 / 8 * boxsize), boxsize, boxsize)
    
    // ctx.fillStyle = "#98f517";
    // ctx.fillRect(pos[0] - (1 / 8 * boxsize), pos[1] - (7 / 8 * boxsize), boxsize, boxsize);

    // ctx.fillStyle = "#98f517";
    // ctx.fillRect(pos[0] - (7 / 8 * boxsize), pos[1], 10, 10);
    // ctx.fillRect(pos[0], pos[1], 10, 10);
    ctx.save()
    ctx.beginPath();
    ctx.rect(pos[0] - (6/8 * boxsize), pos[1] - (2/8 * boxsize), boxsize, boxsize);
    ctx.lineWidth = 1.5;
    // ctx.strokeStyle = "#F173BA";
    // ctx.shadowBlur = 1;
    // ctx.shadowColor = "#F173BA"
    ctx.stroke();
    
    ctx.beginPath();
    ctx.rect(pos[0] - (2/8 * boxsize), pos[1] - (6/8 * boxsize), boxsize, boxsize);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#F173BA";
    
    ctx.stroke();
    ctx.restore();
  }

  collideWith(otherObject) {
    if (otherObject instanceof Ship) {
      otherObject.relocate();
      return true;
    } else if (otherObject instanceof Bullet || otherObject instanceof Singularity) {
      
      this.remove();
      otherObject.remove();
      return true;
    }

    return false;
  }

}

BoxBox.BOX_SIZE = 10;
BoxBox.COLOR = "#f00745"

module.exports = BoxBox;

const NORMAL_FRAME_TIME_DELTA = 1000 / 60;