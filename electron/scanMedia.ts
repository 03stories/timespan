import fs from 'fs/promises';
import path from 'path';
import exifr from 'exifr';
import ffprobe from '@ffprobe-installer/ffprobe';
import { execFile } from 'child_process';

export interface MediaItem {
  name: string;
  path: string;
  type: 'photo' | 'video';
  timestamp: number;
  end?: number;
}

async function getVideoDuration(file: string): Promise<number> {
  return new Promise((resolve) => {
    execFile(ffprobe.path, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file], (err, stdout) => {
      if (err) return resolve(0);
      resolve(parseFloat(stdout) * 1000);
    });
  });
}

export async function scanMedia(dir: string): Promise<MediaItem[]> {
  const files = await fs.readdir(dir);
  const items: MediaItem[] = [];
  for (const file of files) {
    const full = path.join(dir, file);
    const stat = await fs.stat(full);
    if (!stat.isFile()) continue;
    const ext = path.extname(file).toLowerCase();
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      try {
        const exif = await exifr.parse(full, { translateValues: false });
        const date = exif?.DateTimeOriginal ?? exif?.CreateDate;
        if (date) {
          items.push({ name: file, path: full, type: 'photo', timestamp: new Date(date).getTime() });
        }
      } catch {
        // ignore
      }
    } else if (['.mp4', '.mov', '.avi'].includes(ext)) {
      const start = stat.birthtime.getTime();
      const duration = await getVideoDuration(full);
      items.push({ name: file, path: full, type: 'video', timestamp: start, end: start + duration });
    }
  }
  return items.sort((a, b) => a.timestamp - b.timestamp);
}
