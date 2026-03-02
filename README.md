# Ahmed Ameen - Interactive Portfolio

A premium, high-performance portfolio for a **Generative AI Engineer & Data Scientist**. This project features a custom-built **RAG-based Interactive Guide** (Athar) designed to provide instant, context-aware answers about my professional journey, credentials, and projects.

## ✨ Core Architecture & Technologies

This portfolio is not just a static site; it is a demonstration of applied Generative AI concepts running directly in the browser. 

### 1. LLM Integration (Groq API)
- **Engine**: The chat interface is powered by `Llama-3.1-8b-instant` via the **Groq API**.
- **Reasoning**: Groq's LPU (Language Processing Unit) inference engine was chosen for its ultra-low latency. It allows the assistant to stream contextually accurate, specialized responses in under 500ms, creating a fluid, human-like conversational experience.

### 2. Retrieval-Augmented Generation (RAG)
The assistant does not hallucinate; its knowledge is strictly bound by a custom RAG pipeline built from scratch.
- **Knowledge Base**: The entire professional profile is structured as atomic definitions in `content/MASTER_EN.md` and `content/MASTER_AR.md`.
- **System Prompting**: The engine uses advanced prompt engineering to ensure the assistant adheres strictly to retrieving exact data (e.g., specific certification dates, project tools) rather than relying on its base weights.
- **Bilingual Context Switching**: The system automatically detects whether the user is typing in Arabic or English and seamlessly loads the corresponding native language knowledge base to prevent cross-language context contamination.

### 3. Embeddings & Chunking (`sync-content.js`)
- **Semantic Preparation**: A custom Build Node.js script processes the knowledge base into localized "chunks". 
- **Sliding Window Technique**: Data is broken down into structured, overlapping segments. This ensures that when the system retrieves information, the LLM receives the full context of a project or certification without missing surrounding metadata.
- **Pre-Compilation**: The chunks are compiled into `rag-data-en.json` and `rag-data-ar.json` at build time, meaning the live website doesn't need to parse markdown dynamically, resulting in zero latency on load.

### 4. Vector Retrieval (Simulated Client-Side DB)
To avoid the overhead and cost of a heavy backend vector database (like Pinecone or ChromaDB), the retrieval logic is handled entirely client-side.
- **Semantic Root-Matching**: The engine maps natural language queries (like "certificates", "شهادات", "projects") down to their atomic roots.
- **Heuristic Scoring**: Every chunk is scored instantly based on keyword density, root mapping, and header prioritization. The top 18 chunks are passed to the Groq API. This lightweight "simulated vector DB" approach is perfectly tailored for the tightly scoped domain of a personal portfolio.

### 5. Frontend & UI Engineering
- **Stack**: Vanilla JavaScript, CSS3, and HTML5. No heavy frameworks (React/Vue), ensuring maximum performance and SEO capabilities.
- **Aesthetics Elements**: Features a high-end Glassmorphism design, floating tech badges, soft CSS radial glows, and micro-interactions.
- **Performance**: Intersection Observers are heavily utilized to trigger fade-up animations and lazy-load components only as they enter the viewport.

---

## 🚀 Getting Started Locally

1. Clone the repository.
2. Run `npm install` to install processing dependencies (like `pdf-parse`) for the content synchronizer.
3. Replace the `GROQ_API_KEY` placeholder in `js/chat.js` with your own key, or supply it dynamically through the UI when prompted.
4. If you update the knowledge base (`content/MASTER_EN.md` or `content/MASTER_AR.md`), run the pre-compiler:
   ```bash
   node scripts/sync-content.js
   ```
5. Launch `index.html` using a local web server (e.g., Live Server or `python -m http.server`).

---
*Developed by Ahmed Ameen.*
