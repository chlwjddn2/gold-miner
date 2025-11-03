import GameManager from '../manager/GameManager.js';

export default class LevelDoneScene extends Phaser.Scene {
  constructor() {
    super('GameFinishScene');
  }

  create() {
    this.add.rectangle(0, 0, 1280, 720, 0xffffff).setOrigin(0,0);
    this.homeButton = this.add.image(640, 550, 'home_button')
      .setScale(0.6)
      .setInteractive({ useHandCursor: true });

    this.homeButton.on('pointerover', () => this.homeButton.setScale(0.65))
    this.homeButton.on('pointerout', () => this.homeButton.setScale(0.6));
    this.homeButton.on('pointerdown', () => {
      this.scene.stop();
      this.scene.start('GameStartScene');
      GameManager.reset();
    })
  }
}