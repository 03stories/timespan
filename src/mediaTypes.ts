export interface MediaItem {
  name: string;
  path: string;
  type: 'photo' | 'video';
  timestamp: number;
  end?: number;
  thumbnailUrl?: string;
}
