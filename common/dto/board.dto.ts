export default class BoardDTO {
  board: number[][]; // 0 for empty, 1 for yellow, 2 for red

  constructor(rows = 6, columns = 7) {
    this.board = Array.from({ length: rows }, () => Array(columns).fill(0));
  }
}
