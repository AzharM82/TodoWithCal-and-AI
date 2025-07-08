import React, { useState } from 'react';
import { Paper, Typography, Button, CircularProgress, Box, TextField } from '@mui/material';

export default function MotivationSection() {


  const [quote, setQuote] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // TODO: Replace with your actual OpenAI API key
  const apiKey = ***REMOVED***;

  const fetchMotivation = async () => {
    setLoading(true);
    setError('');
    setQuote('');
    setExplanation('');
    try {
      const prompt = `**"Create a personalized motivation catalyst for me right now. I want a powerful, lesser-known quote that hits different from the usual clichés, paired with a specific, actionable strategy I can implement within the next 30 minutes.
Format your response EXACTLY like this:
🔥 QUOTE:
[Your powerful quote here]
💡 WHY THIS MATTERS TODAY:
[2-3 sentences explaining why this quote is relevant right now]
⚡ YOUR 30-MINUTE ACTION PLAN:
[Specific steps I can take in the next 30 minutes]
🎯 SUCCESS MARKER:
[How I'll know this worked]
Make it feel like you're my personal coach who actually gets what I'm going through. Keep each section concise but impactful - I want to read this and immediately feel ready to take action."**
Key structural improvements:

Clear visual hierarchy: Emojis and headers create scannable sections
Exact formatting instructions: "Format your response EXACTLY like this"
Defined section lengths: "2-3 sentences," "concise but impactful"
Action-oriented sections: Each part has a specific purpose
Success tracking: Built-in way to measure effectiveness
Plain text friendly: Uses simple characters that display consistently`;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 350,
          temperature: 0.7
        })
      });
      if (!response.ok) throw new Error('API error: ' + response.status);
      const data = await response.json();
      // The response should be in the form: "Quote" — Explanation.
      const text = data.choices?.[0]?.message?.content || '';
      const match = text.match(/^"([^"]+)"\s*[—-]\s*(.+)$/);
      if (match) {
        setQuote(match[1]);
        setExplanation(match[2]);
      } else {
        setQuote(text);
        setExplanation('');
      }
    } catch (err) {
      setError('Failed to fetch motivation: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Motivation for Today
      </Typography>
      <Button variant="outlined" onClick={fetchMotivation} disabled={loading} sx={{ mb: 2, alignSelf: 'flex-start' }}>
        {loading ? <CircularProgress size={20} /> : 'Get New Motivation'}
      </Button>
      {error && <Typography color="error" variant="body2" mb={2}>{error}</Typography>}
      {quote && (
        <Box mt={2}>
          <Typography variant="subtitle1" fontStyle="italic" gutterBottom>{quote}</Typography>
          {explanation && (() => {
            // Try to split explanation into sections based on headings in the prompt
            // Format: Quote → Why this matters today → Your 30-minute action plan
            const match = explanation.match(/Why this matters today[:\-]?\s*(.*?)(?:Your 30-minute action plan[:\-]?|$)(.*)/is);
            let why = '', plan = '';
            if (match) {
              why = match[1]?.trim();
              plan = match[2]?.replace(/^(Your 30-minute action plan[:\-]?)/i, '').trim();
            } else {
              // fallback: just show all as explanation
              why = explanation;
            }
            return <>
              {why && <>
                <Typography variant="subtitle2" mt={2}>Why this matters today</Typography>
                <Typography variant="body2" mb={1}>{why}</Typography>
              </>}
              {plan && <>
                <Typography variant="subtitle2" mt={2}>30-Minute Action Plan</Typography>
                <Typography variant="body2">{plan}</Typography>
              </>}
            </>;
          })()}
        </Box>
      )}
    </Paper>
  );
}
