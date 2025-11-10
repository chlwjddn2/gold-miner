import GameManager from '../manager/GameManager.js';
import { createText } from '../utils';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create = () => {
    const center = {
      x: this.cameras.main.width / 2,
      y: this.cameras.main.height / 2,
    };

    this.add.image(0, 0, 'game_over_bg').setOrigin(0, 0);
    this.add.image(900, 436, 'game_over_miner');
    this.add.image(center.x, 155, 'game_over_text').setOrigin(0.5);
    this.add.image(367, 478, 'game_over_box');
    this.homeButton = this.add.image(360, 580, 'home_button').setInteractive({ useHandCursor: true }); 

    // 텍스트 생성
    createText(this, 300, 370, `${GameManager.level}단계`, 54, '#6E2802')
    createText(this, 360, 468, `${GameManager.score}`, 68, '#fff')
    
    this.addEvent();
  }

  addEvent = () => {
    this.homeButton.on('pointerout', () => this.homeButton.setScale(1));
    this.homeButton.on('pointerover', () => this.homeButton.setScale(1.1));

    this.homeButton.on('pointerdown', () => {
      this.scene.start('GameStartScene');
      GameManager.reset();
    })
  }

  createText = (x, y, content, fontSize, color = '#fff') => { 
    return this.add.text(x, y, content, {
      fontSize: `${fontSize}px`,
      fontFamily: 'Cafe24Surround',
      color: color,
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }
}