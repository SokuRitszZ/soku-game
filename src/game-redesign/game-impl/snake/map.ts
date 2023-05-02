import { Game } from '@/game-redesign/game.base';
import { SnakeGame } from './game';
import { GameObject } from '@/game-redesign/game.object';

export class GameMap extends GameObject {
  constructor(game: Game) {
    super(game);

    this.mkUpdater('render-map', () => {
      const L = game.L!;
      const g = game.g!;

      (game as SnakeGame).grid.forEach((_, i) => {
        _.forEach((_, j) => {
          g.Rect({
            y: i * L,
            x: j * L,
            lx: L,
            ly: L,
            color: _ ? '#896c50' : ((i + j) & 1 && '#dddddd') || '#efefef',
          });
        });
      });
    });
  }
}