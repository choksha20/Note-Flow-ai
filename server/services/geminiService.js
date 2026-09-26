import { GoogleGenAI, Type } from '@google/genai';
import { geminiResponseSchema } from '../validators/schemas.js';

const SYSTEM_PROMPT = `You are a precise notes-analysis engine. Given raw, unstructured text from a
meeting, email thread, or personal notes, extract:
1. A concise 2-3 sentence summary of what the text is about.
2. A list of key decisions that were made (empty array if none).
3. A list of concrete action items, each with a task description, an owner
   (if named in the text, otherwise null), a deadline (if mentioned, in
   YYYY-MM-DD format, otherwise null), and a priority (low, medium, or high,
   inferred from urgency language or default to medium).

Respond ONLY with valid JSON matching the exact schema provided. Do not
include markdown formatting, code fences, or any commentary outside the
JSON object.`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    decisions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    action_items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          task: { type: Type.STRING },
          owner: { type: Type.STRING, nullable: true },
          deadline: { type: Type.STRING, nullable: true },
          priority: { 
            type: Type.STRING,
            enum: ['low', 'medium', 'high']
          }
        },
        required: ['task', 'priority']
      }
    }
  },
  required: ['summary', 'decisions', 'action_items']
};

/**
 * Invokes Gemini API with full retry and Zod validation.
 * @param {string} rawText
 * @returns {Promise<{summary: string, decisions: string[], action_items: Array}>}
 */
export async function processNotesWithAI(rawText) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    console.warn('GEMINI_API_KEY is not configured. Utilizing local intelligent extraction fallback.');
    return generateLocalFallbackExtraction(rawText);
  }

  const ai = new GoogleGenAI({ apiKey });

  let attempt = 0;
  let lastError = null;

  while (attempt < 2) {
    attempt++;
    try {
      console.log(`Calling Gemini API (Attempt ${attempt}/2)...`);
      
      const prompt = attempt === 1
        ? `Analyze the following text and extract a summary, decisions, and action items as specified in your instructions.\n\nTEXT:\n"""\n${rawText}\n"""`
        : `CRITICAL STRICT RETRY: You must output ONLY a raw, unformatted valid JSON object matching the exact schema. No backticks, no markdown fence.\n\nTEXT:\n"""\n${rawText}\n"""`;

      // Timeout wrapper (20 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gemini API call timed out after 20 seconds')), 20000)
      );

      const apiCallPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
          temperature: 0.2
        }
      });

      const response = await Promise.race([apiCallPromise, timeoutPromise]);
      const jsonText = response.text;
      console.log('Received response from Gemini API.');

      let parsedJson;
      try {
        // Strip code block markers if any exist despite instructions
        const cleanedText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
        parsedJson = JSON.parse(cleanedText);
      } catch (parseErr) {
        throw new Error(`Invalid JSON output from Gemini: ${parseErr.message}`);
      }

      // Validate against Zod schema
      const validated = geminiResponseSchema.parse(parsedJson);
      return validated;

    } catch (err) {
      console.error(`Gemini processing attempt ${attempt} failed:`, err.message);
      lastError = err;
    }
  }

  // If both attempts fail, throw structured error
  throw new Error(`AI processing failed after 2 attempts: ${lastError ? lastError.message : 'Unknown error'}`);
}

/**
 * Fallback extraction logic when API key is not present or for offline testing
 */
function generateLocalFallbackExtraction(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Extract summary
  const firstSentences = rawText.replace(/\n/g, ' ').substring(0, 250).trim();
  const summary = lines.length > 0 
    ? `Overview of notes: ${firstSentences}${firstSentences.endsWith('.') ? '' : '...'}`
    : 'Summary unavailable for short note.';

  const decisions = [];
  const action_items = [];

  const todayStr = new Date().toISOString().split('T')[0];

  lines.forEach((line, index) => {
    const lower = line.toLowerCase();
    
    // Decisions identification
    if (lower.includes('decided') || lower.includes('agreed') || lower.includes('decision') || lower.includes('approved') || lower.startsWith('decision:')) {
      decisions.push(line.replace(/^(decision:|\*|-|\d+\.)\s*/i, ''));
    }
    
    // Action items identification
    if (
      lower.includes('todo') || lower.includes('action:') || lower.includes('assign') || 
      lower.includes('need to') || lower.includes('should') || lower.includes('will') || 
      lower.includes('deadline') || lower.startsWith('- [ ]') || lower.startsWith('* [ ]')
    ) {
      let priority = 'medium';
      if (lower.includes('urgent') || lower.includes('asap') || lower.includes('critical') || lower.includes('high priority')) {
        priority = 'high';
      } else if (lower.includes('low priority') || lower.includes('when possible') || lower.includes('eventually')) {
        priority = 'low';
      }

      // Infer owner
      let owner = null;
      const ownerMatch = line.match(/(?:assigned to|owner:|\bfor\b|\bby\b)\s+([A-Z][a-z]+)/i);
      if (ownerMatch) {
        owner = ownerMatch[1];
      }

      const task = line
        .replace(/^(-\s*\[\s*\]|\*\s*\[\s*\]|-|\*|\d+\.|\btodo:|\baction:)/i, '')
        .trim();

      if (task.length > 3) {
        action_items.push({
          task: task,
          owner: owner,
          deadline: lower.includes('today') || lower.includes('asap') ? todayStr : null,
          priority: priority
        });
      }
    }
  });

  // Default fallback if no specific keywords matched
  if (decisions.length === 0) {
    decisions.push('No formal decisions were explicitly marked in the raw notes.');
  }

  if (action_items.length === 0 && lines.length > 0) {
    action_items.push({
      task: `Review and follow up on: "${lines[0].substring(0, 60)}"`,
      owner: null,
      deadline: null,
      priority: 'medium'
    });
  }

  return {
    summary,
    decisions,
    action_items
  };
}
