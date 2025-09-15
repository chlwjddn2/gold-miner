import { gameEvents } from './Event.js';
import loadJson from './utils/loadJson';
import findRandomArray from './utils/findRandomArray';

export default class Quiz{
  constructor(container) {
    this.container = container
    this.quizItems = [];
    this.init();
  }

  async init() {
    this.quizData = await loadJson('./quizData/data.json');
  }

  renderQuestion(key) {
     this.setQuizHtml(findRandomArray(this.quizData), key);
     this.bindEvents();
  }

  setQuizHtml(data = {}, key = 'bomb') {
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
    this.quizItems.forEach(item => {
      item.addEventListener('click', () => {
        gameEvents.emit('correct');
      });
    });
  }


  correct() {
    gameEvents.emit('correct');
  }

  incorrect() {
    gameEvents.emit('incorrect');
  }
}