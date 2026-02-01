import React, { useEffect, useState } from 'react';
import { Timeline } from './Timeline';
import { scanMediaBrowser } from './scanMediaBrowser';
import type { MediaItem } from './mediaTypes';

declare global {
  interface Window {
    electronAPI?: {
      pickDirectory(): Promise<MediaItem[]>;
    };
  }
}

export default function App() {
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    return () => {
      for (const item of items) {
        if (item.thumbnailUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(item.thumbnailUrl);
        }
      }
    };
  }, [items]);

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
    <div className="app">
      <header className="header">
        <div className="title-block">
          <h1 className="title">Timespan</h1>
          <p className="subtitle">Scan a folder to map photos and videos onto a single timeline.</p>
        </div>
        <button className="primary" onClick={handlePick}>Pick Directory</button>
      </header>
      <section className="timeline-panel">
        <div className="timeline-wrap">
          <Timeline items={items} />
        </div>
      </section>
    </div>
  );
}
