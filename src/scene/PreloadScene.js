import AudioManager from "../manager/AudioManager";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
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

    const loadingText = this.add.text(centerX, centerY - 50, 'Loading...', {
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

    // ✅ 로딩 완료 이벤트
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
    
    this.load.spritesheet('bgmButton', './images/soundButton.png', { frameWidth: 532, frameHeight: 532 });
    
    this.load.audio('bgmSound', './audio/bgm.mp3');
    this.load.audio('clickSound', './audio/click.mp3');
    

    this.load.image('mainBackground', './images/background.png'); 
    this.load.image('introBackground', './images/background1.png');   
    this.load.image('storeBackground', './images/store_background.png');   


    this.load.image('rope', './images/rope.png');
    this.load.image('clamp', './images/clamp.png');
    this.load.image('bomb', './images/bomb.png');
    this.load.image('potion', './images/potion.png');
    this.load.image('cable', './images/cable.png');

    this.load.image('howtoButton', './images/howtoButton.png');
    this.load.image('playButton', './images/playButton.png');

    this.load.spritesheet('player', './images/player.png', { frameWidth: 116, frameHeight: 116 });
    this.load.spritesheet('minerals', './images/mineral.png', { frameWidth: 532, frameHeight: 532 });
    this.load.spritesheet('explosion', './images/explosion.png', { frameWidth: 96, frameHeight: 96 });
    
    this.load.tilemapTiledJSON(`map`, `./map/map.json`);

    // 음원 로드
    this.load.audio('ropeSound', './audio/rope.mp3');
    this.load.audio('wrongSound', './audio/wrong.mp3');
    this.load.audio('correctSound', './audio/correct.mp3');
    this.load.audio('ropeShrinkingSound', './audio/rope_shirking.mp3');
    this.load.audio('moneySound', './audio/money.mp3');
    this.load.audio('bgmSound', './audio/bgm.mp3');
  }

  create() {
    AudioManager.registerScene(this);
    AudioManager.add('bgmSound', { volume: 0.1 });
    AudioManager.add('clickSound');
    AudioManager.add('ropeSound', { volume: 0.5 });
    AudioManager.add('wrongSound', { volume: 0.5 });
    AudioManager.add('correctSound');
    AudioManager.add('moneySound');
    AudioManager.add('ropeShrinkingSound', { loop: true });

    this.scene.start('GameStartScene');
  }
}
