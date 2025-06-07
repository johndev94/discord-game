import { useState } from "react";

// NOTE: This was AI generated for a quick example. Will change to fit project later.

const Connect4Game = () => {
	const ROWS = 6;
	const COLS = 7;

	// Initialize empty board (0 = empty, 1 = red, 2 = yellow)
	const [board, setBoard] = useState(() =>
		Array(ROWS)
			.fill(null)
			.map(() => Array(COLS).fill(0))
	);

	const [currentPlayer, setCurrentPlayer] = useState(1); // 1 = red, 2 = yellow

	const handleColumnClick = (colIndex: any) => {
		console.log(
			`Column ${colIndex + 1} clicked by ${
				currentPlayer === 1 ? "Red" : "Yellow"
			} player`
		);

		// Find the bottom-most empty slot in this column
		let targetRow = -1;
		for (let row = ROWS - 1; row >= 0; row--) {
			if (board[row][colIndex] === 0) {
				targetRow = row;
				break;
			}
		}

		// If column is full, do nothing
		if (targetRow === -1) {
			console.log(`Column ${colIndex + 1} is full!`);
			return;
		}

		// Update the board
		const newBoard = board.map((row) => [...row]);
		newBoard[targetRow][colIndex] = currentPlayer;
		setBoard(newBoard);

		// Switch players
		setCurrentPlayer(currentPlayer === 1 ? 2 : 1);

		console.log(`Piece placed at row ${targetRow + 1}, column ${colIndex + 1}`);
	};

	const resetGame = () => {
		setBoard(
			Array(ROWS)
				.fill(null)
				.map(() => Array(COLS).fill(0))
		);
		setCurrentPlayer(1);
		console.log("Game reset!");
	};

	const getCellColor = (cellValue: any) => {
		switch (cellValue) {
			case 1:
				return "bg-red-500";
			case 2:
				return "bg-yellow-400";
			default:
				return "bg-white";
		}
	};

	return (
		<div className="flex flex-col items-center p-8 bg-blue-600 min-h-screen">
			<h1 className="text-4xl font-bold text-white mb-6">Connect 4</h1>

			<div className="mb-4 text-white text-xl">
				Current Player:
				<span
					className={`ml-2 px-3 py-1 rounded font-bold ${
						currentPlayer === 1 ? "bg-red-500" : "bg-yellow-400 text-black"
					}`}
				>
					{currentPlayer === 1 ? "Red" : "Yellow"}
				</span>
			</div>

			<div className="bg-blue-800 p-4 rounded-lg shadow-lg">
				{/* Column headers for debugging */}
				<div className="flex mb-2">
					{Array(COLS)
						.fill(null)
						.map((_, colIndex) => (
							<div
								key={`header-${colIndex}`}
								className="w-16 h-8 flex items-center justify-center text-white font-bold text-sm"
							>
								{colIndex + 1}
							</div>
						))}
				</div>

				{/* Game board */}
				<div className="grid grid-cols-7 gap-2">
					{board.map((row, rowIndex) =>
						row.map((cell, colIndex) => (
							<div
								key={`${rowIndex}-${colIndex}`}
								className={`w-16 h-16 rounded-full border-2 border-blue-300 ${getCellColor(
									cell
								)} 
                           transition-all duration-300 shadow-inner`}
							/>
						))
					)}
				</div>

				{/* Column click areas */}
				<div className="flex mt-2">
					{Array(COLS)
						.fill(null)
						.map((_, colIndex) => (
							<button
								key={`col-${colIndex}`}
								onClick={() => handleColumnClick(colIndex)}
								className="w-16 h-12 bg-blue-500 hover:bg-blue-400 transition-colors duration-200 
                         border border-blue-300 text-white font-bold text-sm rounded
                         hover:shadow-lg active:bg-blue-600"
							>
								↓
							</button>
						))}
				</div>
			</div>

			<button
				onClick={resetGame}
				className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-bold 
                   rounded-lg transition-colors duration-200 shadow-lg"
			>
				Reset Game
			</button>
		</div>
	);
};

export default Connect4Game;
