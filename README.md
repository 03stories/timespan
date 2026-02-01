# Timespan (WIP!)

This project renders an interactive timeline of photos and videos. It now uses **React**, **TypeScript** and **Vite** with **D3.js**. Media is scanned locally through Node.js/Electron. Video metadata relies on `@ffprobe-installer/ffprobe`.

## Setup

1. Install dependencies

```bash
npm install
```

2. Start the development server

```bash
npm run dev
```

3. To launch the Electron app

```bash
npm run electron
```

## Usage

- When the app starts, click **Pick Directory**. You can either select a folder through the Electron dialog or enter a path manually in the browser.
- The app scans for image and video files, extracts timestamps (EXIF for photos and creation time/duration for videos) and shows them on a timeline. Photos appear as points and videos as bars spanning their duration. Hover a point/bar to see filename and timestamps. Use your trackpad or mouse wheel to zoom and pan.

## Testing

Run unit and UI tests with

```bash
npm test
```
