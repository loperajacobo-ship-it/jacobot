<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JACOBOT - Asistente IA</title>
    <link rel="manifest" href="/manifest.json">
    <style>
        :root {
            --bg-color: #05050a;
            --panel-color: #0b0f19;
            --accent-color: #00f0ff;
            --text-color: #e0fbfc;
            --border-color: #1e293b;
            --user-bg: #1e293b;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background-color: var(--bg-color); color: var(--text-color); display: flex; height: 100vh; overflow: hidden; }
        
        /* Sidebar de Opciones / Historial */
        sidebar { width: 260px; background-color: var(--panel-color); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; padding: 20px; gap: 15px; }
        .logo-area { font-size: 1.1rem; color: var(--accent-color); font-weight: bold; letter-spacing: 2px; text-shadow: 0 0 10px rgba(0,240,255,0.4); margin-bottom: 10px; }
        .menu-btn { background: #111827; color: var(--text-color); border: 1px solid var(--border-color); padding: 10px 15px; border-radius: 8px; cursor: pointer; text-align: left; transition: 0.2s; font-size: 0.9rem; }
        .menu-btn:hover { border-color: var(--accent-color); background: #1f2937; }

        /* Panel Principal de Chat */
        .main-chat { flex: 1; display: flex; flex-direction: column; height: 100vh; }
        header { background-color: var(--panel-color); border-bottom: 1px solid var(--border-color); padding: 15px 20px; display: flex; align-items: center; justify-content: space-between; }
        #chat-container { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
        .message { max-width: 75%; padding: 12px 16px; border-radius: 12px; line-height: 1.5; word-wrap: break-word; }
        .user { background-color: var(--user-bg); align-self: flex-end; border: 1px solid #334155; }
        .bot { background-color: var(--panel-color); align-self: flex-start; border: 1px solid var(--accent-color); box-shadow: 0 0 10px rgba(0,240,255,0.1); }
        
        /* Área de escritura */
        .input-area { background-color: var(--panel-color); border-top: 1px solid var(--border-color); padding: 15px; display: flex; gap: 10px; align-items: center; position: relative; }
        input[type="text"] { flex: 1; background-color: #05050a; border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; color: var(--text-color); outline: none; font-size: 1rem; }
        input[type="text"]:focus { border-color: var(--accent-color); box-shadow: 0 0 5px rgba(0,240,255,0.3); }
        button.send-btn { background-color: var(--accent-color); color: #000; border: none; border-radius: 8px; padding: 12px 20px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        button.send-btn:hover { opacity: 0.9; box-shadow: 0 0 10px var(--accent-color); }
        .icon-btn { background: #111827; color: var(--accent-color); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; cursor: pointer; font-size: 1rem; transition: 0.2s; }
        .icon-btn:hover { border-color: var(--accent-color); background: #1f2937; }
        
        #image-preview { position: absolute; bottom: 75px; left: 15px; max-height: 60px; border-radius: 6px; border: 1px solid var(--accent-color); display: none; background: #000; }
    </style>
</head>
<body>
    <sidebar>
        <div class="logo-area">⚡ JACOBOT v1.0</div>
        <button class="menu-btn" onclick="clearChat()">🗑️ Nuevo Chat</button>
        <button class="menu-btn" onclick="alert('Modo: Asistente IA Gemini Activo')">⚙️ Configuración</button>
        <div style="margin-top: auto; font-size: 0.75rem; color: #64748b;">Sistema Protegido & Seguro</div>
    </sidebar>

    <div class="main-chat">
        <header>
            <span style="color: var(--accent-color); font-weight: 600;">EN LÍNEA</span>
            <span style="font-size: 0.85rem; color: #94a3b8;">Gemini AI Core</span>
        </header>

        <div id="chat-container">
            <div class="message bot">Hola Jacobo. Soy JACOBOT. ¿Qué proyecto o consulta abordaremos hoy?</div>
        </div>

        <div class="input-area">
            <input type="file" id="image-input" accept="image/*" style="display:none">
            <button class="icon-btn" onclick="document.getElementById('image-input').click()" title="Adjuntar Imagen">📷</button>
            <img id="image-preview" alt="Preview">
            <input type="text" id="prompt-input" placeholder="Escribe un mensaje o comando a JACOBOT..." onkeypress="if(event.key === 'Enter') sendMessage()">
            <button class="send-btn" onclick="sendMessage()">Enviar</button>
        </div>
    </div>

    <script>
        let base64Image = null;
        document.getElementById('image-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (uploadEvent) => {
                    base64Image = uploadEvent.target.result;
                    const preview = document.getElementById('image-preview');
                    preview.src = base64Image;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });

        function clearChat() {
            document.getElementById('chat-container').innerHTML = `<div class="message bot">Chat reiniciado. ¿En qué te ayudo?</div>`;
        }

        async function sendMessage() {
            const input = document.getElementById('prompt-input');
            const container = document.getElementById('chat-container');
            const prompt = input.value.trim();
            if (!prompt && !base64Image) return;

            let userHtml = `<div class="message user">`;
            if (base64Image) userHtml += `<img src="${base64Image}" style="max-width:150px; display:block; margin-bottom:5px; border-radius:4px;">`;
            userHtml += `${prompt || 'Imagen adjunta'}</div>`;
            container.innerHTML += userHtml;

            const currentPrompt = prompt;
            const currentImage = base64Image;

            input.value = '';
            base64Image = null;
            document.getElementById('image-preview').style.display = 'none';
            container.scrollTop = container.scrollHeight;

            const loadingId = 'loading-' + Date.now();
            container.innerHTML += `<div class="message bot" id="${loadingId}">Procesando con Gemini...</div>`;

            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: currentPrompt, image: currentImage })
                });
                const data = await res.json();
                document.getElementById(loadingId).remove();
                container.innerHTML += `<div class="message bot">${data.reply || data.error}</div>`;
            } catch (err) {
                document.getElementById(loadingId).remove();
                container.innerHTML += `<div class="message bot">Error de conexión con el servidor.</div>`;
            }
            container.scrollTop = container.scrollHeight;
        }
    </script>
</body>
</html>
