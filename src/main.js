import './style.css'
import Phaser from 'phaser';
import { gsap } from 'gsap/all';
import { gameEvents } from './manager/EventManager.js';
import GameStartScene from './scene/GameStartScene.js';
import GameMainScene from './scene/GameMainScene.js';
import LevelDoneScene from './scene/LevelDoneScene.js';
import GameOverScene from './scene/GameOverScene.js';
import GameStoreScene from './scene/GameStoreScene.js';
import PreloadScene from './scene/PreloadScene.js';
import GameManager from './manager/GameManager.js';
import AudioManager from './manager/AudioManager.js';

import Quiz from './Quiz';

export default class GoldMinerMain {
  #config = {
    type: Phaser.CANVAS,
    width: 1280,
    height: 720,
    backgroundColor: '#88C2F6',
    scene: [
      PreloadScene,
      GameStoreScene,
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
    // scale: {
    //   mode: Phaser.Scale.FIT,         // 비율 유지하면서 화면에 꽉 차게
    //   autoCenter: Phaser.Scale.CENTER_BOTH, // 자동 중앙 정렬
    // },
    pixelArt: false,
  }

  constructor() {
    // 게임 방법 팝업
    this.howToContainer = document.querySelector(`.howto-container`);
    this.howToCloseButton = this.howToContainer.querySelector(`.closeButton`);
    this.logoContainer = document.querySelector('.logo-container');
    this.gameContainer = document.querySelector('.game-container');

    // 퀴즈
    this.quizContainer = document.querySelector(`.quiz-container`);
    this.wrap = document.querySelector('#wrap');
    
    this.init();
	}

  get isOpenedQuizPopup() {
    return this.quizContainer.classList.contains('show');
  }

  init = () => {
    this.game = new Phaser.Game(this.#config);
    this.quiz = new Quiz();
    this.logoContainer.classList.remove('show');
    // setTimeout(() => {
    //   this.game = new Phaser.Game(this.#config);
    //   this.logoContainer.classList.remove('show');
    // },3000);
    
    this.addEvent();
    this.resizeContent();
  }

  addEvent = () => {
    // 팝업 이벤트
    gameEvents.on('howto', () => this.clickHowto());
    // 상점 아이템 클릭 이벤트
    gameEvents.on('clickItem', (event) => this.clickItem(event.key));
    gameEvents.on('quizFinish', (event) => this.quizFinish(event));
    // 게임 방법 팝업 닫기
    this.howToCloseButton.addEventListener('click', () => this.clickHowToClose());
    window.addEventListener('resize', this.resizeContent); // 스케일 조절
  }
   
  showHowToPopup(bool) { // 게임방법 팝업
    const innerContaion = this.howToContainer.querySelector('.howto-inner');
    if (bool) {
      this.howToContainer.classList.add('show');
      gsap.fromTo(innerContaion, {top: '150%'}, {top: '50%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)"});
    } else {
      gsap.fromTo(innerContaion, {top: '50%'}, {top: '150%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)", onComplete: () => { 
        this.howToContainer.classList.remove('show');
      }});
    }
  }

  showQuizPopup(bool) { // 퀴즈 팝업
    const quizInner = this.quizContainer.querySelector('.quiz-inner');
    gsap.killTweensOf(quizInner);
    if (bool) {
      this.quizContainer.classList.add('show');
      gsap.fromTo(quizInner, {top: '150%'}, {top: '50%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)"});
    } 
    else {
      gsap.fromTo(quizInner, {top: '50%'}, {top: '150%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)", onComplete: () => { 
        this.quizContainer.classList.remove('show');
      }});
    }
  }

  renderQuestion(key) { // 퀴즈 셋팅
    this.randomData = findRandomArray(this.quizData);
    this.key = key;
    this.setQuizHtml(this.randomData, key);
    this.bindEvents();
  }

  bindEvents() { // 퀴즈 아이템 이벤트 추가
    this.quizItems?.forEach((item, index) => {
      item.addEventListener('click', () => {
        index === this.randomData.answer ? this.correct() : this.incorrect();
        this.showQuizPopup(false);
      });
    });
  }
    
  resizeContent() { // 스케일 조절 함수
    if (1280 / 720 <= document.body.clientWidth / document.body.clientHeight) {
      this.ratio = document.body.clientHeight / 720;
      this.wrap.style.top = `0px`
      this.wrap.style.left = `${(document.body.clientWidth - 1280 * this.ratio) / 2}px`
      this.wrap.style.scale = `${this.ratio}`
    } else {
      this.ratio = document.body.clientWidth / 1280;
      this.wrap.style.top = `${(document.body.clientHeight - 720 * this.ratio) / 2}px`
      this.wrap.style.left = `0px`
      this.wrap.style.scale = `${this.ratio}`
    }
  }

  clickItem = (key) => {
    AudioManager.play('clickSound');
    this.showQuizPopup(true);
    this.quiz.setQuizItem(key);
  }

  clickHowto = () => {
    AudioManager.play('clickSound');
    this.showHowToPopup(true);
  }

  clickHowToClose = () => {
    AudioManager.play('clickSound');
    this.showHowToPopup(false);
  }

  quizFinish = (event) => {
    const { result, key } = event;
    if (result) {
      AudioManager.play('correctSound');
      key === 'dynamite' ? GameManager.addDynamite() : GameManager.addPotion();;
    } else {
      AudioManager.play('wrongSound');
    }

    this.showQuizPopup(false);
  }
}

const game = new GoldMinerMain();