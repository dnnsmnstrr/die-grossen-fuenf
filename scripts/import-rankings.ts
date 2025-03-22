import { rankings } from '../src/data/rankings';
import { supabase } from '../src/lib/supabase';

async function importRankings() {
  console.log('Starting rankings import...');
  
  for (const ranking of rankings) {
    try {
      const { error } = await supabase
        .from('podcast_rankings')
        .insert({
          topic: ranking.Thema,
          episode: ranking.Folge,
          year: parseInt(ranking.Jahr),
          jan_items: ranking.Jan,
          olli_items: ranking.Olli,
          guest_name: ranking.GastName || null,
          guest_items: ranking.Gast || null
        });

      if (error) {
        if (error.code === '23505') { // Unique violation
          console.log(`Skipping duplicate ranking: ${ranking.Thema}`);
        } else {
          console.error(`Error importing ranking ${ranking.Thema}:`, error);
        }
      } else {
        console.log(`Imported ranking: ${ranking.Thema}`);
      }
    } catch (error) {
      console.error(`Failed to import ranking ${ranking.Thema}:`, error);
    }
  }
  
  console.log('Import completed');
}

importRankings();