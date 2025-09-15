import './style.css'
import Phaser from 'phaser';

import { gsap } from 'gsap/all';
import { gameEvents } from './Event.js';

import BootScene from './BootScene';
import GameStartScene from './GameStartScene';
import GameMainScene from './GameMainScene';
import LevelDoneScene from './LevelDoneScene';
import GameOverScene from './GameOverScene';

import Quiz from './Quiz';


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
    parent: 'game-container',
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
    pixelArt: false,
  }

  constructor() {
    this.howToContainer = document.querySelector(`.howto-container`);
    this.howToCloseButton = this.howToContainer.querySelector(`.closeButton`);
    this.quizContainer = document.querySelector(`.quiz-container`);
    this.wrap = document.querySelector('#wrap');
    this.game = new Phaser.Game(this.#config);
    this.quiz = new Quiz(this.quizContainer);

    this.init();
	}

  async init() {
    this.event();
    this.resizeContent();
  }

  event() {
    window.addEventListener('resize', () => this.resizeContent())
    document.addEventListener('HOWTO_SHOW', () => this.showHowToPopup(true));
    document.addEventListener('SET_BGM', () => this.bgm.toggle());
    this.howToCloseButton.addEventListener('click', () => this.showHowToPopup(false));
    
    gameEvents.on('bomb', (event) => {
      this.quiz.renderQuestion(event.key);
      this.showQuizPopup(true);
    });

    gameEvents.on('correct', (event) => {
      this.showQuizPopup(false);
    });
  }
  
  showHowToPopup(bool) {
    if (bool) {
      this.howToContainer.classList.add('show');
      gsap.fromTo(this.howToContainer.querySelector('.howto-inner'), {top: '150%'}, {top: '50%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)"});
    } 
    else {
      gsap.fromTo(this.howToContainer.querySelector('.howto-inner'), {top: '50%'}, {top: '150%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)", onComplete: () => { 
        this.howToContainer.classList.remove('show');
      }});
    }
  }

  showQuizPopup(bool) {
    if (bool) {
      this.quizContainer.classList.add('show');
      gsap.fromTo(this.quizContainer.querySelector('.quiz-inner'), {top: '150%'}, {top: '50%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)"});
      this.game.scene.pause('MainScene');
    } 
    else {
      gsap.fromTo(this.quizContainer.querySelector('.quiz-inner'), {top: '50%'}, {top: '150%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)", onComplete: () => { 
        this.quizContainer.classList.remove('show');
        this.game.scene.resume('MainScene');
      }});
    }
  }
    
  resizeContent() {
    const ratio = document.body.clientWidth / 1280;
    this.wrap.style.top = `${(document.body.clientHeight - 720 * ratio) / 2}px`
    this.wrap.style.left = '0px'
    this.wrap.style.scale = `${ratio}`
  }
}

const game = new GoldMinerMain();