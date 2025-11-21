import type { Position, Velocity, Dimensions, GameEntity, Rectangle } from '../types';
import { Vector2D } from '../utils/Vector2D';

export abstract class Entity implements GameEntity {
  public position: Vector2D;
  public velocity: Vector2D;
  public dimensions: Dimensions;
  protected image: HTMLImageElement | null = null;
  protected imageLoaded: boolean = false;

  constructor(position: Position, velocity: Velocity, dimensions: Dimensions) {
    this.position = Vector2D.fromPosition(position);
    this.velocity = Vector2D.fromPosition(velocity);
    this.dimensions = dimensions;
  }

  protected loadImage(imagePath: string): void {
    this.image = new Image();
    this.image.onload = () => {
      this.imageLoaded = true;
    };
    this.image.src = imagePath;
  }

  update(deltaTime: number): void {
    const movement = this.velocity.multiply(deltaTime);
    this.position = this.position.add(movement);
  }

  getBounds(): Rectangle {
    return {
      x: this.position.x - this.dimensions.width / 2,
      y: this.position.y - this.dimensions.height / 2,
      width: this.dimensions.width,
      height: this.dimensions.height
    };
  }

  checkCollision(other: Entity): boolean {
    const thisBounds = this.getBounds();
    const otherBounds = other.getBounds();

    return (
      thisBounds.x < otherBounds.x + otherBounds.width &&
      thisBounds.x + thisBounds.width > otherBounds.x &&
      thisBounds.y < otherBounds.y + otherBounds.height &&
      thisBounds.y + thisBounds.height > otherBounds.y
    );
  }

  isOutOfBounds(canvasWidth: number, canvasHeight: number): boolean {
    const bounds = this.getBounds();
    // Allow some margin for spawning outside the canvas
    const margin = 100;
    return bounds.x + bounds.width < -margin || 
           bounds.x > canvasWidth + margin || 
           bounds.y + bounds.height < -margin || 
           bounds.y > canvasHeight + margin;
  }

  abstract render(context: CanvasRenderingContext2D): void;

  protected renderRect(context: CanvasRenderingContext2D, color: string): void {
    const bounds = this.getBounds();
    context.fillStyle = color;
    context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  protected renderImage(context: CanvasRenderingContext2D, fallbackColor: string = '#ff0000'): void {
    const bounds = this.getBounds();
    
    if (this.image && this.imageLoaded) {
      context.drawImage(this.image, bounds.x, bounds.y, bounds.width, bounds.height);
    } else {
      this.renderRect(context, fallbackColor);
    }
  }
}