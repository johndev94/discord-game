import PlayerMoveDTO from "@common/dto/player-move.dto";
import PlayerDTO from "@common/dto/player.dto";
import SessionDTO from "@common/dto/session.dto"

function makePlayerMove(sessionDTO: SessionDTO, column: number, currentPlayer: PlayerDTO): SessionDTO {
    if (!currentPlayer?.colour) return sessionDTO;
    const currentBoard = sessionDTO.board.board;

    if (currentBoard[0][column] === 0) {
        for (let row = currentBoard.length - 1; row >= 0; row--) {
            if (currentBoard[row][column] === 0) { // TODO: Maybe change 0 to the enum of empty.
                currentBoard[row][column] = currentPlayer.colour;
            }
        }
    }
    sessionDTO.board.board = currentBoard;
    return sessionDTO;
}

function checkIfPlayerWon(sessionDTO: SessionDTO): boolean {
    // Will need to consider how I update the current session to notify players who won.
    return false;
}

function updatePlayersTurns(sessionDTO: SessionDTO): PlayerDTO[] {
    const updatedTurns = sessionDTO.players.map((p) => {
        return {
            ...p,
            isTurn: !p.isTurn
        };
    });

    return updatedTurns;
}

export default function processPlayerMove(playerMoveDTO: PlayerMoveDTO): SessionDTO { // TODO: Add return type later
    const currentPlayer = playerMoveDTO.session.players.find((p) => {
        p.isTurn === true;
    });

    if (!currentPlayer) {
        console.log("YOU ARE NOT A PLAYER SUCKER");
        return playerMoveDTO.session;
    }

    const updatedBoardSession = makePlayerMove(playerMoveDTO.session, playerMoveDTO.playerSelectedColomn, currentPlayer);

    const playerWon = checkIfPlayerWon(updatedBoardSession);

    if (playerWon) {
        updatedBoardSession.winner = currentPlayer;
        return updatedBoardSession;
    }

    updatedBoardSession.players = updatePlayersTurns(updatedBoardSession);

    console.log("///////////////////////////////////");
    console.log(updatedBoardSession);
    console.log("///////////////////////////////////");

    return updatedBoardSession;
}