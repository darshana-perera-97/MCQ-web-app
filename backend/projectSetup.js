import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');

const files = {
  'users.json': [],
  'mcqs.json': [],
  'essays.json': [],
  'notifications.json': [],
  'settings.json': { globalDailyLimit: 10 }
};

async function seed() {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir(dataDir, { recursive: true });

    console.log('🌱 Seeding database files...\n');

    // Create each JSON file if it doesn't exist
    for (const [filename, defaultData] of Object.entries(files)) {
      const filePath = path.join(dataDir, filename);
      
      try {
        // Check if file exists
        await fs.access(filePath);
        console.log(`✓ ${filename} already exists, skipping...`);
      } catch (error) {
        // File doesn't exist, create it
        await fs.writeFile(
          filePath,
          JSON.stringify(defaultData, null, 2),
          'utf-8'
        );
        console.log(`✓ Created ${filename}`);
      }
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📁 Data files location:', dataDir);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed
seed();

