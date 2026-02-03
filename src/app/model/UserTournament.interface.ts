import { IBranch } from "./branch.interface";
import { ICategory } from "./category.interface";
import { IModality } from "./modality.interface";
import { ITournamentRegistration } from "./tournament-registration.interface";

export interface IUserTournament {
  tournamentId: number;
  name: string;
  organizer: string;
  ambitId: number;
  ambitName: string;
  imageUrl: string | null;

  startDate: string;
  endDate: string;
  location: string;
  stage: string;
  status: boolean;

  // IDs
  categoryIds: number[] | null;
  modalityIds: number[] | null;
  branchIds: number[] | null;

  categoryNames: string[] | null;
  modalityNames: string[] | null;
  branchNames: string[] | null;

  // Objetos completos
  categories: ICategory[] | null;
  modalities: IModality[] | null;
  branches: IBranch[] | null;

  tournamentRegistrations: ITournamentRegistration[] | null;

  // Información del usuario en el torneo
  posicionFinal: number | null;
  resultados: number;

  categoria: string;
  modalidad: string;
  date: string;
}
