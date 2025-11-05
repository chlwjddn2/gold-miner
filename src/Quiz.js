
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

  init = async () => { // 퀴즈 초기 설정
    this.quizData = await loadJson('./quizData/data.json'); // 퀴즈 데이터 로드
    shuffleArray(this.quizData); // 섞기
    this.reset();
    this.addEvent();
  }

  addEvent = () => { // 이벤트 등록
    this.quizList.forEach((list, index) => {
      list.addEventListener('click', () => this.clickItem(index));
    })
  }

  setQuizItem = (key) => { // 퀴즈 내용 생성
    const quizData = this.quizData[this.quizStep];
    this.key = key;
    this.quizText.innerHTML = this.quizData[this.quizStep].title;
    this.quizImage.src = `./images/quiz/quiz_${this.key}.png`;
    this.quizList.forEach((list, index) => list.innerHTML = quizData.list[index]);
    this.isSolved = false;
  }

  clickItem = (index) => {  // 퀴즈 아이템 클릭
    if (this.isSolved) return;
    const quizData = this.quizData[this.quizStep];
    const answer = quizData.answer;
    const result = index + 1 === answer;
    gameEvents.emit('quizFinish', { result, key: this.key })
    this.quizStep += 1;
    this.isSolved = true;
  }

  reset = () => { // 퀴즈 리셋
    this.quizStep = 0;
    this.key = '';
    this.isSolved = false;
  }
}