export default class ScoreBoard {
  constructor(scene) {
    this.score = 0;
    this.scene = scene;
    this.targetScore = 650;
    this.timeLeft = 60; // 타이머 시작 시간 (초)
    this.level = 1; 
  }

  loadScoreBoard() {
    this.scoreText = this.scene.add.text(1000, 36, `score : ${this.score}`, {
      fontSize: '32px',
      fill: '#000000',
      fontFamily: 'Pretendard',
    }).setDepth(100);

    this.targetScoreText = this.scene.add.text(1000, 76, `target : ${this.targetScore}`, {
      fontSize: '32px',
      fill: '#000000',
      fontFamily: 'Pretendard',
    }).setDepth(100);

    this.timerText = this.scene.add.text(1000, 116, `time : ${this.timeLeft}`, {
      fontSize: '32px',
      fill: '#000000',
      fontFamily: 'Pretendard',
    }).setDepth(100);

    this.levelText = this.scene.add.text(1000, 156, `level : ${this.level}`, {   // 추가
      fontSize: '32px',
      fill: '#000000',
      fontFamily: 'Pretendard',
    }).setDepth(100);
  }

  startTimer(duration = 60) {
    this.timeLeft = duration;
    this.timerText.setText(`time : ${this.timeLeft}`);

    // 1초마다 timeLeft 감소 
    this.timerEvent = this.scene.time.addEvent({
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
    if (this.score <= this.targetScore) {
      this.scene.scene.launch('GameOverScene');
      this.scene.scene.pause();        
    } else {
      this.scene.scene.restart();
    }

    console.log(this.level++);
    
  }

  updateScore(amount) {
    this.score += amount;
    this.scoreText.setText(`score : ${this.score}`);
  }

  updateLevel(newLevel) {
    this.level = newLevel;
    this.levelText.setText(`level : ${this.level}`);
  }
}