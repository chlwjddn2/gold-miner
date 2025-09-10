export default class GameStartScene extends Phaser.Scene {
  constructor() {
    super('GameStartScene');
  }

  preload() {
    this.load.spritesheet('bgmButton', './images/soundButton.png', {
      frameWidth: 532,
      frameHeight: 532
    })
  }

  create() {
    const { width, height } = this.scale;

    this.title = this.add.text(width / 2, height / 2 - 100, ' 황금 캐기 ', {
      fontSize: '48px',
      fontFamily: 'SchoolSafetyRoundedSmile',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.startButton = this.add.text(width / 2, height / 2 + 100, '게임 시작', {
      fontSize: '36px',
      fontFamily: 'SchoolSafetyRoundedSmile',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.howToGameButton = this.add.text(width / 2, height / 2 + 200, '게임 방법', {
      fontSize: '36px',
      fontFamily: 'SchoolSafetyRoundedSmile',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.howToGameButton.on('pointerdown', () => {
      const howToPopEvent = new Event('HOWTO_SHOW');
      document.dispatchEvent(howToPopEvent);      
    });

    this.startButton.on('pointerdown', () => this.scene.start('MainScene'));
  }
}