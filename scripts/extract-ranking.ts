import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractRanking() {
  const url = 'https://www.festundflauschig.de/die-grossen-fuenf';
  console.log(`Fetching content from ${url}...`);

  try {
    const response = await fetch(url);
    const html = await response.text();

    const prompt = `
      Extract the latest "Die Großen Fünf" rankings from the following HTML content.
      Format the output as a JSON array of objects with the following structure:
      {
        "Thema": "Topic Name",
        "Folge": "Episode Name/Number",
        "Jahr": "YYYY",
        "Jan": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
        "Olli": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
        "GastName": "Name of Guest (optional)",
        "Gast": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"] (optional)
      }
      Only include the JSON array in your response.
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant that extracts structured data from HTML.' },
        { role: 'user', content: prompt + '\n\nHTML Content:\n' + html.substring(0, 15000) }
      ],
      model: 'gpt-4-turbo-preview',
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error('No content received from OpenAI');

    const data = JSON.parse(content);
    const rankings = data.rankings || data;

    const outputPath = path.join(process.cwd(), 'src/data/rankings.ts');
    const fileContent = `export const rankings = ${JSON.stringify(rankings, null, 2)};`;

    fs.writeFileSync(outputPath, fileContent);
    console.log(`Successfully updated rankings in ${outputPath}`);
  } catch (error) {
    console.error('Error extracting rankings:', error);
    process.exit(1);
  }
}

extractRanking();
