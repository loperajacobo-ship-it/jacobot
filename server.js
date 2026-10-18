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

const systemPrompts = {
  General: 'Eres JACOBOT, un asistente de IA avanzado, claro y útil.',
  Matematicas: 'Eres un experto tutor de matemáticas. Explica las soluciones paso a paso, usando notación clara y detallando cada procedimiento.',
  Historia: 'Eres un historiador experto. Responde con precisión histórica, contexto claro y fechas destacadas de forma amena.',
  Idiomas: 'Eres un tutor de idiomas. Ayuda a traducir, corregir la gramática y practicar conversaciones en el idioma que el usuario prefiera.',
  Quiz: 'Eres un creador de cuestionarios interactivos. Genera preguntas con opciones múltiples (A, B, C, D) e indica las respuestas correctas al final o cuando el usuario responda.'
};

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, image, mode } = req.body;
    const modePrompt = systemPrompts[mode] || systemPrompts.General;

    let textPrompt = `${modePrompt}\n\nUsuario: ${prompt || 'Hola'}`;
    let contents = [textPrompt];

    if (image) {
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        contents = [
          {
            inlineData: {
              mimeType: matches[1],
              data: matches[2]
            }
          },
          textPrompt
        ];
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
  console.log(`Servidor JACOBOT corriendo en el puerto ${PORT}`);
});
