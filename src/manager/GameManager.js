class GameManager {
  constructor() {
    this.score = 0;
    this.level = 4;
    this.targetScore = 650;
    this.bgmOn = true;
    this.dynamite = 0;
    this.potion = 0;
    this.timeRate = 6000;
  }

  get isPower() { return this.potionUseCount > 0; }

  updateScore(amount) {
    this.score += amount;
  }

  addPotion = () => {
    this.potion++;
  }

  usePotion() {
    this.potion--;
  }

  addDynamite() {
    this.dynamite++;
  }
  
  useDynamite() {
    this.dynamite--;
  }

  levelUp() {
    this.level += 1;
    this.targetScore = (135 * this.level * this.level) + (135 * this.level) + 380;
  }

  toggleBgm() {
    this.bgmOn = !this.bgmOn;
  }

  reset() {
    this.score = 0;
    this.level = 1;
    this.targetScore = 650;
    this.bgmOn = true;
    this.dynamite = 0;
    this.potion = 0;
  }
}

const gameManager = new GameManager();
export default gameManager;