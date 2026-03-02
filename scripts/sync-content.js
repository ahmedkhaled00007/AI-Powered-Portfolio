import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const SOURCE_DIR = path.join(__dirname, '../content');
const OUTPUT_FILE_EN = path.join(__dirname, '../js/rag-data-en.json');
const OUTPUT_FILE_AR = path.join(__dirname, '../js/rag-data-ar.json');

// Configuration for Intelligence
const CHUNK_SIZE = 600;      // Target characters per chunk
const CHUNK_OVERLAP = 150;   // Overlap between chunks to keep context
const MIN_CHUNK_SIZE = 100;  // Don't keep tiny slivers

/**
 * Intelligent Keyword Extraction
 */
function extractKeywords(text) {
    const stopWords = new Set(['this', 'that', 'with', 'from', 'about', 'would', 'could', 'should', 'other', 'which', 'their', 'there', 'those']);
    return text.toLowerCase()
        .replace(/[^a-z0-9\s\-\u0600-\u06FF]/g, ' ')
        .split(/\s+/)
        .filter(word =>
            word.length > 3 &&
            !stopWords.has(word) &&
            !/^\d+$/.test(word) // Ignore purely numeric strings
        );
}

/**
 * Atomic Definition Chunking + Sliding Window
 */
function createSlidingChunks(content, fileName) {
    const lines = content.split('\n');
    const chunks = [];
    let slidingContent = [];

    lines.forEach((line, i) => {
        const trimmed = line.trim();
        // Atomic Detection: Lines starting with '-' are high-priority definitions
        if (trimmed.startsWith('-')) {
            chunks.push({
                id: `atomic_${fileName}_${i}`,
                keywords: [...new Set(extractKeywords(trimmed))],
                text: trimmed
            });
        } else if (trimmed.length > 0) {
            slidingContent.push(trimmed);
        }
    });

    // Process remaining text with sliding window
    const fullText = slidingContent.join(' ');
    let start = 0;
    const textLength = fullText.length;

    while (start < textLength) {
        let end = start + CHUNK_SIZE;
        if (end < textLength) {
            const nextSpace = fullText.indexOf(' ', end);
            if (nextSpace !== -1 && nextSpace < end + 50) end = nextSpace + 1;
        } else {
            end = textLength;
        }

        const chunkText = fullText.substring(start, end).trim();
        if (chunkText.length >= MIN_CHUNK_SIZE) {
            chunks.push({
                id: `sliding_${fileName}_${chunks.length}`,
                keywords: [...new Set(extractKeywords(chunkText))],
                text: chunkText
            });
        }

        if (end >= textLength) break;
        start = end - CHUNK_OVERLAP;
        if (start < 0) start = end;
    }

    return chunks;
}

async function syncContent() {
    console.log('--- Advanced Content Synchronizer v2.1 ---');

    if (!fs.existsSync(SOURCE_DIR)) {
        fs.mkdirSync(SOURCE_DIR);
        console.log('Created source directory: /content');
    }

    const files = fs.readdirSync(SOURCE_DIR);
    let allChunksEn = [];
    let allChunksAr = [];

    for (const file of files) {
        const filePath = path.join(SOURCE_DIR, file);
        if (fs.statSync(filePath).isDirectory()) continue;

        const ext = path.extname(file).toLowerCase();

        try {
            let fullText = '';
            if (ext === '.txt' || ext === '.md') {
                console.log(`Analyzing ${ext.substring(1)}: ${file}`);
                fullText = fs.readFileSync(filePath, 'utf8');
            }
            else if (ext === '.pdf') {
                console.log(`Analyzing pdf: ${file}`);
                const dataBuffer = fs.readFileSync(filePath);
                const data = await pdf(dataBuffer);
                fullText = data.text;
            } else {
                continue;
            }

            const fileChunks = createSlidingChunks(fullText, file);

            // Route chunks based on filename
            if (file.includes('_EN')) {
                allChunksEn.push(...fileChunks);
                console.log(`  -> Generated ${fileChunks.length} EN chunks.`);
            } else if (file.includes('_AR')) {
                allChunksAr.push(...fileChunks);
                console.log(`  -> Generated ${fileChunks.length} AR chunks.`);
            }

        } catch (err) {
            console.error(`Error processing ${file}:`, err.message);
        }
    }

    fs.writeFileSync(OUTPUT_FILE_EN, JSON.stringify(allChunksEn, null, 2));
    fs.writeFileSync(OUTPUT_FILE_AR, JSON.stringify(allChunksAr, null, 2));

    console.log(`\nSuccess! Indexed ${allChunksEn.length} EN chunks and ${allChunksAr.length} AR chunks.`);
    console.log('Dual-language RAG intelligence successfully deployed.');
}

syncContent();
