import SpectatorDTO from "./spectator.dto"

export default class JoinSessionDTO {
    spectator: SpectatorDTO;

    constructor(spectator : SpectatorDTO){
        this.spectator = spectator;
    }
}