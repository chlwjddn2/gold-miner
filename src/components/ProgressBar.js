export default class ProgressBar {
  constructor(scene, x, y, width = 400, height = 25) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    // 배경
    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x111111, 0.4);
    this.bg.fillRoundedRect(x, y, width, height, 12);

    // 채워지는 부분
    this.bar = scene.add.graphics();

    this.scoreBox = scene.add.image(962, 51, 'miner_balloon').setDepth(10);
    this.scroeText = scene.add.text(962, 46, '', {
      fontSize: '28px',
      color: '#000',
      fontFamily: 'Cafe24Surround',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(15);
    
    this.targetScoreBox = scene.add.image(1200, 80, 'miner_trophi_box');
    this.targetScoreText = scene.add.text(1215, 107, '', {
      fontSize: '28px',
      color: '#000',
      fontFamily: 'Cafe24Surround',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.coinIcon = scene.add.image(965, 104, 'miner_icon_coin').setOrigin(0.5);
  }

  update(current, target) {
    this.progress = Phaser.Math.Clamp(current / target, 0, 1);

    if (this.progress > 0) {
      this.bar.clear(); 
      this.bar.fillStyle(0xf7db49, 1);
      this.bar.fillRoundedRect(this.x, this.y, this.width * this.progress, this.height, 12);
    }
    
    this.scroeText.setText(`${current}`);
    this.targetScoreText.setText(`${target}`);
    const barWidth = this.width * this.progress;

    
    this.coinIcon.setX(this.x + barWidth); // bar 끝 위치
    this.scoreBox.setX(this.x + barWidth); // bar 끝 위치
    this.scroeText.setX(this.x + barWidth); // bar 끝 위치
    this.coinIcon.setY(this.y + this.height / 2); // 높이는 바 중앙
  }

  destroy() {
    this.bg.destroy();
    this.bar.destroy();
    this.text.destroy();
  }
}