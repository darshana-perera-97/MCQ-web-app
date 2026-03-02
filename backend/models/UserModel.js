import { BaseModel } from './BaseModel.js';

export class UserModel extends BaseModel {
  constructor() {
    super('users.json');
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    return await this.findBy('email', email);
  }

  /**
   * Add MCQ ID to user's seen list
   */
  async addSeenMcq(userId, mcqId) {
    const user = await this.findById(userId);
    if (!user) {
      return null;
    }

    if (!user.seenMcqs) {
      user.seenMcqs = [];
    }

    if (!user.seenMcqs.includes(mcqId)) {
      user.seenMcqs.push(mcqId);
      await this.update(userId, { seenMcqs: user.seenMcqs });
    }

    return user;
  }

  /**
   * Reset daily count if it's a new day
   */
  async checkAndResetDailyCount(userId) {
    const user = await this.findById(userId);
    if (!user) {
      return null;
    }

    const today = new Date().toISOString().split('T')[0];
    
    if (user.lastAttemptDate !== today) {
      await this.update(userId, {
        dailyCount: 0,
        lastAttemptDate: today
      });
      return { ...user, dailyCount: 0, lastAttemptDate: today };
    }

    return user;
  }

  /**
   * Increment daily count
   */
  async incrementDailyCount(userId) {
    const user = await this.findById(userId);
    if (!user) {
      return null;
    }

    const newCount = (user.dailyCount || 0) + 1;
    await this.update(userId, { dailyCount: newCount });
    return { ...user, dailyCount: newCount };
  }

  /**
   * Update user score
   */
  async updateScore(userId, points) {
    const user = await this.findById(userId);
    if (!user) {
      return null;
    }

    const newScore = (user.score || 0) + points;
    await this.update(userId, { score: newScore });
    return { ...user, score: newScore };
  }
}

