import { IAmbit } from './ambit.interface';
import { IBranch } from './branch.interface';
import { ICategory } from './category.interface';
import { IModality } from './modality.interface';
import { ITeam } from './team.interface';
import { ITournamentRegistration } from './tournament-registration.interface';
export interface ITournament {
  tournamentId: number;
  name: string;
  ambitName?: IAmbit;
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
  tournamentRegistrations?: ITournamentRegistration[];
  branches?: IBranch[];
  branchPlayerCounts?: IBranch[];
  teams?: ITeam[];
}
