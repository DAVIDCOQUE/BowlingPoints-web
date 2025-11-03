// src/app/interfaces/result-details.interface.ts

export interface IPlayerScore {
  personId: number;
  playerName: string;
  clubName: string;
  scores: number[];
  total: number;
  promedio: number;
}

export interface IModality {
  modalityId: number;
  name: string;
}

export interface IRound {
  roundNumber: number;
}

export interface IHighestLine {
  score: number;
  playerName: string;
  lineNumber: number;
}

export interface ITournamentSummary {
  tournamentId: number;
  tournamentName: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl: string;
  status: boolean;
}

export interface IResultsResponse {
  tournament: ITournamentSummary;
  results: IPlayerScore[];
  modalities: IModality[];
  rounds: number[];
  avgByLine: Record<string, number>;
  avgByRound: number;
  highestLine: IHighestLine;
}
