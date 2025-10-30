#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createOpencode } from '@opencode-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_FILE = path.join(__dirname, '../layouts/_default/single.html');
const HAIKU_MODEL = 'anthropic/claude-3-5-haiku-20241022';

async function reviewBlogTemplate() {
  console.log('🚀 Starting blog template review with OpenCode SDK...\n');

  // Connect to existing server
  const { createAsyncClient } = await import('@opencode-ai/sdk');
  const client = createAsyncClient({
    baseURL: 'http://localhost:4096'
  });

  try {
    // Create session
    console.log('📝 Creating session...');
    const session = await client.session.create({
      body: {
        agent: 'build',
        model: {
          providerID: 'anthropic',
          modelID: HAIKU_MODEL
        }
      }
    });

    const sessionId = session.id || Object.keys(session)[0];
    console.log(`✓ Session created: ${sessionId}\n`);

    // Read template
    const templateContent = fs.readFileSync(TEMPLATE_FILE, 'utf-8');
    const templateSize = Buffer.byteLength(templateContent);

    console.log(`📤 Sending template (${templateSize} bytes)...\n`);
    console.log('─── OpenCode Response ───\n');

    // Send prompt with file
    await client.session.prompt({
      path: { id: sessionId },
      body: {
        parts: [
          {
            type: 'text',
            text: `Review this Hugo blog post template for aesthetics and UX improvements. Provide specific CSS/HTML suggestions to improve:
1. Visual hierarchy and spacing between sections
2. Readability on mobile vs desktop
3. Interactive elements (buttons, tags, links styling)
4. Color contrast and dark/light theme consistency
5. Component reusability patterns
6. Typography and font sizing

Focus on practical, actionable improvements.`
          },
          {
            type: 'file',
            url: `file://${TEMPLATE_FILE}`,
            filename: 'single.html',
            mime: 'text/html'
          }
        ]
      }
    });

    // Poll for session updates
    let completed = false;
    while (!completed) {
      await new Promise(resolve => setTimeout(resolve, 500));

      const sessionInfo = await client.session.get({
        path: { id: sessionId }
      });

      if (sessionInfo.messages && sessionInfo.messages.length > 0) {
        // Print any new messages
        const lastMessage = sessionInfo.messages[sessionInfo.messages.length - 1];
        if (lastMessage.content) {
          console.log(lastMessage.content);
        }
      }

      if (sessionInfo.status === 'completed') {
        console.log('\n─────────────────────');
        console.log(`✓ Session completed`);
        console.log(`📊 Tokens: ${sessionInfo.usage?.totalTokens || 'N/A'}`);
        completed = true;
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

reviewBlogTemplate();
