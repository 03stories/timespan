import exifr from 'exifr';
import type { MediaItem } from './mediaTypes';

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
    const objectUrl = URL.createObjectURL(file);

    if (['jpg', 'jpeg', 'png'].includes(ext)) {
      try {
        const exif = await exifr.parse(file, { translateValues: false });
        const date = exif?.DateTimeOriginal ?? exif?.CreateDate;
        if (date) {
          items.push({
            name: file.name,
            path: file.name,
            type: 'photo',
            timestamp: new Date(date).getTime(),
            thumbnailUrl: objectUrl
          });
        } else {
          items.push({
            name: file.name,
            path: file.name,
            type: 'photo',
            timestamp: file.lastModified,
            thumbnailUrl: objectUrl
          });
        }
      } catch {
        items.push({
          name: file.name,
          path: file.name,
          type: 'photo',
          timestamp: file.lastModified,
          thumbnailUrl: objectUrl
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
      URL.revokeObjectURL(objectUrl);
    } else {
      URL.revokeObjectURL(objectUrl);
    }
  }

  return items.sort((a, b) => a.timestamp - b.timestamp);
}
