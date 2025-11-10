import GameManager from '../manager/GameManager.js';
import AudioManager from '../manager/AudioManager.js';
import { createText } from '../utils';

export default class LevelDoneScene extends Phaser.Scene {
  constructor() {
    super('LevelDoneScene');
  }

  create = () => {
    const center = {
      x: this.cameras.main.width / 2,
      y: this.cameras.main.height / 2,
    };

    this.add.image(0, 0, 'next_level_bg').setOrigin(0, 0);
    this.add.image(center.x, center.y, 'next_level_box').setOrigin(0.5, 0.5);
    this.storeButton = this.add.image(center.x - 120, center.y + 260, 'store_button').setInteractive({ useHandCursor: true });
    this.nexLevelButton = this.add.image(center.x + 120, center.y + 260, 'next_button').setInteractive({ useHandCursor: true });

    // 텍스트 생성
    createText(this, 395, 364, `${GameManager.level}단계`, 54, '#6E2802');
    createText(this, 462, 474, `${GameManager.score}`, 68, '#fff');
    
    this.addEvent();
  }

  addEvent = () => { // 이벤트 등록
    this.storeButton.on('pointerover', () => this.storeButton.setScale(1.1));
    this.storeButton.on('pointerout', () => this.storeButton.setScale(1));
    
    this.nexLevelButton.on('pointerover', () => this.nexLevelButton.setScale(1.1))
    this.nexLevelButton.on('pointerout', () => this.nexLevelButton.setScale(1));

    this.storeButton.on('pointerdown', () => {
      AudioManager.play('clickSound');
      this.scene.start('GameStoreScene');
    })

    this.nexLevelButton.on('pointerdown', () => {
      AudioManager.play('clickSound');
      GameManager.levelUp();
      this.scene.start('GameMainScene');
    })
  }
}