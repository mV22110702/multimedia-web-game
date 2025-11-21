import { Player } from "./entities/Player";
import { Enemy } from "./entities/Enemy";
import { Direction } from "./types";
import type { GameConfig } from "./types";

export class Game {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private player!: Player;
  private enemies: Enemy[] = [];
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private backgroundImage: HTMLImageElement | null = null;
  private backgroundLoaded: boolean = false;
  private gameOver: boolean = false;

  private config: GameConfig = {
    canvasWidth: 800,
    canvasHeight: 600,
    playerSize: 50,
    bulletSpeed: 300,
    bulletSize: 8,
    enemyBaseSpeed: 50,
    enemySize: 40,
    enemyBaseHealth: 3,
    spawnRate: 500,
    difficultyIncrease: 0.05,
  };

  private lastSpawnTime: number = 0;
  private gameStartTime: number = Date.now();

  private keys: { [key: string]: boolean } = {};

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas with id "${canvasId}" not found`);
    }

    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2D context from canvas");
    }
    this.context = context;

    this.canvas.width = this.config.canvasWidth;
    this.canvas.height = this.config.canvasHeight;

    this.loadBackground();
    this.initializePlayer();
    this.setupInputHandlers();
  }

  private loadBackground(): void {
    this.backgroundImage = new Image();
    this.backgroundImage.onload = () => {
      this.backgroundLoaded = true;
    };
    this.backgroundImage.src = "./background.png";
  }

  private initializePlayer(): void {
    const centerX = this.config.canvasWidth / 2;
    // Position player on the floor (approximately 75% down the screen)
    const floorY = this.config.canvasHeight * 0.7;
    this.player = new Player({ x: centerX, y: floorY }, this.config.playerSize);
  }

  private setupInputHandlers(): void {
    window.addEventListener("keydown", (event) => {
      this.keys[event.key.toLowerCase()] = true;
      this.handleKeyDown(event);
    });

    window.addEventListener("keyup", (event) => {
      this.keys[event.key.toLowerCase()] = false;
    });
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();

    if (this.gameOver) {
      if (key === "r") {
        this.restart();
      }
      return;
    }

    switch (key) {
      case "a":
      case "arrowleft":
        this.player.turnLeft();
        break;
      case "d":
      case "arrowright":
        this.player.turnRight();
        break;
      case " ":
        event.preventDefault();
        this.player.shoot();
        break;
    }
  }

  private spawnEnemy(): void {
    if (this.gameOver) return;

    const now = Date.now();
    const currentDifficulty = this.getCurrentDifficulty();

    if (
      this.lastSpawnTime === 0 ||
      now - this.lastSpawnTime >= this.config.spawnRate / currentDifficulty
    ) {
      const side = Math.random() < 0.5 ? Direction.LEFT : Direction.RIGHT;
      const spawnX =
        side === Direction.LEFT
          ? -this.config.enemySize
          : this.config.canvasWidth + this.config.enemySize;
      // Spawn at floor level with small random variation (±15px)
      const floorY = this.config.canvasHeight * 0.7;
      const spawnY = floorY + (Math.random() - 0.5) * 20;

      const enemy = new Enemy(
        { x: spawnX, y: spawnY },
        side === Direction.LEFT ? Direction.RIGHT : Direction.LEFT,
        this.config.enemyBaseHealth,
        this.config.enemyBaseSpeed * currentDifficulty
      );

      this.enemies.push(enemy);
      this.lastSpawnTime = now;
      console.log("Enemy spawned:", {
        spawnX,
        spawnY,
        direction: side === Direction.LEFT ? Direction.RIGHT : Direction.LEFT,
        totalEnemies: this.enemies.length,
      });
    }
  }

  private getCurrentDifficulty(): number {
    const timeElapsed = Date.now() - this.gameStartTime;
    return 1 + (timeElapsed / 10000) * this.config.difficultyIncrease;
  }

  private checkCollisions(): void {
    const bullets = this.player.getBullets();

    // Bullet-Enemy collisions
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];

        if (bullet.checkCollision(enemy)) {
          enemy.takeDamage(bullet.getDamage());
          this.player.removeBullet(bullet);

          if (!enemy.isAlive()) {
            this.enemies.splice(j, 1);
          }
          break;
        }
      }
    }

    // Enemy-Player collisions
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (enemy.checkCollision(this.player)) {
        enemy.stopMovement();
        // Deal damage per second while in contact
        const damage = enemy.getDamagePerSecond() * (1 / 60); // Assuming 60 FPS
        this.player.takeDamage(damage);

        if (!this.player.isAlive()) {
          this.gameOver = true;
        }
      }
    }
  }

  private update(deltaTime: number): void {
    if (this.gameOver) return;

    this.player.update(deltaTime);

    this.enemies.forEach((enemy) => {
      enemy.update(deltaTime);
    });

    const beforeCount = this.enemies.length;
    this.enemies = this.enemies.filter((enemy) => {
      const outOfBounds = enemy.isOutOfBounds(
        this.config.canvasWidth,
        this.config.canvasHeight
      );
      if (outOfBounds) {
        console.log("Enemy removed (out of bounds):", {
          position: enemy.position,
          bounds: enemy.getBounds(),
        });
      }
      return !outOfBounds;
    });
    const afterCount = this.enemies.length;
    if (beforeCount !== afterCount) {
      console.log("Enemies filtered:", {
        before: beforeCount,
        after: afterCount,
        removed: beforeCount - afterCount,
      });
    }

    this.spawnEnemy();
    this.checkCollisions();
  }

  private render(): void {
    this.context.clearRect(
      0,
      0,
      this.config.canvasWidth,
      this.config.canvasHeight
    );

    if (this.backgroundImage && this.backgroundLoaded) {
      this.context.drawImage(
        this.backgroundImage,
        0,
        0,
        this.config.canvasWidth,
        this.config.canvasHeight
      );
    } else {
      this.context.fillStyle = "#001122";
      this.context.fillRect(
        0,
        0,
        this.config.canvasWidth,
        this.config.canvasHeight
      );
    }

    this.player.render(this.context);

    this.enemies.forEach((enemy) => {
      enemy.render(this.context);
    });

    this.renderUI();

    if (this.gameOver) {
      this.renderGameOver();
    }
  }

  private renderUI(): void {
    const difficulty = this.getCurrentDifficulty().toFixed(2);
    this.context.fillStyle = "#fff";
    this.context.font = "16px Arial";
    this.context.fillText(
      `Difficulty: ${difficulty}x`,
      10,
      this.config.canvasHeight - 50
    );
    this.context.fillText(
      `Enemies: ${this.enemies.length}`,
      10,
      this.config.canvasHeight - 30
    );
    this.context.fillText(
      `Health: ${Math.ceil(this.player.health)}/${this.player.maxHealth}`,
      10,
      this.config.canvasHeight - 10
    );
  }

  private renderGameOver(): void {
    // Dim background
    this.context.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.context.fillRect(
      0,
      0,
      this.config.canvasWidth,
      this.config.canvasHeight
    );

    // Game Over text
    this.context.fillStyle = "#ff4444";
    this.context.font = "bold 48px Arial";
    this.context.textAlign = "center";
    this.context.fillText(
      "GAME OVER",
      this.config.canvasWidth / 2,
      this.config.canvasHeight / 2 - 50
    );

    // Retry button
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonX = this.config.canvasWidth / 2 - buttonWidth / 2;
    const buttonY = this.config.canvasHeight / 2 + 20;

    this.context.fillStyle = "#4CAF50";
    this.context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    this.context.fillStyle = "#fff";
    this.context.font = "bold 24px Arial";
    this.context.fillText("RETRY", this.config.canvasWidth / 2, buttonY + 32);

    // Instructions
    this.context.fillStyle = "#ccc";
    this.context.font = "18px Arial";
    this.context.fillText(
      "Press R to retry",
      this.config.canvasWidth / 2,
      buttonY + 100
    );

    // Reset text alignment
    this.context.textAlign = "left";
  }

  private gameLoop = (currentTime: number): void => {
    if (!this.isRunning) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.gameStartTime = Date.now();
    this.lastTime = performance.now();
    this.lastSpawnTime = 0; // Reset spawn timer

    requestAnimationFrame(this.gameLoop);
  }

  public stop(): void {
    this.isRunning = false;
  }

  public restart(): void {
    this.gameOver = false;
    this.enemies = [];
    this.gameStartTime = Date.now();
    this.lastSpawnTime = 0;
    this.initializePlayer();

    if (!this.isRunning) {
      this.start();
    }
  }
}
