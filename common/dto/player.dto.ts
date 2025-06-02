export default interface PlayerDTO { 
    id?: string;
    username?: string;
    avatar?: string; // URL to Discord avatar
    color?: "red" | "yellow"; 
    isTurn?: boolean; // Tracks if it's their turn
    score?: number; // Player's score
}