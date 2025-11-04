import GameManager from '../manager/GameManager.js';
import AudioManager from '../manager/AudioManager.js';

export default class LevelDoneScene extends Phaser.Scene {
  constructor() {
    super('GameFinishScene');
  }

  create = () => {
    const center = {
      x: this.cameras.main.width / 2,
      y: this.cameras.main.height / 2
    }
    this.add.image(0, 0, 'finish_bg').setOrigin(0, 0); // 배경
    this.completeImg = this.add.image(center.x, center.y - 200, 'complete').setOrigin(0.5).setScale(0);
    this.homeButton = this.add.image(center.x + 470, center.y + 260, 'home_button').setScale(0.8).setInteractive({ useHandCursor: true });
    this.scoreBox = this.add.image(center.x, center.y + 260, 'miner_score_box').setOrigin(0.5);
    this.add.text(center.x, center.y + 260, `${GameManager.score}`, {
      fontSize: '56px',
        fontFamily: 'Cafe24Surround',
        color: '#fff',
        fontStyle: 'bold',
    }).setOrigin(0.5);

    this.createAnimation();
    this.addEvent();
    AudioManager.play('win');
  }

  createAnimation = () => {
    this.tweens.add({
      targets: this.completeImg,
      scale: 1,
      duration: 600,
      ease: 'Back.Out' // 살짝 튀어나오는 듯한 느낌
    });
  }

  addEvent = () => {
    this.homeButton.on('pointerover', () => this.homeButton.setScale(0.85))
    this.homeButton.on('pointerout', () => this.homeButton.setScale(0.8));
    this.homeButton.on('pointerdown', () => {
      this.scene.stop();
      this.scene.start('GameStartScene');
      GameManager.reset();
      AudioManager.play('clickSound');
    })
  }
}