export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // 공통으로 사용할 이미지/오디오 등 로드
    this.load.audio('bgm', './audio/bgm.mp3');
    this.load.audio('click', './audio/click.mp3');
    this.load.spritesheet('bgmButton', './images/soundButton.png', { frameWidth: 532, frameHeight: 532 })
  }

  create() {
    this.bgm = this.sound.add('bgm', { loop: true, volume: 0.3 });
    this.click = this.sound.add('click');
    this.scene.start('GameStartScene');
  }
}