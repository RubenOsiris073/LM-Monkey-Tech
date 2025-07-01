export interface SavedModel {
  id?: string;
  name: string;
  createdAt: string;
  size: string;
  accuracy?: number;
  classes?: string[];
}
