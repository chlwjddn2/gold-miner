class GameManager {
  constructor() {
    this.score = 0;
    this.level = 1;
    this.targetScore = 650;
    this.bgmOn = true;
    this.bomb = 0
    this.power = 0;
    this.return = 0;
  }

  updateScore(amount) {
    this.score += amount
  }

  levelUp() {
    this.level += 1;
    this.targetScore = (135 * this.level * this.level) + (135 * this.level) + 380;
  }

  addBomb() {
    this.bomb += 1;
  }

  addPower() {
    this.power += 1;
  }

  toggleBgm() {
    this.bgmOn = !this.bgmOn;
  }

  reset() {
    this.score = 0;
    this.level = 1;
    this.targetScore = 650;
    this.bgmOn = true;
    this.bomb = 0
    this.power = 0;
    this.return = 0;
  }
}

const gameManager = new GameManager();
export default gameManager;