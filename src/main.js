import './style.css'
import Phaser from 'phaser';
import { gsap } from 'gsap/all';
import { gameEvents } from './manager/EventManager.js';
import GameStartScene from './scene/GameStartScene.js';
import GameMainScene from './scene/GameMainScene.js';
import LevelDoneScene from './scene/LevelDoneScene.js';
import GameOverScene from './scene/GameOverScene.js';
import PreloadScene from './scene/PreloadScene.js';
import Quiz from './Quiz';
import { GameManager } from './manager/GameManager.js';

export default class GoldMinerMain {
  #config = {
    type: Phaser.CANVAS,
    width: 1280,
    height: 720,
    backgroundColor: '#88C2F6',
    scene: [
      PreloadScene,
      GameMainScene,
      GameStartScene,
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
    this.wrap = document.querySelector('#wrap');
    this.game = new Phaser.Game(this.#config);
    this.quiz = new Quiz();

    this.init();
	}

  init() {
    this.addEvent();
    this.resizeContent();
  }
  
  addEvent() {
    gameEvents.on('howto', () => {
      this.game.sound.get('clickSound').play();
      this.showHowToPopup(true);
    });

    gameEvents.on('item', (type) => {
      this.quiz.renderQuestion(type.key)
      this.showQuizPopup(true);
    })

    gameEvents.on('correct', async (type) => {
      this.showQuizPopup(false);
      await new Promise((resolve) => setTimeout(resolve, 1300));
      if (type.key === 'bomb') this.game.scene.getScene('MainScene').mineralExplosion();
      if (type.key === 'potion') this.game.scene.getScene('MainScene').powerUp();
    })

    gameEvents.on('incorrect', () => this.showQuizPopup(false));

    this.howToCloseButton.addEventListener('click', () => {
      this.game.sound.get('clickSound').play();
      this.showHowToPopup(false);
    })

    window.addEventListener('resize', this.resizeContent);
  }
   
  showHowToPopup(bool) {
    if (bool) {
      this.howToContainer.classList.add('show');
      gsap.fromTo(this.howToContainer.querySelector('.howto-inner'), {top: '150%'}, {top: '50%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)"});
      this.game.sound.get('bgmSound').pause();
    } 
    else {
      gsap.fromTo(this.howToContainer.querySelector('.howto-inner'), {top: '50%'}, {top: '150%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)", onComplete: () => { 
        this.howToContainer.classList.remove('show');
      }});
      this.game.sound.get('bgmSound').resume();
    }
  }

  showQuizPopup(bool) {
    if (bool) {
      this.quiz.container.classList.add('show');
      gsap.fromTo(this.quiz.container.querySelector('.quiz-inner'), {top: '150%'}, {top: '50%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)"});
      this.game.scene.pause('MainScene');
      GameManager.bgmOn && this.game.sound.get('bgmSound').pause();
    } 
    else {
      gsap.fromTo(this.quiz.container.querySelector('.quiz-inner'), {top: '50%'}, {top: '150%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)", onComplete: () => { 
        this.quiz.container.classList.remove('show');
        this.game.scene.resume('MainScene');
        GameManager.bgmOn && this.game.sound.get('bgmSound').resume();
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