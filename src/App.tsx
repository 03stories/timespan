import React, { useState } from 'react';
import { Timeline } from './Timeline';
import { scanMedia, MediaItem } from '../electron/scanMedia';

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
      const dir = prompt('Enter path to directory');
      if (!dir) return;
      const result = await scanMedia(dir);
      setItems(result);
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
