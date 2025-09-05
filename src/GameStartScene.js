export default class GameStartScene extends Phaser.Scene {
  constructor() {
    super('GameStartScene');
  }

  create() {
    const { width, height } = this.scale;
    this.title = this.add.text(width / 2, height / 2 - 100, '🚀 GOLD MINER 🚀', {
      fontSize: '48px'
    }).setOrigin(0.5);

    this.startButton = this.add.text(width / 2, height / 2 + 100, 'START GAME', {
      fontSize: '36px'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.startButton.on('pointerdown', () => this.scene.start('MainScene'));
  }
}