export default class Quiz{
  constructor(container, data, key) {
    this.container = container;
    this.list = data.list
    this.answer = data.correct;
    this.title = data.title;
    this.key = key;

    this.quizItems = [];

    this.init();
  }

  init() {
    this.container.append(this.setQuizHtml())

    Array.from(this.quizItems).forEach((item, index) => {
      item.addEventListener('click', () => {
        console.log('click');
        
        
      })
    })
  }

  setQuizHtml() {
    const quizInner = document.createElement('div');
    quizInner.className = 'quiz-inner';

    const quizQuestion = document.createElement('div');
    quizQuestion.className = 'quiz-question';

    const quizImage = document.createElement('div');
    quizImage.className = 'quiz-image';

    const quizText = document.createElement('div');
    quizText.className = 'quiz-text';

    const img = document.createElement('img');
    img.src =  `./images/${this.key}.png`; // 기본 이미지
    img.alt = '';
    quizImage.appendChild(img);

    const p = document.createElement('p');
    p.textContent = this.title;

    const quizList = document.createElement('ul');
    quizList.className = 'quiz-list';

    this.list.forEach(text => {
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

    return quizInner;
  }

  correct() {
    
  }
}