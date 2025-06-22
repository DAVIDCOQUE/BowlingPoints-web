export interface ITournament {
  tournamentId: number;
  name: string;
  modalityId: number;
  modalityName?: string; // Opcional si no siempre viene del backend
  startDate: Date;
  endDate: Date;
  ambitId: number;
  ambitName: string;
  location: string;
  causeStatus: string;
  status: boolean;
}
