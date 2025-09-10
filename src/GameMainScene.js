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
    
    this.load.tilemapTiledJSON("map", `./map/map${this.level}.json`);

    this.load.audio('ropeSound', './audio/rope.mp3');
    this.load.audio('wrongSound', './audio/wrong.mp3');
    this.load.audio('correctSound', './audio/correct.mp3');
    this.load.audio('ropeShrinkingSound', './audio/rope_shirking.mp3');
  }

  create() {
    const { width, height } = this.cameras.main;
    this.initStatus();

    this.background = this.add.tileSprite(0, 0, width, height, 'background').setOrigin(0, 0); // 배경
    this.rope = this.add.image(width / 2, 116, 'rope').setOrigin(0.5, 0).setScale(0.5, this.lineLength / 100).setDepth(10); // rope 이미지 설정
    this.clamp = this.matter.add.image(width / 2, 170, 'clamp').setOrigin(0.5, 0).setScale(0.1).setDepth(20).setBody({ type: 'circle', radius: 10 }); // clamp 이미지 설정

    this.cable = this.add.sprite(width / 2, 116, 'cable').setDepth(5).setScale(0.15);
    this.player = this.add.sprite(width / 2 + 80, 106, 'player').setDepth(10).setFlipX(true).setDepth(5); // 플레이어 이미지 설정

    this.cursors = this.input.keyboard.createCursorKeys(); // 키 입력
    
    this.bomb = this.add.image(450, 125, 'bomb').setScale(0.1).setInteractive({ useHandCursor: true });
    this.potion = this.add.image(510, 125, 'potion').setScale(0.12).setInteractive({ useHandCursor: true });
    this.bgmButton = this.add.sprite(80, 65, 'bgmButton').setOrigin(0.5).setScale(0.1).setInteractive({ useHandCursor: true }).setFrame(1);

    this.scoreText = this.createText( width - 250, 46,  `점수 : ${this.score}`)
    this.targetScoreText = this.createText(width - 250, 110,  `${this.level}단계 목표 : ${this.targetScore}`);
    this.timerText = this.createText(50, 110,  `시간 : ${this.timeLeft}`);

    this.ropeSound = this.sound.add('ropeSound', { volume: 0.5 });
    this.wrongSound = this.sound.add('wrongSound', { volume: 0.5 });
    this.correctSound = this.sound.add('correctSound');
    this.ropeShrinkingSound = this.sound.add('ropeShrinkingSound', { loop: true });
    this.bgm = this.sound.add('bgm', { loop: true, volume: 0.3 });

    this.anims.create({
      key: 'explosion',
      frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 11 }),
      frameRate: 10,
    });
    
    this.bgm.play();

    this.createMap(); // 맵 생성
    this.startTimer(); 
    
    this.event();
  }

  update(time, delta) {
    if (!this.lineMoving && !this.lineShrinking) this.swingRope(delta);
    if (this.lineMoving) this.expansionRope();
    if (this.lineShrinking) this.shrinkingRope();

    // rope의 길이 및 각도 계산하여 업데이트
    this.updateRope(this.angle);
  }

  initStatus() {
    this.lineMoving = false;      // 선 늘어나는 상태
    this.lineShrinking = false;   // 선 줄어드는 상태
    this.swingTime = 0;           // 스윙 계산용 시간
    this.lineLength = 100;        // 현재 선 길이
    this.baseSpeed = 10;          // 선 늘어나고 줄어드는 기본 속도
    this.currentAngle = 0;        // 스윙 멈출 때 각도 저장
    this.angle = 0;
    this.attachedObject = null;
    this.timeLeft = 60;
  }

  event() {
    this.cursors.down.on('down', (event) => {
      if (this.lineMoving || this.lineShrinking) return;
      this.lineMoving = true;
      this.currentAngle = Math.sin(this.swingTime) * (Math.PI / 2.5); // 현재 스윙 각도 저장
      if (!this.ropeSound.isPlaying) this.ropeSound.play();
      this.player.setFrame(1);
    });

    this.input.on('pointerdown', (event) => {
      if (this.ignoreNextPointerDown) return this.ignoreNextPointerDown = false;
      if (this.lineMoving || this.lineShrinking) return;
      this.lineMoving = true;
      this.currentAngle = Math.sin(this.swingTime) * (Math.PI / 2.5); // 현재 스윙 각도 저장
      if (!this.sound.get('ropeSound')?.isPlaying) this.ropeSound.play();
      this.player.setFrame(1);
    })
    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach((pair) => this.handleclampCollision(pair.bodyA, pair.bodyB));
    });

    this.bomb.on('pointerdown', (event) => this.addItemCustomEvent());
    this.potion.on('pointerdown', (event) => this.addItemCustomEvent());

    this.bgmButton.on('pointerdown', () => {
      this.ignoreNextPointerDown = true;
      if (this.bgm.isPlaying) {
        this.bgm.stop();
        this.bgmButton.setFrame(0);
      } else {
        this.bgm.play();
        this.bgmButton.setFrame(1);
      }
    })

    this.cursors.up.on('down', (event) => {
      if (!this.attachedObject) return;
      this.mineralExplosion();
    });
  }

  updateRope(angle) {
    this.rope.setRotation(angle);

    const clampX = this.cable.x - Math.sin(angle) * (this.rope.displayHeight);
    const clampY = this.cable.y + Math.cos(angle) * (this.rope.displayHeight);
    
    this.clamp.setPosition(clampX, clampY);
    this.clamp.setRotation(angle);
    if (this.lineMoving || this.lineShrinking) this.rope.setScale(0.5, this.lineLength / 100);

    
    if (this.attachedObject) {
      this.attachedObject.setPosition(clampX, clampY);
      this.attachedObject.setRotation(angle);
      this.attachedObject.setDepth(10);
      this.lineMoving = false;
      this.lineShrinking = true;
    }
  }

  shrinkingRope() {
    this.lineLength -= this.baseSpeed;

    !this.ropeShrinkingSound.isPlaying && this.ropeShrinkingSound.play();

    if (this.lineLength <= 100) { // 원래 길이 도달
      this.lineLength = 100;
      this.lineShrinking = false;
      this.lineMoving = false;
      this.player.setFrame(0);
      this.ropeShrinkingSound.stop();
      
      // 🔥 붙어있던 오브젝트 처리
      if (this.attachedObject) {
        this.attachedObject.destroy(); // 혹은 점수 추가 등 원하는 처리
        this.updateScore(this.attachedObject.price);
        this.attachedObject = null;
        this.baseSpeed = 10;
      }
    }
  }

  expansionRope() {
    this.angle = this.currentAngle;
    this.lineLength += this.baseSpeed;
    const { width, height } = this.cameras.main;

    // 화면 밖 체크 또는 최대 길이 도달 시 줄어들게 전환
    if (this.clamp.x > width || this.clamp.x < 0 || this.clamp.y > height) {
      this.lineMoving = false;
      this.lineShrinking = true;
    }
  }

  swingRope(delta) {
    this.swingTime += delta * 0.002;
    this.angle = Math.sin(this.swingTime) * (Math.PI / 2.5);
    this.currentAngle = this.angle;
  }

  handleclampCollision(clamp, object) {
    this.attachedObject = object.gameObject;
    this.matter.world.remove(object);
    this.baseSpeed = Math.floor(10 - (this.attachedObject.weight / 100) * (10 - 1));
    
    this.attachedObject.price < 50 ? this.wrongSound.play() : this.correctSound.play();
  }

  startTimer(duration = 60) {
    // 1초마다 timeLeft 감소 
    this.timerEvent = this.time.addEvent({
      delay: 1000, // 1초
      callback: () => {
        this.timeLeft--;
        this.timerText.setText(`시간 : ${this.timeLeft}`);
        if (this.timeLeft <= 0) this.onTimerEnd();
      },
      callbackScope: this,
      loop: true,
    });
  }

  onTimerEnd() {
    if (this.score <= this.targetScore) this.scene.launch('GameOverScene');
    else this.scene.launch('LevelDoneScene', {level: this.level, score: this.score, targetScore: this.targetScore });
    this.scene.pause();        
    this.bgm.stop();
  }

  updateScore(amount) {
    this.score += amount;
    this.scoreText.setText(`score : ${this.score}`);
  }

  createMap() {
    const randomNunber = Phaser.Math.Between(1, 2);
    const map = this.make.tilemap({ key: "map" });
    const objectLayer = map.getObjectLayer(`Object Layer 2`);
    const tileSets = map.getTileset("mineral");
    
    objectLayer.objects.forEach((obj) => {
      const x = Math.floor(obj.x);
      const y = Math.floor(obj.y) - 80;
      const gid = obj.gid - 2;
      
      const sprite = this.matter.add.sprite(x, y, "minerals", gid);
      const objectData = tileSets.tileData[gid]?.objectgroup?.objects[0];
      const verts = objectData?.polygon?.map(poly => ({ x: poly.x , y: poly.y  }));

      const price = Number(obj.properties?.find((property) => property.name === 'price').value);
      const weight = Number(obj.properties?.find((property) => property.name === 'weight').value);
      
      if (verts) sprite.setBody({ type: 'fromVertices', verts });
      
      sprite.setDisplaySize(obj.width, obj.height);
      sprite.price = price || Phaser.Math.Between(10, 500);
      sprite.weight = weight || Phaser.Math.Between(10, 90);
    });
  }

  createText(x, y, text) {
    return this.add.text(x, y, text, {
      fontSize: '32px',
      fill: '#000000',
      fontFamily: 'SchoolSafetyRoundedSmile',
      fontStyle: 'bold'
    }).setDepth(100);
  }

  addItemCustomEvent() {
    this.ignoreNextPointerDown = true;
    const event = new Event('QUIZ_SHOW');
    document.dispatchEvent(event);     
    this.bgm.stop(); 
  }

  mineralExplosion() {
    const explosion = this.add.sprite(this.attachedObject.x, this.attachedObject.y, 'explosion').setScale(1);
    explosion.play('explosion');
    explosion.on('animationcomplete', () => explosion.destroy());
    this.attachedObject.destroy(); // 혹은 점수 추가 등 원하는 처리
    this.attachedObject = null;
    this.baseSpeed = 10;
  }

  powerUp() {
    this.baseSpeed = 10;
  }
}