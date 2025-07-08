import React, { useState } from 'react';
import { Paper, Typography, Button, CircularProgress, Box } from '@mui/material';

export default function TradingQuotesSection({ apiKey, prompt }) {
  const [quote, setQuote] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchQuote = async () => {
    setLoading(true);
    setError('');
    setQuote('');
    setExplanation('');
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 120,
          temperature: 0.7
        })
      });
      if (!response.ok) throw new Error('API error: ' + response.status);
      const data = await response.json();
      // Try to split the response into quote and explanation using a simple double line break
      const text = data.choices?.[0]?.message?.content || '';
      const [q, ...rest] = text.split(/\n\n+/);
      setQuote(q.trim());
      setExplanation(rest.join('\n\n').trim());
    } catch (err) {
      setError('Failed to fetch trading quote: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Trading Quotes
      </Typography>
      <Button variant="outlined" onClick={fetchQuote} disabled={loading} sx={{ mb: 2, alignSelf: 'flex-start' }}>
        {loading ? <CircularProgress size={20} /> : 'Get Trading Quote'}
      </Button>
      {error && <Typography color="error" variant="body2" mb={2}>{error}</Typography>}
      {quote && (
        <Box mt={2}>
          <Typography variant="subtitle1" fontStyle="italic" gutterBottom>{quote}</Typography>
          {explanation && (() => {
            // Try to split explanation into sections based on headings in the trading prompt
            // Format: TRADING QUOTE → WHY THIS MATTERS IN TODAY'S MARKETS → YOUR 30-MINUTE MENTAL TRAINING → TRADING SUCCESS MARKER
            const match = explanation.match(/WHY THIS MATTERS IN TODAY'S MARKETS[:\-\n]*([\s\S]*?)(?:YOUR 30-MINUTE MENTAL TRAINING[:\-\n]*|$)([\s\S]*?)(?:TRADING SUCCESS MARKER[:\-\n]*|$)([\s\S]*)/i);
            let why = '', plan = '', marker = '';
            if (match) {
              why = match[1]?.trim();
              plan = match[2]?.trim();
              marker = match[3]?.trim();
            } else {
              // fallback: just show all as explanation
              why = explanation;
            }
            return <>
              {why && <>
                <Typography variant="subtitle2" mt={2}>Why this matters in today's markets</Typography>
                <Typography variant="body2" mb={1}>{why}</Typography>
              </>}
              {plan && <>
                <Typography variant="subtitle2" mt={2}>30-Minute Mental Training</Typography>
                <Typography variant="body2" mb={1}>{plan}</Typography>
              </>}
              {marker && <>
                <Typography variant="subtitle2" mt={2}>Trading Success Marker</Typography>
                <Typography variant="body2">{marker}</Typography>
              </>}
            </>;
          })()}
        </Box>
      )}
    </Paper>
  );
}
