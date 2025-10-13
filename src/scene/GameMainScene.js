import { gameEvents } from '../manager/EventManager.js';
import GameManager from '../manager/GameManager.js';
import AudioManager from "../manager/AudioManager";
import BgmButton from '../components/BgmButton.js';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  create() {
    this.angle = 0;
    this.swingTime = 0;           // 스윙 계산용 시간
    this.baseSpeed = 700;          // 선 늘어나고 줄어드는 기본 속도
    this.lineLength = 100;        // 현재 선 길이
    this.lineMoving = false;      // 선 늘어나는 상태
    this.lineShrinking = false;   // 선 줄어드는 상태
    this.attachedObject = null;   // 붙은 오브젝트
    this.width = this.cameras.main.width; 
    this.height = this.cameras.main.height;
    this.gameOver = false;

    this.bgmButton = new BgmButton(this, 80, 60); // bgm 버튼

    this.cable = this.add.sprite(this.width / 2, 116, 'cable').setDepth(5).setScale(0.15);
    this.player = this.add.sprite(this.width / 2 + 80, 106, 'player').setDepth(10).setFlipX(true).setDepth(5); // 플레이어 이미지 설정

    this.rope = this.add.image(this.width / 2, 116, 'rope').setOrigin(0.5, 0).setScale(0.5, this.lineLength / 100).setDepth(10); // rope 이미지 설정
    this.mainBackground = this.add.image(0, 0, 'mainBackground').setOrigin(0, 0).setInteractive(); // 배경
    this.bomb = this.add.image(450, 125, 'bomb').setScale(0.1).setAlpha(0.5);
    this.potion = this.add.image(510, 125, 'potion').setScale(0.12).setAlpha(0.5);

    if (GameManager.bomb > 0) this.bomb.setInteractive({ useHandCursor: true }).setAlpha(1); // 
    if (GameManager.power > 0) this.potion.setInteractive({ useHandCursor: true }).setAlpha(1);
    
    this.clamp = this.matter.add.image(this.width / 2, 170, 'clamp').setOrigin(0.5, 0).setScale(0.1).setDepth(20).setBody({ type: 'circle', radius: 10 }); // clamp 이미지 설정

    this.scoreText = this.createText(this.width - 250, 46,  `점수 : ${GameManager.score}`);
    this.targetScoreText = this.createText(this.width - 250, 110,  `${GameManager.level}단계 목표 : ${GameManager.targetScore}`);

    this.anims.create({
      key: 'explosion',
      frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 11 }),
      frameRate: 10,
    });

    this.bgm = this.sound.get('bgmSound');
    this.cursors = this.input.keyboard.createCursorKeys(); // 키 입력

    this.initMap();
    this.initTimer();
    this.addEvent();
  }

  update(time, delta) {
    if (this.gameOver) return;
    if (!this.attachedObject && !this.lineMoving && !this.lineShrinking) this.swingRope(delta);
    if (this.lineMoving) this.expansionRope(delta);
    if (this.lineLength > 100 && this.lineShrinking) this.shrinkingRope(delta);
    
    // bgm 설정
    if (GameManager.bgmOn && this.bgm.isPaused) this.bgm.resume();
    if (GameManager.bgmOn && !this.bgm.isPlaying) this.bgm.play();
    if (!GameManager.bgmOn && this.bgm.isPlaying) this.bgm.pause();
    
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
    this.mainBackground.on('pointerdown', () => {
      if (this.lineMoving || this.lineShrinking) return;
      this.lineMoving = true;
      AudioManager.play('ropeSound');
      this.player.setFrame(1);
    })

    // 아이템 클릭 이벤트
    this.bomb.on('pointerdown', () => this.mineralExplosion());
    this.potion.on('pointerdown', () => this.powerUp());
    this.matter.world.on('collisionstart', (event) => this.handleclampCollision(event.pairs[0].bodyB));
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

  expansionRope(delta) { // 늘어나는 상태
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
    this.power && this.powrCount --
    this.baseSpeed = 700;
    AudioManager.stop('ropeShrinkingSound');

    if (this.power && this.powrCount <= 0) this.power = false;

    if (this.attachedObject) { // 잡은 물체가 있으면
      this.time.delayedCall(1000, () => {
        this.lineShrinking = false;
        this.attachedObject.destroy();
        GameManager.updateScore(this.attachedObject.price)
        this.scoreText.setText(`점수 : ${GameManager.score}`);
        this.createScoreText();
        this.attachedObject = null;
        AudioManager.play('moneySound');
        this.previewText?.destroy();
      });
    } else this.lineShrinking = false;
  }

  handleclampCollision(object) {  // 광물과 충돌 했을때 처리
    this.attachedObject = object.gameObject;
    this.matter.world.remove(object);
    this.baseSpeed = this.power ? this.baseSpeed : Math.floor(this.baseSpeed - (this.attachedObject.weight / 100) * (this.baseSpeed - 1));
    this.attachedObject.price < 50 ? AudioManager.play('wrongSound') : AudioManager.play('correctSound');
    this.lineMoving = false;
    this.lineShrinking = true;
    AudioManager.play('ropeShrinkingSound');
  } 

  onTimerEnd() { // 타이머 끝난 후
    this.gameOver = true;
    this.scene.pause();        
    AudioManager.stopAll();
    if (GameManager.score <= GameManager.targetScore) this.scene.launch('GameOverScene');
    else this.scene.launch('LevelDoneScene');
  }
 
  mineralExplosion() { // 공물 폭발
    if (!this.attachedObject || GameManager.bomb === 0) return;
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
}