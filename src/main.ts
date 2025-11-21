import { Game } from './Game';

class GameApplication {
  private game: Game | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    window.addEventListener('DOMContentLoaded', () => {
      this.startGame();
    });

    if (document.readyState === 'loading') {
      return;
    }
    
    this.startGame();
  }

  private startGame(): void {
    try {
      this.game = new Game('gameCanvas');
      this.game.start();
      
      console.log('Tower Defense Game started successfully!');
      console.log('Controls:');
      console.log('- A/D or Left/Right arrows: Aim left/right');
      console.log('- Space: Shoot');
      
    } catch (error) {
      console.error('Failed to start game:', error);
      this.showError('Failed to initialize the game. Please check the console for details.');
    }
  }

  private showError(message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #ff4444;
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-family: Arial, sans-serif;
      z-index: 1000;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
  }

  public restart(): void {
    if (this.game) {
      this.game.restart();
    }
  }

  public stop(): void {
    if (this.game) {
      this.game.stop();
    }
  }
}

new GameApplication();