import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Base model class for JSON file operations
 * Provides atomic write operations to prevent corruption
 */
export class BaseModel {
  constructor(filename) {
    this.filePath = path.join(__dirname, '../data', filename);
  }

  /**
   * Read data from JSON file
   */
  async read() {
    try {
      // Ensure data directory exists
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      
      const data = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(data);
      // Ensure we always return an array
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return empty array
        return [];
      }
      // If JSON parse error, log it and return empty array
      if (error instanceof SyntaxError) {
        console.error(`Invalid JSON in ${this.filePath}, returning empty array:`, error.message);
        return [];
      }
      throw error;
    }
  }

  /**
   * Write data to JSON file atomically
   * Writes to temp file first, then renames to prevent corruption
   */
  async write(data) {
    const tempPath = `${this.filePath}.tmp`;
    try {
      // Ensure data directory exists
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      
      // Write to temp file
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      
      // Atomic rename
      await fs.rename(tempPath, this.filePath);
    } catch (error) {
      // Clean up temp file on error
      try {
        await fs.unlink(tempPath);
      } catch (unlinkError) {
        // Ignore cleanup errors
      }
      throw error;
    }
  }

  /**
   * Find item by ID
   */
  async findById(id) {
    const data = await this.read();
    return data.find(item => item.id === id) || null;
  }

  /**
   * Find item by custom field
   */
  async findBy(field, value) {
    const data = await this.read();
    return data.find(item => item[field] === value) || null;
  }

  /**
   * Get all items
   */
  async findAll() {
    return await this.read();
  }

  /**
   * Create new item
   */
  async create(item) {
    const data = await this.read();
    data.push(item);
    await this.write(data);
    return item;
  }

  /**
   * Update item by ID
   */
  async update(id, updates) {
    const data = await this.read();
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    data[index] = { ...data[index], ...updates };
    await this.write(data);
    return data[index];
  }

  /**
   * Delete item by ID
   */
  async delete(id) {
    const data = await this.read();
    const filtered = data.filter(item => item.id !== id);
    
    if (filtered.length === data.length) {
      return null; // Item not found
    }
    
    await this.write(filtered);
    return true;
  }
}

