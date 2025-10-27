import { gameEvents } from '../manager/EventManager.js';
import GameManager from '../manager/GameManager.js';

export default class GameStoreScene extends Phaser.Scene {
  constructor() {
    super('GameStoreScene');
  }

  create() {
    this.storeBackground = this.add.image(0, 0, 'storeBackground').setOrigin(0, 0); // 배경

    this.bomb = this.add.image(330, 420, 'store_dynamite').setInteractive({ useHandCursor: true }).setScale(0.7);
    this.potion = this.add.image(545, 420, 'store_potion').setInteractive({ useHandCursor: true }).setScale(0.7);

    this.nexLevelButton = this.add.image(432, 620, 'miner_store_out_button').setInteractive({ useHandCursor: true }).setScale(0.8)

    this.addEvent();
  }

  addEvent() {

    this.nexLevelButton.setInteractive({ useHandCursor: true });

    this.bomb.on('pointerdown', () => {
      this.disableItem(this.bomb);
      gameEvents.emit('item', { key: 'dynamite' });
    })

    this.potion.on('pointerdown', () => {
      this.disableItem(this.potion);
      gameEvents.emit('item', { key: 'potion' });
    })

    this.nexLevelButton.on('pointerover', () => this.nexLevelButton.setScale(0.85));
    this.nexLevelButton.on('pointerout', () => this.nexLevelButton.setScale(0.8));

    this.nexLevelButton.on('pointerdown', () => {
      GameManager.levelUp(); 
      this.scene.stop('GameStoreScene');
      this.scene.start('GameMainScene');
    })
  }


  disableItem(item) {
    item.disableInteractive().setAlpha(0.5);
    this.input.setDefaultCursor('default'); 
  }
}