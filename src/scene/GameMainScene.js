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
  
    if (bodyA.gameObject.name === bodyB.gameObject.name) return;
    
    this.matter.world.remove(bodyB);
    this.attachedObject = bodyB.gameObject;
    this.minerals.forEach((mineral) => mineral.tween?.pause());
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
    this.attachedObject.tween?.stop();
    this.attachedObject.destroy();
    this.attachedObject = null;
    AudioManager.play('moneySound');
    this.minerals.forEach((mineral) => mineral.tween?.paused && mineral.tween?.resume());
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
}