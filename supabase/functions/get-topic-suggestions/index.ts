// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// import { serve } from "https://deno.land/std/http/server.ts";
// const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
// const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  const { input } = await req.json();
  
  // Call OpenAI API for topic suggestions
  const response = await fetch("https://api.openai.com/v1/engines/davinci/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Deno.env.get("VITE_OPENAI_KEY")}`,
    },
    body: JSON.stringify({
      prompt: `Suggest topics based on: ${input}`,
      max_tokens: 50,
    }),
  });
  
  const data = await response.json();
  const suggestions = data.choices && data.choices[0].text.trim().split("\n") || [];
  
  // Save suggestions to the database
  // const { error } = await supabase
  //   .from("topic_suggestions")
  //   .insert(suggestions.map(suggestion => ({ suggestion })));
  
  // if (error) {
  //   return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  // }
  
  return new Response(JSON.stringify({ suggestions }), { status: 200 });
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-topic-suggestions' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
