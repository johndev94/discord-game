export default class BoardDTO {
  board: number[][]; // 0 for empty, 1 for player 1, 2 for player 2

  constructor(rows = 6, columns = 7) {
    this.board = Array.from({ length: rows }, () => Array(columns).fill(0));
  }

  isColumnFull(column: number): boolean {
    return this.board[0][column] !== 0;
  }

  dropDisc(column: number, player: number): boolean {
    if (this.isColumnFull(column)) return false;

    for (let row = this.board.length - 1; row >= 0; row--) {
      if (this.board[row][column] === 0) {
        this.board[row][column] = player;
        return true;
      }
    }
    return false;
  }

  // Logic for win-checking goes here
}
