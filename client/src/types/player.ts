export interface Player {
    id: string;  // Discord ID
    name: string; // Player's username
    avatar?: string; // URL to Discord avatar
    color: "red" | "yellow"; 
    isTurn: boolean; // Tracks if it's their turn
    score: number; // Player's score
  }
  