export default class BgmToggleButton {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.bgm = this.scene.sound.get('bgm') || this.scene.sound.add('bgm', { loop: true, volume: 0.3 });
  }

  init() {
    this.initButton();
    this.addEvent();
  }

  initButton() {
    this.button = this.scene.add.sprite(this.x, this.y, 'bgmButton')
      .setOrigin(0.5)
      .setScale(0.1)
      .setInteractive({ useHandCursor: true })
      .setFrame(this.bgm.isPlaying ? 1 : 0).setDepth(100);
  }

  addEvent() {
    this.button.on('pointerdown', () => {
      if (this.bgm.isPlaying) {
        this.bgm.stop();
        this.button.setFrame(0);
      } else {
        this.bgm.play();
        this.button.setFrame(1);
      }
    });
  }
}