class GameManager {
  constructor() {
    this.score = 0;
    this.level = 1;
    this.targetScore = 650;
    this.bgmOn = true;

    this.dynamite = 1;

    this.potion = 2;
    this.potionUseCount = 0;
  }

  updateScore(amount) {
    this.score += amount
  }

  addPotion = () => {
    this.potion++;
  }

  usePotion() {
    if (this.potion > 0 && this.potionUseCount === 0) {
      this.potion--;
      this.potionUseCount = 3;
    }
  }

  consumePower() {
    if (this.potionUseCount > 0) this.potionUseCount--;
  }

  addDynamite() {
    this.dynamite++;
  }
  
  useDynamite() {
    if (this.dynamite > 0) this.dynamite--;
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
    this.return = 0;
    this.potionUseCount = 3;
  }
}

const gameManager = new GameManager();
export default gameManager;