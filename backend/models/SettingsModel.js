import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SettingsModel {
  constructor() {
    this.filePath = path.join(__dirname, '../data', 'settings.json');
  }

  /**
   * Get settings (returns object instead of array)
   */
  async read() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Return default settings
        return { globalDailyLimit: 15 };
      }
      throw error;
    }
  }

  /**
   * Write settings atomically
   */
  async write(data) {
    const tempPath = `${this.filePath}.tmp`;
    
    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      await fs.rename(tempPath, this.filePath);
    } catch (error) {
      try {
        await fs.unlink(tempPath);
      } catch (unlinkError) {
        // Ignore cleanup errors
      }
      throw error;
    }
  }

  /**
   * Get global daily limit
   */
  async getDailyLimit() {
    const settings = await this.read();
    return settings.globalDailyLimit || 15;
  }

  /**
   * Update global daily limit
   */
  async updateDailyLimit(limit) {
    const settings = await this.read();
    settings.globalDailyLimit = limit;
    await this.write(settings);
    return settings;
  }
}

