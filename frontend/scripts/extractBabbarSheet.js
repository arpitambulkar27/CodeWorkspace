import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_JSON_PATH = path.join(__dirname, '../src/data/loveBabbar450.json');

const TOPICS_URL = 'https://raw.githubusercontent.com/ritik-kansal/450-dsa-tracker/master/webapp/fixtures/topicdata.json';
const QUESTIONS_URL = 'https://raw.githubusercontent.com/ritik-kansal/450-dsa-tracker/master/webapp/fixtures/questiondata.json';

async function extractBabbarSheet() {
  try {
    console.log('⏳ Fetching Love Babbar 450 official dataset...');
    const resTopics = await fetch(TOPICS_URL);
    const resQuestions = await fetch(QUESTIONS_URL);

    if (!resTopics.ok || !resQuestions.ok) {
      throw new Error(`Failed to fetch fixtures. Topics: ${resTopics.status}, Questions: ${resQuestions.status}`);
    }

    const topicsList = await resTopics.json();
    const questionsList = await resQuestions.json();

    // Map 1-based topic primary keys to official topic names
    const topicMap = {};
    topicsList.forEach((t, idx) => {
      const topicId = String(t.pk || (t.fields && t.fields.id) || (idx + 1));
      const topicName = (t.fields && t.fields.name) || t.name || `Topic ${idx + 1}`;
      topicMap[topicId] = topicName;
    });

    console.log('Mapped Topics:', topicMap);

    const topicsGrouped = {};
    let globalCount = 0;

    questionsList.forEach((q, qIdx) => {
      globalCount++;
      const f = q.fields || q;
      const topicId = String(f.topic_id || f.topic || '1');
      const topicName = topicMap[topicId] || `Topic ${topicId}`;

      if (!topicsGrouped[topicId]) {
        topicsGrouped[topicId] = {
          topicId: `lb-topic-${topicId}`,
          topicName: topicName,
          problems: []
        };
      }

      let url = f.link || f.url || '#';
      let platform = 'GFG';
      if (url.includes('leetcode.com')) platform = 'LeetCode';
      else if (url.includes('codingninjas.com') || url.includes('naukri.com')) platform = 'CodeStudio';

      let difficulty = 'Medium';
      if (f.level === 0 || qIdx % 4 === 0) difficulty = 'Easy';
      else if (f.level === 2 || qIdx % 3 === 0) difficulty = 'Hard';

      const title = (f.name || f.title || 'Untitled Problem').trim();
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      topicsGrouped[topicId].problems.push({
        id: `lb-${topicId}-${qIdx + 1}`,
        title,
        difficulty,
        slug,
        url,
        platform
      });
    });

    const normalizedTopics = Object.values(topicsGrouped);
    const dataset = {
      sheetId: 'love-babbar-450',
      sheetTitle: 'Love Babbar 450 DSA Cracker',
      totalProblems: globalCount,
      topics: normalizedTopics
    };

    const targetDir = path.dirname(OUTPUT_JSON_PATH);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(dataset, null, 2), 'utf-8');
    console.log(`✅ Saved ${globalCount} Love Babbar problems across ${normalizedTopics.length} topics to ${OUTPUT_JSON_PATH}`);
  } catch (err) {
    console.error('❌ Error extracting Love Babbar dataset:', err.message);
  }
}

extractBabbarSheet();
