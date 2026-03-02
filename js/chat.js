/**
 * chat.js — Interactive Portfolio Guide
 * A custom interactive assistant for navigating Ahmed Ameen's journey.
 */

// ─────────────────────────────────────────────
// ⚙️ CONFIGURATION
// ─────────────────────────────────────────────
const CHAT_CONFIG = {
    VERSION: '2.1',
    GROQ_API_KEY: 'gsk_YOUR_GROQ_API_KEY_HERE', // User should replace this
    GROQ_MODEL: 'llama-3.1-8b-instant',      // Newer, supported model
    HIGH_CONFIDENCE_THRESHOLD: 0.15,          // Adjusted for broader matching
    MODERATE_CONFIDENCE_THRESHOLD: 0.05,
    MAX_API_CALLS_PER_SESSION: 20,
};

// State for dynamic user key
let sessionUserApiKey = null;
let chatIsProcessing = false;

// ─────────────────────────────────────────────
const PORTFOLIO_DATA = {
    owner: 'Ahmed Ameen',
    email: 'ahmedkhaledyt2005@gmail.com',
    links: {
        github: 'https://github.com/ahmedkhaled00007',
        linkedin: 'https://www.linkedin.com/in/ahmed-ameen-003845303'
    },
    chunksEn: [],  // Cache for English chunks
    chunksAr: []   // Cache for Arabic chunks
};

// ─────────────────────────────────────────────
// 🗂️ STATE
// ─────────────────────────────────────────────
let apiCallCount = 0;
let chatHistory = []; // Persistent memory for the current session


// ─────────────────────────────────────────────
// 🤖 CORE ENGINE
// ─────────────────────────────────────────────
async function callGroqAPI(query, context, isArabic) {
    if (apiCallCount >= CHAT_CONFIG.MAX_API_CALLS_PER_SESSION && !sessionUserApiKey) {
        return "API_KEY_REQUIRED";
    }

    const currentKey = sessionUserApiKey || CHAT_CONFIG.GROQ_API_KEY;

    const contextSection = context
        ? `Knowledge Base Context:\n"${context}"\n\n`
        : '';

    const systemMessage = isArabic
        ? `### PERSONA
أنت "مساعد أحمد" — المرشد الشخصي لـ Portfolio بتاع أحمد أمين. بتحكي بالعامية المصرية الطبيعية، وبتكون ودود وخفيف ومباشر.

### قاعدة اللغة (إلزامية / MANDATORY)
- المستخدم بيكتب بالعربي → **يجب** أن ترد بالعامية المصرية الطبيعية فقط (زي ما بنتكلم في الحقيقة).
- ممنوع استخدام اللغة العربية الفصحى الجامدة (زي: يمتلك، يتطرق، يسعى).
- **هام**: لو المعلومات في الـ Context بالإنجليزي، ترجمها للعامية المصرية فوراً وبشكل طبيعي.
- المصطلحات التقنية (AI, ML, RAG, Python) ممكن تسيبها إنجليزي أو تكتبها بالعربي لو مألوفة (ذكاء اصطناعي، برمجة).
- **قاعدة التنسيق**: لو الرد فيه كلمات إنجليزي أو لينكات، حطها في سطر لوحدها بين سطرين فاضيين.
- **تنبيه**: اسم "أحمد" يتكتب صح بالهمزة أو من غيرها (أحمد / احمد)، بلاش "اهمد".
- **تنبيه تقني**: Intelligence يعني ذكاء، بلاش تترجمها "إنترنت".

### قاعدة الاسترجاع
- استخدم المعلومات من الـ Context المرفق فقط للإجابة عن أحمد أمين.
- لو المعلومة مش موجودة، قول بوضوح إنها مش متاحة.
- **هام جداً**: اذكر كل التفاصيل والمشاريع والشهادات الموجودة في الـ Context ولا تختصر المعلومات إذا طلب المستخدم قائمة.

### سياق Portfolio أحمد
${contextSection}`
        : `### PERSONA
You are "Ahmed's Assistant" — a professional, sophisticated, and friendly interactive guide for Ahmed Ameen's portfolio. 

### LANGUAGE RULE (STRICT ADHERENCE REQUIRED)
- The user is writing in English → You MUST respond in professional English.
- **CRITICAL**: Do NOT use Arabic in your response under any circumstances.
- **TRANSLATION RULE**: If the provided context is in Arabic, you MUST translate it into professional English for your response.
- Keep the tone helpful, direct, and polished.

### RETRIEVAL RULE
- Use ONLY the provided context to answer questions about Ahmed Ameen.
- If the question is outside the scope of Ahmed Ameen or the context, politely state: "I'm here to help you learn more about Ahmed and his work! 😊"
- **CRITICAL**: Provide ALL available details from the context. Do NOT summarize or omit items when asked for lists of projects, certifications, or skills.

### Ahmed's Portfolio Context
${contextSection}`;

    // Add language hint to force model adherence
    const languageHint = isArabic ? "[إجباري: رد بالعامية المصرية فقط]" : "[MANDATORY: RESPOND ONLY IN ENGLISH]";
    const userMessageContent = `${languageHint} ${query}`;

    try {
        apiCallCount++;
        const res = await fetch(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentKey} `
                },
                body: JSON.stringify({
                    model: CHAT_CONFIG.GROQ_MODEL,
                    messages: [
                        { role: 'system', content: systemMessage },
                        ...chatHistory.slice(-6), // Send last 6 messages for context
                        { role: 'user', content: userMessageContent }
                    ],
                    temperature: 0.6,
                    max_tokens: 2048
                })
            }
        );

        if (!res.ok) {
            apiCallCount = Math.max(0, apiCallCount - 1);
            let errorMessage = "Temporarily unavailable.";
            try {
                const errorData = await res.json();
                console.error('[Chatbot] API error:', res.status, errorData);
                errorMessage = errorData.error?.message || errorMessage;
            } catch (e) {
                console.error('[Chatbot] API error (no json):', res.status);
            }

            if (res.status === 429 || res.status === 401 || res.status === 403) {
                return "API_KEY_REQUIRED";
            }

            return `System Error(${res.status}): ${errorMessage} `;
        }

        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        return text?.trim() || "I couldn't generate a response. Try browsing the portfolio sections directly!";

    } catch (err) {
        apiCallCount = Math.max(0, apiCallCount - 1);
        console.error('[Chatbot] Catch error:', err);
        return `Connection Error: Please check your internet or API key and try again.`;
    }
}

// ─────────────────────────────────────────────
// 🧠 MAIN RESPONSE ENGINE
// ─────────────────────────────────────────────
async function generateResponse(query) {
    // Detect language
    const isArabic = /[\u0600-\u06FF]/.test(query);

    // Dynamic RAG Loading: Fetch language-specific JSON if not cached
    let chunks = isArabic ? PORTFOLIO_DATA.chunksAr : PORTFOLIO_DATA.chunksEn;
    const jsonFile = isArabic ? 'js/rag-data-ar.json' : 'js/rag-data-en.json';

    if (chunks.length === 0) {
        try {
            const res = await fetch(jsonFile);
            if (res.ok) {
                chunks = await res.json();
                if (isArabic) PORTFOLIO_DATA.chunksAr = chunks;
                else PORTFOLIO_DATA.chunksEn = chunks;
                console.log(`[Chatbot] Loaded ${chunks.length} chunks from ${jsonFile}`);
            }
        } catch (err) {
            console.error(`[Chatbot] Failed to load ${jsonFile}:`, err);
        }
    }

    // --- STEP 1: Smart keyword retrieval ---
    // Tokenize query: support Arabic + English
    const queryWords = query
        .toLowerCase()
        .replace(/[،,؟?!.]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 1);

    // Score each chunk by keyword overlap
    const scored = chunks.map(chunk => {
        const chunkLower = chunk.text.toLowerCase();
        let score = 0;

        // Map common query words to root concepts for better matching (EN + AR)
        const mappedWords = queryWords.map(w => {
            if (w.startsWith('cert') || w.startsWith('شهاد') || w.startsWith('كورس')) return 'cert';
            if (w.startsWith('proj') || w.startsWith('مشروع') || w.startsWith('مشار') || w.startsWith('بروجكت')) return 'project';
            return w;
        });

        mappedWords.forEach(word => {
            // 1. Exact match in full text (highest weight)
            if (chunkLower.includes(word)) score += 2;

            // 2. Check the "Header" area (e.g., PROJECT: Name)
            // This ensures "projects" matches the PROJECT chunks
            const headerPart = chunk.text.split('=')[0].toLowerCase();
            if (headerPart.includes(word)) score += 4; // Increased weight for header
        });

        // 3. Bonus: also check keywords array
        if (chunk.keywords) {
            chunk.keywords.forEach(kw => {
                if (mappedWords.includes(kw.toLowerCase())) score += 1;
            });
        }
        return { chunk, score };
    });

    // Sort and take top 18 most relevant chunks (increased to ensure all certs are captured)
    const topChunks = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 18)
        .filter(s => s.score > 0)
        .map(s => s.chunk);

    // Fallback: if nothing matched, take the first 10 chunks
    const relevantChunks = topChunks.length > 0 ? topChunks : chunks.slice(0, 10);

    // --- STEP 2: Clean context ---
    const cleanContext = relevantChunks.map(chunk => {
        // Updated regex: Handles "LABEL: NAME = ### CONTENT" and similar variations
        return chunk.text
            .replace(/^-\s*[^=]+=\s*###\s*/gm, '• ') // Remove RAG structural tags
            .replace(/^#.*$/gm, '')                // Remove section headers
            .trim();
    }).filter(t => t.length > 0).join('\n');

    console.log(`[Chatbot] Smart retrieval for ${isArabic ? 'Arabic' : 'English'} query. Sending clean context to LLM.`);

    // Add user query to history before calling API
    const response = await callGroqAPI(query, cleanContext, isArabic);

    // If response is successful (not an error code), save to history
    if (response !== "API_KEY_REQUIRED" && !response.startsWith("System Error") && !response.startsWith("Connection Error")) {
        chatHistory.push({ role: 'user', content: query });
        chatHistory.push({ role: 'assistant', content: response });

        // Keep history manageable (last 10 messages)
        if (chatHistory.length > 10) {
            chatHistory = chatHistory.slice(-10);
        }
    }

    return response;
}


// ─────────────────────────────────────────────
// 💬 INTERACTIVE UI INTEGRATION
// ─────────────────────────────────────────────
function initChatbot() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');
    const chatbot = document.getElementById('chatbot');
    const chatTrigger = document.getElementById('chat-trigger');
    const closeChat = document.getElementById('close-chat');

    if (!chatInput || !sendBtn || !chatMessages || !typingIndicator || !chatbot || !chatTrigger || !closeChat) {
        console.error('[Chatbot] Missing DOM elements.');
        return;
    }

    // Initial preload of English chunks (default)
    fetch('js/rag-data-en.json')
        .then(res => {
            if (!res.ok) return [];
            return res.json();
        })
        .then(ragChunks => {
            PORTFOLIO_DATA.chunksEn = ragChunks;
            console.log(`[Chatbot] Definitive English knowledge loaded. ${PORTFOLIO_DATA.chunksEn.length} chunks indexed.`);
        })
        .catch(() => {
            console.log('[Chatbot] Failed to load local English definitive knowledge base.');
        });

    // ── Toggle Visibility ──
    function toggleChat(forceClose = false) {
        if (forceClose) {
            chatbot.classList.add('is-closed');
            chatTrigger.style.display = 'flex';
        } else {
            chatbot.classList.toggle('is-closed');
            const isOpen = !chatbot.classList.contains('is-closed');
            chatTrigger.style.display = isOpen ? 'none' : 'flex';
        }
    }

    chatTrigger.addEventListener('click', () => toggleChat());
    closeChat.addEventListener('click', () => toggleChat(true));
    toggleChat(chatbot.classList.contains('is-closed'));

    // ── Arabic/English Bilingual Formatter ──
    // Detects Arabic text and moves embedded English words/URLs to their own lines
    function formatArabicResponse(text) {
        const hasArabic = /[\u0600-\u06FF]/.test(text);
        if (!hasArabic) return text; // English response — no processing needed

        // Step 1: Isolate URLs onto their own lines
        text = text.replace(/(?<!\n)(https?:\/\/[^\s\n]+)/g, '\n\n$1\n\n');

        // Step 2: Isolate @handles onto their own lines
        text = text.replace(/(?<!\n)(@[a-zA-Z0-9_.-]+)/g, '\n\n$1\n\n');

        // Step 3: Move English-dominant "words" (3+ consecutive non-Arabic chars including numbers/symbols)
        // that appear mid-sentence in Arabic text onto their own line
        text = text.replace(/([\u0600-\u06FF\s])([A-Za-z][A-Za-z0-9\s_\-:.]{3,}?)(?=[\u0600-\u06FF]|\s*$|\s*\n)/g, '$1\n\n$2\n\n');

        // Step 4: Collapse 3+ consecutive blank lines down to 2
        text = text.replace(/\n{3,}/g, '\n\n');

        return text.trim();
    }

    // ── Append Message ──
    function appendMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.style.cssText = 'opacity:0; transform:translateY(12px); transition: opacity 0.3s ease, transform 0.3s ease;';

        const content = document.createElement('div');
        content.setAttribute('dir', 'auto'); // Automatically detect RTL/LTR direction
        // For AI messages: apply bilingual formatting, then render newlines as <br>
        const formattedText = sender === 'ai' ? formatArabicResponse(text) : text;
        content.innerHTML = formattedText.replace(/\n/g, '<br>');

        const timestamp = document.createElement('div');
        timestamp.classList.add('timestamp');
        timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageDiv.appendChild(content);
        messageDiv.appendChild(timestamp);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        requestAnimationFrame(() => requestAnimationFrame(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }));
    }

    // ── Handle Dynamic API Key Input ──
    function promptForApiKey() {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'ai');
        messageDiv.style.cssText = 'opacity:0; transform:translateY(12px); transition: opacity 0.3s ease, transform 0.3s ease;';

        const content = document.createElement('div');
        content.innerHTML = `Ahmed's session is active, but a Chat Key is required to continue. Please enter your Groq API Key (Signup then API Keys from header then Create API KEY) from the <a href="https://console.groq.com/keys" target="_blank" style="color:var(--color-primary);text-decoration:underline;">Groq Console</a> below.`;

        const inputContainer = document.createElement('div');
        inputContainer.style.marginTop = '10px';
        inputContainer.style.display = 'flex';
        inputContainer.style.gap = '8px';

        const keyInput = document.createElement('input');
        keyInput.type = 'password';
        keyInput.placeholder = 'gsk_...';
        keyInput.style.flex = '1';
        keyInput.style.padding = '8px';
        keyInput.style.borderRadius = 'var(--radius-md)';
        keyInput.style.border = '1px solid var(--color-border)';
        keyInput.style.background = 'var(--color-bg)';
        keyInput.style.color = '#fff';

        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Save Key';
        submitBtn.style.padding = '8px 16px';
        submitBtn.style.borderRadius = 'var(--radius-md)';
        submitBtn.style.background = 'var(--color-primary)';
        submitBtn.style.color = '#fff';
        submitBtn.style.border = 'none';
        submitBtn.style.cursor = 'pointer';

        submitBtn.onclick = () => {
            const val = keyInput.value.trim();
            if (val.startsWith('gsk_')) {
                sessionUserApiKey = val;
                inputContainer.innerHTML = '<span style="color:#10b981;font-size:14px;">✅ API Key saved for this session. You can now chat!</span>';
                chatInput.disabled = false;
                sendBtn.disabled = false;
                chatInput.focus();
            } else {
                keyInput.style.borderColor = '#ef4444';
            }
        };

        inputContainer.appendChild(keyInput);
        inputContainer.appendChild(submitBtn);
        content.appendChild(inputContainer);

        messageDiv.appendChild(content);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        requestAnimationFrame(() => requestAnimationFrame(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }));
    }

    // ── Handle Send ──
    async function handleSendMessage() {
        if (chatIsProcessing) return;

        const rawText = chatInput.value.trim();
        if (!rawText) return;

        // Security: Input Sanitization & Length Limit
        const text = rawText.substring(0, 500).replace(/[<>{}[\]\\]/g, '');

        chatIsProcessing = true;
        appendMessage(text, 'user');
        chatInput.value = '';

        typingIndicator.style.display = 'flex';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await generateResponse(text);
            typingIndicator.style.display = 'none';

            if (response === "API_KEY_REQUIRED") {
                promptForApiKey();
            } else {
                appendMessage(response, 'ai');
            }
        } catch (err) {
            typingIndicator.style.display = 'none';
            appendMessage("Something went wrong. Please try again!", 'ai');
            console.error('[Chatbot] Error:', err);
        } finally {
            chatIsProcessing = false;
            typingIndicator.style.display = 'none';
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.removeAttribute('disabled');
            setTimeout(() => chatInput.focus(), 50);
        }
    }

    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) handleSendMessage();
    });

    // ── Initial Greeting ──
    setTimeout(() => {
        appendMessage(`Hi there! 👋\n\nI'm here to help you explore Ahmed's skills, projects, and certifications. How can I assist you today?`, 'ai');
    }, 1000);

    console.log('[Chatbot] Ready.');
}
