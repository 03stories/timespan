import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs/promises';
import { scanMedia } from '../electron/scanMedia';

vi.mock('fs/promises', async () => {
  return {
    default: {
      readdir: vi.fn(async () => ['a.jpg', 'b.mp4']),
      stat: vi.fn(async () => ({ isFile: () => true, birthtime: new Date() })),
    }
  };
});

describe('scanMedia', () => {
  it('returns array', async () => {
    const items = await scanMedia('test');
    expect(Array.isArray(items)).toBe(true);
  });
});
