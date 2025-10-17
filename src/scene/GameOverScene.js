import GameManager from '../manager/GameManager.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    const { width, height } = this.scale;

    //  this.gameOverBackground = this.add.image(0, 0, 'gameoverBackground').setOrigin(0, 0); // 배경
    // 반투명 배경
    this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0, 0);
    this.gameOverTxt = this.add.image(width / 2, height / 2 - 100, 'gameOverTxt');

    this.homeButton = this.add.image(width / 2, height / 2 + 230, 'homeButton')
      .setScale(0.6)
      .setInteractive({ useHandCursor: true });
    

    this.add.text(width / 2, height / 2 + 30, `${GameManager.level}단계 실패`, {
      fontSize: '42px',
        fontFamily: 'SchoolSafetyRoundedSmile',
        color: '#fff',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 100, `현재 점수: ${GameManager.score}`, {
      fontSize: '42px',
        fontFamily: 'SchoolSafetyRoundedSmile',
        color: '#fff',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 3,
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