import AudioManager from "../manager/AudioManager";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload = () => {
    //background
    this.load.image('main_bg', './images/miner_main_bg.png'); 
    this.load.image('store_bg', './images/store/miner_store_bg.png');   
    this.load.image('timer_bg', './images/miner_timer_bg.png');
    this.load.image('game_over_bg', './images/miner_game_over_bg.png');
    this.load.image('next_level_bg', './images/miner_next_level_bg.png');
    this.load.image('intro_bg', './images/miner_intro_bg.png');   
    this.load.image('finish_bg', './images/finish/miner_finish_bg.png');

    this.load.image('intro_title', './images/miner_intro_title.png');

    // item
    this.load.image('dynamite', './images/miner_items_dynamite.png');
    this.load.image('potion', './images/miner_items_potion.png');

    //storeItem
    this.load.image('store_dynamite', './images/store/miner_store_shop_item_dynamite.png');
    this.load.image('store_potion', './images/store/miner_store_shop_item_potion.png');

    // player
    this.load.spritesheet('miner_idle', './images/miner/miner_idle_sprite.png', { frameWidth: 724, frameHeight: 780 });
    this.load.spritesheet('miner_hard', './images/miner/miner_hard_sprite.png', { frameWidth: 724, frameHeight: 780 });
    this.load.spritesheet('miner_cry', './images/miner/miner_cry_sprite.png', { frameWidth: 724, frameHeight: 780 });
    this.load.spritesheet('miner_smile', './images/miner/miner_smile_sprite.png', { frameWidth: 724, frameHeight: 780 });

    this.load.image('miner_powerup', './images/miner/miner_powerup.png');
    this.load.spritesheet('miner_power', './images/miner/miner_power_sprite.png', { frameWidth: 724, frameHeight: 780 });

    // clamp
    this.load.spritesheet('clamp', './images/miner/miner_clamp_sprite.png', { frameWidth: 72, frameHeight: 72 });
    this.load.image('rope', './images/miner/miner_rope.png');

    // button
    this.load.image('home_button', './images/button/home_button.png');
    this.load.image('store_button', './images/button/miner_store_button.png')
    this.load.image('next_level_button', './images/button/miner_next_button.png')
    this.load.image('miner_store_out_button', './images/button/miner_store_out_button.png')
    this.load.spritesheet('bgm_button', './images/button/miner_button_sound.png', { frameWidth: 84, frameHeight: 84 });
    this.load.image('howto_button', './images/button/howto_button.png');
    this.load.image('play_button', './images/button/play_button.png');

    //text 
    this.load.image('fail', './images/miner_fail.png');
    this.load.image('success', './images/miner_success.png');
    this.load.image('complete', './images/finish/miner_complete.png');
    
    this.load.image('miner_balloon', './images/miner_balloon.png');
    this.load.image('miner_trophi_box', './images/miner_trophi_box.png');
    this.load.image('miner_icon_coin', './images/miner_icon_coin.png');
    this.load.image('miner_score_box', './images/finish/miner_score_box.png')

    this.load.spritesheet('loading_miner', './images/loading_miner.png', { frameWidth: 81, frameHeight: 67 });

    this.load.spritesheet('minerals', './images/miner_mineral2.png', { frameWidth: 532, frameHeight: 532 });
    this.load.spritesheet('explosion', './images/explosion.png', { frameWidth: 96, frameHeight: 96 });
    
    this.load.tilemapTiledJSON(`map`, `./map/map.json`);

    // 음원 로드
    this.load.audio('bgmSound', './audio/bgm.mp3');
    this.load.audio('ropeSound', './audio/rope.mp3');
    this.load.audio('wrongSound', './audio/wrong.mp3');
    this.load.audio('correctSound', './audio/correct.mp3');
    this.load.audio('ropeShrinkingSound', './audio/rope_shirking.mp3');
    this.load.audio('moneySound', './audio/money.mp3');
    this.load.audio('explode', './audio/explode.mp3');
    this.load.audio('lose', './audio/lose.mp3');
    this.load.audio('powerUp', './audio/power_up.mp3');
    this.load.audio('win', './audio/win.mp3');
    this.load.audio('clickSound', './audio/click.mp3');

    this.loading();
  }

  create = () =>{
    AudioManager.registerScene(this);
    AudioManager.add('bgmSound', { volume: 0.1 });
    AudioManager.add('ropeSound', { volume: 0.5 });
    AudioManager.add('wrongSound', { volume: 0.5 });
    AudioManager.add('correctSound');
    AudioManager.add('moneySound');
    AudioManager.add('ropeShrinkingSound', { loop: true });
    AudioManager.add('lose', { volume: 0.3 });
    AudioManager.add('explode', { volume: 0.7 })
    AudioManager.add('powerUp', { volume: 0.7 })
    AudioManager.add('win');
    AudioManager.add('clickSound');

    this.loadingMiner.stop('loading_move');
    this.time.delayedCall(300, () => this.scene.start('GameStartScene'));
  }

  loading = () => {
    const size = { 
      width: 500, 
      height: 30, 
      boxStroke: 3, 
      barStroke: 2 
    };

    const center = { 
      x: this.cameras.main.width / 2 - size.width / 2, 
      y: this.cameras.main.height / 2 - size.height / 2
    };

    this.loadingMiner = this.add.sprite(this.cameras.main.width / 2, center.y - 20, 'loading_miner').setScale(0.5);

    this.loadingMiner.anims.create({
      key: 'loading_move',
      frames: this.anims.generateFrameNumbers('loading_miner', { start: 0, end: 2 }),
      frameRate: 10,
      repeat: -1
    });
    this.loadingMiner.play('loading_move');

    const loadingBox = this.add.graphics();
    loadingBox.fillStyle(0xffffff, 1);
    loadingBox.fillRoundedRect(center.x, center.y, size.width, size.height, size.height / 2);
    loadingBox.lineStyle(size.boxStroke, 0x94ccdc, 1); 
    loadingBox.strokeRoundedRect(center.x, center.y, size.width, size.height, size.height / 2);

    const loadingBar = this.add.graphics();

    this.load.on('progress', (value) => {
      loadingBar.clear();
      loadingBar.fillStyle(0x94ccdc, 1);
      const innerWidth = (size.width - 6) * value;
      loadingBar.fillRoundedRect(center.x + 3, center.y + 3, Math.max(size.height - 6, innerWidth), size.height - 6, (size.height - 6) / 2);
      loadingBar.lineStyle(size.barStroke, 0xffffff, 0.7);
      loadingBar.strokeRoundedRect(center.x + 3, center.y + 3, Math.max(size.height - 6, innerWidth), size.height - 6, (size.height - 6) / 2);

      this.loadingMiner.x = center.x +  Math.max(size.height - 6, innerWidth);
    });
  };
}