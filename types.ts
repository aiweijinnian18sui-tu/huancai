
export interface ImageState {
  original: string | null;
  edited: string | null;
  mimeType: string | null;
}

export interface HistoryItem {
  id: string;
  original: string;
  edited: string;
  prompt: string;
  timestamp: number;
}
