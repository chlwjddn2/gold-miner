import Phaser from 'phaser';
import GameMainScene from './GameMainScene';
import GameStartScene from './GameStartScene';
import GameOverScene from './GameOverScene';
import LevelDoneScene from './LevelDoneScene';
import BootScene from './BootScene';
import './style.css'
import { gsap } from 'gsap/all';
import SetBgm from './utils/setBgm';
import loadJson from './utils/loadJson';

export default class GoldMinerMain {
  #config = {
    type: Phaser.CANVAS,
    width: 1280,
    height: 720,
    backgroundColor: '#88C2F6',
    scene: [
      BootScene,
      GameStartScene,
      GameMainScene,
      LevelDoneScene,
      GameOverScene,
    ],
    parent: 'container',
    physics: {
      default: 'matter',
      matter: {
        gravity: { x: 0, y: 0 },      // 중력 설정 (기본값 y=1)
        // debug: true,                  // 디버그 모드 (바디 모양 보여줌)
        enableSleeping: false,        // 휴면모드 허용 여부
        positionIterations: 6,        // 물리 계산 반복 횟수
        velocityIterations: 4,
        constraintIterations: 2,
      }
    },
    scale: {
      mode:Phaser.Scale.FIT,//자동맞춤
      autoCenter:Phaser.Scale.CENTER_BOTH,//가로세로 모두맞춤
    },
    pixelArt: false,
  }

  constructor() {
    this.howToContainer = document.querySelector(`.howto-container`);
    this.howToCloseButton = this.howToContainer.querySelector(`.closeButton`);

    this.quizContainer = document.querySelector(`.quiz-container`);
    this.quizCloseButton = this.quizContainer.querySelector(`.closeButton`);
    this.init();
	}

  async init() {
    this.game = new Phaser.Game(this.#config);
    this.bgm = new SetBgm('./audio/bgm.mp3');
    this.quizData = await loadJson('./quizData/data.json');
    this.event();
  }

  event() {
    document.addEventListener('HOWTO_SHOW', (evt) => this.showHowToPopup(true));
    document.addEventListener('SET_BGM', (evt) => this.bgm.toggle());
    document.addEventListener('QUIZ_SHOW', (evt) => this.showQuizPopup(true));
    this.howToCloseButton.addEventListener('click', () => this.showHowToPopup(false));
    this.quizCloseButton.addEventListener('click', () => this.showQuizPopup(false));
  }
  
  showHowToPopup(bool) {
    if (bool) {
      this.howToContainer.classList.add('show');
      gsap.fromTo(this.howToContainer, {top: '150%'}, {top: '50%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)"});
    } else {
      gsap.fromTo(this.howToContainer, {top: '50%'}, {top: '150%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)", onComplete: () => { this.howToContainer.classList.remove('show');}});
    }
  }

  showQuizPopup(bool) {
    if (bool) {
      this.quizContainer.classList.add('show');
      gsap.fromTo(this.quizContainer, {top: '150%'}, {top: '50%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)"});
      this.game.scene.pause('MainScene');
      this.setQuizItem();

    } else {
      gsap.fromTo(this.quizContainer, {top: '50%'}, {top: '150%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)", onComplete: () => { 
        this.quizContainer.classList.remove('show');
        this.game.scene.resume('MainScene');
      }});
    }
  }

  setQuizItem() {
    console.log(this.quizData);
    console.log(this.game);
    
    
  }
}

const game = new GoldMinerMain();