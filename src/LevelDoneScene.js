export default class LevelDoneScene extends Phaser.Scene {
  constructor() {
    super('LevelDoneScene');
  }

  init(data) {
    this.score = data.score
    this.level = data.level
    this.targetScore = data.targetScore
  }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, 800, 600, 0x000000, 0.6);
    this.add.text(width / 2, height / 2 - 100, '🎇 Level Done! 🎇', {
      fontSize: '48px',
      fill: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 50, `Score: ${this.score}`, {
      fontSize: '48px',
      fill: '#ffffff',
    }).setOrigin(0.5);

    // [R] Restart Game - 중앙
    this.nexLevelButton = this.add.text(width / 2, height / 2 + 100, 'Next Level', {
      fontSize: '24px',
      fill: '#ffff00',
    }).setOrigin(0.5);

    this.nexLevelButton.setInteractive({ useHandCursor: true });

    this.nexLevelButton.on('pointerdown', () => {
      this.scene.stop();
      this.scene.start('MainScene', { level: this.level + 1, score: this.score, targetScore: this.getNthTerm(this.level+ 1)});
    })
  }

  getNthTerm(level) {
    return 135 * level * level + 135 * level + 380;
  }
}