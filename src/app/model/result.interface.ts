import { ICategory } from './category.interface';
import { ITeam } from './team.interface';
import { ITournament } from './tournament.interface';
import { IModality } from './modality.interface';
import { IUser } from './user.interface';
export interface IResults {

  resultId: number;
  score: number;
  laneNumber?: number;
  lineNumber?: number;
  rama: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  category?: ICategory;
  person?: IUser;
  team?: ITeam;
  roundNumber: number;
  tournament?: ITournament;
  modality?: IModality;

}
