import GameManager from '../manager/GameManager.js';

export default class BgmButton{
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    this.button = this.scene.add.sprite(80, 60, 'bgmButton').setOrigin(0.5).setScale(0.1).setInteractive({ useHandCursor: true }).setFrame(GameManager.bgmOn ? 1 : 0).setDepth(100);
    this.button.on('pointerdown', () => this.clickBgmButton());
  }

  clickBgmButton() {
    GameManager.toggleBgm();
    this.button.setFrame(GameManager.bgmOn ? 1 : 0);
  }
}

