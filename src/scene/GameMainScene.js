import { gameEvents } from '../manager/EventManager.js';
import GameManager from '../manager/GameManager.js';
import AudioManager from "../manager/AudioManager";
import BgmButton from '../components/BgmButton.js';
import ProgressBar from '../components/ProgressBar.js';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('GameMainScene');
  }

  create() {
    this.initState(); // 메인 씬 내 변수 초기화
    this.initStage();
    this.addEvent();

    this.progressBar = new ProgressBar(this, 784, 96, 360, 25);
    this.progressBar.update(GameManager.score, GameManager.targetScore);
  }

  update(time, delta) {
    if (this.gameOver) return;
    if (!this.attachedObject && !this.lineMoving && !this.lineShrinking) this.swingRope(delta);
    if (this.lineMoving) this.expansionRope(delta);
    if (this.lineLength > 100 && this.lineShrinking) this.shrinkingRope(delta);
    
    // // // bgm 설정
    // if (GameManager.bgmOn && this.bgm.isPaused) this.bgm.resume();
    // if (GameManager.bgmOn && !this.bgm.isPlaying) this.bgm.play();
    // if (!GameManager.bgmOn && this.bgm.isPlaying) this.bgm.pause();
    
    this.updateClamp();
  }

  initState() {
    this.angle = 0;
    this.swingTime = 0;           // 스윙 계산용 시간
    this.baseSpeed = 700;         // 선 늘어나고 줄어드는 기본 속도
    this.lineLength = 100;        // 현재 선 길이
    this.lineMoving = false;      // 선 늘어나는 상태
    this.lineShrinking = false;   // 선 줄어드는 상태
    this.attachedObject = null;   // 붙은 오브젝트
    this.width = this.cameras.main.width; 
    this.height = this.cameras.main.height;
    this.gameOver = false;
  }

  initStage() {
    this.bgm = this.sound.get('bgmSound');
    this.bgmButton = new BgmButton(this, 80, 60); // bgm 버튼
    this.mainBackground = this.add.image(0, 0, 'mainBackground')
    .setOrigin(0, 0)
    .setInteractive()
    .setDepth(-1); // 배경

    this.createMiner(); // 광부 생성
    this.createMap(); // 맵 생성
    this.createTimer(); // 타이머 초기화
    this.createItems();

    this.anims.create({
      key: 'explosion',
      frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 11 }),
      frameRate: 10,
    });
  }

  createMiner() {
    this.miner = this.add.sprite(this.width / 2, 94, 'miner').setFrame(1);
    this.miner.setFrame(1);
    this.miner.setScale(0.17);

    this.rope = this.add.image(614, 140, 'rope')
    .setOrigin(0.5, 0)
    .setScale(1, this.lineLength / 100)
    .setDepth(10); // rope 이미지 설정

    this.clamp = this.matter.add.sprite(614, this.rope.y + 60, 'clamp')
    .setDepth(20)
    .setCircle(10)
    .setFrame(1);

    this.anims.create({
      key: 'playerIdle',
      frames: this.anims.generateFrameNumbers('miner', { start: 0, end: 0 }),
      frameRate: 1,
      repeat: 0
    });

    this.anims.create({
      key: 'playerAni',
      frames: this.anims.generateFrameNumbers('miner', { start: 0, end: 2 }),
      frameRate: 5,
      repeat: -1
    });

    this.anims.create({
      key: 'playerHardAni',
      frames: this.anims.generateFrameNumbers('hard_miner', { start: 0, end: 2 }),
      frameRate: 5,
      repeat: -1
    });

    this.anims.create({
      key: 'playerCryAni',
      frames: this.anims.generateFrameNumbers('cry_miner', { start: 0, end: 0 }),
      frameRate: 5,
      repeat: -1
    });

    this.anims.create({
      key: 'playerSmileAni',
      frames: this.anims.generateFrameNumbers('smile_miner', { start: 0, end: 0 }),
      frameRate: 5,
      repeat: -1
    });
    
  }

  createItems() {
    this.dynamite = this.add.image(405, 123, 'dynamite');
    this.potion = this.add.image(498, 123, 'potion');

    this.dynamiteCountText = this.createItemCountText(this.dynamite, GameManager.bomb);
    this.potionCountText = this.createItemCountText(this.potion, GameManager.power);

    if (GameManager.bomb > 0) this.dynamite.setInteractive({ useHandCursor: true });
    if (GameManager.power > 0) this.potion.setInteractive({ useHandCursor: true });
  }

  createTimer(time = 60) { // 타이머 세팅
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

  createMap() { // 멥 세팅
    const map = this.make.tilemap({  key: 'map' });
    const tileSet = map.getTileset('mineral');
    const objectLayer = map.getObjectLayer(`Map Layer${GameManager.level}`);

    objectLayer.objects.forEach((obj) => {
      const x = Math.floor(obj.x);
      const y = Math.floor(obj.y) - 80;
      const gid = obj.gid - 2;
      const price = Number(obj.properties?.find(p => p.name === 'price')?.value) || Phaser.Math.Between(10, 500);
      const weight = Number(obj.properties?.find(p => p.name === 'weight')?.value) || Phaser.Math.Between(10, 90);

      const sprite = this.matter.add.sprite(x, y, "minerals", gid);
      const objectData = tileSet.tileData[gid]?.objectgroup?.objects[0];
      const verts = objectData?.polygon?.map(poly => ({ x: poly.x, y: poly.y }));
      if (verts) sprite.setBody({ type: 'fromVertices', verts });
      
      sprite.setDisplaySize(obj.width, obj.height);
      sprite.price = price;
      sprite.weight = weight;
    });
  }

  addEvent() { // 이벤트 추가
    this.mainBackground?.on('pointerdown', () => {
      if (this.lineMoving || this.lineShrinking) return;
      this.lineMoving = true;
      AudioManager.play('ropeSound');
    })

    // 아이템 클릭 이벤트
    this.dynamite.on('pointerdown', () => this.mineralExplosion());
    this.potion.on('pointerdown', () => this.powerUp());
    this.matter.world.on('collisionstart', (event) => this.handleclampCollision(event.pairs[0].bodyB));
  }

  updateClamp() { // 집게 로직
    const clampX = this.rope.x - Math.sin(this.angle) * (this.rope.displayHeight);
    const clampY = this.rope.y + Math.cos(this.angle) * (this.rope.displayHeight);
    this.clamp.setPosition(clampX, clampY);
    this.clamp.setRotation(this.angle);
  };

  swingRope(delta) { // 로프 스윙
    this.swingTime += delta * 0.002;
    this.angle = Math.sin(this.swingTime) * (Math.PI / 2.5);
    this.rope.setRotation(this.angle);
  };

  expansionRope(delta) { // 늘어나는 상태
    this.miner.setFrame(2);
    const speedPerSecond = this.baseSpeed; // 예: 100px per second
    this.lineLength += (speedPerSecond * delta) / 1000; // ms → s
    this.rope.setScale(0.5, this.lineLength / 100);
    
    if ((this.clamp.x > this.width) || (this.clamp.x < 0)  || (this.clamp.y > this.height)) {
      this.lineMoving = false;
      this.lineShrinking = true;
    }
  };

  shrinkingRope(delta) { // 줄어드는 상태
    const speedPerSecond = this.baseSpeed;
    this.lineLength -= (speedPerSecond * delta) / 1000;
    this.rope.setScale(0.5, this.lineLength / 100);
    this.attachedObject?.setPosition(this.clamp.x, this.clamp.y);
    
    if (!this.miner.anims.isPlaying) {
      this.baseSpeed < 350 ? this.miner.play('playerHardAni') : this.miner.play('playerAni');
    }
    
    if (this.lineLength <= 100) this.shrinkingEndPos();
  }

  shrinkingEndPos() { // 다 줄어들었을 떄 
    this.lineLength = 100;
    this.miner.stop();
    this.power && this.powrCount --
    this.baseSpeed = 700;
    this.miner.play('playerIdle');
    this.clamp.setFrame(1);
    AudioManager.stop('ropeShrinkingSound');

    if (this.power && this.powrCount <= 0) this.power = false;
    this.lineShrinking = false;
    if (this.attachedObject) { // 잡은 물체가 있으면
      this.time.delayedCall(200, () => {
        this.lineShrinking = false;
        this.attachedObject.destroy();
        GameManager.updateScore(this.attachedObject.price)
        // this.scoreText.setText(`점수 : ${GameManager.score}`);
        this.createScoreText();
        this.attachedObject = null;
        AudioManager.play('moneySound');
        this.previewText?.destroy();
        this.progressBar.update(GameManager.score, GameManager.targetScore);
      });
    }
  }

  handleclampCollision(object) {  // 광물과 충돌 했을때 처리
    this.attachedObject = object.gameObject;
    this.attachedObject.setRotation(this.angle);
    this.attachedObject.setDepth(10);
    this.matter.world.remove(object);
    this.baseSpeed = this.power ? this.baseSpeed : Math.floor(this.baseSpeed - (this.attachedObject.weight / 100) * (this.baseSpeed - 1));
    
    this.attachedObject.price < 50 ? AudioManager.play('wrongSound') : AudioManager.play('correctSound');
    this.lineMoving = false;
    this.lineShrinking = true;
    AudioManager.play('ropeShrinkingSound');
    
    this.clamp.setFrame(0);
  } 

  onTimerEnd() { // 타이머 끝난 후
    this.gameOver = true;
    this.scene.pause();        
    AudioManager.stopAll();
    if (GameManager.score < GameManager.targetScore) {
      this.scene.launch('GameOverScene');
      AudioManager.play('lose');
      this.miner.play('playerCryAni');
      console.log('1');
      
    }
    else {
      this.scene.launch('LevelDoneScene');
      this.miner.play('playerSmileAni');
      console.log('2');
      
    }
  }
 
  mineralExplosion() { // 공물 폭발
    if (!this.attachedObject || GameManager.bomb === 0) return;
    GameManager.bomb--;
    this.createItemCountText(this.dynamite, GameManager.bomb);
    const explosion = this.add.sprite(this.attachedObject.x, this.attachedObject.y, 'explosion').setScale(1);
    explosion.play('explosion');
    explosion.on('animationcomplete', () => explosion.destroy());
    this.attachedObject.destroy(); // 혹은 점수 추가 등 원하는 처리
    this.attachedObject = null;
    this.baseSpeed = 700;
    this.priceText?.destroy();
    this.previewText?.destroy();
  }

  powerUp() { // 파워 업
    if (GameManager.power === 0) return;
    GameManager.power--;
    this.countText.setText(`${GameManager.power}`)
    this.power = true;
    this.baseSpeed = 700;
    this.powrCount = 3;
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

  returnRope() {
    this.lineMoving = false;
    this.lineShrinking = true;
    this.baseSpeed = 1500;
  }

  createItemCountText(item, count) {
    const offsetX = item.displayWidth / 2 - 30;   // 오른쪽 살짝 안쪽
    const offsetY = -item.displayHeight / 2 + 20; // 위쪽 살짝 안쪽
    this.add.text(
      item.x + offsetX,
      item.y + offsetY,
      `x`,
      {
        fontSize: '18px',
        fontFamily: 'Cafe24Surround',
        color: '#fff',
        fontStyle: 'bold',
      }
    ).setDepth(200);

    this.countText = this.add.text(
      item.x + offsetX + 10,
      item.y + offsetY + 2,
      `${count}`,
      {
        fontSize: '18px',
        fontFamily: 'Cafe24Surround',
        color: '#fff',
        fontStyle: 'bold',
      }
    ).setDepth(200);
  }
}