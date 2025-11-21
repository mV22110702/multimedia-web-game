import { Entity } from './Entity';
import type { Position, Damageable } from '../types';
import { Direction } from '../types';
import { HealthBar } from '../ui/HealthBar';

export class Enemy extends Entity implements Damageable {
  public health: number;
  public maxHealth: number;
  private healthBar: HealthBar;
  private showHealthBar: boolean = false;
  private healthBarTimer: number = 0;
  private healthBarDuration: number = 3000;
  private speed: number;
  private direction: Direction;
  private spriteIndex: number;

  constructor(position: Position, direction: Direction, health: number = 3, speed: number = 50) {
    const enemySize = 40;
    super(
      position,
      { x: direction * speed, y: 0 },
      { width: enemySize, height: enemySize }
    );

    this.health = health;
    this.maxHealth = health;
    this.speed = speed;
    this.direction = direction;
    this.healthBar = new HealthBar(this.position, { width: enemySize + 10, height: 6 });
    
    this.spriteIndex = Math.floor(Math.random() * 8) + 1;
    this.loadImage(`/enemies/r_${this.spriteIndex}_tr.png`);
  }

  takeDamage(damage: number): void {
    this.health -= damage;
    this.showHealthBar = true;
    this.healthBarTimer = Date.now();
    
    if (this.health <= 0) {
      this.health = 0;
    }
  }

  isAlive(): boolean {
    return this.health > 0;
  }

  update(deltaTime: number): void {
    super.update(deltaTime);

    if (this.showHealthBar && Date.now() - this.healthBarTimer > this.healthBarDuration) {
      this.showHealthBar = false;
    }

    this.healthBar.setPosition({
      x: this.position.x,
      y: this.position.y - this.dimensions.height / 2 - 15
    });
    this.healthBar.setHealthPercentage(this.health / this.maxHealth);
  }

  stopMovement(): void {
    this.velocity.x = 0;
    this.velocity.y = 0;
  }

  getDamagePerSecond(): number {
    return 20;
  }

  render(context: CanvasRenderingContext2D): void {
    context.save();
    
    context.translate(this.position.x, this.position.y);
    
    // Mirror sprite if moving left (Direction.LEFT = -1)
    if (this.direction === Direction.LEFT) {
      context.scale(-1, 1);
    }
    
    const bounds = {
      x: -this.dimensions.width / 2,
      y: -this.dimensions.height / 2,
      width: this.dimensions.width,
      height: this.dimensions.height
    };

    if (this.image && this.imageLoaded) {
      context.drawImage(this.image, bounds.x, bounds.y, bounds.width, bounds.height);
    } else {
      context.fillStyle = '#ff0000';
      context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }
    
    context.restore();

    if (this.showHealthBar && this.health < this.maxHealth) {
      this.healthBar.render(context);
    }
  }

  increaseSpeed(multiplier: number): void {
    this.velocity.x = this.direction * this.speed * multiplier;
  }

  getDirection(): Direction {
    return this.direction;
  }
}