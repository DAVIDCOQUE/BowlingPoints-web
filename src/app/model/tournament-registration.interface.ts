export interface ITournamentRegistration {
  registrationId: number;
  tournamentId: number;
  tournamentName?: string;

  personId: number;
  personFullName?: string;

  categoryId?: number;
  categoryName?: string;

  modalityId?: number;
  modalityName?: string;

  branchId?: number;
  branchName?: string;

  teamId?: number;
  teamName?: string;

  status?: boolean;
  registrationDate?: Date;

  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
