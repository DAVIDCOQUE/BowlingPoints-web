import { ICategory } from "./category.interface";
import { IModality } from "./modality.interface";

export interface ITournament {
  tournamentId: number;
  name: string;
  organizer: string;
  imageUrl: string;

  modalities: IModality[];
  categories: ICategory[];

  modalityIds: number[];
  modalityNames?: string[];

  categoryIds?: number[];
  categoryNames?: string[];

  lugar: string;
  startDate: string;
  endDate: string;
  ambitId: number;
  ambitName: string;
  location: string;
  stage: string;
  status: boolean;
}
