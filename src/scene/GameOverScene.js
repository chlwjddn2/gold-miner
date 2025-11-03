import GameManager from '../manager/GameManager.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {

    this.add.image(0, 0, 'game_over_bg').setOrigin(0, 0); // 배경
    this.add.image(470, 334, 'fail').setScale(0.9);
    this.homeButton = this.add.image(360, 550, 'home_button')
      .setScale(0.6)
      .setInteractive({ useHandCursor: true });
    

    this.add.text(300, 340, `${GameManager.level}단계`, {
      fontSize: '56px',
        fontFamily: 'Cafe24Surround',
        color: '#6E2802',
        fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(360, 437, `${GameManager.score}`, {
      fontSize: '56px',
        fontFamily: 'Cafe24Surround',
        color: '#fff',
        fontStyle: 'bold',
    }).setOrigin(0.5);

    this.homeButton.on('pointerover', () => this.homeButton.setScale(0.65))
    this.homeButton.on('pointerout', () => this.homeButton.setScale(0.6));
    this.homeButton.on('pointerdown', () => {
      this.scene.stop();
      this.scene.start('GameStartScene');
      GameManager.reset();
    })
  }
}