import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, image } = req.body;
    const contents = [];

    if (image) {
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        contents.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    }

    contents.push(prompt || 'Hola');

    // Nombre de modelo compatible con la librería actual
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: contents
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Error en API:', error);
    res.status(500).json({ error: 'Error procesando tu solicitud.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`JACOBOT servidor activo en puerto ${PORT}`);
});
