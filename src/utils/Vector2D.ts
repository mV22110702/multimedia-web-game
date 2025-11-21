import type { Position } from '../types';

export class Vector2D implements Position {
  public x: number;
  public y: number;
  
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  static fromPosition(position: Position): Vector2D {
    return new Vector2D(position.x, position.y);
  }

  static zero(): Vector2D {
    return new Vector2D(0, 0);
  }

  static fromAngle(angle: number, magnitude: number = 1): Vector2D {
    return new Vector2D(
      Math.cos(angle) * magnitude,
      Math.sin(angle) * magnitude
    );
  }

  add(other: Vector2D): Vector2D {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vector2D): Vector2D {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }

  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  divide(scalar: number): Vector2D {
    return new Vector2D(this.x / scalar, this.y / scalar);
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): Vector2D {
    const mag = this.magnitude();
    return mag > 0 ? this.divide(mag) : Vector2D.zero();
  }

  distance(other: Vector2D): number {
    return this.subtract(other).magnitude();
  }

  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  copy(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  set(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  equals(other: Vector2D, tolerance: number = 0.001): boolean {
    return Math.abs(this.x - other.x) < tolerance && 
           Math.abs(this.y - other.y) < tolerance;
  }
}