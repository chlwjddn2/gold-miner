import BgmToggleButton from '../components/BgmToggleButton.js'
import { gameEvents } from '../Event.js';

export default class GameStartScene extends Phaser.Scene {
  constructor() {
    super('GameStartScene');
  }

  create() {
    const { width, height } = this.scale;
    this.bgmButton = new BgmToggleButton(this, width - 100, height - 100);
    this.bgmButton.init();

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

    this.howToGameButton.on('pointerdown', () => gameEvents.emit('howto'));

    this.startButton.on('pointerdown', async () => {
      this.sound.get('click').play();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.scene.start('MainScene')
    });
  }
}