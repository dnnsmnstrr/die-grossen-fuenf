import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import axios from 'axios';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TEMP_DIR = path.join(process.cwd(), 'temp');

/**
 * Downloads a file from a URL.
 */
async function downloadFile(url: string, outputPath: string) {
  console.log(`Downloading episode from ${url}...`);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

/**
 * Compresses audio to 32kbps mono for Whisper.
 */
async function compressAudio(inputPath: string): Promise<string> {
  const outputPath = path.join(TEMP_DIR, 'episode_compressed.mp3');
  console.log('Compressing with ffmpeg...');
  // Compress to 32kbps mono to fit in Whisper's 25MB limit and improve speed
  execSync(`ffmpeg -i "${inputPath}" -ar 16000 -ac 1 -map 0:a:0 -b:a 32k "${outputPath}" -y`);
  return outputPath;
}

/**
 * Transcribes audio file using OpenAI Whisper.
 */
async function transcribe(filePath: string) {
  console.log('Transcribing with Whisper...');
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-1',
    language: 'de',
  });
  return transcription.text;
}

/**
 * Extracts Ranking JSON from transcript using GPT-4o.
 */
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
  const source = process.argv[2];

  if (!source) {
    console.error('Usage: tsx scripts/extract-ranking.ts <URL_OR_FILE_PATH>');
    process.exit(1);
  }

  try {
    if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

    let audioPath = source;

    // Check if source is a URL or a local file
    if (source.startsWith('http')) {
      audioPath = path.join(TEMP_DIR, 'episode_downloaded.mp3');
      await downloadFile(source, audioPath);
    } else if (!fs.existsSync(audioPath)) {
      throw new Error(`Local file not found: ${audioPath}`);
    }

    const compressedPath = await compressAudio(audioPath);
    const transcript = await transcribe(compressedPath);
    const newRanking = await extractRankingFromText(transcript);

    if (newRanking) {
      console.log('New ranking found:', newRanking.Thema);
      const rankingsPath = path.join(process.cwd(), 'src/data/rankings.ts');
      
      let currentFileContent = fs.readFileSync(rankingsPath, 'utf-8');
      const arrayStart = currentFileContent.indexOf('[');
      const updatedContent = currentFileContent.slice(0, arrayStart + 1) + 
        '\\n  ' + JSON.stringify(newRanking, null, 2) + ',' +
        currentFileContent.slice(arrayStart + 1);

      fs.writeFileSync(rankingsPath, updatedContent);
      console.log('Successfully updated src/data/rankings.ts');
    } else {
      console.log('No ranking found in this episode.');
    }
  } catch (error) {
    console.error('Pipeline failed:', error);
    process.exit(1);
  } finally {
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  }
}

run();
