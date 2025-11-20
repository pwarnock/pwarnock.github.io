import fs from 'fs';
import path from 'path';

const TOOLS_DIR = 'content/tools';
const IMAGES_DIR = 'static/images/tools';
const CLEARBIT_API = 'https://logo.clearbit.com/';

// Helper to get domain from URL
function getDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return null;
  }
}

async function fetchLogo(domain, outputPath) {
  const url = `${CLEARBIT_API}${domain}?size=512`; // Request high-res
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(outputPath, buffer);
    return true;
  } catch (error) {
    console.error(`❌ Error fetching logo for ${domain}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Scanning tool pages...');
  // Use Bun's built-in glob
  const glob = new Bun.Glob(`${TOOLS_DIR}/**/*.md`);

  for await (const file of glob.scan()) {
    if (file.endsWith('_index.md')) continue;

    // file is relative to cwd
    const content = fs.readFileSync(file, 'utf8');
    const slug = path.basename(path.dirname(file)); // Assuming leaf bundle content/tools/slug/index.md

    // Extract Website URL using multiple patterns
    const patterns = [
      /\*\*Website\*\*:\s*\[.*?\]\((.*?)\)/i, // **Website**: [Name](url)
      /Website:\s*\[.*?\]\((.*?)\)/i, // Website: [Name](url)
      /^Website:\s*(https?:\/\/.*)$/im, // Website: https://url
      /\[Website\]\((.*?)\)/i, // [Website](url)
    ];

    let websiteUrl = null;
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        websiteUrl = match[1].trim();
        break;
      }
    }

    if (!websiteUrl) {
      console.log(`⚠️  No website found for ${slug}`);
      continue;
    }

    const domain = getDomain(websiteUrl);

    if (!domain) {
      console.log(`⚠️  Invalid URL for ${slug}: ${websiteUrl}`);
      continue;
    }

    const imageFilename = `${slug}.png`;
    const imagePath = path.join(IMAGES_DIR, imageFilename);

    // Use absolute path for frontmatter to prevent template prefixing issues
    const frontmatterPath = `/images/tools/${imageFilename}`;

    // Check if image already exists
    if (fs.existsSync(imagePath)) {
      console.log(`✅ Logo already exists for ${slug}`);
    } else {
      console.log(`⬇️  Fetching logo for ${slug} (${domain})...`);
      const success = await fetchLogo(domain, imagePath);
      if (!success) continue;
    }

    // Update Frontmatter if needed
    // Check if current image value matches our target
    const currentImageMatch = content.match(/^image:\s*['"]?(.*?)['"]?$/m);
    const currentImage = currentImageMatch ? currentImageMatch[1] : null;

    if (currentImage !== frontmatterPath) {
      // Check if image key exists
      if (content.match(/^image:/m)) {
        // Update existing
        const newContent = content.replace(/^image:.*$/m, `image: '${frontmatterPath}'`);
        fs.writeFileSync(file, newContent);
        console.log(`📝 Updated frontmatter for ${slug}`);
      } else {
        // Add image key after tags
        const newContent = content.replace(/(tags: \[.*?\])/s, `$1\nimage: '${frontmatterPath}'`);
        fs.writeFileSync(file, newContent);
        console.log(`📝 Added frontmatter for ${slug}`);
      }
    }
  }
}

main().catch(console.error);
