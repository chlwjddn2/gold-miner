import { gameEvents } from '../manager/EventManager.js';
import GameManager from '../manager/GameManager.js';

export default class GameStoreScene extends Phaser.Scene {
  constructor() {
    super('GameStoreScene');
  }

  create() {
    this.storeBackground = this.add.image(0, 0, 'store_bg').setOrigin(0, 0); // 배경
    this.storeDynamite = this.add.image(330, 420, 'store_dynamite').setInteractive({ useHandCursor: true }).setScale(0.7);
    this.storePotion = this.add.image(545, 420, 'store_potion').setInteractive({ useHandCursor: true }).setScale(0.7);
    this.nexLevelButton = this.add.image(432, 620, 'miner_store_out_button').setInteractive({ useHandCursor: true }).setScale(0.8)

    this.addEvent();
  }

  addEvent() {
    this.storeDynamite.on('pointerdown', () => {
      this.disableItem(this.storeDynamite);
      gameEvents.emit('clickItem', { key: 'dynamite' });
    })

    this.storePotion.on('pointerdown', () => {
      this.disableItem(this.storePotion);
      gameEvents.emit('clickItem', { key: 'potion' });
    })

    this.nexLevelButton.on('pointerover', () => this.nexLevelButton.setScale(0.85));
    this.nexLevelButton.on('pointerout', () => this.nexLevelButton.setScale(0.8));

    this.storeDynamite.on('pointerover', () => this.storeDynamite.setScale(0.75));
    this.storeDynamite.on('pointerout', () => this.storeDynamite.setScale(0.7));

    this.storePotion.on('pointerover', () => this.storePotion.setScale(0.75));
    this.storePotion.on('pointerout', () => this.storePotion.setScale(0.7));

    this.nexLevelButton.on('pointerdown', () => {
      GameManager.levelUp(); 
      this.scene.stop('GameStoreScene');
      this.scene.start('GameMainScene');
    })
  }


  disableItem = (item) => {
    item.disableInteractive().setAlpha(0.5);
    this.input.setDefaultCursor('default'); 
  }
}