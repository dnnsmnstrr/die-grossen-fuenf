import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import OpenAI from 'openai';
import { supabase } from '../lib/supabase';
const apiKey = import.meta.env.VITE_OPENAI_KEY;
const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
});

export default function CreateRanking() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [rankings, setRankings] = useState<string[]>(['', '', '', '', '']);
  const [saving, setSaving] = useState(false);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const completion = await openai.chat.completions.create({
        messages: [{
          role: "system",
          content: "Du bist ein Assistent, der hilft, interessante und lustige Themen für ein Podcast-Ranking-Segment namens 'Die Großen 5' zu generieren. Generiere kreative und unterhaltsame Themen auf Deutsch. Es sollten offene Fragestellungen sein, die nicht nur eindeutige Möglichkeiten oder Fakten hervorrufen. Halte dich kurz und prägnant, außer ein längerer Satz ist unbedingt notwendig um die Situation zu erklären. Lasse 'die großen 5' im Titel weg und formuliere es so, dass der Satz fortgeführt wird, ohne Bindestrich oder andere Zeichen. Es soll keine Frage sein, also so etwas wie (Die großen 5) 'Dinge, die man in seinem Leben mal gemacht haben sollte"
        }, {
          role: "user",
          content: "Generiere 3 interessante Themen für 'Die Großen 5' Rankings, mit einer Leerzeile zwischen jedem Vorschlag. Wenn die Eingabe sinnvoll oder relevant erscheint, sollten sich die Vorschläge daran orientieren. Nutzereingabe: " + topic
        }],
        model: "gpt-3.5-turbo",
      });

      const suggestedTopics = completion.choices[0].message.content
        ?.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, ''))
        .slice(0, 3) || [];

      setSuggestions(suggestedTopics);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRankingChange = (index: number, value: string) => {
    const newRankings = [...rankings];
    newRankings[index] = value;
    setRankings(newRankings);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === rankings.length - 1) {
        // On the last input field, submit if all fields are filled
        if (topic && rankings.every(r => r)) {
          handleSubmit();
        }
      } else {
        // Focus the next input field
        const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // const { data: { user } } = await supabase.auth.getUser();
      
      // if (!user) {
      //   alert('Bitte melde dich an, um dein Ranking zu speichern');
      //   return;
      // }
      let userId = window.localStorage.getItem('userId');
      if (!userId) {
        userId = crypto.randomUUID();
        window.localStorage.setItem('userId', userId);
      }
      const { error } = await supabase
        .from('user_rankings')
        .insert({
          topic,
          items: rankings,
          user_id: window.localStorage.getItem('userId')
        });

      if (error) throw error;
      
      navigate('/rankings');
    } catch (error) {
      console.error('Error saving ranking:', error);
      alert('Fehler beim Speichern des Rankings. Bitte versuche es erneut.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Eigenes Ranking erstellen</h2>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thema
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Gib ein Thema ein oder lass dir Vorschläge machen..."
              className="flex-1 px-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              onClick={generateSuggestions}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              <span className="ml-2">Vorschläge</span>
            </button>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Vorgeschlagene Themen:</h3>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setTopic(suggestion)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Dein Ranking:</h3>
          {rankings.map((item, index) => (
            <div key={index} className="flex items-center">
              <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold mr-3">
                {5 - index}
              </span>
              <input
                type="text"
                value={item}
                onChange={(e) => handleRankingChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                data-index={index}
                placeholder={`Platz ${5 - index}...`}
                className="flex-1 p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={saving || !topic || rankings.some(r => !r)}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Speichern...
              </>
            ) : (
              'Ranking speichern'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}