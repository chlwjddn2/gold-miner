import './style.css'
import { CANVAS, Scene } from 'phaser';
import { gsap } from 'gsap/all';
import { gameEvents } from './manager/EventManager.js';
import GameStartScene from './scene/GameStartScene.js';
import GameMainScene from './scene/GameMainScene.js';
import LevelDoneScene from './scene/LevelDoneScene.js';
import GameOverScene from './scene/GameOverScene.js';
import GameStoreScene from './scene/GameStoreScene.js';
import GameFinishScene from './scene/GameFinishScene.js';
import Boot from './scene/Boot.js';
import PreloadScene from './scene/PreloadScene.js';
import GameManager from './manager/GameManager.js';
import AudioManager from './manager/AudioManager.js';

import Quiz from './Quiz';

export default class GoldMinerMain {
  #config = {
    type: CANVAS,
    width: 1280,
    height: 720,
    backgroundColor: '#c9effa',
    scene: [
      Boot,
      PreloadScene,
      GameStartScene,
      GameMainScene,
      GameStoreScene,
      LevelDoneScene,
      GameOverScene,
      GameFinishScene
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
    scale: {
      mode: Phaser.Scale.FIT,         // 비율 유지하면서 화면에 꽉 차게
      autoCenter: Phaser.Scale.CENTER_BOTH, // 자동 중앙 정렬
    },
    pixelArt: false,
  }

  constructor() {
    // 게임 방법 팝업
    this.howToPopup = document.querySelector(`.howto-popup`);
    this.howToCloseButton = this.howToPopup.querySelector(`.closeButton`);
    this.gameContainer = document.querySelector('.game-container');
    this.popupContainer = document.querySelector('.popup-container');

    // 퀴즈
    this.quizPopup = document.querySelector(`.quiz-popup`);
    this.wrap = document.querySelector('#wrap');
    
    this.init();
	}

  init = () => {
    this.quiz = new Quiz();
    this.game = new Phaser.Game(this.#config);
    this.addEvent();
    this.resizeContent();
  }

  addEvent = () => { // 이벤트 추가
    // 팝업 이벤트
    gameEvents.on('howto', () => this.clickHowto());
    // 상점 아이템 클릭 이벤트
    gameEvents.on('clickItem', (event) => this.clickItem(event.key));
    gameEvents.on('quizFinish', (event) => this.quizFinish(event));
    gameEvents.on('playGame', () => this.quiz.reset());
    // 게임 방법 팝업 닫기
    this.howToCloseButton.addEventListener('click', () => this.clickHowToClose());
    window.addEventListener('resize', this.resizeContent); // 스케일 조절
  }
   
  showHowToPopup = (bool) => { // 게임방법 팝업
    const innerContaion = this.howToPopup.querySelector('.howto-inner');
    if (bool) {
      this.howToPopup.classList.add('show');
      gsap.fromTo(innerContaion, {top: '150%'}, {top: '50%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)"});
    } else {
      gsap.fromTo(innerContaion, {top: '50%'}, {top: '150%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)", onComplete: () => { 
        this.howToPopup.classList.remove('show');
      }});
    }
  }

  showQuizPopup = (bool) => { // 퀴즈 팝업
    const quizInner = this.quizPopup.querySelector('.quiz-inner');
    gsap.killTweensOf(quizInner);
    if (bool) {
      this.quizPopup.classList.add('show');
      gsap.fromTo(quizInner, {top: '150%'}, {top: '50%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)"});
    } 
    else {
      gsap.fromTo(quizInner, {top: '50%'}, {top: '150%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)", onComplete: () => { 
        this.quizPopup.classList.remove('show');
      }});
    }
  }
    
  resizeContent = () => { // 스케일 조절 함수
    if (1280 / 720 <= document.body.clientWidth / document.body.clientHeight) {
      this.ratio = document.body.clientHeight / 720;
      this.popupContainer.style.top = `0px`
      this.popupContainer.style.left = `${(document.body.clientWidth - 1280 * this.ratio) / 2}px`
      this.popupContainer.style.scale = `${this.ratio}`
    } else {
      this.ratio = document.body.clientWidth / 1280;
      this.popupContainer.style.top = `${(document.body.clientHeight - 720 * this.ratio) / 2}px`
      this.popupContainer.style.left = `0px`
      this.popupContainer.style.scale = `${this.ratio}`
    }
  }

  clickItem = (key) => { // 상점 아이템 클릭 했을때 
    AudioManager.play('clickSound');
    this.showQuizPopup(true);
    this.quiz.setQuizItem(key);
  }

  clickHowto = () => { // 게임 방법 버튼 클릭했을때
    AudioManager.play('clickSound');
    this.showHowToPopup(true);
  }

  clickHowToClose = () => { // 게임 방법 닫기 버튼
    AudioManager.play('clickSound');
    this.showHowToPopup(false);
  }

  quizFinish = (event) => { // 퀴즈 완료 후
    const { result, key } = event;
    if (result) {
      AudioManager.play('correctSound');
      key === 'dynamite' ? GameManager.addDynamite() : GameManager.addPotion();
    } else {
      AudioManager.play('wrongSound');
    }

    this.showQuizPopup(false);
  }
}

const game = new GoldMinerMain();