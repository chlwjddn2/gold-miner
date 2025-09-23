import { GameManager } from '../manager/GameManager.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    const { width, height } = this.scale;

    // 반투명 배경
    this.add.rectangle(width / 2, height / 2, 800, 600, 0x000000, 0.6);

    // "Game Over" 텍스트 - 중앙 상단
    this.add.text(width / 2, height / 2 - 100, '💀 게임 종료 💀', {
      fontSize: '48px',
      fill: '#ffffff',
      fontFamily: 'SchoolSafetyRoundedSmile',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // [R] Restart Game - 중앙
    this.reStartButton = this.add.text(width / 2, height / 2, '[ R ] 재시작', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'SchoolSafetyRoundedSmile',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // [M] Main Menu - 중앙 하단
    this.mainMenuButton = this.add.text(width / 2, height / 2 + 50, '[ M ] 메인메뉴', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'SchoolSafetyRoundedSmile',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.reStartButton.setInteractive({ useHandCursor: true });
    this.mainMenuButton.setInteractive({ useHandCursor: true });

    this.reStartButton.on('pointerdown', () => {
      this.scene.stop();
      this.scene.stop('MainScene');
      this.scene.start('MainScene');
      this.reset();
    })

    this.mainMenuButton.on('pointerdown', () => {
      this.scene.stop();
      this.scene.stop('MainScene');
      this.scene.start('GameStartScene');
      this.reset();
    })
  }

  reset() {
    GameManager.score = 0;
    GameManager.level = 1;
    GameManager.targetScore = 650;
  }
}