import type { Position, Dimensions } from '../types';
import { Vector2D } from '../utils/Vector2D';

export class HealthBar {
  private position: Vector2D;
  private dimensions: Dimensions;
  private healthPercentage: number = 1.0;
  private backgroundColor: string = '#444';
  private healthColor: string = '#00ff00';
  private lowHealthColor: string = '#ff0000';
  private mediumHealthColor: string = '#ffff00';
  private borderColor: string = '#fff';

  constructor(position: Position, dimensions: Dimensions) {
    this.position = Vector2D.fromPosition(position);
    this.dimensions = dimensions;
  }

  setPosition(position: Position): void {
    this.position.set(position.x, position.y);
  }

  setHealthPercentage(percentage: number): void {
    this.healthPercentage = Math.max(0, Math.min(1, percentage));
  }

  getHealthColor(): string {
    if (this.healthPercentage <= 0.3) {
      return this.lowHealthColor;
    } else if (this.healthPercentage <= 0.6) {
      return this.mediumHealthColor;
    }
    return this.healthColor;
  }

  render(context: CanvasRenderingContext2D): void {
    const x = this.position.x - this.dimensions.width / 2;
    const y = this.position.y - this.dimensions.height / 2;

    context.fillStyle = this.backgroundColor;
    context.fillRect(x, y, this.dimensions.width, this.dimensions.height);

    context.strokeStyle = this.borderColor;
    context.lineWidth = 1;
    context.strokeRect(x, y, this.dimensions.width, this.dimensions.height);

    const healthWidth = this.dimensions.width * this.healthPercentage;
    context.fillStyle = this.getHealthColor();
    context.fillRect(x, y, healthWidth, this.dimensions.height);
  }

  getDimensions(): Dimensions {
    return this.dimensions;
  }

  getPosition(): Vector2D {
    return this.position.copy();
  }
}