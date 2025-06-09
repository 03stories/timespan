import React, { useState } from 'react';
import { Timeline } from './Timeline';
import { scanMedia, MediaItem } from '../electron/scanMedia';
import { scanMediaBrowser } from '../electron/scanMedia';

declare global {
  interface Window {
    electronAPI?: {
      pickDirectory(): Promise<MediaItem[]>;
    };
  }
}

export default function App() {
  const [items, setItems] = useState<MediaItem[]>([]);

  const handlePick = async () => {
    if (window.electronAPI) {
      const list = await window.electronAPI.pickDirectory();
      setItems(list);
    } else {
      // Browser mode - show file picker
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = '.jpg,.jpeg,.png,.mp4,.mov,.avi';
      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          const result = await scanMediaBrowser(files);
          setItems(result);
        }
      };
      input.click();
    }
  };

  return (
    <div>
      <h1>Timespan</h1>
      <button onClick={handlePick}>Pick Directory</button>
      <Timeline items={items} />
    </div>
  );
}