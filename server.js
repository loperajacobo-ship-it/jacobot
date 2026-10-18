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
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
app.post('/api/chat', async (req, res) => {
  try {
    const { message, image } = req.body;
    let contents = message;
    if (image) {
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      contents = [{ inlineData: { data: base64Data, mimeType: mimeType } }, message || "Describe esta imagen."];
    }
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: { systemInstruction: "Eres JACOBOT, un asistente virtual avanzado e inteligente." }
    });
    res.json({ reply: response.text });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor de IA." });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor listo en el puerto ${PORT}`));
