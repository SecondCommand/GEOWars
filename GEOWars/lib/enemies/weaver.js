const MovingObject = require("../moving_object")
const Bullet = require("../bullet")
const Ship = require("../ship")
const Util = require("../util")
class Weaver extends MovingObject {
  constructor(options) {
    super(options)
    this.pos = options.pos || options.game.randomPosition();
    this.angle = 0;
    this.rotation_speed = 0.3;
    this.speed = 1;
    this.vel = Util.randomVec(this.speed);
    this.weaverCloseHitBox = 50;
    this.directionInfluenced = false;
    this.influencers = [];
  }

  // ADDING MOVEMENT MECHANICS FOR Weaver
  move(timeDelta) {
    let speed = 1.5;
    let shipPos = this.game.ships[0].pos;
    let dy = shipPos[1] - this.pos[1];
    let dx = shipPos[0] - this.pos[0];
    
    
    let rotationSpeedScale = timeDelta / NORMAL_FRAME_TIME_DELTA;
    const velocityScale = timeDelta / NORMAL_FRAME_TIME_DELTA;
    let direction = 0;
    if (!this.directionInfluenced){
      direction = Math.atan2(dy, dx);
    } else {
      direction = this.influenceDirection();
    }
    // I need to make a max speed and the pulling effect an acceleration instead
    // this will make it possible to direct the ship well too
    
    // if (this.game.isOutOfBounds(this.pos)) {
      //   Util.bounce(this, [1000, 600]) // HARD CODED
      // }
      
    this.angle = (this.angle + this.rotation_speed * rotationSpeedScale) % (Math.PI * 2)
    this.pos[0] += speed * Math.cos(direction) * velocityScale;
    this.pos[1] += speed * Math.sin(direction) * velocityScale;

    
    this.directionInfluenced = false;
    this.influencers = [];

  }

  draw(ctx, spawningScale) {
    let pos = this.pos;
    spawningScale = spawningScale || 1;
    let shipLength = 10 * 2.2 * spawningScale * this.stretchScale_L;
    let shipWidth = 10 * 2.2 * spawningScale * this.stretchScale_W;
    let l = shipLength;
    let w = shipWidth;

    ctx.save();
    ctx.beginPath();
    ctx.translate(pos[0], pos[1]);
    ctx.rotate(this.angle);

    ctx.beginPath();
    ctx.strokeStyle = "#4286f4";
    ctx.lineWidth = 4;
    ctx.moveTo(0, -l / 2); //1
    ctx.lineTo(w / 2, 0); //2
    ctx.lineTo(0, l / 2); //3
    ctx.lineTo(-w / 2, -0); //4

    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  influenceDirection() {
    let directionVector = [0,0]
    
    this.influencers.forEach((influencer) =>{
      let dx = directionVector[0] + influencer[0];
      let dy = directionVector[1] + influencer[1];
      let newVector = [dx,dy]
      directionVector = Util.dir(newVector);
    })
    let influencedDirection = atan2(directionVector[1], directionVector[0]);
    return influencedDirection
  }

  acceptBulletDirection(source){
    this.directionInfluenced = true;
    dy = this.pos[1] - source[1];
    dx = this.pos[0] - source[0];
    let unitVector = Util.dir([dx,dy]);
    this.influencers.push(unitVector)
    // first 
  }

  isCollidedWith(otherObject) {
    const centerDist = Util.dist(this.pos, otherObject.pos);

    if (otherObject instanceof Bullet){
      if (centerDist < (this.radius + otherObject.radius)) {
        return true
      } else if( centerDist < (this.weaverCloseHitBox + otherObject.radius)) {
        this.acceptBulletDirection(otherObject.pos) 
      } else {
        return false;
      }
    }

    return centerDist < (this.radius + otherObject.radius);
  }

  collideWith(otherObject) {
    if (otherObject instanceof Ship) {
      otherObject.relocate();
      return true;
    } else if (otherObject instanceof Bullet) {
      this.remove();
      otherObject.remove();
      return true;
    }

    return false;
  }

  // remove() {
  //   debugger;
  //   this.game.remove(this);
  // }
}

Weaver.BOX_SIZE = 10;
Weaver.COLOR = "#3cff0b"

module.exports = Weaver;

const NORMAL_FRAME_TIME_DELTA = 1000 / 60;