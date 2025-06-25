export interface ITournament {
  tournamentId: number;
  name: string;
  imageUrl: string;
  modalityIds: [];
  modalityNames?: []; // Opcional si no siempre viene del backend

  categoryIds?: [];
  categoryNames?: []; // Opcional si no siempre viene del backend

  startDate: Date;
  endDate: Date;
  ambitId: number;
  ambitName: string;
  location: string;
  causeStatus: string;
  status: boolean;
}
