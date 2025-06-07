export default interface PlayerDTO { 
    playerId?: string; // Is the player ID for the channel or the player?
    username?: string;
    avatar?: string; // URL to Discord avatar
    color?: "red" | "yellow"; 
    isTurn?: boolean; // Tracks if it's their turn
    score?: number; // Player's score
}