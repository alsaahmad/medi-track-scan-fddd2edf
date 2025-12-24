import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, history } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client for fetching context data
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build context from database if drugId provided
    let drugContext = '';
    if (context?.drugId) {
      const { data: drug } = await supabase
        .from('drugs')
        .select('*')
        .eq('id', context.drugId)
        .single();
      
      if (drug) {
        const { data: scanLogs } = await supabase
          .from('scan_logs')
          .select('*')
          .eq('drug_id', drug.id)
          .order('scan_time', { ascending: true });

        const { data: alerts } = await supabase
          .from('alerts')
          .select('*')
          .eq('drug_id', drug.id);

        drugContext = `
Current Drug Information:
- Name: ${drug.drug_name}
- Batch: ${drug.batch_number}
- Status: ${drug.current_status}
- Expiry: ${drug.expiry_date}

Scan History:
${scanLogs?.map(s => `- ${new Date(s.scan_time).toLocaleString()}: ${s.role} - ${s.verification_result} at ${s.location || 'Unknown location'}`).join('\n') || 'No scans recorded'}

Alerts:
${alerts?.map(a => `- ${a.alert_type}: ${a.description}`).join('\n') || 'No alerts'}
`;
      }
    }

    const systemPrompt = `You are MediTrack AI Assistant, an expert in pharmaceutical supply chain verification and drug authenticity. 
You help consumers, pharmacies, and regulators understand drug verification results and supply chain tracking.

Your capabilities:
1. Explain why a drug is marked as genuine, suspicious, or counterfeit
2. Help understand alerts and warnings
3. Guide users through compliance steps
4. Answer questions about the drug supply chain
5. Provide insights into verification results

Always be helpful, clear, and concise. If discussing a specific drug, use the provided context.
If you don't have enough information, say so clearly.

${drugContext}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Sending request to Lovable AI Gateway');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.',
          response: 'I apologize, but I\'m currently experiencing high demand. Please try again in a few moments.'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Payment required.',
          response: 'AI service is temporarily unavailable. Please try again later.'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'I could not generate a response.';

    console.log('AI response received successfully');

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      response: 'I apologize, but I encountered an error. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
