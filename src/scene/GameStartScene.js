import { gameEvents } from '../manager/EventManager.js';
import BgmButton from '../components/BgmButton.js';

export default class GameStartScene extends Phaser.Scene {
  constructor() {
    super('GameStartScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    this.introBackground = this.add.image(0, 0, 'introBackground').setOrigin(0, 0); // 배경
    this.bgmButton = new BgmButton(this, 80, 60);
    this.playButton = this.add.image(width / 2 - 200, height / 2 + 100, 'playButton').setScale(0.7).setInteractive({ useHandCursor: true });
    this.howToGameButton = this.add.image(width / 2 - 200, height / 2 + 200, 'howtoButton').setScale(0.7).setInteractive({ useHandCursor: true });
    this.title = this.add.text(width / 2 - 200, height / 2 - 100, ' 황금 캐기 ', { fontSize: '62px', fontFamily: 'SchoolSafetyRoundedSmile', fontStyle: 'bold' }).setOrigin(0.5);
    
    this.addEvent();
  }

  addEvent() {
    this.playButton.on('pointerdown', async () => this.scene.start('MainScene'));
    this.howToGameButton.on('pointerdown', () => gameEvents.emit('howto'));
  }
}