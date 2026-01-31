import exifr from 'exifr';
import fs from 'fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

export interface MediaItem {
  name: string;
  path: string;
  type: 'photo' | 'video';
  timestamp: number;
  end?: number;
  thumbnailUrl?: string;
}

const execFileAsync = promisify(execFile);
const PHOTO_EXTS = new Set(['jpg', 'jpeg', 'png']);
const VIDEO_EXTS = new Set(['mp4', 'mov', 'avi']);

function getStatTimeMs(stats: { birthtimeMs?: number; mtimeMs?: number; birthtime?: Date }) {
  if (typeof stats.birthtimeMs === 'number') return stats.birthtimeMs;
  if (typeof stats.mtimeMs === 'number') return stats.mtimeMs;
  if (stats.birthtime instanceof Date) return stats.birthtime.getTime();
  return Date.now();
}

async function getVideoDurationMs(filePath: string): Promise<number> {
  const ffprobePath = ffprobeInstaller?.path;
  if (!ffprobePath) return 0;
  try {
    const { stdout } = await execFileAsync(ffprobePath, [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath
    ]);
    const seconds = Number.parseFloat(String(stdout).trim());
    return Number.isFinite(seconds) ? seconds * 1000 : 0;
  } catch {
    return 0;
  }
}

export async function scanMedia(dirPath: string): Promise<MediaItem[]> {
  const entries = await fs.readdir(dirPath);
  const items: MediaItem[] = [];

  for (const name of entries) {
    const ext = path.extname(name).slice(1).toLowerCase();
    if (!PHOTO_EXTS.has(ext) && !VIDEO_EXTS.has(ext)) continue;

    const fullPath = path.join(dirPath, name);
    let stats;
    try {
      stats = await fs.stat(fullPath);
    } catch {
      continue;
    }
    if (!stats.isFile()) continue;

    if (PHOTO_EXTS.has(ext)) {
      try {
        const exif = await exifr.parse(fullPath, { translateValues: false });
        const date = exif?.DateTimeOriginal ?? exif?.CreateDate;
        const timestamp = date ? new Date(date).getTime() : getStatTimeMs(stats);
        items.push({
          name,
          path: fullPath,
          type: 'photo',
          timestamp,
          thumbnailUrl: `file://${fullPath}`
        });
      } catch {
        items.push({
          name,
          path: fullPath,
          type: 'photo',
          timestamp: getStatTimeMs(stats),
          thumbnailUrl: `file://${fullPath}`
        });
      }
    } else {
      const start = getStatTimeMs(stats);
      const duration = await getVideoDurationMs(fullPath);
      items.push({
        name,
        path: fullPath,
        type: 'video',
        timestamp: start,
        end: start + duration
      });
    }
  }

  return items.sort((a, b) => a.timestamp - b.timestamp);
}
