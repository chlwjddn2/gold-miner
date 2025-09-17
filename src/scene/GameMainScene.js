import { gameEvents } from '../Event.js';
import BgmToggleButton from '../components/BgmToggleButton.js';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  init(data) {
    this.level = data?.level ?? 1;
    this.score = data?.score ?? 0;
    this.targetScore = data?.targetScore ?? 650;
  }

  preload() {
    this.load.image('background', './images/background.png'); 
    this.load.image('rope', './images/rope.png');
    this.load.image('clamp', './images/clamp.png');
    this.load.image('bomb', './images/bomb.png');
    this.load.image('potion', './images/potion.png');
    this.load.image('cable', './images/cable.png');

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
  }

  create() {
    this.angle = 0;
    this.swingTime = 0;           // 스윙 계산용 시간
    this.baseSpeed = 10;          // 선 늘어나고 줄어드는 기본 속도
    this.lineLength = 100;        // 현재 선 길이
    this.lineMoving = false;      // 선 늘어나는 상태
    this.lineShrinking = false;   // 선 줄어드는 상태
    this.attachedObject = null;
    this.width = this.cameras.main.width;
    this.height = this.cameras.main.height;

    this.background = this.add.image(0, 0, 'background').setOrigin(0, 0).setInteractive(); // 배경
    this.rope = this.add.image(this.width / 2, 116, 'rope').setOrigin(0.5, 0).setScale(0.5, this.lineLength / 100).setDepth(10); // rope 이미지 설정
    this.clamp = this.matter.add.image(this.width / 2, 170, 'clamp').setOrigin(0.5, 0).setScale(0.1).setDepth(20).setBody({ type: 'circle', radius: 10 }); // clamp 이미지 설정
    this.cable = this.add.sprite(this.width / 2, 116, 'cable').setDepth(5).setScale(0.15);
    this.player = this.add.sprite(this.width / 2 + 80, 106, 'player').setDepth(10).setFlipX(true).setDepth(5); // 플레이어 이미지 설정
    this.bomb = this.add.image(450, 125, 'bomb').setScale(0.1).setInteractive({ useHandCursor: true });
    this.potion = this.add.image(510, 125, 'potion').setScale(0.12).setInteractive({ useHandCursor: true });
    
    this.cursors = this.input.keyboard.createCursorKeys(); // 키 입력

    this.initMap();
    this.initSound();
    this.initTimer();
    this.initScore();
    this.initAnimation();
    this.addEvent();

    this.bgmButton = new BgmToggleButton(this, 80, 65);
    this.bgmButton.init();
  }

  update(time, delta) {
    if (!this.attachedObject && !this.lineMoving && !this.lineShrinking) this.swingRope(delta);
    if (this.lineMoving) this.expansionRope();
    if (this.lineShrinking) this.shrinkingRope();
    this.updateClamp();
  }

  initTimer(time = 60) {
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        time--;
        this.timerText?.setText(`시간 : ${time}`);
        if (time <= 0) this.onTimerEnd();
      },
      callbackScope: this,
    });

    this.targetScoreText = this.createText(50, 100,  `시간 : ${time}`);
  }

  initScore() {
    this.scoreText = this.createText(this.width - 250, 46,  `점수 : ${this.score}`);
    this.targetScoreText = this.createText(this.width - 250, 110,  `${this.level}단계 목표 : ${this.targetScore}`);
  }

  initMap() {
    const map = this.make.tilemap({  key: 'map' });
    const tileSet = map.getTileset('mineral');
    const objectLayer = map.getObjectLayer(`Map Layer${this.level}`);

    objectLayer.objects.forEach((obj) => {
      const x = Math.floor(obj.x);
      const y = Math.floor(obj.y) - 80;
      const gid = obj.gid - 2;

      const sprite = this.matter.add.sprite(x, y, "minerals", gid);
      const objectData = tileSet.tileData[gid]?.objectgroup?.objects[0];
      const verts = objectData?.polygon?.map(poly => ({ x: poly.x, y: poly.y }));
      if (verts) sprite.setBody({ type: 'fromVertices', verts });
      
      sprite.setDisplaySize(obj.width, obj.height);

      // object properties에서 price, weight 가져오기
      const price = Number(obj.properties?.find(p => p.name === 'price')?.value) || Phaser.Math.Between(10, 500);
      const weight = Number(obj.properties?.find(p => p.name === 'weight')?.value) || Phaser.Math.Between(10, 90);

      sprite.price = price;
      sprite.weight = weight;
    });
  }

  initSound() {
    this.ropeSound = this.sound.add('ropeSound', { volume: 0.5 });
    this.wrongSound = this.sound.add('wrongSound', { volume: 0.5 });
    this.correctSound = this.sound.add('correctSound');
    this.moneySound = this.sound.add('moneySound');
    this.ropeShrinkingSound = this.sound.add('ropeShrinkingSound', { loop: true });

    !this.sound.get('bgm').isPlaying && this.sound.get('bgm').play();
  }

  initAnimation() {
    this.anims.create({
      key: 'explosion',
      frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 11 }),
      frameRate: 10,
    });
  }

  updateClamp() {
    const clampX = this.cable.x - Math.sin(this.angle) * (this.rope.displayHeight);
    const clampY = this.cable.y + Math.cos(this.angle) * (this.rope.displayHeight);
    this.clamp.setPosition(clampX, clampY);
    this.clamp.setRotation(this.angle);
  };

  swingRope(delta) {
    this.swingTime += delta * 0.002;
    this.angle = Math.sin(this.swingTime) * (Math.PI / 2.5);
    this.rope.setRotation(this.angle);
  };

  expansionRope() {
    this.lineLength += this.baseSpeed;
    this.rope.setScale(0.5, this.lineLength / 100);

    // 화면 밖 체크 또는 최대 길이 도달 시 줄어들게 전환
    if (this.clamp.x > this.width || this.clamp.x < 0 || this.clamp.y > this.height) {
      this.lineMoving = false;
      this.lineShrinking = true;
    }
  };

  shrinkingRope() {
    this.lineLength -= this.baseSpeed;
    this.rope.setScale(0.5, this.lineLength / 100);
    this.ropeShrinkingSound.play();

    if (this.attachedObject) {
      this.attachedObject.setPosition(this.clamp.x, this.clamp.y);
      this.attachedObject.setRotation(this.angle);
      this.attachedObject.setDepth(10);
    }

    if (this.lineLength <= 100) {
      this.lineLength = 100;
      this.player.setFrame(0);
      this.ropeShrinkingSound.stop();

      if (this.attachedObject) {
        this.lineShrinking = false; // 먼저 끄는 방식 가능
        this.time.delayedCall(1000, () => {
          this.attachedObject.destroy();
          this.updateScore(this.attachedObject.price);
          this.createScoreText();
          this.attachedObject = null;
          this.baseSpeed = 10;
          this.moneySound.play();
        });
      } else {
        this.lineShrinking = false;
      }
    }
  }

  addEvent() {
    this.cursors.down.on('down', (event) => {
      if (this.lineMoving || this.lineShrinking) return;
      this.lineMoving = true;
      this.ropeSound.play();
      this.player.setFrame(1);
    });

    this.cursors.up.on('down', (event) => {
      if (!this.attachedObject) return;
      this.mineralExplosion();
    });

    this.background.on('pointerdown', () => {
      if (this.lineMoving || this.lineShrinking) return;
      this.lineMoving = true;
      this.ropeSound.play();
      this.player.setFrame(1);
    })

    this.bomb.on('pointerdown', () => gameEvents.emit('bomb',{ key: 'bomb' }));
    this.potion.on('pointerdown', (event) => gameEvents.emit('bomb',{ key: 'potion' }));
    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach((pair) => this.handleclampCollision(pair.bodyA, pair.bodyB));
    });
  }

  handleclampCollision(clamp, object) {
    this.attachedObject = object.gameObject;
    this.matter.world.remove(object);
    this.baseSpeed = Math.floor(10 - (this.attachedObject.weight / 100) * (10 - 1));
    this.attachedObject.price < 50 ? this.wrongSound.play() : this.correctSound.play();
    this.lineMoving = false;
    this.lineShrinking = true;
  }

  onTimerEnd() {
    if (this.score <= this.targetScore) this.scene.launch('GameOverScene');
    else this.scene.launch('LevelDoneScene', {level: this.level, score: this.score, targetScore: this.targetScore });
    this.scene.pause();        
    this.bgm.stop();
    this.ropeSound.stop();
    this.ropeShrinkingSound.stop();
  }

  createText(x, y, text) {
    return this.add.text(x, y, text, {
      fontSize: '32px',
      fill: '#000000',
      fontFamily: 'SchoolSafetyRoundedSmile',
      fontStyle: 'bold'
    }).setDepth(100);
  }
 
  mineralExplosion() {
    const explosion = this.add.sprite(this.attachedObject.x, this.attachedObject.y, 'explosion').setScale(1);
    explosion.play('explosion');
    explosion.on('animationcomplete', () => explosion.destroy());
    this.attachedObject.destroy(); // 혹은 점수 추가 등 원하는 처리
    this.attachedObject = null;
    this.baseSpeed = 10;
    this.priceText?.destroy();
  }

  createScoreText() {
    this.hideText = this.createText(770, 110,  `+${this.attachedObject.price}`);
    this.tweens.add({
      targets: this.hideText,         
      y: this.hideText.y - 70,       
      alpha: 0,                    
      duration: 1000,              
      ease: 'Power1',              
      onComplete: () => {
        this.hideText.destroy();
      }
    });
  }

  updateScore(amount) {
    this.score += amount;
    this.scoreText.setText(`점수 : ${this.score}`);
  }
}