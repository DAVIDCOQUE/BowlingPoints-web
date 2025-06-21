export interface ITournament {
  tournamentId: number;
  name: string;
  modalityId: number;
  modalityName?: string; // Opcional si no siempre viene del backend
  startDate: Date;
  endDate: Date;
  location: string;
  causeStatus: string;
  status: boolean;
}
