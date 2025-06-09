import exifr from 'exifr';

export interface MediaItem {
  name: string;
  path: string;
  type: 'photo' | 'video';
  timestamp: number;
  end?: number;
}

async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration * 1000);
    };
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(0);
    };
    video.src = URL.createObjectURL(file);
  });
}

export async function scanMediaBrowser(files: FileList): Promise<MediaItem[]> {
  const items: MediaItem[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png'].includes(ext)) {
      try {
        const exif = await exifr.parse(file, { translateValues: false });
        const date = exif?.DateTimeOriginal ?? exif?.CreateDate;
        if (date) {
          items.push({
            name: file.name,
            path: file.name, // In browser we don't have full paths
            type: 'photo',
            timestamp: new Date(date).getTime()
          });
        } else {
          // Fallback to file's last modified time if no EXIF data
          items.push({
            name: file.name,
            path: file.name,
            type: 'photo',
            timestamp: file.lastModified
          });
        }
      } catch {
        // Fallback to file's last modified time if exifr fails
        items.push({
          name: file.name,
          path: file.name,
          type: 'photo',
          timestamp: file.lastModified
        });
      }
    } else if (['mp4', 'mov', 'avi'].includes(ext)) {
      const start = file.lastModified;
      const duration = await getVideoDuration(file);
      items.push({
        name: file.name,
        path: file.name,
        type: 'video',
        timestamp: start,
        end: start + duration
      });
    }
  }
  
  return items.sort((a, b) => a.timestamp - b.timestamp);
}