import { GameImplement } from '../../game-implement.decorator';
import { Game } from '../../game.base';
import { GameMap } from './map';

const dx = [-1, -1, -1, 0, 1, 1, 1, 0];
const dy = [-1, 0, 1, 1, 1, 0, -1, -1];

@GameImplement('reversi', 2)
export class ReversiGame extends Game {
  constructor() {
    super();

    this.before.on('start', () => {
      new GameMap(this);
    });
  }

  grid = <number[][]>[];
  r = 0;
  c = 0;
  initImpl(data: { rc: number; mask: string }): void {
    let { rc } = data;
    const { mask } = data;
    let k = 0;

    const c = rc & ((1 << 16) - 1);
    rc >>= 16;
    const r = rc;

    this.r = r;
    this.c = c;
    this.screen?.config([c, r]);

    this.grid = new Array(r).fill(0).map(() => new Array(c));

    for (let i = 0; i < r; ++i) {
      for (let j = 0; j < c; ++j) {
        this.grid[i][j] = +mask[k++];
      }
    }
  }
  stepImpl(s: string): void {
    'i.r.c';
    'p';
    if (s === 'p') return this.pass();
    const i = +s[0],
      r = parseInt(s[1], 36),
      c = parseInt(s[2], 36);

    this.placePiece(s, r, c, i);
  }
  validateImpl(s: string): boolean {
    if (s === 'p') return true;
    if (!/^[0-1][0-9a-zA-Z]{2,2}$/.test(s)) return false;

    const id = +s[0],
      r = parseInt(s[1], 36),
      c = parseInt(s[2], 36);

    if (this.turn !== id) return false;
    if (r < 0 || this.r <= r || c < 0 || this.c <= c) return false;
    if (this.grid[r][c] !== 2) return false;
    for (let i = 0; i < 8; ++i) {
      if (this.checkValidDir(r, c, id, i)) return true;
    }

    return false;
  }

  turn = 0;
  placePiece(s: string, ...[r, c, i]: number[]) {
    const grid = this.grid;

    this.grid[r][c] = i;

    let row = this.r,
      col = this.c;

    let changedPieces: number[][] | null = [];

    for (let j = 0; j < 8; ++j) {
      if (this.checkValidDir(r, c, i, j)) {
        reverse(j);
      }
    }

    this.turn ^= 1;

    this.pushStep(s, () => {
      this.grid[r][c] = 2;
      changedPieces!.forEach(([x, y]) => {
        this.grid[x][y] = 1 - i;
      });
      changedPieces = null;
      this.turn ^= 1;
    });

    function reverse(d = 0) {
      let x = r + dx[d],
        y = c + dy[d];
      while (isIn(x, y) && grid[x][y] === 1 - i) {
        grid[x][y] = i;
        changedPieces!.push([x, y]);
        (x += dx[d]), (y += dy[d]);
      }
    }

    function isIn(x = 0, y = 0) {
      return 0 <= x && x < row && 0 <= y && y < col;
    }
  }

  checkValidDir(r: number, c: number, id: number, d = 0) {
    const grid = this.grid;
    const row = this.r,
      col = this.c;
    let x = r + dx[d],
      y = c + dy[d];
    let flg = false;

    while (isIn(x, y) && grid[x][y] === 1 - id) {
      flg = true;
      (x += dx[d]), (y += dy[d]);
    }
    if (!isIn(x, y) || grid[x][y] === 2 || !flg) {
      return false;
    }
    function isIn(x = 0, y = 0) {
      return 0 <= x && x < row && 0 <= y && y < col;
    }

    return true;
  }

  pass() {
    this.turn ^= 1;

    this.pushStep('p', () => {
      this.turn ^= 1;
    });
  }
}
