import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Inicialización de la API de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompts = {
  General: 'Eres JACOBOT, un asistente de IA avanzado, claro y útil.',
  Matematicas: 'Eres un experto tutor de matemáticas. Explica las soluciones paso a paso, usando notación clara.',
  Historia: 'Eres un historiador experto. Responde con precisión histórica, contexto claro y fechas destacadas.',
  Idiomas: 'Eres un tutor de idiomas. Ayuda a traducir, corregir la gramática y practicar conversaciones.',
  Quiz: 'Eres un creador de cuestionarios interactivos. Genera preguntas con opciones múltiples (A, B, C, D).'
};

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, image, mode } = req.body;
    const modePrompt = systemPrompts[mode] || systemPrompts.General;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const contents = [];

    // Verificación segura de la imagen
    if (image && typeof image === 'string' && image.includes('base64,')) {
      const parts = image.split('base64,');
      if (parts.length === 2) {
        const mimeMatch = parts[0].match(/data:(.*);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        
        contents.push({
          inlineData: {
            mimeType: mimeType,
            data: parts[1]
          }
        });
      }
    }

    const userText = `${modePrompt}\n\nUsuario: ${prompt || 'Hola'}`;
    contents.push(userText);

    const result = await model.generateContent(contents);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (error) {
    console.error('Error detallado en API:', error);
    res.status(500).json({ error: 'Error procesando tu solicitud.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor JACOBOT corriendo en el puerto ${PORT}`);
});
