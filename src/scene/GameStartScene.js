import { gameEvents } from '../manager/EventManager.js';
import { GameManager } from '../manager/GameManager.js';

export default class GameStartScene extends Phaser.Scene {
  constructor() {
    super('GameStartScene');
  }

  preload() {
    this.load.image('background1', './images/background1.png'); 
    this.load.image('howtoButton', './images/howtoButton.png');
    this.load.image('playButton', './images/playButton.png');
  }

  create() {
    const { width, height } = this.scale;
    this.background = this.add.image(0, 0, 'background1').setOrigin(0, 0); // 배경
    this.bgmButton = this.add.sprite(80, 60, 'bgmButton').setOrigin(0.5).setScale(0.1).setInteractive({ useHandCursor: true }).setFrame(GameManager.bgmOn ? 1 : 0).setDepth(100);
    this.playButton = this.add.image(width / 2 - 200, height / 2 + 100, 'playButton').setScale(0.7).setInteractive({ useHandCursor: true });
    this.howToGameButton = this.add.image(width / 2 - 200, height / 2 + 200, 'howtoButton').setScale(0.7).setInteractive({ useHandCursor: true });
    this.title = this.add.text(width / 2 - 200, height / 2 - 100, ' 황금 캐기 ', { fontSize: '62px', fontFamily: 'SchoolSafetyRoundedSmile', fontStyle: 'bold' }).setOrigin(0.5);
    
    this.addEvent();
  }

  addEvent() {
    this.playButton.on('pointerdown', async () => this.scene.start('MainScene'));
    this.howToGameButton.on('pointerdown', () => gameEvents.emit('howto'));
    this.bgmButton.on('pointerdown', () => {
      this.sound.get('clickSound').play();
      this.setBgm(GameManager.bgmOn);
    });
  }

  setBgm(bool) {
    GameManager.bgmOn = !bool;
    this.bgmButton.setFrame(GameManager.bgmOn ? 1 : 0);
  }
}