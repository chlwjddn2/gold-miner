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
import loadJson from './utils/loadJson';
import findRandomArray from './utils/findRandomArray';

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

    // 퀴즈
    this.quizContainer = document.querySelector(`.quiz-container`);
    this.wrap = document.querySelector('#wrap');
    
    this.init();
	}

  init() {
    this.game = new Phaser.Game(this.#config);
    this.logoContainer.classList.remove('show');
    // setTimeout(() => {
    //   this.game = new Phaser.Game(this.#config);
    //   this.logoContainer.classList.remove('show');
    // },3000);
    
    this.addEvent();
    this.resizeContent();
    this.loadQuizData();

  }

  async loadQuizData() {
    this.quizData = await loadJson('./quizData/data.json');
  }
  
  addEvent() {
    // 팝업 이벤트
    gameEvents.on('howto', () => {
      AudioManager.play('clickSound');
      this.showHowToPopup(true);
    });

    // 상점 아이템 클릭 이벤트
    gameEvents.on('item', (event) => {
      AudioManager.play('clickSound');
      this.renderQuestion(event.key); // 퀴즈 렌더링
      this.showQuizPopup(true); // 팝업 온
    })

    // 게임 방법 팝업 닫기
    this.howToCloseButton.addEventListener('click', () => {
      AudioManager.play('clickSound');
      this.showHowToPopup(false);
    })

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
    if (bool) {
      this.quizContainer.classList.add('show');
      gsap.fromTo(this.quizContainer.querySelector('.quiz-inner'), {top: '150%'}, {top: '50%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)"});
    } 
    else {
      gsap.fromTo(this.quizContainer.querySelector('.quiz-inner'), {top: '50%'}, {top: '150%', duration: 1.3, ease: "elastic.inOut(0.1 ,0.1)", onComplete: () => { 
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

  setQuizHtml(data = {}, key = 'bomb') { // 퀴즈 html 셋팅
    this.quizContainer.innerHTML = '';
    this.quizItems = [];

    const quizInner = document.createElement('div');
    quizInner.className = 'quiz-inner';

    const quizQuestion = document.createElement('div');
    quizQuestion.className = 'quiz-question';

    const quizImage = document.createElement('div');
    quizImage.className = 'quiz-image';

    const quizText = document.createElement('div');
    quizText.className = 'quiz-text';

    const img = document.createElement('img');
    img.src =  `./images/${key}.png`; // 기본 이미지
    img.alt = '';
    quizImage.appendChild(img);

    const p = document.createElement('p');
    p.textContent = data.title;

    const quizList = document.createElement('ul');
    quizList.className = 'quiz-list';

    data.list.forEach(text => {
      const li = document.createElement('li');
      li.className = 'quiz-item';
      li.textContent = text;
      quizList.appendChild(li);
      this.quizItems.push(li);
    });

    quizText.appendChild(p);
    quizInner.appendChild(quizQuestion);
    quizInner.appendChild(quizList);
    quizQuestion.appendChild(quizImage);
    quizQuestion.appendChild(quizText);

    this.quizContainer.appendChild(quizInner);
  }

  bindEvents() { // 퀴즈 아이템 이벤트 추가
    this.quizItems?.forEach((item, index) => {
      item.addEventListener('click', () => {
        index === this.randomData.answer ? this.correct() : this.incorrect();
        this.showQuizPopup(false);
      });
    });
  }

  correct() { // 정답일 경우
    AudioManager.play('correctSound');
    this.key === 'bomb' ? GameManager.bomb++ : GameManager.power++;
  }
  
  incorrect() { // 오답일 경우
    AudioManager.play('wrongSound');
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
}

const game = new GoldMinerMain();