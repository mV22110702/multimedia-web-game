import { Entity } from './Entity';
import type { Position } from '../types';
import { Direction } from '../types';

export class Bullet extends Entity {
  private damage: number = 1;

  constructor(position: Position, direction: Direction) {
    const bulletSize = 8;
    super(
      position,
      { x: direction * 300, y: 0 },
      { width: bulletSize, height: bulletSize }
    );
    this.loadImage('/bullet.jpg');
  }

  getDamage(): number {
    return this.damage;
  }

  render(context: CanvasRenderingContext2D): void {
    if (this.image && this.imageLoaded) {
      this.renderImage(context, '#ffff00');
    } else {
      this.renderRect(context, '#ffff00');
    }
  }

  update(deltaTime: number): void {
    super.update(deltaTime);
  }
}