import { gameEvents } from '../manager/EventManager.js';
import AudioManager from '../manager/AudioManager.js';
import BgmButton from '../components/BgmButton.js';

export default class GameStartScene extends Phaser.Scene {
  constructor() {
    super('GameStartScene');
  }

  create = () => {
    this.introBackground = this.add.image(0, 0, 'intro_bg').setOrigin(0, 0); 
    this.playButton = this.add.image(235, 600, 'play_button').setScale(0.6).setInteractive({ useHandCursor: true });
    this.howToGameButton = this.add.image(480, 600, 'howto_button').setScale(0.6).setInteractive({ useHandCursor: true });
    this.bgmButton = new BgmButton(this, 80, 60);
    this.title = this.add.image(400, 250, 'intro_title').setOrigin(0.5, 0.5).setScale(0);

    
    this.createAnimation(); // animation
    this.addEvent(); // event
  }

  createAnimation = () => { // 애니메이션 생성
    this.tweens.add({
      targets: this.title,
      scale: 1,
      duration: 600,
      ease: 'Back.Out'
    });
  }

  addEvent = () => { // 이벤트 등록
    this.playButton.on('pointerover', () => this.playButton.setScale(0.65));
    this.playButton.on('pointerout', () => this.playButton.setScale(0.6))
    this.howToGameButton.on('pointerout', () => this.howToGameButton.setScale(0.6))
    this.howToGameButton.on('pointerover', () => this.howToGameButton.setScale(0.65));
    this.howToGameButton.on('pointerdown', () => gameEvents.emit('howto'));
    this.playButton.on('pointerdown', () => {
      AudioManager.play('clickSound');
      gameEvents.emit('playGame');
      this.scene.start('GameMainScene');
    });
  }
}