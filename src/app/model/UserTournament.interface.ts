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

  // IDs como arrays simples
  categoryIds: number[] | null;
  modalityIds: number[] | null;
  branchIds: number[] | null;

  // Nombres como arrays de strings
  categoryNames: string[] | null;
  modalityNames: string[] | null;
  branchNames: string[] | null;

  // Objetos completos
  categories: ICategory[] | null;
  modalities: IModality[] | null;
  branches: IBranch[] | null;

  tournamentRegistrations: ITournamentRegistration[] | null;

  // Campo especial que no viene aún, pero lo tenías antes
  posicionFinal: number | null;
  resultados: number;

  // Compatibilidad anterior
  categoria: string;
  modalidad: string;
  date: string;
}
