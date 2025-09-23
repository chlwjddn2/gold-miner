export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.load.spritesheet('bgmButton', './images/soundButton.png', { frameWidth: 532, frameHeight: 532 });
    
    this.load.audio('bgmSound', './audio/bgm.mp3');
    this.load.audio('clickSound', './audio/click.mp3');
  }

  create() {
    this.bgmSound = this.sound.add('bgmSound', { volume: 0.2 });
    this.clickSound = this.sound.add('clickSound');
    this.scene.start('GameStartScene');
  }
}
