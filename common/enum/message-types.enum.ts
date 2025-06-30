
// TODO: Refactor these to be more specific later
const MESSAGE_TYPE = {
  JOIN_SESSION: "join_session", // Keep as is
  START_SESSION: "start_session", // Unsure what this is even used for? Maybe I thought once the players are in lobby we start game?
  UPDATE_SESSION: "update_session", // This is too broad. Update what? The messages? The game? The players? We can break it down or use this a catch all if I need to.
  PLAYER_MOVE: "player_move",
  END_SESSION: "end_session", // Is this for when we manually end it or?
} as const;

export default MESSAGE_TYPE;