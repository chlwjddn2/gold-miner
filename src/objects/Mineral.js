import AudioManager from "../manager/AudioManager";

export default class Mineral extends Phaser.Physics.Matter.Sprite {
  constructor(scene, data) {
    const textureKey = data.type === 'mole' ? 'mole' : 'minerals';
    const frame = data.type === 'mole' ? 0 : data.gid;

    super(scene.matter.world, data.x, data.y, textureKey, frame);
    
    this.scene = scene;
    this.price = data.price;
    this.weight = data.weight;
    this.type = data.type;
    this.dataList = data;
    this.scene.add.existing(this);
    this.name = data.name;
    this.init();
  }

  init = () => {
    this.setBody({ type: 'fromVertices', verts: this.dataList.verts });
    this.setDisplaySize( this.dataList.width,  this.dataList.height);
    this.createAnimation();

    if (this.type === 'mole') {
       this.setTexture('mole'); // 🔁 두더지 전용 이미지로 교체
      this.makeMole(this, this.dataList.x, this.dataList.y)
    }
  }

  explode = () => {
    const explosion = this.scene.add.sprite(this.x, this.y, 'explosion').setScale(1);
    explosion.play('explosion');
    explosion.once('animationcomplete', () => explosion.destroy());
    
    this.scene.matter.world.remove(this.body); // Matter 바디 제거
    this.destroy(); // 스프라이트 제거
    AudioManager.play('explode');
  }

  createAnimation = () => {
    const anims = this.scene.anims;

    if (!anims.get('explosion')) {
      anims.create({
        key: 'explosion',
        frames: anims.generateFrameNumbers('explosion', { start: 0, end: 11 }),
        frameRate: 10,
      });
    }

    if (!anims.get('mole_move')) {
      anims.create({
        key: 'mole_move',
        frames: anims.generateFrameNumbers('mole', { start: 0, end: 29 }),
        frameRate: 80,
        repeat: -1
      });
    }
  }

  makeMole = (mole, x) => {
    mole.setSensor(true); //물리 설정 끄기
    mole.setScale(0.25);
    mole.play('mole_move');
    const sceneWidth = this.scene.cameras.main.width;
    const moveDistance = Phaser.Math.Between(100, 300);
    const duration = Phaser.Math.Between(2000, 3000);
    const direction = x > sceneWidth / 2 ? -1 : 1;
    
    if (x < sceneWidth / 2) { // 중간보다 오른쪽이면 filp
      mole.toggleFlipX();
      this.scene.matter.body.scale(mole.body, -1, 1, { x: mole.x, y: mole.y });
    }

    mole.tween = this.scene.tweens.add({ // 애니메이션 등록
      targets: mole,
      x: x + moveDistance * direction,
      duration,
      yoyo: true,
      repeat: -1,
      ease: 'Linear',
      onYoyo: () => {
        mole.toggleFlipX();
        const center = { x: mole.x, y: mole.y };
        this.scene.matter.body.scale(mole.body, -1, 1, center);
      },
      onRepeat: () => {
        mole.toggleFlipX();
        const center = { x: mole.x, y: mole.y };
        this.scene.matter.body.scale(mole.body, -1, 1, center);
      }
    });
  }
}