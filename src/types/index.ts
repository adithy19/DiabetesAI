export interface DatasetRow {
  [key: string]: string | number;
}

export interface Dataset {
  data: DatasetRow[];
  columns: string[];
  filename: string;
  uploadedAt: Date;
}

export interface PredictionInput {
  [key: string]: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  predictions: PredictionHistory[];
}

export interface PredictionHistory {
  id: string;
  input: PredictionInput;
  result: number;
  risk: 'low' | 'high';
  timestamp: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}