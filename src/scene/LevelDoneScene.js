import GameManager from '../manager/GameManager.js';

export default class LevelDoneScene extends Phaser.Scene {
  constructor() {
    super('LevelDoneScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, 800, 600, 0x000000, 0.6);
    this.add.text(width / 2, height / 2 - 100, `${GameManager.level}단계 성공`, {
      fontSize: '48px',
      fill: '#ffffff',
      fontFamily: 'SchoolSafetyRoundedSmile',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 50, `점수: ${GameManager.score}`, {
      fontSize: '48px',
      fill: '#ffffff',
      fontFamily: 'SchoolSafetyRoundedSmile',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.storeButton = this.add.text(width / 2 - 100, height / 2 + 200, '상점 가기', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'SchoolSafetyRoundedSmile',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.nexLevelButton = this.add.text(width / 2 + 100, height / 2 + 200, '다음 단계', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'SchoolSafetyRoundedSmile',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.nexLevelButton.setInteractive({ useHandCursor: true });
    this.storeButton.setInteractive({ useHandCursor: true });

    this.storeButton.on('pointerdown', () => {
      this.scene.stop('MainScene');
      this.scene.start('GameStoreScene');
    })


    this.nexLevelButton.on('pointerdown', () => {
      GameManager.levelUp();
      this.scene.start('MainScene');
    })
  }
}