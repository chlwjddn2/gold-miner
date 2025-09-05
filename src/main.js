import Phaser from 'phaser';
import './style.css'
import MainScene from './MainScene';
import GameOverScene from './GameOverScene';
import GameStartScene from './GameStartScene';

const width = window.innerWidth;
const height = window.innerHeight;

class Game{
	#config = {
    type: Phaser.CANVAS,
    width: 1280,
    height: 720,
		backgroundColor: '#88C2F6',
    scene: [
      MainScene,
      GameStartScene,
      GameOverScene,
    ],
    parent: 'container',
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
      mode:Phaser.Scale.FIT,//자동맞춤
      autoCenter:Phaser.Scale.CENTER_BOTH,//가로세로 모두맞춤
    },
    pixelArt: false,
  }
  constructor() {
		this.game = new Phaser.Game(this.#config);
	}
}

const game = new Game();
