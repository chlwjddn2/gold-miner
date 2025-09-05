export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  init(data) {
    this.level = data?.level ?? 1;
    this.score = data?.score ?? 0;
    this.targetScore = data?.targetScore ?? 650;
    this.timeLeft = 60;
  }

  preload() {
    this.load.image('background', './background3.png');
    this.load.image('rope', './rope.png');
    this.load.image('saw', './saw.png');
    this.load.spritesheet('player', './player.png', { frameWidth: 116, frameHeight: 116 });
    this.load.spritesheet('lever', './lever.png', { frameWidth: 84, frameHeight: 84 });
    this.load.spritesheet('minerals', './mineral.png', { frameWidth: 374, frameHeight: 355 });

    this.load.image('diamond', './diamond.png');

    this.scoreText = this.add.text(1000, 36, `score : ${this.score}`, {
      fontSize: '32px',
      fill: '#000000',
      fontFamily: 'Daeojamjil',
      fontStyle: 'bold'
    }).setDepth(100);

    this.targetScoreText = this.add.text(1000, 76, `target : ${this.targetScore}`, {
      fontSize: '32px',
      fill: '#000000',
      fontFamily: 'Daeojamjil',
      fontStyle: 'bold'
    }).setDepth(100);

    this.timerText = this.add.text(1000, 116, `time : ${this.timeLeft}`, {
      fontSize: '32px',
      fill: '#000000',
      fontFamily: 'Daeojamjil',
      fontStyle: 'bold'
    }).setDepth(100);

    this.levelText = this.add.text(1000, 156, `level : ${this.level}`, {   // 추가
      fontSize: '32px',
      fill: '#000000',
      fontFamily: 'Daeojamjil',
      fontStyle: 'bold'
    }).setDepth(100);

    this.startTimer(60); 
    this.load.tilemapTiledJSON("map", `./map${this.level}.json`);

  }

  create() {
    const { width, height } = this.cameras.main;
    this.#initStatus();

    this.background = this.add.tileSprite(0, 0, width, height, 'background').setOrigin(0, 0); // 배경
    this.lever = this.add.sprite(width / 2, 176, 'lever').setDepth(5);
    this.rope = this.add.image(width / 2, 176, 'rope').setOrigin(0.5, 0).setScale(0.5, this.lineLength / 100).setDepth(10); // rope 이미지 설정
    this.saw = this.matter.add.image(width / 2, 230, 'saw').setOrigin(0.5, 0).setScale(0.5).setDepth(20); // saw 이미지 설정
    this.saw.setBody({ type: 'circle', radius: 10 });
    this.cursors = this.input.keyboard.createCursorKeys(); // 키 입력
    this.player = this.add.sprite(width / 2 + 80, 160, 'player').setDepth(10).setFlipX(true).setDepth(5); // 플레이어 이미지 설정

    this.createMap(); // 맵 생성

    this.cursors.down.on('down', () => {
      if (this.lineMoving || this.lineShrinking) return;
      this.lineMoving = true;
      this.currentAngle = Math.sin(this.swingTime) * (Math.PI / 2.5); // 현재 스윙 각도 저장
      this.player.setFrame(1);
    });

    this.input.on('pointerdown', () => {
      if (this.lineMoving || this.lineShrinking) return;
      this.lineMoving = true;
      this.currentAngle = Math.sin(this.swingTime) * (Math.PI / 2.5); // 현재 스윙 각도 저장
      this.player.setFrame(1);
    })
    this.matter.world.on('collisionstart', (event) => {
      event.pairs.forEach((pair) => this.handleSawCollision(pair.bodyA, pair.bodyB));
    });
  }

  update(time, delta) {
    if (!this.lineMoving && !this.lineShrinking) this.swingRope(delta);
    if (this.lineMoving) this.expansionRope();
    if (this.lineShrinking) this.shrinkingRope();

    // rope의 길이 및 각도 계산하여 업데이트
    this.updateRope(this.angle);
  }

  #initStatus() {
    this.lineMoving = false;      // 선 늘어나는 상태
    this.lineShrinking = false;   // 선 줄어드는 상태
    this.swingTime = 0;           // 스윙 계산용 시간
    this.lineLength = 100;        // 현재 선 길이
    this.baseSpeed = 10;          // 선 늘어나고 줄어드는 기본 속도
    this.currentAngle = 0;        // 스윙 멈출 때 각도 저장
    this.angle = 0;
    this.attachedObject = null;
  }

  updateRope(angle) {
    this.rope.setRotation(angle);

    const sawX = this.lever.x - Math.sin(angle) * (this.rope.displayHeight - 10);
    const sawY = this.lever.y + Math.cos(angle) * (this.rope.displayHeight - 10);
    
    this.saw.setPosition(sawX, sawY);
    this.saw.setRotation(angle);
    if (this.lineMoving || this.lineShrinking) this.rope.setScale(0.5, this.lineLength / 100);

    
    if (this.attachedObject) {
      this.attachedObject.setPosition(sawX, sawY);
      this.attachedObject.setRotation(angle);
      this.attachedObject.setDepth(10);
      this.lineMoving = false;
      this.lineShrinking = true;
      
    }
  }

  shrinkingRope() {
    this.lineLength -= this.baseSpeed;

    if (this.lineLength <= 100) { // 원래 길이 도달
      this.lineLength = 100;
      this.lineShrinking = false;
      this.lineMoving = false;
      this.player.setFrame(0);
      
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
    if (this.saw.x > width || this.saw.x < 0 || this.saw.y > height) {
      this.lineMoving = false;
      this.lineShrinking = true;
    }
  }

  swingRope(delta) {
    this.swingTime += delta * 0.002;
    this.angle = Math.sin(this.swingTime) * (Math.PI / 2.5);
    this.currentAngle = this.angle;
  }

  handleSawCollision(saw, object) {
    this.attachedObject = object.gameObject;
    this.matter.world.remove(object);
    this.baseSpeed = Math.floor(10 - (this.attachedObject.weight / 100) * (10 - 1));
  }

  startTimer(duration = 60) {
    this.timeLeft = duration;
    this.timerText.setText(`time : ${this.timeLeft}`);

    // 1초마다 timeLeft 감소 
    this.timerEvent = this.time.addEvent({
      delay: 1000, // 1초
      callback: () => {
        this.timeLeft--;
        this.timerText.setText(`time : ${this.timeLeft}`);
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
  }

  updateScore(amount) {
    this.score += amount;
    this.scoreText.setText(`score : ${this.score}`);
  }

  createMap() {
    const randomNunber = Phaser.Math.Between(1, 2);
    const map = this.make.tilemap({ key: "map" });
    const objectLayer = map.getObjectLayer(`Object Layer ${randomNunber}`);
    const tileSets = map.getTileset("mineral");

    objectLayer.objects.forEach((obj) => {
      const x = Math.floor(obj.x);
      const y = Math.floor(obj.y) - 80;
      const gid = obj.gid - 1;

      const sprite = this.matter.add.sprite(x, y, "minerals", gid);
      const objectData = tileSets.tileData[gid]?.objectgroup?.objects[0];
      const verts = objectData?.polygon?.map(poly => ({ x: poly.x + 100, y: poly.y + 100 }));
      
      if (verts) sprite.setBody({ type: 'fromVertices', verts });
      
      sprite.setDisplaySize(obj.width, obj.height);
      sprite.price = Number(obj.properties.find((property) => property.name === 'price').value);
      sprite.weight = Number(obj.properties.find((property) => property.name === 'weight').value);
      
    });
  }
}