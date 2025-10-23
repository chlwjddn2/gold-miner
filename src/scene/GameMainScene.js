import { gameEvents } from '../manager/EventManager.js';
import GameManager from '../manager/GameManager.js';
import AudioManager from "../manager/AudioManager";
import BgmButton from '../components/BgmButton.js';
import ProgressBar from '../components/ProgressBar.js';
import MapManager from '../manager/MapManager.js';
import TimerManager from '../manager/TimerManaer.js';

import Miner from '../entities/Miner.js';


export default class MainScene extends Phaser.Scene {
  constructor() {
    super('GameMainScene');
  }

  create() {
    // this.angle = 0;
    // this.swingTime = 0;           // 스윙 계산용 시간
    // this.baseSpeed = 700;         // 선 늘어나고 줄어드는 기본 속도
    // this.lineLength = 100;        // 현재 선 길이
    // this.lineMoving = false;      // 선 늘어나는 상태
    // this.lineShrinking = false;   // 선 줄어드는 상태
    // this.attachedObject = null;   // 붙은 오브젝트
    this.width = this.cameras.main.width; 
    this.height = this.cameras.main.height;
    this.attachedObject = null;
    this.gameOver = false;

    this.bgm = this.sound.get('bgmSound');
    this.bgmButton = new BgmButton(this, 80, 60); // bgm 버튼

    // bg 생성
    this.background = this.add.image(0, 0, 'mainBackground').setOrigin(0, 0).setInteractive().setDepth(-1); // 배경

    // miner 생성
    this.miner = new Miner(this, this.width / 2, 94);

    // 맵 생성
    this.map = new MapManager(this);
    this.map.createMap(GameManager.level);
    this.minerals = this.map.minerals;

    //점수 바 생성
    this.progressBar = new ProgressBar(this, 784, 96, 360, 25); 
    this.progressBar.update(GameManager.score, GameManager.targetScore);

    // timer 생성
    this.timer = new TimerManager(this, 80, 120, 60, () => this.onTimerEnd());

    // 아이템 생성
    this.dynamite = this.setItems(405, 123, 'dynamite');
    this.potion = this.setItems(498, 123, 'potion');

    this.addEvent(); // 이벤트 등록
  }

  update(time, delta) {
    if (this.gameOver) return;

    const { clamp, isExpand, isShrink, miner, lineLength } = this.miner;
    const isClampOutOfBounds = clamp.x > this.width || clamp.x < 0 || clamp.y > this.height;

    this.miner.update(delta);

    if ((isClampOutOfBounds || this.attachedObject) && isExpand) this.miner.shrinkStart();
    if (isShrink && lineLength <= 100) this.miner.shrinkEnd();
    if (this.attachedObject) this.pullAttachedObject();
    
    // bgm 설정
    if (GameManager.bgmOn && this.bgm.isPaused) this.bgm.resume();
    if (GameManager.bgmOn && !this.bgm.isPlaying) this.bgm.play();
    if (!GameManager.bgmOn && this.bgm.isPlaying) this.bgm.pause();
  }

  addEvent = () => {
    this.background.on('pointerdown', () => this.miner.expandStart())
    this.matter.world.on('collisionstart', (event) => this.collision(event));
    
    this.dynamite.sprite.on('pointerdown', () => this.useDynamite());
    this.potion.sprite.on('pointerdown', () => this.usePotion());

    gameEvents.on('expandStart', () => this.expandStart());
    gameEvents.on('shrinkStart', () => this.shrinkStart());
    gameEvents.on('shrinkEnd', () => this.shrinkEnd());
  }

  collision = (event) => { // 충돌!
    const {bodyA, bodyB} = event.pairs[0];
    this.matter.world.remove(bodyB);
    this.attachedObject = bodyB.gameObject;
  }

  pullAttachedObject = () => {
    const {rope, angle} = this.miner;
    const clampOffset = 25;
    const clampX = rope.x + - Math.sin(angle) * (rope.displayHeight + clampOffset);
    const clampY = rope.y + Math.cos(angle) * (rope.displayHeight + clampOffset);

    this.attachedObject.setDepth(20);
    this.attachedObject.setRotation(angle);
    this.attachedObject.setPosition(clampX, clampY);
  }

  expandStart = () => {
    console.log('늘어나기 시작!!');
  }

  shrinkStart = () => {
    if (GameManager.potionUseCount > 0) {
      GameManager.consumePower();
      this.miner.adjustSpeed(-50);
    } else {
      const speed = this.attachedObject ? this.attachedObject.weight : 0;
      this.miner.adjustSpeed(speed);
    }

    if (!this.attachedObject) return;

    const type = this.attachedObject.type;
    type === 'rock' ? AudioManager.play('wrongSound') : AudioManager.play('correctSound');
  }

  shrinkEnd = () => {
    if (!this.attachedObject) return;

    GameManager.updateScore(this.attachedObject.price)
    this.progressBar.update(GameManager.score, GameManager.targetScore);
    this.attachedObject.destroy();
    this.attachedObject = null;
    AudioManager.play('moneySound');
  }

  setItems = (x, y, type) => {
    const sprite = this.add.image(x, y, type).setInteractive({ useHandCursor: true });

    const offsetX = sprite.displayWidth / 2 - 30;
    const offsetY = -sprite.displayHeight / 2 + 20;
    const count = type  === 'dynamite' ? GameManager.dynamite : GameManager.potion;

    const xText = sprite.x + offsetX;
    const yText = sprite.y + offsetY;

    this.add.text(xText, yText, 'x', {
      fontSize: '18px',
      color: '#fff',
      fontFamily: 'Cafe24Surround',
    });

    const countText = this.add.text(xText + 10, yText + 2, `${count}`, {
      fontSize: '18px',
      color: '#fff',
      fontFamily: 'Cafe24Surround',
    });

    return {sprite, countText};
  }

  explodeMineral = () => {
    if (GameManager.dynamite <= 0) return;

    GameManager.dynamite--;
    this.dynamite.countText.setText(`${GameManager.dynamite}`);
    this.attachedObject.explode();
    this.attachedObject.destroy();
    this.attachedObject = null;
    this.miner.adjustSpeed(0);
  }

  useDynamite = () => {
    if (GameManager.dynamite <= 0) return;

    GameManager.dynamite--;
    this.dynamite.countText.setText(`${GameManager.dynamite}`);
    this.attachedObject.explode();
    this.attachedObject.destroy();
    this.attachedObject = null;
    this.miner.adjustSpeed(0);
  }

  usePotion = () => {
    if (GameManager.potion <= 0) return;

    GameManager.usePotion();
    GameManager.consumePower();
    this.potion.countText.setText(`${GameManager.potion}`);
    this.miner.adjustSpeed(-50);
  }

  onTimerEnd() { // 타이머 끝난 후
    this.gameOver = true;
    this.scene.pause();        
    AudioManager.stopAll();
    if (GameManager.score < GameManager.targetScore) {
      this.scene.launch('GameOverScene');
      AudioManager.play('lose');
    }
    else {
      this.scene.launch('LevelDoneScene');
    }
  }
  //     if (this.lineMoving || this.lineShrinking) return;
  //     this.lineMoving = true;
  //     AudioManager.play('ropeSound');
  //   })

  //   // 아이템 클릭 이벤트
  //   this.dynamite.on('pointerdown', () => this.mineralExplosion());
  //   this.potion.on('pointerdown', () => this.powerUp());
  //   this.matter.world.on('collisionstart', (event) => this.handleclampCollision(event.pairs[0].bodyA, event.pairs[0].bodyB));
  // }

  // updateClamp() { // 집게 로직
  //   const clampX = this.rope.x - Math.sin(this.angle) * (this.rope.displayHeight);
  //   const clampY = this.rope.y + Math.cos(this.angle) * (this.rope.displayHeight);
  //   this.clamp.setPosition(clampX, clampY);
  //   this.clamp.setRotation(this.angle);
  // };

  // swingRope(delta) { // 로프 스윙
  //   this.swingTime += delta * 0.002;
  //   this.angle = Math.sin(this.swingTime) * (Math.PI / 2.5);
  //   this.rope.setRotation(this.angle);
  // };

  // expansionRope(delta) { // 늘어나는 상태
  //   this.miner.setFrame(2);
  //   const speedPerSecond = this.baseSpeed; // 예: 100px per second
  //   this.lineLength += (speedPerSecond * delta) / 1000; // ms → s
  //   this.rope.setScale(0.5, this.lineLength / 100);
    
  //   if ((this.clamp.x > this.width) || (this.clamp.x < 0)  || (this.clamp.y > this.height)) {
  //     this.lineMoving = false;
  //     this.lineShrinking = true;
  //   }
  // };

  // shrinkingRope(delta) { // 줄어드는 상태
  //   const speedPerSecond = this.baseSpeed;
  //   this.lineLength -= (speedPerSecond * delta) / 1000;
  //   this.rope.setScale(0.5, this.lineLength / 100);

  //   const clampX = this.rope.x + - Math.sin(this.angle) * (this.rope.displayHeight + 25);
  //   const clampY = this.rope.y + Math.cos(this.angle) * (this.rope.displayHeight + 25);
    
  //   this.attachedObject?.setPosition(clampX, clampY);
    
  //   if (!this.miner.anims.isPlaying) {
  //     this.baseSpeed < 350 ? this.miner.play('playerHardAni') : this.miner.play('playerAni');
  //   }
    
  //   if (this.lineLength <= 100) this.shrinkingEndPos();
  // }

  // shrinkingEndPos() { // 다 줄어들었을 떄 
  //   this.lineShrinking = false;
  //   this.lineLength = 100;
  //   this.miner.stop();
  //   this.power && this.powrCount --
  //   this.baseSpeed = 700;
  //   this.miner.play('playerIdle');
  //   this.clamp.setFrame(1);
  //   AudioManager.stop('ropeShrinkingSound');
    

  //   if (this.power && this.powrCount <= 0) this.power = false;
  //   if (this.attachedObject) { // 잡은 물체가 있으면
  //     this.time.delayedCall(200, () => {
  //       this.lineShrinking = false;
  //       this.attachedObject.destroy();
  //       this.attachedObject.tween?.remove();
  //       GameManager.updateScore(this.attachedObject.price)
  //       this.createScoreText();
  //       this.attachedObject = null;
  //       AudioManager.play('moneySound');
  //       this.previewText?.destroy();
  //       this.progressBar.update(GameManager.score, GameManager.targetScore);
  //       this.clamp.body.collisionFilter.mask = 0xFFFFFFFF;

  //       this.minerals.forEach((mineral) =>  mineral.tween?.paused && mineral.tween?.resume());
  //     });
  //   }
  // }

  // handleclampCollision(bodyA, bodyB) {  // 광물과 충돌 했을때 처리
  //   if (bodyA.gameObject.type === bodyB.gameObject.type) return;
    
  //   this.attachedObject = bodyB.gameObject;
  //   this.attachedObject.setRotation(this.angle);
  //   this.attachedObject.setDepth(10);

  //   this.matter.world.remove(bodyB);
  //   this.clamp.body.collisionFilter.mask = 0;
    
  //   this.baseSpeed = this.power ? this.baseSpeed : Math.floor(this.baseSpeed - (this.attachedObject.weight / 100) * (this.baseSpeed - 1));

    
  //   this.minerals.forEach((mineral) => mineral.tween?.pause());

  //   this.attachedObject.price < 50 ? AudioManager.play('wrongSound') : AudioManager.play('correctSound');
  //   this.lineMoving = false;
  //   this.lineShrinking = true;
  //   AudioManager.play('ropeShrinkingSound');
    
  //   this.clamp.setFrame(0);
  // } 

  // onTimerEnd() { // 타이머 끝난 후
  //   this.gameOver = true;
  //   this.scene.pause();        
  //   AudioManager.stopAll();
  //   if (GameManager.score < GameManager.targetScore) {
  //     this.scene.launch('GameOverScene');
  //     AudioManager.play('lose');
  //     this.miner.play('playerCryAni');
  //     console.log('1');
      
  //   }
  //   else {
  //     this.scene.launch('LevelDoneScene');
  //     this.miner.play('playerSmileAni');
  //     console.log('2');
      
  //   }
  // }
 
  // mineralExplosion() { // 공물 폭발
  //   if (!this.attachedObject || GameManager.bomb === 0) return;
  //   GameManager.bomb--;
  //   this.dynamiteCountText.setText(`${GameManager.bomb}`);
  //   const explosion = this.add.sprite(this.attachedObject.x, this.attachedObject.y, 'explosion').setScale(1);
  //   explosion.play('explosion');
  //   explosion.on('animationcomplete', () => explosion.destroy());
  //   this.attachedObject.destroy(); // 혹은 점수 추가 등 원하는 처리
  //   this.attachedObject = null;
  //   this.baseSpeed = 700;
  //   this.priceText?.destroy();
  //   this.previewText?.destroy();
  // }

  // powerUp() { // 파워 업
  //   if (GameManager.power === 0) return;
  //   GameManager.power--;
  //   this.potionCountText.setText(`${GameManager.power}`)
  //   this.power = true;
  //   this.baseSpeed = 700;
  //   this.powrCount = 3;
  // }

  // createText(x, y, text) {
  //   return this.add.text(x, y, text, {
  //     fontSize: '32px',
  //     fill: '#fff',
  //     fontFamily: 'SchoolSafetyRoundedSmile',
  //     fontStyle: 'bold'
  //   }).setDepth(100);
  // }

  // createScoreText() {
  //   const sign = this.attachedObject.price < 0 ? '-' : '+';
  //   this.hideText = this.createText(770, 110,  `${sign}${this.attachedObject.price}`);
  //   this.tweens.add({
  //     targets: this.hideText,         
  //     y: this.hideText.y - 70,       
  //     alpha: 0,                    
  //     duration: 1000,              
  //     ease: 'Power1',              
  //     onComplete: () => {
  //       this.hideText.destroy();
  //     }
  //   });
  // }

  // returnRope() {
  //   this.lineMoving = false;
  //   this.lineShrinking = true;
  //   this.baseSpeed = 1500;
  // }

  // createItemCountText(item, count) {
  //   const offsetX = item.displayWidth / 2 - 30;   // 오른쪽 살짝 안쪽
  //   const offsetY = -item.displayHeight / 2 + 20; // 위쪽 살짝 안쪽
  //   this.add.text(
  //     item.x + offsetX,
  //     item.y + offsetY,
  //     `x`,
  //     {
  //       fontSize: '18px',
  //       fontFamily: 'Cafe24Surround',
  //       color: '#fff',
  //       fontStyle: 'bold',
  //     }
  //   ).setDepth(200);

  //   const countText = this.add.text(
  //     item.x + offsetX + 10,
  //     item.y + offsetY + 2,
  //     `${count}`,
  //     {
  //       fontSize: '18px',
  //       fontFamily: 'Cafe24Surround',
  //       color: '#fff',
  //       fontStyle: 'bold',
  //     }
  //   ).setDepth(200);

  //   return countText;
  // }
}