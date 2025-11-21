export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface GameEntity {
  position: Position;
  velocity: Velocity;
  dimensions: Dimensions;
  update(deltaTime: number): void;
  render(context: CanvasRenderingContext2D): void;
  getBounds(): Rectangle;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Damageable {
  health: number;
  maxHealth: number;
  takeDamage(damage: number): void;
  isAlive(): boolean;
}

export interface Weapon {
  cooldown: number;
  lastShot: number;
  canShoot(): boolean;
  shoot(position: Position, direction: number): void;
}

export const Direction = {
  LEFT: -1,
  RIGHT: 1
} as const;

export type Direction = typeof Direction[keyof typeof Direction];

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  playerSize: number;
  bulletSpeed: number;
  bulletSize: number;
  enemyBaseSpeed: number;
  enemySize: number;
  enemyBaseHealth: number;
  spawnRate: number;
  difficultyIncrease: number;
}