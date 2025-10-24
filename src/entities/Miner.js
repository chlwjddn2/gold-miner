import AudioManager from "../manager/AudioManager";
import GameManager from "../manager/GameManager.js";
import { gameEvents } from "../manager/EventManager.js";

export default class Miner {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
  
    this.angle = 0;
    this.swingTime = 0;
    this.baseSpeed = 1000;
    this.shrinkSpeed = 0;
    this.lineLength = 100;

    this.isExpand = false;
    this.isShrink = false;

    this.width = scene.cameras.main.width;
    this.height = scene.cameras.main.height;

    this.create();
  }

  create = () => {
    // 광부 생성
    this.miner = this.scene.add.sprite(this.width / 2, 94, 'miner')
      .setFrame(1)
      .setScale(0.17);

    // rope 이미지 설정
    this.rope = this.scene.add.image(614, 140, 'rope')
      .setOrigin(0.5, 0)
      .setScale(1, this.lineLength / 100)
      .setDepth(10);

    // 집게 생성
    this.clamp = this.scene.matter.add.sprite(614, this.rope.y + 60, 'clamp')
      .setDepth(20)
      .setCircle(10)
      .setFrame(1);

    // 애니메이션 등록
    this.createAnimation();
  }

  update = (delta) => {
    if (!this.isExpand && !this.isShrink) this.swingRope(delta);
    if (this.isExpand) this.expandingRope(delta);
    if (this.isShrink) this.shrinkingRope(delta);
    
    this.updateClamp();
  }

  createAnimation = () => { // 애니메이션 등록 함수
    const anims = this.scene.anims;

    if (!anims.get('idle')) {
      anims.create({
        key: 'idle',
        frames: anims.generateFrameNumbers('miner', { start: 0, end: 0 }),
        frameRate: 1,
        repeat: 0
      });
    }
    
    if (!anims.get('mining')) {
      anims.create({
        key: 'mining',
        frames: anims.generateFrameNumbers('miner', { start: 0, end: 2 }),
        frameRate: 5,
        repeat: -1
      });
    }

    if (!anims.get('mining_hard')) {
      anims.create({
        key: 'mining_hard',
        frames: anims.generateFrameNumbers('hard_miner', { start: 0, end: 2 }),
        frameRate: 5,
        repeat: -1
      });
    }

    if (!anims.get('cry')) {
      anims.create({
        key: 'cry',
        frames: anims.generateFrameNumbers('cry_miner', { start: 0, end: 2 }),
        frameRate: 5,
        repeat: -1
      });
    }
    
    if (!anims.get('smile')) {
      anims.create({
        key: 'smile',
        frames: anims.generateFrameNumbers('smile_miner', { start: 0, end: 0 }),
        frameRate: 5,
        repeat: -1
      });
    }

    if (!anims.get('power')) {
      anims.create({
        key: 'power',
        frames: anims.generateFrameNumbers('power_miner', { start: 1, end: 1 }),
        frameRate: 5,
        repeat: 0
      });
    }

    if (!anims.get('strong')) {
      anims.create({
        key: 'strong',
        frames: anims.generateFrameNumbers('strong_miner', { start: 0, end: 2 }),
        frameRate: 5,
        repeat: -1
      });
    }
  }

  expandStart = () => { // 줄 늘어나기 시작
    if (this.isExpand || this.isShrink) return;
    this.isExpand = true;
    AudioManager.play('ropeSound');
    this.miner.setFrame(2);
    gameEvents.emit('expandStart');
  }

  shrinkStart = () => {
    this.isExpand = false;
    this.isShrink = true;
    
    gameEvents.emit('shrinkStart');
  }

  shrinkEnd = () => { // rope 줄어들기
    this.isShrink = false;
    this.lineLength = 100;
    
    gameEvents.emit('shrinkEnd');
  }

  swingRope = (delta) => { // rope delta 값에 따라 스윙 
    this.swingTime += delta * 0.002;
    this.angle = Math.sin(this.swingTime) * (Math.PI / 2.5); // 각도 제한
    this.rope.setRotation(this.angle);
  }

  updateClamp = () => { // rope 각도 따라 집게 움직임 (줄 길이에 따라 위치 보정)
    const clampX = this.rope.x - Math.sin(this.angle) * this.rope.displayHeight;
    const clampY = this.rope.y + Math.cos(this.angle) * this.rope.displayHeight;
    this.clamp.setPosition(clampX, clampY);
    this.clamp.setRotation(this.angle);
  }

  expandingRope = (delta) => { // rope 늘어나는 함수
    this.lineLength += (this.baseSpeed * delta) / 1000; // delta 값에 따라 scale 계산
    this.rope.setScale(0.5, this.lineLength / 100); // 스케일 업데이트
  }

  shrinkingRope = (delta) => { // rope 줄어들기
    this.lineLength -= (this.shrinkSpeed * delta) / 1000;
    this.rope.setScale(0.5, this.lineLength / 100);

    const clampX = this.rope.x - Math.sin(this.angle) * (this.rope.displayHeight + 25);
    const clampY = this.rope.y + Math.cos(this.angle) * (this.rope.displayHeight + 25);

    this.attachedObject?.setPosition(clampX, clampY);
  }

  adjustSpeed = (weight) => {
    this.shrinkSpeed = Math.floor(this.baseSpeed - (weight / 100) * (this.baseSpeed - 1));
  }

  playAnimation = (name) => {
    this.miner.stop();
    this.miner.play(name);
  }

  stopAmimation = () => {
    this.miner.stop(); // 애니메이션 종료
    const texture = GameManager.potionUseCount > 0 ? 'strong_miner' : 'miner';
    this.setTexture(texture);
  }

  setTexture = (texture) => {
    this.miner.setTexture(texture);
  }
}
