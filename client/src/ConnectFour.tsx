/////////////////////////////////////////////////////////////////////////////////////////////////////
//  DISCALIMER: THIS IS ALL AI GENERATED. WILL NEED TO ADAPT LATER TO OUR USE CASE.
/////////////////////////////////////////////////////////////////////////////////////////////////////
import React, { useState } from "react";

// Type definitions
type CellValue = 0 | 1 | 2; // 0 = empty, 1 = red, 2 = yellow
type Board = CellValue[][];
type Player = 1 | 2;

interface GameState {
	board: Board;
	currentPlayer: Player;
	hoveredColumn: number | null;
}

const Connect4Game: React.FC = () => {
	const ROWS: number = 6;
	const COLS: number = 7;

	// Initialize empty board
	const createEmptyBoard = (): Board =>
		Array(ROWS)
			.fill(null)
			.map(() => Array(COLS).fill(0 as CellValue));

	const [board, setBoard] = useState<Board>(createEmptyBoard);
	const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
	const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);

	const handleColumnClick = (colIndex: number): void => {
		const playerName = currentPlayer === 1 ? "Red" : "Yellow";
		console.log(`Column ${colIndex + 1} clicked by ${playerName} player`);

		// Find the bottom-most empty slot in this column
		let targetRow: number = -1;
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
		const newBoard: Board = board.map((row) => [...row]);
		newBoard[targetRow][colIndex] = currentPlayer;
		setBoard(newBoard);

		// Switch players
		setCurrentPlayer(currentPlayer === 1 ? 2 : 1);

		console.log(`Piece placed at row ${targetRow + 1}, column ${colIndex + 1}`);
	};

	const resetGame = (): void => {
		setBoard(createEmptyBoard());
		setCurrentPlayer(1);
		setHoveredColumn(null);
		console.log("Game reset!");
	};

	const getCellColor = (cellValue: CellValue): string => {
		switch (cellValue) {
			case 1:
				return "bg-red-500";
			case 2:
				return "bg-yellow-400";
			default:
				return "bg-gray-50";
		}
	};

	const isColumnFull = (colIndex: number): boolean => {
		return board[0][colIndex] !== 0;
	};

	const handleMouseEnter = (colIndex: number): void => {
		setHoveredColumn(colIndex);
	};

	const handleMouseLeave = (): void => {
		setHoveredColumn(null);
	};

	const getPlayerName = (player: Player): string => {
		return player === 1 ? "Red" : "Yellow";
	};

	const getPlayerBadgeClasses = (player: Player): string => {
		return player === 1
			? "bg-red-500 shadow-red-200 text-white"
			: "bg-yellow-400 text-gray-800 shadow-yellow-200";
	};

	const getHoverIndicatorClasses = (player: Player): string => {
		return player === 1
			? "border-red-400 bg-red-100"
			: "border-yellow-400 bg-yellow-100";
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex flex-col items-center justify-center p-8">
			<div className="w-full max-w-2xl">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-5xl font-bold text-gray-800 mb-4 tracking-tight">
						Connect 4
					</h1>
					<div className="flex items-center justify-center gap-3">
						<span className="text-gray-600 text-lg">Current Player:</span>
						<div
							className={`px-4 py-2 rounded-full font-semibold shadow-lg transition-all duration-300 ${getPlayerBadgeClasses(
								currentPlayer
							)}`}
						>
							{getPlayerName(currentPlayer)}
						</div>
					</div>
				</div>

				{/* Game Board Container */}
				<div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
					<div className="relative">
						{/* Board Grid with Clickable Columns */}
						<div className="grid grid-cols-7 gap-2">
							{Array(COLS)
								.fill(null)
								.map((_, colIndex: number) => (
									<div
										key={`column-${colIndex}`}
										className={`cursor-pointer transition-all duration-200 rounded-lg p-1 relative ${
											hoveredColumn === colIndex && !isColumnFull(colIndex)
												? "bg-gray-100 shadow-md"
												: "hover:bg-gray-50"
										} ${
											isColumnFull(colIndex)
												? "cursor-not-allowed opacity-60"
												: ""
										}`}
										onClick={() =>
											!isColumnFull(colIndex) && handleColumnClick(colIndex)
										}
										onMouseEnter={() => handleMouseEnter(colIndex)}
										onMouseLeave={handleMouseLeave}
									>
										{/* Hover indicator positioned relative to this column */}
										{hoveredColumn === colIndex && !isColumnFull(colIndex) && (
											<div
												className={`absolute w-16 h-16 rounded-full border-4 border-dashed transition-all duration-200 z-10 left-1/2 transform -translate-x-1/2 ${getHoverIndicatorClasses(
													currentPlayer
												)}`}
												style={{ top: "-80px" }}
											/>
										)}

										{/* Column cells */}
										{board.map((row: CellValue[], rowIndex: number) => (
											<div
												key={`${rowIndex}-${colIndex}`}
												className={`w-16 h-16 rounded-full border-2 border-gray-200 ${getCellColor(
													row[colIndex]
												)} 
                                 transition-all duration-300 shadow-sm mb-2 last:mb-0 relative overflow-hidden`}
											>
												{row[colIndex] !== 0 && (
													<div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
												)}
											</div>
										))}
									</div>
								))}
						</div>
					</div>
				</div>

				{/* Controls */}
				<div className="flex justify-center mt-8">
					<button
						onClick={resetGame}
						className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold 
                       rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl 
                       active:scale-95 flex items-center gap-2"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						Reset Game
					</button>
				</div>
			</div>
		</div>
	);
};

export default Connect4Game;
