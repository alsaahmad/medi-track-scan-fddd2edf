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
    const { type, drugId, action, role, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch drug data
    const { data: drug } = await supabase
      .from('drugs')
      .select('*')
      .eq('id', drugId)
      .single();

    if (!drug) {
      return new Response(JSON.stringify({ 
        explanation: 'Unable to find drug information for verification.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch scan history
    const { data: scanLogs } = await supabase
      .from('scan_logs')
      .select('*')
      .eq('drug_id', drugId)
      .order('scan_time', { ascending: true });

    // Fetch alerts
    const { data: alerts } = await supabase
      .from('alerts')
      .select('*')
      .eq('drug_id', drugId);

    // Build context for AI
    const drugInfo = `
Drug: ${drug.drug_name}
Batch: ${drug.batch_number}
Status: ${drug.current_status}
Expiry Date: ${drug.expiry_date}
Scan Count: ${scanLogs?.length || 0}
Alerts: ${alerts?.length || 0}
`;

    const scanHistory = scanLogs?.map(s => 
      `${new Date(s.scan_time).toISOString()}: ${s.role} at ${s.location || 'Unknown'} - ${s.verification_result}`
    ).join('\n') || 'No scan history';

    let prompt = '';
    
    if (type === 'explain') {
      prompt = `You are a drug verification AI. Generate a brief, human-readable explanation (2-3 sentences max) for the following drug status update.

${drugInfo}

Recent Action: ${action || context}
Performed by: ${role || 'System'}

Previous Scan History:
${scanHistory}

Active Alerts: ${alerts?.map(a => a.description).join('; ') || 'None'}

Generate a clear, professional explanation of what this means for the drug's authenticity and supply chain tracking. Focus on being reassuring if the drug is legitimate, or alerting if there are concerns.`;
    } else if (type === 'verify') {
      prompt = `You are a drug verification AI. Analyze this drug's verification status and provide a brief assessment.

${drugInfo}

Scan History:
${scanHistory}

Alerts: ${alerts?.map(a => `${a.alert_type}: ${a.description}`).join('\n') || 'None'}

Provide a 2-3 sentence verification assessment. State clearly if the drug appears genuine, suspicious, or counterfeit, and briefly explain why.`;
    }

    console.log('Generating AI verification explanation');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are a pharmaceutical supply chain verification AI. Provide clear, concise explanations about drug authenticity. Keep responses brief and professional.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      console.error('AI gateway error:', response.status);
      // Return a default explanation if AI fails
      return new Response(JSON.stringify({ 
        explanation: `Drug ${drug.drug_name} (Batch: ${drug.batch_number}) status updated to ${drug.current_status}. The supply chain record has been updated accordingly.` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content || 
      `Drug verification completed for ${drug.drug_name}. Current status: ${drug.current_status}.`;

    console.log('AI explanation generated successfully');

    return new Response(JSON.stringify({ explanation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-verification function:', error);
    return new Response(JSON.stringify({ 
      explanation: 'Verification recorded. AI explanation temporarily unavailable.' 
    }), {
      status: 200, // Return 200 with fallback to not break the flow
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
