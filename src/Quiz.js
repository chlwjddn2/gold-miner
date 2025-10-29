
import { shuffleArray, loadJson } from './utils';
import { gameEvents } from './manager/EventManager.js';

export default class Quiz {
  constructor() {
    this.container = document.querySelector('.quiz-container');
    this.quizText = document.querySelector('.quiz-text > p');
    this.quizImage = document.querySelector('.quiz-image > img');
    this.quizList = Array.from(document.querySelectorAll('.quiz-list'));

    this.init();
  }

  init = async () => {
    this.quizData = await loadJson('./quizData/data.json');
    
    shuffleArray(this.quizData);
    this.reset();
    this.addEvent();
  }

  setQuizItem = (key) => {
    const quizData = this.quizData[this.quizStep];
    this.key = key;
    this.quizText.innerHTML = this.quizData[this.quizStep].title;
    this.quizImage.src = `./public/images/quiz/miner_store_${this.key}_char.png`;
    this.quizList.forEach((list, index) => list.innerHTML = quizData.list[index]);
    this.isSolved = false;
  }

  addEvent = () => {
    this.quizList.forEach((list, index) => {
      list.addEventListener('click', () => this.clickItem(index));
    })
  }


  clickItem = (index) => {
    if (this.isSolved) return;
    const quizData = this.quizData[this.quizStep];
    const answer = quizData.answer;
    const result = index + 1 === answer;
    gameEvents.emit('quizFinish', { result, key: this.key })
    this.quizStep += 1;
    this.isSolved = true;
  }

  reset = () => {
    this.quizStep = 0;
    this.key = '';
    this.isSolved = false;
  }
}