import { gameEvents } from '../manager/EventManager.js';
import AudioManager from '../manager/AudioManager.js';
import BgmButton from '../components/BgmButton.js';

export default class GameStartScene extends Phaser.Scene {
  constructor() {
    super('GameStartScene');
  }

  create() {
    this.introBackground = this.add.image(0, 0, 'intro_bg')
      .setOrigin(0, 0); // 배경

    this.playButton = this.add.image(250, 400, 'playButton')
      .setScale(0.6)
      .setInteractive({ useHandCursor: true });

    this.howToGameButton = this.add.image(250, 520, 'howtoButton')
      .setScale(0.6)
      .setInteractive({ useHandCursor: true });

    this.bgmButton = new BgmButton(this, 80, 60);

    //event
    this.playButton.on('pointerover', () => this.playButton.setScale(0.65));
    this.playButton.on('pointerout', () => this.playButton.setScale(0.6))
    this.howToGameButton.on('pointerout', () => this.howToGameButton.setScale(0.6))
    this.howToGameButton.on('pointerover', () => this.howToGameButton.setScale(0.65));
    this.howToGameButton.on('pointerdown', () => gameEvents.emit('howto'));
    this.playButton.on('pointerdown', () => {
      AudioManager.play('clickSound');
      this.scene.start('GameMainScene');
    });
  }
}