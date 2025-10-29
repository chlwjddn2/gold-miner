export default class Timer {
  constructor(scene, x, y, duration, onEndCallback) {
    this.scene = scene;
    this.remainingTime = duration;
    this.onEndCallback = onEndCallback;

    // 텍스트 UI 생성
    this.timerBg = scene.add.image(x, y, 'timer_bg');
    this.timerText = scene.add.text(x, y - 15, `${this.remainingTime}`, {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'SchoolSafetyRoundedSmile',
      fontStyle: 'bold'
    }).setDepth(100);

    this.timerEvent = scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.updateTimer(),
    });
  }

  updateTimer() {
    this.remainingTime--;
    this.timerText.setText(`${this.remainingTime}`);

    if (this.remainingTime <= 0) {
      this.onEndCallback && this.onEndCallback();
    }
  }
}