import AudioManager from "../manager/AudioManager";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload = () => {
    // game over scene
    this.load.image('game_over_bg', './images/game_over/game_over_bg.png');
    this.load.image('game_over_text', './images/game_over/game_over_text.png');
    this.load.image('game_over_box', './images/game_over/game_over_box.png');
    this.load.image('game_over_miner', './images/game_over/game_over_miner.png');

    // next level scene
    this.load.image('next_level_bg', './images/next_level/next_level_bg.png');
    this.load.image('next_level_box', './images/next_level/next_level_box.png');

    // main scene
    this.load.image('main_bg', './images/main/main_bg.png'); 
    this.load.image('timer_bg', './images/main/main_timer_bg.png');
    this.load.image('dynamite', './images/main/main_dynamite.png');
    this.load.image('potion', './images/main/main_potion.png');

    this.load.image('icon_coin', './images/main/main_icon_coin.png');
    this.load.image('trophi_box', './images/main/main_trophi_box.png');
    this.load.image('balloon', './images/main/main_balloon.png');
    
    this.load.spritesheet('explosion', './images/main/main_explosion.png', { frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet('minerals', './images/main/main_mineral.png', { frameWidth: 532, frameHeight: 532 });
    this.load.spritesheet('mole', './images/main/main_mole_sprites.png', { frameWidth: 532, frameHeight: 532 });

    // store scene
    this.load.image('store_bg', './images/store/store_bg.png');   
    this.load.image('store_dynamite', './images/store/store_dynamite.png');
    this.load.image('store_potion', './images/store/store_potion.png');

    // intro scene
    this.load.image('intro_bg', './images/intro/intro_bg.png');   
    this.load.image('intro_title', './images/intro/intro_title.png');

    this.load.image('howto_bg', './images/intro/intro_howto_bg.png');
    this.load.image('howto_bubbld1', './images/intro/intro_bubbld1.png');
    this.load.image('howto_bubbld2', './images/intro/intro_bubbld2.png');
    this.load.image('howto_bubbld3', './images/intro/intro_bubbld3.png');

    this.load.video('intro_video', './images/intro/intro_bg.mp4', 'loadeddata', false, true);

    // finish scene
    this.load.image('finish_bg', './images/finish/miner_finish_bg.png');
    this.load.image('complete', './images/finish/miner_complete.png');
    this.load.image('miner_score_box', './images/finish/miner_score_box.png')
    
    // player
    this.load.spritesheet('miner_idle', './images/miner/miner_idle_sprite.png', { frameWidth: 724, frameHeight: 780 });
    this.load.spritesheet('miner_hard', './images/miner/miner_hard_sprite.png', { frameWidth: 724, frameHeight: 780 });
    this.load.spritesheet('miner_cry', './images/miner/miner_cry_sprite.png', { frameWidth: 724, frameHeight: 780 });
    this.load.spritesheet('miner_smile', './images/miner/miner_smile_sprite.png', { frameWidth: 724, frameHeight: 780 });
    this.load.spritesheet('miner_power', './images/miner/miner_power_sprite.png', { frameWidth: 724, frameHeight: 780 });
    this.load.image('miner_powerup', './images/miner/miner_powerup.png');

    // clamp
    this.load.spritesheet('clamp', './images/miner/miner_clamp_sprite.png', { frameWidth: 72, frameHeight: 72 });
    this.load.image('rope', './images/miner/miner_rope.png');

    // button
    this.load.image('home_button', './images/button/home_button.png');
    this.load.image('next_button', './images/button/next_button.png')
    this.load.image('store_button', './images/button/store_button.png')
    this.load.image('miner_store_out_button', './images/button/miner_store_out_button.png')
    this.load.spritesheet('bgm_button', './images/button/miner_button_sound.png', { frameWidth: 84, frameHeight: 84 });
    this.load.image('howto_button', './images/button/howto_button.png');
    this.load.image('play_button', './images/button/play_button.png');

    // loading
    this.load.spritesheet('loading_miner', './images/loading_miner.png', { frameWidth: 81, frameHeight: 67 });

    // map
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

    this.loading(); // 로드될때까지 로딩 
  }

  create = async () =>{
    // CSS @font-face로 등록된 폰트가 로드될 때까지 대기
    await document.fonts.load('16px "Cafe24Surround"');
    await document.fonts.ready;  
    
    // audio manager에 음원 등록
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

    // 로드 후 애니메이션 종료
    this.loadingMiner.stop('loading_move');

    // 끝난 후 딜레이 추가
    this.time.delayedCall(300, () => this.scene.start('GameStartScene'));
  }

  loading = () => { // 로딩 바 함수
    const size = {
      width: 500,
      height: 30,
      boxStroke: 3,
      barStroke: 2,
    };

    const cam = this.cameras.main;
    const center = {
      x: cam.width / 2 - size.width / 2,
      y: cam.height / 2 - size.height / 2,
    };

    const padding = 3; 
    const innerHeight = size.height - padding * 2;
    const innerX = center.x + padding;
    const innerY = center.y + padding;

    const loadingBox = this.add.graphics();
    const loadingBar = this.add.graphics();

    // 캐릭터 설정
    this.loadingMiner = this.add.sprite(cam.width / 2, center.y - 20, "loading_miner").setScale(0.5);

    this.loadingMiner.anims.create({
      key: "loading_move",
      frames: this.anims.generateFrameNumbers("loading_miner", { start: 0, end: 2 }),
      frameRate: 10,
      repeat: -1,
    });

    this.loadingMiner.play("loading_move");

    // 로딩 박스
    loadingBox.fillStyle(0xffffff, 1);
    loadingBox.fillRoundedRect(center.x, center.y, size.width, size.height, size.height / 2);
    loadingBox.lineStyle(size.boxStroke, 0x94ccdc, 1);
    loadingBox.strokeRoundedRect(center.x, center.y, size.width, size.height, size.height / 2);

    // 로딩 진행
    this.load.on("progress", (value) => {
      loadingBar.clear();

      const innerWidth = (size.width - padding * 2) * value;
      const barWidth = Math.max(innerHeight, innerWidth);

      loadingBar.fillStyle(0x94ccdc, 1);
      loadingBar.fillRoundedRect(innerX, innerY, barWidth, innerHeight, innerHeight / 2);

      loadingBar.lineStyle(size.barStroke, 0xffffff, 0.7);
      loadingBar.strokeRoundedRect(innerX, innerY, barWidth, innerHeight, innerHeight / 2);

      this.loadingMiner.x = innerX + barWidth;
    });
  };
}