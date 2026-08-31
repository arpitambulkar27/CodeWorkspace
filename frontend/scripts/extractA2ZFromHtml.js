import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_JSON_PATH = path.join(__dirname, '../src/data/striverA2Z.json');

async function run() {
  try {
    console.log('⏳ Fetching A2Z page source from takeuforward.org...');
    const response = await fetch('https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page source: ${response.status} ${response.statusText}`);
    }

    const htmlContent = await response.text();

    // 1. Concatenate Next.js self.__next_f streaming chunks
    const chunkRegex = /self\.__next_f\.push\(\[\d+,\s*"((?:[^"\\]|\\.)*)"\]\)/g;
    let fullStream = '';
    let match;

    while ((match = chunkRegex.exec(htmlContent)) !== null) {
      const unescapedChunk = match[1]
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
      fullStream += unescapedChunk;
    }

    // 2. Extract the "sections":[...] array
    const sectionsMarker = '"sections":[';
    const startIndex = fullStream.indexOf(sectionsMarker);
    if (startIndex === -1) {
      throw new Error('Could not locate "sections" array in page source stream.');
    }

    const bracketIndex = fullStream.indexOf('[', startIndex + '"sections":'.length - 2);
    let openBrackets = 0;
    let endIndex = -1;

    for (let i = bracketIndex; i < fullStream.length; i++) {
      if (fullStream[i] === '[') openBrackets++;
      else if (fullStream[i] === ']') {
        openBrackets--;
        if (openBrackets === 0) {
          endIndex = i + 1;
          break;
        }
      }
    }

    if (endIndex === -1) {
      throw new Error('Could not find closing bracket for "sections" array.');
    }

    let jsonString = fullStream.substring(bracketIndex, endIndex);
    jsonString = jsonString.replace(/[\u0000-\u001F]+/g, (m) => {
      return m === '\n' ? '\\n' : m === '\r' ? '\\r' : m === '\t' ? '\\t' : '';
    });

    const rawSections = JSON.parse(jsonString);

    // 3. Normalize into clean topic & problem objects
    const normalizedTopics = [];
    let count = 0;

    rawSections.forEach((section, sIdx) => {
      const category = section.category_name || `Section ${sIdx + 1}`;
      (section.subcategories || []).forEach((sub, subIdx) => {
        const subTitle = (sub.subcategory_name || `Part ${subIdx + 1}`).trim();
        const problems = (sub.problems || []).map((p) => {
          count++;
          let finalUrl = p.leetcode;
          let platform = 'LeetCode';

          if (!finalUrl || finalUrl === '$undefined') {
            if (p.link && p.link !== '$undefined') {
              finalUrl = p.link;
              platform = p.link.includes('geeksforgeeks.org') ? 'GFG' : 'External';
            } else if (p.article && p.article !== '$undefined') {
              finalUrl = p.article;
              platform = 'Article';
            } else {
              finalUrl = p.youtube && p.youtube !== '$undefined' ? p.youtube : `https://takeuforward.org${p.plus || ''}`;
              platform = p.youtube && p.youtube !== '$undefined' ? 'YouTube' : 'TakeUForward';
            }
          }

          const slug = (p.problem_name || `prob-${count}`)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          return {
            id: p.problem_id || `a2z-${count}`,
            title: p.problem_name || 'Untitled Problem',
            difficulty: p.difficulty || 'Medium',
            slug,
            url: finalUrl,
            platform,
            article: p.article && p.article !== '$undefined' ? p.article : null,
            youtube: p.youtube && p.youtube !== '$undefined' ? p.youtube : null
          };
        });

        if (problems.length > 0) {
          normalizedTopics.push({
            topicId: `topic-${sIdx + 1}-${subIdx + 1}`,
            topicName: `${category} → ${subTitle}`,
            problems
          });
        }
      });
    });

    const dataset = {
      sheetId: 'striver-a2z',
      sheetTitle: "Striver's A2Z DSA Course",
      totalProblems: count,
      topics: normalizedTopics
    };

    const targetDir = path.dirname(OUTPUT_JSON_PATH);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(dataset, null, 2), 'utf-8');
    console.log(`✅ Saved ${count} problems across ${normalizedTopics.length} sections to ${OUTPUT_JSON_PATH}`);
  } catch (err) {
    console.error('❌ Extraction failed:', err.message);
  }
}

run();
