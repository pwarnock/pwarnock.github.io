import fs from 'fs';
import path from 'path';

const TOOLS_DIR = 'content/tools';
const IMAGES_DIR = 'static/images/tools';
const CLEARBIT_API = 'https://logo.clearbit.com/';
const BRANDFETCH_API = 'https://api.brandfetch.io/v2/brands/';

// Helper to get domain from URL
function getDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return null;
  }
}

async function fetchBrandfetchLogo(domain, outputPath, apiKey) {
  try {
    const response = await fetch(`${BRANDFETCH_API}${domain}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) throw new Error(`Brandfetch error: ${response.statusText}`);

    const data = await response.json();
    // Prefer icon, then logo. Prefer SVG, then PNG.
    const logos = data.logos || [];
    const icon = logos.find(l => l.type === 'icon') || logos[0];

    if (!icon) throw new Error('No logo found in Brandfetch response');

    // Try to find SVG, else highest res PNG
    const format = icon.formats.find(f => f.format === 'svg') || icon.formats[0];
    const logoUrl = format.src;

    console.log(`   ✨ Found Brandfetch logo for ${domain}`);

    const imgResponse = await fetch(logoUrl);
    const buffer = Buffer.from(await imgResponse.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    return true;
  } catch (error) {
    console.log(`   ⚠️  Brandfetch failed for ${domain}: ${error.message}. Falling back...`);
    return false;
  }
}

async function fetchLogo(domain, outputPath) {
  // Try Brandfetch if key is available
  if (process.env.BRANDFETCH_API_KEY) {
    const success = await fetchBrandfetchLogo(domain, outputPath, process.env.BRANDFETCH_API_KEY);
    if (success) return true;
  }

  // Fallback to Clearbit
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
        // Add new image key. Try to insert before 'draft:', otherwise before second '---'
        let newContent;
        if (content.match(/^draft:/m)) {
          newContent = content.replace(/^(draft:)/m, `image: '${frontmatterPath}'\n$1`);
        } else {
          // Insert before the closing frontmatter delimiter
          const parts = content.split('---');
          if (parts.length >= 3) {
            parts[1] = parts[1] + `image: '${frontmatterPath}'\n`;
            newContent = parts.join('---');
          } else {
            console.log(`⚠️  Could not find place to insert frontmatter for ${slug}`);
            continue;
          }
        }
        fs.writeFileSync(file, newContent);
        console.log(`📝 Added frontmatter for ${slug}`);
      }
    }
  }
}

main().catch(console.error);
