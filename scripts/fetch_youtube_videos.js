#!/usr/bin/env node
/**
 * Fetch latest YouTube uploads for a channel via the public RSS feed
 * (no API key required) and write public/videos/videos.json.
 *
 * Usage:
 *   YT_CHANNEL_ID=UCxxxxxxxxxxxxxxxxxxx node scripts/fetch_youtube_videos.js
 * Optional env:
 *   OUT=public/videos/videos.json   # output path
 *   MAX=12                          # number of videos
 *
 * How to find channel ID:
 *   - Open your channel page, View Source, search for "channelId"
 *   - Or go to studio.youtube.com/channel/CHANNEL_ID
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CHANNEL_ID = "UCqoyDZUv5sg0woJif9pQeLg";
const OUT = process.env.OUT || path.join(__dirname, '..', 'public', 'videos', 'videos.json');
const MAX = parseInt(process.env.MAX || '12', 10);


const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ottovintola-site/1.0)',
        'Accept': 'application/atom+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'identity',
      }
    }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Request failed. Status: ${res.statusCode}`));
          res.resume();
          return;
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      });
    req.on('error', reject);
    req.end();
  });
}

function parseEntries(xml) {
  // Extremely lightweight parse tailored to YouTube RSS structure
  const entries = [];
  const entryRegex = /<entry[\s\S]*?>([\s\S]*?)<\/entry>/gi;
  let match;
  let count = 0;
  while ((match = entryRegex.exec(xml))) {
    count += 1;
    const entryXml = match[1];
    if (count === 1) {
      console.log('ENTRY SAMPLE:\n' + entryXml.slice(0, 600));
    }

    const get = (tag, attr) => {
      if (attr) {
        const r = new RegExp(`<${tag}[^>]*?${attr}="([^"]+)"[^>]*?>`, 'i');
        const m = entryXml.match(r);
        return m ? m[1] : null;
      }
      const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i');
      if (count === 1 && (tag === 'id' || tag === 'title' || tag === 'published' || tag === 'yt:videoId')) {
        console.log('GET test', tag, r, 'MATCH?', r.test(entryXml));
      }
      const m = entryXml.match(r);
      return m ? m[1].trim() : null;
    };

    const idRaw = get('yt:videoId') || (get('id') || '').replace('yt:video:', '');
    const title = get('title');
    const publishedAt = get('published');
    const thumb = get('media:thumbnail', 'url');
    if (count === 1) {
      const rid = new RegExp(`<${'id'}[^>]*>([\\s\\S]*?)<\/${'id'}>`, 'i');
      const rtitle = new RegExp(`<${'title'}[^>]*>([\\s\\S]*?)<\/${'title'}>`, 'i');
      const idTest = /<id>([\s\S]*?)<\/id>/i.exec(entryXml);
      const titleTest = /<title>([\s\S]*?)<\/title>/i.exec(entryXml);
      const pubTest = /<published>([\s\S]*?)<\/published>/i.exec(entryXml);
      console.log('DEBUG fields:', {
        idFallback: get('id'), idRaw, title, publishedAt, thumb,
        idTest: idTest && idTest[1], titleTest: titleTest && titleTest[1], pubTest: pubTest && pubTest[1]
      });
      console.log('RID', rid, 'RID.test', rid.test(entryXml));
      console.log('RTITLE', rtitle, 'RTITLE.test', rtitle.test(entryXml));
    }

    if (idRaw && title) {
      entries.push({
        id: idRaw,
        title,
        publishedAt,
        thumbnail: thumb || `https://i.ytimg.com/vi/${idRaw}/hqdefault.jpg`,
      });
    }
  }
  console.log(`Parsed ${count} <entry> blocks, extracted ${entries.length} items`);
  return entries;
}

(async () => {
  try {
    const xml = await fetch(RSS_URL);
  console.log(`Fetched RSS ${xml ? xml.length : 0} chars`);
  console.log(xml.slice(0, 500));
  const hasEntry = xml.toLowerCase().includes('<entry');
  console.log(`Contains <entry>: ${hasEntry}`);
  const items = parseEntries(xml).slice(0, MAX);

    const outDir = path.dirname(OUT);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({ videos: items }, null, 2));
    console.log(`Wrote ${items.length} videos to ${OUT}`);
  } catch (err) {
    console.error('Failed to fetch or write videos:', err);
    process.exit(1);
  }
})();
