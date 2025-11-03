export interface IResults {
  resultId: number;
  score: number;

  /** Datos de pista y línea */
  laneNumber: number;
  lineNumber: number;

  /** Rama (masculino/femenino) */
  branchName: string;
  branchId: number;

  /** IDs relacionales */
  personId?: number | null;
  teamId?: number | null;
  tournamentId?: number | null;
  categoryId?: number | null;
  modalityId?: number | null;
  roundId?: number | null;

  /** Nombres descriptivos (para mostrar sin hacer joins) */
  personName?: string | null;
  teamName?: string | null;
  tournamentName?: string | null;
  categoryName?: string | null;
  modalityName?: string | null;
  roundNumber?: number | null;

  /** Fechas opcionales (si el backend las envía) */
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string;
}
