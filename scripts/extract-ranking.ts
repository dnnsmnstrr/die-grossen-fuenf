import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RSS_FEED_URL = 'https://festundflauschig.de/feed'; // Placeholder, replace with actual feed if different
const TEMP_DIR = path.join(process.cwd(), 'temp');

async function getLatestEpisodeUrl() {
  console.log('Fetching RSS feed...');
  const response = await axios.get(RSS_FEED_URL);
  const xml = response.data;
  
  // Simple regex to find the first enclosure url
  const match = xml.match(/<enclosure[^>]+url="([^"]+)"/);
  if (!match) throw new Error('No podcast episode found in RSS feed');
  
  return match[1];
}

async function downloadAndCompress(url: string) {
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);
  const inputPath = path.join(TEMP_DIR, 'episode.mp3');
  const outputPath = path.join(TEMP_DIR, 'episode_low.mp3');

  console.log('Downloading episode...');
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  const writer = fs.createWriteStream(inputPath);
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  console.log('Compressing with ffmpeg...');
  // Compress to 32kbps mono to fit in Whisper's 25MB limit or reduce cost/time
  execSync(`ffmpeg -i ${inputPath} -ar 16000 -ac 1 -map 0:a:0 -b:a 32k ${outputPath} -y`);
  
  return outputPath;
}

async function transcribe(filePath: string) {
  console.log('Transcribing with Whisper...');
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-1',
    language: 'de',
  });
  return transcription.text;
}

async function extractRankingFromText(text: string) {
  console.log('Extracting rankings with GPT-4o...');
  const prompt = `
    Das ist ein Transkript des Podcasts "Fest & Flauschig". 
    Extrahiere die "Die Großen Fünf" Rankings aus dem Text.
    Suche nach dem Moment, in dem Jan Böhmermann und Olli Schulz ihre Top 5 Listen zu einem bestimmten Thema vorstellen.
    
    Format der Ausgabe ist ein JSON Objekt mit folgendem Aufbau:
    {
      "Thema": "Name des Themas",
      "Folge": "Name der Folge",
      "Jahr": "2026",
      "Jan": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
      "Olli": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
      "GastName": "Name des Gastes (falls vorhanden)",
      "Gast": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"] (falls vorhanden)
    }
    Gibt nur das JSON Objekt zurück. Falls kein Ranking gefunden wurde, gib null zurück.
  `;

  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are an expert at analyzing podcast transcripts and extracting structured data.' },
      { role: 'user', content: prompt + '\\n\\nTranscript:\\n' + text }
    ],
    model: 'gpt-4o',
    response_format: { type: 'json_object' }
  });

  const content = completion.choices[0].message.content;
  if (!content) return null;
  return JSON.parse(content);
}

async function run() {
  try {
    const url = await getLatestEpisodeUrl();
    const compressedPath = await downloadAndCompress(url);
    const transcript = await transcribe(compressedPath);
    const newRanking = await extractRankingFromText(transcript);

    if (newRanking) {
      console.log('New ranking found:', newRanking.Thema);
      const rankingsPath = path.join(process.cwd(), 'src/data/rankings.ts');
      
      // Read existing rankings
      let currentFileContent = fs.readFileSync(rankingsPath, 'utf-8');
      // Simple injection: find the start of the array and insert
      const arrayStart = currentFileContent.indexOf('[');
      const updatedContent = currentFileContent.slice(0, arrayStart + 1) + 
        '\\n  ' + JSON.stringify(newRanking, null, 2) + ',' +
        currentFileContent.slice(arrayStart + 1);

      fs.writeFileSync(rankingsPath, updatedContent);
      console.log('Updated src/data/rankings.ts');
    } else {
      console.log('No ranking found in this episode.');
    }
  } catch (error) {
    console.error('Pipeline failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  }
}

run();
