import { BaseModel } from './BaseModel.js';

export class McqModel extends BaseModel {
  constructor() {
    super('mcqs.json');
  }

  /**
   * Get random unseen MCQ for a user
   */
  async getRandomUnseen(userSeenMcqs = []) {
    const allMcqs = await this.findAll();
    const unseenMcqs = allMcqs.filter(mcq => !userSeenMcqs.includes(mcq.id));
    
    if (unseenMcqs.length === 0) {
      return null; // No unseen MCQs
    }

    const randomIndex = Math.floor(Math.random() * unseenMcqs.length);
    return unseenMcqs[randomIndex];
  }

  /**
   * Get all MCQs with optional filtering
   */
  async findAll(filter = {}) {
    const allMcqs = await super.findAll();
    
    if (filter.category) {
      return allMcqs.filter(mcq => mcq.category === filter.category);
    }
    
    return allMcqs;
  }
}

