import { gameEvents } from '../manager/EventManager.js';
import { GameManager } from '../manager/GameManager.js';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
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
    this.load.audio('bgmSound', './audio/bgm.mp3');
  }

  create() {

    const widthScale = this.cameras.main.width / 1280;
    const heightScale = this.cameras.main.height / 720;

    // 평균값 또는 원하는 축 기준으로 스케일 결정
    const screenScale = (widthScale + heightScale) / 2;
    this.baseSpeed = 10 * screenScale;

    this.angle = 0;
    this.swingTime = 0;           // 스윙 계산용 시간
    this.ropeSpeed = this.baseSpeed;
    this.lineLength = 100;        // 현재 선 길이
    this.lineMoving = false;      // 선 늘어나는 상태
    this.lineShrinking = false;   // 선 줄어드는 상태
    this.attachedObject = null;
    this.width = this.cameras.main.width;
    this.height = this.cameras.main.height;
    this.power = false;

    this.bgmButton = this.add.sprite(80, 60, 'bgmButton').setOrigin(0.5).setScale(0.1).setInteractive({ useHandCursor: true }).setFrame(GameManager.bgmOn ? 1 : 0).setDepth(100);
    this.cable = this.add.sprite(this.width / 2, 116, 'cable').setDepth(5).setScale(0.15);
    this.player = this.add.sprite(this.width / 2 + 80, 106, 'player').setDepth(10).setFlipX(true).setDepth(5); // 플레이어 이미지 설정

    this.rope = this.add.image(this.width / 2, 116, 'rope').setOrigin(0.5, 0).setScale(0.5, this.lineLength / 100).setDepth(10); // rope 이미지 설정
    this.background = this.add.image(0, 0, 'background').setOrigin(0, 0).setInteractive(); // 배경
    this.bomb = this.add.image(450, 125, 'bomb').setScale(0.1).setInteractive({ useHandCursor: true });
    this.potion = this.add.image(510, 125, 'potion').setScale(0.12).setInteractive({ useHandCursor: true });
    
    this.clamp = this.matter.add.image(this.width / 2, 170, 'clamp').setOrigin(0.5, 0).setScale(0.1).setDepth(20).setBody({ type: 'circle', radius: 10 }); // clamp 이미지 설정

    this.scoreText = this.createText(this.width - 250, 46,  `점수 : ${GameManager.score}`);
    this.targetScoreText = this.createText(this.width - 250, 110,  `${GameManager.level}단계 목표 : ${GameManager.targetScore}`);

    this.ropeSound = this.sound.add('ropeSound', { volume: 0.5 });
    this.wrongSound = this.sound.add('wrongSound', { volume: 0.5 });
    this.correctSound = this.sound.add('correctSound');
    this.moneySound = this.sound.add('moneySound');
    this.ropeShrinkingSound = this.sound.add('ropeShrinkingSound', { loop: true });
    this.bgmSound = this.sound.get('bgmSound');

    this.baseSpeedText = this.createText(this.width - 250, 500, `${this.baseSpeed}`)

    this.anims.create({
      key: 'explosion',
      frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 11 }),
      frameRate: 10,
    });
    
    this.cursors = this.input.keyboard.createCursorKeys(); // 키 입력
    
    this.initMap();
    this.initTimer();
    this.addEvent();
    
    GameManager.bgmOn ? this.bgmSound.play() : this.bgmSound.pause();
  }

  update(time, delta) {
    if (!this.attachedObject && !this.lineMoving && !this.lineShrinking) this.swingRope(delta);
    if (this.lineMoving) this.expansionRope();
    if (this.lineLength > 100 && this.lineShrinking) this.shrinkingRope();
    this.updateClamp();
  }

  initTimer(time = 60) { // 타이머 세팅
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        time--;
        this.timerText?.setText(`시간 : ${time}`);
        if (time <= 0) this.onTimerEnd();
      },
      loop: true,
    });

    this.timerText = this.createText(50, 100,  `시간 : ${time}`);
  }

  initMap() { // 멥 세팅
    const map = this.make.tilemap({  key: 'map' });
    const tileSet = map.getTileset('mineral');
    const objectLayer = map.getObjectLayer(`Map Layer${GameManager.level}`);

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

  addEvent() { // 이벤트 추가
    this.background.on('pointerdown', () => {
      if (this.lineMoving || this.lineShrinking) return;
      this.lineMoving = true;
      this.ropeSound.play();
      this.player.setFrame(1);
    })

    // 아이템 클릭 이벤트
    this.bomb.on('pointerdown', () => {
      this.allSoundStop();
      gameEvents.emit('item', { key: 'bomb' })
    });

    this.potion.on('pointerdown', () => {
      this.allSoundStop();
      gameEvents.emit('item', { key: 'potion' })
    });

    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach((pair) => this.handleclampCollision(pair.bodyB));
    });

    this.bgmButton.on('pointerdown', () => {
      this.sound.get('clickSound').play();
      this.setBgm(GameManager.bgmOn);
    });
  }

  setBgm(bool) {
    GameManager.bgmOn = !bool;
    GameManager.bgmOn ? this.bgmSound.resume() : this.bgmSound.pause();
    this.bgmButton.setFrame(GameManager.bgmOn ? 1 : 0);
  }

  updateClamp() { // 집게 로직
    const clampX = this.cable.x - Math.sin(this.angle) * (this.rope.displayHeight);
    const clampY = this.cable.y + Math.cos(this.angle) * (this.rope.displayHeight);
    this.clamp.setPosition(clampX, clampY);
    this.clamp.setRotation(this.angle);
  };

  swingRope(delta) { // 로프 스윙
    this.swingTime += delta * 0.002;
    this.angle = Math.sin(this.swingTime) * (Math.PI / 2.5);
    this.rope.setRotation(this.angle);
  };

  expansionRope() { // 늘어나는 상태
    this.lineLength += this.ropeSpeed;
    this.rope.setScale(0.5, this.lineLength / 100);
    
    // 화면 밖 체크 또는 최대 길이 도달 시 줄어들게 전환
    if ((this.clamp.x > this.width) || (this.clamp.x < 0)  || (this.clamp.y > this.height)) {
      this.lineMoving = false;
      this.lineShrinking = true;
    }
  };

  shrinkingRope() { // 줄어드는 상태
    this.lineLength -= this.ropeSpeed;
    this.rope.setScale(0.5, this.lineLength / 100);

    this.ropeShrinkingSound.play();

    if (this.attachedObject) {
      this.attachedObject.setPosition(this.clamp.x, this.clamp.y);
      this.attachedObject.setRotation(this.angle);
      this.attachedObject.setDepth(10);
    }
    if (this.lineLength <= 100) this.shrinkingEndPos();
  }

  shrinkingEndPos() { // 다 줄어들었을 떄 
    this.lineLength = 100;
    this.player.setFrame(0);
    this.ropeShrinkingSound.stop();
    this.power && this.powrCount --
    this.ropeSpeed = this.baseSpeed;

    if (this.power && this.powrCount <= 0) this.power = false;

    if (this.attachedObject) { // 잡은 물체가 있으면
      this.time.delayedCall(1000, () => {
        this.lineShrinking = false;
        this.attachedObject.destroy();
        this.updateScore(this.attachedObject.price);
        this.createScoreText();
        this.attachedObject = null;
        this.moneySound.play();
        this.previewText?.destroy();
      });
    } else this.lineShrinking = false;
  }

  handleclampCollision(object) {  // 광물과 충돌 했을때 처리
    this.attachedObject = object.gameObject;
    this.matter.world.remove(object);
    this.ropeSpeed = this.power ? this.baseSpeed : Math.floor(this.baseSpeed - (this.attachedObject.weight / 100) * (this.baseSpeed - 1));
    this.attachedObject.price < 50 ? this.wrongSound.play() : this.correctSound.play();
    this.lineMoving = false;
    this.lineShrinking = true;
    this.createPreviewScore();
  } 

  onTimerEnd() { // 타이머 끝난 후
    if (GameManager.score <= GameManager.targetScore) this.scene.launch('GameOverScene');
    else this.scene.launch('LevelDoneScene');
    this.scene.pause();        
    this.allSoundStop();
  }
 
  mineralExplosion() { // 공물 폭발
    if (!this.attachedObject) return;
    const explosion = this.add.sprite(this.attachedObject.x, this.attachedObject.y, 'explosion').setScale(1);
    explosion.play('explosion');
    explosion.on('animationcomplete', () => explosion.destroy());
    this.attachedObject.destroy(); // 혹은 점수 추가 등 원하는 처리
    this.attachedObject = null;
    this.ropeSpeed = 10;
    this.priceText?.destroy();
  }

  powerUp() { // 파워 업
    this.power = true;
    this.ropeSpeed = 10;
    this.powrCount = 3;
  }

  updateScore(amount) { //점수 업데이트
    GameManager.score += amount;
    this.scoreText.setText(`점수 : ${GameManager.score}`);
  }

  allSoundStop() { // 전체 사운드 끄기
    this.ropeSound.stop();
    this.wrongSound.stop();
    this.correctSound.stop();
    this.ropeShrinkingSound.stop();
    this.bgmSound.pause();
  }

  createText(x, y, text) {
    return this.add.text(x, y, text, {
      fontSize: '32px',
      fill: '#000000',
      fontFamily: 'SchoolSafetyRoundedSmile',
      fontStyle: 'bold'
    }).setDepth(100);
  }

  createScoreText() {
    const sign = this.attachedObject.price < 0 ? '-' : '+';
    this.hideText = this.createText(770, 110,  `${sign}${this.attachedObject.price}`);
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

  createPreviewScore() {
    this.previewText = this.createText(this.width / 2, 50,  `+${this.attachedObject.price}`).setOrigin(0.5);
  }
}