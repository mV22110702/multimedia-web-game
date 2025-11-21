import { Entity } from "./Entity";
import type { Position, Weapon, Damageable } from "../types";
import { Direction } from "../types";
import { Bullet } from "./Bullet";
import { HealthBar } from "../ui/HealthBar";

export class Player extends Entity implements Weapon, Damageable {
  public cooldown: number = 10;
  public lastShot: number = 0;
  public facing: Direction = Direction.RIGHT;
  public bullets: Bullet[] = [];
  public health: number = 100;
  public maxHealth: number = 100;
  private healthBar: HealthBar;
  private showHealthBar: boolean = false;
  private healthBarTimer: number = 0;
  private healthBarDuration: number = 5000;

  constructor(position: Position, size: number) {
    super(position, { x: 0, y: 0 }, { width: size, height: size });
    this.loadImage("./hero.png");
    this.healthBar = new HealthBar(
      { x: this.position.x, y: this.position.y - size / 2 - 20 },
      { width: size + 20, height: 8 }
    );
  }

  canShoot(): boolean {
    return Date.now() - this.lastShot >= this.cooldown;
  }

  shoot(): void {
    if (!this.canShoot()) return;

    const bulletStartX =
      this.position.x +
      (this.facing === Direction.RIGHT
        ? this.dimensions.width / 2
        : -this.dimensions.width / 2);
    const bulletStartY = this.position.y;

    const bullet = new Bullet(
      { x: bulletStartX, y: bulletStartY },
      this.facing
    );

    this.bullets.push(bullet);
    this.lastShot = Date.now();
  }

  turnLeft(): void {
    this.facing = Direction.LEFT;
  }

  turnRight(): void {
    this.facing = Direction.RIGHT;
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

    this.bullets = this.bullets.filter((bullet) => {
      bullet.update(deltaTime);
      return !bullet.isOutOfBounds(800, 600);
    });

    if (
      this.showHealthBar &&
      Date.now() - this.healthBarTimer > this.healthBarDuration
    ) {
      this.showHealthBar = false;
    }

    this.healthBar.setPosition({
      x: this.position.x,
      y: this.position.y - this.dimensions.height / 2 - 25,
    });
    this.healthBar.setHealthPercentage(this.health / this.maxHealth);
  }

  render(context: CanvasRenderingContext2D): void {
    context.save();

    context.translate(this.position.x, this.position.y);

    if (this.facing === Direction.LEFT) {
      context.scale(-1, 1);
    }

    const bounds = {
      x: -this.dimensions.width / 2,
      y: -this.dimensions.height / 2,
      width: this.dimensions.width,
      height: this.dimensions.height,
    };

    if (this.image && this.imageLoaded) {
      context.drawImage(
        this.image,
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height
      );
    } else {
      context.fillStyle = "#00ff00";
      context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    context.restore();

    if (this.showHealthBar && this.health < this.maxHealth) {
      this.healthBar.render(context);
    }

    this.bullets.forEach((bullet) => bullet.render(context));
  }

  getBullets(): Bullet[] {
    return this.bullets;
  }

  removeBullet(bullet: Bullet): void {
    const index = this.bullets.indexOf(bullet);
    if (index > -1) {
      this.bullets.splice(index, 1);
    }
  }
}
