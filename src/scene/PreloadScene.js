import AudioManager from "../manager/AudioManager";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload = () => {
    //background
    this.load.image('mainBackground', './images/miner_main_bg.png'); 
    this.load.image('introBackground', './images/miner_intro_bg.png');   
    this.load.image('storeBackground', './images/miner_store.png');   
    this.load.image('timerBackground', './images/miner_timer_bg.png');
    this.load.image('gameOverBackground', './images/miner_game_over_bg.png');
    this.load.image('nexLevelBackground', './images/miner_next_level_bg.png');

    // item
    this.load.image('dynamite', './images/miner_items_dynamite.png');
    this.load.image('potion', './images/miner_items_potion.png');

    //storeItem
    this.load.image('store_dynamite', './images/miner_store_shop_item_dynamite.png');
    this.load.image('store_potion', './images/miner_store_shop_item_potion.png');

    // player
    this.load.spritesheet('miner', './images/miner_spritesheet.png', { frameWidth: 724, frameHeight: 780 });
    this.load.spritesheet('hard_miner', './images/hard_miner_spritesheet.png', { frameWidth: 724, frameHeight: 780 });
    this.load.spritesheet('cry_miner', './images/cry_miner_spritesheet.png', { frameWidth: 724, frameHeight: 780 });
    this.load.spritesheet('smile_miner', './images/smile_miner_spritesheet.png', { frameWidth: 724, frameHeight: 780 });

    // clamp
    this.load.spritesheet('clamp', './images/clamp_sprite.png', { frameWidth: 72, frameHeight: 72 });
    this.load.image('rope', './images/rope.png');

    // button
    this.load.image('howtoButton', './images/howtoButton.png');
    this.load.image('playButton', './images/playButton.png');
    this.load.image('homeButton', './images/homeButton.png');
    this.load.image('storeButton', './images/miner_store_button.png')
    this.load.image('nextLevelButton', './images/miner_next_button.png')
    this.load.spritesheet('bgmButton', './images/miner_button_sound.png', { frameWidth: 84, frameHeight: 84 });

    //text 
    this.load.image('fail', './images/miner_fail.png');
    this.load.image('success', './images/miner_success.png');
    this.load.image('nextLevelTxt', './images/game_next_text.png');
    
    this.load.image('miner_balloon', './images/miner_balloon.png');
    this.load.image('miner_trophi_box', './images/miner_trophi_box.png');
    this.load.image('miner_icon_coin', './images/miner_icon_coin.png');

    this.load.spritesheet('minerals', './images/miner_mineral.png', { frameWidth: 532, frameHeight: 532 });
    this.load.spritesheet('explosion', './images/explosion.png', { frameWidth: 96, frameHeight: 96 });
    
    this.load.tilemapTiledJSON(`map`, `./map/map.json`);

    // 음원 로드
    this.load.audio('bgmSound', './audio/bgm.mp3');
    this.load.audio('clickSound', './audio/click.mp3');
    this.load.audio('ropeSound', './audio/rope.mp3');
    this.load.audio('wrongSound', './audio/wrong.mp3');
    this.load.audio('correctSound', './audio/correct.mp3');
    this.load.audio('ropeShrinkingSound', './audio/rope_shirking.mp3');
    this.load.audio('moneySound', './audio/money.mp3');
    
    this.load.audio('lose', './audio/lose.mp3');

    this.loading();
  }

  create = () =>{
    AudioManager.registerScene(this);
    AudioManager.add('bgmSound', { volume: 0.1 });
    AudioManager.add('clickSound');
    AudioManager.add('ropeSound', { volume: 0.5 });
    AudioManager.add('wrongSound', { volume: 0.5 });
    AudioManager.add('correctSound');
    AudioManager.add('moneySound');
    AudioManager.add('ropeShrinkingSound', { loop: true });
    AudioManager.add('lose', { volume: 0.3 });

    this.scene.start('GameStartScene');
  }

  loading = () => {
    this.cameras.main.setBackgroundColor('#DFF6F5');
    // ✅ 로딩 바 백그라운드
    const barWidth = 400;
    const barHeight = 30;
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(centerX - barWidth / 2, centerY - barHeight / 2, barWidth, barHeight);

    const progressBar = this.add.graphics();

    this.add.text(centerX, centerY - 50, 'Loading...', {
      fontSize: '24px',
      fill: '#000000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const percentText = this.add.text(centerX, centerY, '0%', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // ✅ 로딩 진행 이벤트
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(centerX - barWidth / 2, centerY - barHeight / 2, barWidth * value, barHeight);
      percentText.setText(`${Math.floor(value * 100)}%`);
    });
  }
}