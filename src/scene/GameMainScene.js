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

  get isHeavy() { return this.miner.shrinkSpeed < 350; }
  get isLight() { return this.miner.shrinkSpeed >= 350; }

  create() {
    this.width = this.cameras.main.width; 
    this.height = this.cameras.main.height;
    this.attachedObject = null;
    this.gameOver = false;

    // 포션 아이템 상태
    this.powering = false;
    this.potionUseCount = 0;

    this.bgm = this.sound.get('bgmSound');
    this.bgmButton = new BgmButton(this, 80, 60); // bgm 버튼

    // bg 생성
    this.background = this.add.image(0, 0, 'main_bg').setOrigin(0, 0).setInteractive().setDepth(-1); // 배경

    // miner 생성
    this.miner = new Miner(this, this.width / 2, 94);
    
    // 맵 생성
    this.map = new MapManager(this);
    this.map.createMap(GameManager.level);
    this.minerals = this.map.minerals;
    this.moles = this.minerals.filter((mineral) => mineral.type === 'mole');
    this.clamp = this.miner.clamp;
    
    //점수 바 생성
    this.progressBar = new ProgressBar(this, 784, 96, 360, 25); 
    this.progressBar.update(GameManager.score, GameManager.targetScore);
    
    // timer 생성
    this.timer = new TimerManager(this, 80, 120, 60, () => this.onTimerEnd());
    
    // 아이템 생성
    this.dynamite = this.setItems(405, 123, 'dynamite');
    this.potion = this.setItems(498, 123, 'potion');
    

    this.resetAnimation(); // 애니메이션 초기화
    this.addEvent(); // 이벤트 등록
  }

  update(_, delta) {
    if (this.gameOver || this.powering) return;

    const { clamp, isExpand, isShrink, lineLength } = this.miner;
    const isClampOutOfBounds = clamp.x > this.width || clamp.x < 0 || clamp.y > this.height; // 화면 밖으로 나갔는지 판단

    this.miner.update(delta);

    if (isClampOutOfBounds && isExpand) this.miner.shrinkStart();
    if (isShrink && lineLength <= 100) this.miner.shrinkEnd();
    if (this.attachedObject) this.pullAttachedObject();
    
    // bgm 설정
    if (GameManager.bgmOn && this.bgm.isPaused) this.bgm.resume();
    if (GameManager.bgmOn && !this.bgm.isPlaying) this.bgm.play();
    if (!GameManager.bgmOn && this.bgm.isPlaying) this.bgm.pause();
  }

  addEvent = () => {
    this.background.on('pointerdown', () => this.miner.expandStart());
    this.matter.world.on('collisionstart', (event) => this.collision(event));
    
    this.dynamite.sprite.on('pointerdown', () => this.useDynamite());
    this.potion.sprite.on('pointerdown', () => this.usePotion());

    this.removeCustomEvents();

    gameEvents.on('expandStart', () => this.expandStart());
    gameEvents.on('shrinkStart', () => this.shrinkStart());
    gameEvents.on('shrinkEnd', () => this.shrinkEnd());
  }

  removeCustomEvents = () => {
    gameEvents.off('expandStart');
    gameEvents.off('shrinkStart');
    gameEvents.off('shrinkEnd');
  }

  collision = (event) => { // 충돌!
    const {bodyA, bodyB} = event.pairs[0];

    if (bodyA.gameObject.name === bodyB.gameObject.name) return;
    this.matter.world.remove(bodyB);
    this.attachedObject = bodyB.gameObject;
    this.miner.shrinkStart();
  }

  pullAttachedObject = () => { // 충들 물체 당겨오는 함수
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

  shrinkStart = () => { // 줄어들기 시작
    // 충돌 설정 끄기
    this.clamp.body.collisionFilter.mask = 0;

    // 줄어 들때 속도 셋팅
    if (this.potionUseCount === 0) {
      const speed = this.attachedObject ? this.attachedObject.weight : 0;
      this.miner.adjustSpeed(speed);
    }
    

    // 속도에 따라 애니메이션 설정
    this.setAnimation();    
    
    // mole animation 종료
    this.moles.forEach((mole) => mole.tween?.pause());

    // 타입에 따라 설정
    const type = this.attachedObject?.type;
    if (type === 'mole' || type === 'rock') AudioManager.play('wrongSound');
    if (type === 'gold' || type ==='diamond' || type === 'random') AudioManager.play('correctSound');
    if (type === 'bomb') this.explodeMineralArea();
  }

  shrinkEnd = () => { // 다 줄어들있을떄
    // 충돌 설정 켜기
    this.clamp.body.collisionFilter.mask = 0x0001;
    // mole 애니메이션 시작
    this.moles?.forEach((mole) => {
      if (mole.body && mole.tween?.paused) mole.tween.resume();
    });
    if (this.potionUseCount > 0) this.potionUseCount--;
    // 광부 애니메이션 종료
    this.resetAnimation();
    // 점수 업데이트
    if (this.attachedObject) this.updateScore();
  }

  setItems = (x, y, type) => {
    const sprite = this.add.image(x, y, type).setInteractive({ useHandCursor: true });

    const offsetX = type  === 'dynamite' ? sprite.displayWidth / 2 - 35 : sprite.displayWidth / 2 - 31;
    const offsetY = -sprite.displayHeight / 2 + 20;
    const count = type  === 'dynamite' ? GameManager.dynamite : GameManager.potion;
         
    const xText = sprite.x + offsetX;
    const yText = sprite.y + offsetY;

    this.add.text(xText, yText, 'x', {
      fontSize: '18px',
      color: '#fff',
      fontFamily: 'Cafe24Surround',
    });

    const countText = this.add.text(xText + 10, yText , `${count}`, {
      fontSize: '22px',
      color: '#fff',
      fontFamily: 'Cafe24Surround',
    });

    return {sprite, countText};
  }

  explodeMineral = () => {
    this.attachedObject.explode();
    this.attachedObject = null;
    this.miner.adjustSpeed(0);
  }

  explodeMineralArea = () => {
    const explosionRadius = 150; // 폭발 범위 반경 
    const bombX = this.attachedObject.x; 
    const bombY = this.attachedObject.y;

    this.explodeMineral();

    const nearbyMinerals = this.minerals.filter((mineral) => {
      if (!mineral.active || !mineral.body) return false;
      const dx = mineral.x - bombX;
      const dy = mineral.y - bombY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < explosionRadius;
    });

    nearbyMinerals.forEach((mineral, index) => {
      this.time.addEvent({
        delay: index * 50, // 각 폭발 사이 0.2초 간격
        callback: () => {
          if (!mineral.active) return;
          mineral.explode();
        },
        callbackScope: this
      });
    });

    this.miner.playAnimation('cry');
    
  }

  useDynamite = () => {
    if (GameManager.dynamite <= 0) return;

    GameManager.dynamite--;
    this.dynamite.countText.setText(`${GameManager.dynamite}`);
    this.explodeMineral();
  }

  usePotion = () => {
    if (GameManager.potion <= 0) return;
    this.powering = true;
    GameManager.usePotion();
    this.potion.countText.setText(`${GameManager.potion}`);
    this.miner.adjustSpeed(-50);
    this.resetAnimation();
    this.miner.setTexture('miner_powerup');
    AudioManager.play('powerUp');

    this.time.delayedCall(800, () => {
      this.miner.setTexture('miner_power');
      this.powering = false;
      this.potionUseCount = 3;
    });
  }

  onTimerEnd() { // 타이머 끝난 후
    this.gameOver = true;
    this.scene.pause();        
    AudioManager.stopAll();
    console.log(GameManager.level);
    
    
    if (GameManager.level === 10) {
      this.scene.launch('GameFinishScene');
      return;
    }

    if (GameManager.score < GameManager.targetScore) {
      this.scene.launch('GameOverScene');
      AudioManager.play('lose');
    }
    else {
      this.scene.launch('LevelDoneScene');
      AudioManager.play('win');
    }
  }

  updateScore = () => {
    GameManager.updateScore(this.attachedObject.price);
    this.progressBar.update(GameManager.score, GameManager.targetScore);
    this.attachedObject.tween?.stop();
    this.attachedObject.destroy();
    this.attachedObject = null;
    AudioManager.play('moneySound');
  }

  setAnimation = () => {
    if (this.isHeavy) this.miner.playAnimation('hard');
    if (this.isLight) this.miner.playAnimation('mining');
    if (this.potionUseCount > 0) this.miner.playAnimation('power');
  }

  resetAnimation = () => {
    this.miner.stopAmimation();
    if (this.potionUseCount > 0) this.miner.setTexture('miner_power');
    else this.miner.setTexture('miner_idle');
  }
}