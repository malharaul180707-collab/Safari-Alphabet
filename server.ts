import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: AI-Powered Camera & Drawing Recognition for Kids
app.post('/api/analyze-drawing', async (req, res) => {
  try {
    const { imageBase64, targetLetter, targetWord, mode, grade } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 data' });
    }

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const isFreeMode = mode === 'free' || (!targetLetter && !targetWord);
    const expectedLetter = targetLetter ? targetLetter.toUpperCase().trim() : null;
    const expectedWord = targetWord ? targetWord.toUpperCase().trim() : null;

    const targetDescription = expectedLetter
      ? `CRITICAL GOAL: The student was asked specifically to draw the letter "${expectedLetter}".`
      : expectedWord
      ? `CRITICAL GOAL: The student was asked specifically to write or draw the word "${expectedWord}".`
      : 'The student drew freely on paper or screen with no specific target letter.';

    const prompt = `You are a perceptive, encouraging elementary phonics and handwriting teacher evaluating a young child's (ages 4-7) drawing or handwritten stroke of an English alphabet letter or word.

${targetDescription}
Child's grade: ${grade || 'KG1-G2'}.

TASK:
1. Examine the image carefully. Identify which English letter (A-Z) or word the child actually drew or wrote.
   - Example: If the drawing has a single open curve like a crescent or arc, it is "C", NOT "B".
   - Example: If the drawing has a vertical line and two closed rounded loops, it is "B".
   - Example: If the drawing has two diagonal slanted lines with a horizontal crossbar, it is "A".
   - If the drawing is unclear or random scribbles with no identifiable letter shape, set detectedText to "" and isLetterOrWord to false.

2. TARGET MATCHING (CRITICAL):
   ${
     expectedLetter
       ? `- The expected letter is "${expectedLetter}".
   - If the child drew a DIFFERENT letter (e.g., they drew "C" or "O" when the goal was "${expectedLetter}"), you MUST set "matchesTarget": false and "starsAwarded": 0.
   - DO NOT award stars or say it matches if they drew the wrong letter!
   - Set "shapeQuality" to "wrong_letter" if a different letter was drawn, or "needs_practice" if unformed scribbles.
   - In "encouragement", kindly and warmly explain what letter was detected vs what was requested (e.g., "You drew a lovely letter C! But our mission is letter ${expectedLetter}. Let's try drawing ${expectedLetter} together!").
   - In "strokeTips", clearly describe the geometric shapes needed for letter "${expectedLetter}" (e.g., straight lines, curves, circles, bumps).
   - ONLY if the drawing actually depicts "${expectedLetter}" (uppercase or lowercase), set "matchesTarget": true and award 2 or 3 stars.`
       : expectedWord
       ? `- The expected word is "${expectedWord}".
   - If the word does not match "${expectedWord}", set "matchesTarget": false and "starsAwarded": 0.
   - If it matches "${expectedWord}", set "matchesTarget": true and award 2 or 3 stars.`
       : `- Free draw mode: Identify whatever letter or word was drawn. Set "matchesTarget": true if any English letter or word is recognizable, and award 2 or 3 stars.`
   }

3. Return the evaluation in the required JSON schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedText: {
              type: Type.STRING,
              description: 'The uppercase letter or word detected, or empty string if unrecognizable',
            },
            isLetterOrWord: {
              type: Type.BOOLEAN,
              description: 'True if a recognizable English letter or word was identified',
            },
            matchesTarget: {
              type: Type.BOOLEAN,
              description: 'True ONLY if it matches the target letter/word, false otherwise',
            },
            shapeQuality: {
              type: Type.STRING,
              description: 'superstar, great_try, wrong_letter, or needs_practice',
            },
            encouragement: {
              type: Type.STRING,
              description: 'A gentle, cheerful 1-2 sentence teacher voice message',
            },
            strokeTips: {
              type: Type.STRING,
              description: 'Step-by-step shape breakdown (e.g. 1 straight line down, 2 round bumps)',
            },
            starsAwarded: {
              type: Type.INTEGER,
              description: '0 if wrong letter or unrecognizable, 2 if recognizable, 3 if well-drawn',
            },
            xpAwarded: {
              type: Type.INTEGER,
              description: 'XP points earned (0 to 60)',
            },
            funReactionEmoji: {
              type: Type.STRING,
              description: 'A single reaction emoji like 🌟, ✏️, 🤔, 🎨, 🦁',
            },
          },
          required: [
            'detectedText',
            'isLetterOrWord',
            'matchesTarget',
            'shapeQuality',
            'encouragement',
            'strokeTips',
            'starsAwarded',
            'xpAwarded',
          ],
        },
      },
    });

    const resultText = response.text || '{}';
    const parsed = JSON.parse(resultText);

    // Additional server-side validation to guarantee no accidental mismatch reward
    if (expectedLetter && parsed.detectedText) {
      const detectedUpper = parsed.detectedText.toUpperCase().trim();
      if (detectedUpper !== expectedLetter && detectedUpper.length === 1 && expectedLetter.length === 1) {
        parsed.matchesTarget = false;
        parsed.starsAwarded = 0;
        parsed.shapeQuality = 'wrong_letter';
        parsed.encouragement = `You drew the letter "${detectedUpper}"! That is a great "${detectedUpper}", but our mission is letter "${expectedLetter}". Let's try "${expectedLetter}"!`;
      }
    }

    return res.json({
      success: true,
      analysis: parsed,
    });
  } catch (error: unknown) {
    console.error('Error analyzing drawing:', error);
    // On unexpected server error, do NOT award false matches
    const exp = req.body.targetLetter || req.body.targetWord || 'A';
    return res.json({
      success: true,
      analysis: {
        detectedText: '',
        isLetterOrWord: false,
        matchesTarget: false,
        shapeQuality: 'needs_practice',
        encouragement: `Let's try drawing letter ${exp} once more! Make sure your drawing is in bright lighting.`,
        strokeTips: `To draw ${exp}: make clean, bold lines so the magic camera can see your shape!`,
        starsAwarded: 0,
        xpAwarded: 10,
        funReactionEmoji: '✏️',
      },
    });
  }
});

// Setup Vite in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Alphabet Safari server running on http://localhost:${PORT}`);
  });
}

startServer();
