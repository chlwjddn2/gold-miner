import { gameEvents } from './manager/EventManager.js';
import loadJson from './utils/loadJson';
import findRandomArray from './utils/findRandomArray';
import playSoundEffect from './utils/playSoundEffect';

export default class Quiz{
  constructor() {
    this.container = document.querySelector(`.quiz-container`);
    this.init();
  }

  async init() {
    this.quizData = await loadJson('./quizData/data.json');
  }

  renderQuestion(key) {
    this.randomData = findRandomArray(this.quizData);
    this.key = key;
    this.setQuizHtml(this.randomData, key);
    this.bindEvents();
  }

  setQuizHtml(data = {}, key = 'bomb') {
    this.container.innerHTML = '';
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

    this.container.appendChild(quizInner);
  }

  bindEvents() {
    this.quizItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        index === this.randomData.answer ? this.correct() : this.incorrect();
      });
    });
  }

  correct() {
    playSoundEffect('./audio/correct.mp3');
    gameEvents.emit('correct', { key: this.key });
  }

  incorrect() {
    playSoundEffect('./audio/wrong.mp3');
    gameEvents.emit('incorrect', { key: this.key });
  }
}