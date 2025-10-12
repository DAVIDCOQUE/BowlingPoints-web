import { IAmbit } from './ambit.interface';
import { ICategory } from './category.interface';
import { IModality } from './modality.interface';
import { ITeam } from './team.interface';
export interface ITournament {
  tournamentId: number;
  tournamentName: string;
  ambit?: IAmbit;
  startDate?: Date;
  endDate?: Date;
  status?: boolean;
  location?: string;
  imageUrl?: string;
  organizer?: string;
  stage?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  categories?: ICategory[];
  modalities?: IModality[];
  teams?: ITeam[];
}
