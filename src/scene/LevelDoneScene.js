import GameManager from '../manager/GameManager.js';

export default class LevelDoneScene extends Phaser.Scene {
  constructor() {
    super('LevelDoneScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add.image(0, 0, 'next_level_bg').setOrigin(0, 0); // 배경
    this.add.image(560, 340, 'success').setScale(0.85);

    this.add.text(396, 344, `${GameManager.level}단계`, {
      fontSize: '56px',
        fontFamily: 'Cafe24Surround',
        color: '#6E2802',
        fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(460, 435, `${GameManager.score}`, {
      fontSize: '56px',
        fontFamily: 'Cafe24Surround',
        color: '#fff',
        fontStyle: 'bold',
    }).setOrigin(0.5);

    this.storeButton = this.add.image(width / 2 - 150, height / 2 + 260, 'storeButton')
      .setInteractive({ useHandCursor: true });

    this.nexLevelButton = this.add.image(width / 2 + 150, height / 2 + 260, 'nextLevelButton')
      .setInteractive({ useHandCursor: true });


    this.storeButton.on('pointerover', () => this.storeButton.setScale(1.1));
    this.storeButton.on('pointerout', () => this.storeButton.setScale(1));
    
    this.nexLevelButton.on('pointerover', () => this.nexLevelButton.setScale(1.1))
    this.nexLevelButton.on('pointerout', () => this.nexLevelButton.setScale(1));

    this.storeButton.on('pointerdown', () => {
      this.scene.stop('GameMainScene');
      this.scene.start('GameStoreScene');
    })


    this.nexLevelButton.on('pointerdown', () => {
      GameManager.levelUp();
      this.scene.start('GameMainScene');
    })
  }
}