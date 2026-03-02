import { McqModel } from '../models/McqModel.js';
import { UserModel } from '../models/UserModel.js';
import { SettingsModel } from '../models/SettingsModel.js';
import { v4 as uuidv4 } from 'uuid';

const mcqModel = new McqModel();
const userModel = new UserModel();
const settingsModel = new SettingsModel();

export const getRandomMcq = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check daily limit
    await userModel.checkAndResetDailyCount(userId);
    const updatedUser = await userModel.findById(userId);
    const dailyLimit = await settingsModel.getDailyLimit();

    if (updatedUser.dailyCount >= dailyLimit) {
      return res.status(403).json({ 
        error: 'Daily limit reached',
        dailyCount: updatedUser.dailyCount,
        dailyLimit
      });
    }

    // Get random unseen MCQ
    const mcq = await mcqModel.getRandomUnseen(updatedUser.seenMcqs || []);

    if (!mcq) {
      return res.status(404).json({ error: 'No unseen MCQs available' });
    }

    // Return MCQ without the answer
    const { answer, ...mcqWithoutAnswer } = mcq;
    res.json(mcqWithoutAnswer);
  } catch (error) {
    console.error('Get random MCQ error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitMcqAnswer = async (req, res) => {
  try {
    const { userId, mcqId, selectedAnswer } = req.body;

    if (!userId || !mcqId || !selectedAnswer) {
      return res.status(400).json({ error: 'userId, mcqId, and selectedAnswer are required' });
    }

    // Get MCQ
    const mcq = await mcqModel.findById(mcqId);
    if (!mcq) {
      return res.status(404).json({ error: 'MCQ not found' });
    }

    // Check user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check daily limit
    await userModel.checkAndResetDailyCount(userId);
    const updatedUser = await userModel.findById(userId);
    const dailyLimit = await settingsModel.getDailyLimit();

    if (updatedUser.dailyCount >= dailyLimit) {
      return res.status(403).json({ error: 'Daily limit reached' });
    }

    // Check if already seen
    if (updatedUser.seenMcqs && updatedUser.seenMcqs.includes(mcqId)) {
      return res.status(400).json({ error: 'MCQ already attempted' });
    }

    // Check answer
    const isCorrect = selectedAnswer === mcq.answer;
    const points = isCorrect ? 10 : 0;

    // Update user: add to seen, increment daily count, update score
    await userModel.addSeenMcq(userId, mcqId);
    await userModel.incrementDailyCount(userId);
    if (isCorrect) {
      await userModel.updateScore(userId, points);
    }

    res.json({
      correct: isCorrect,
      correctAnswer: mcq.answer,
      pointsEarned: points,
      message: isCorrect ? 'Correct answer!' : 'Incorrect answer'
    });
  } catch (error) {
    console.error('Submit MCQ answer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllMcqs = async (req, res) => {
  try {
    const { category } = req.query;
    const isAdmin = req.isAdmin || false;
    const mcqs = await mcqModel.findAll({ category });
    
    // Remove answers for non-admin users
    const safeMcqs = isAdmin 
      ? mcqs 
      : mcqs.map(({ answer, ...mcq }) => mcq);
    
    res.json({
      mcqs: safeMcqs,
      count: safeMcqs.length
    });
  } catch (error) {
    console.error('Get MCQs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMcqById = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.isAdmin || false;
    const mcq = await mcqModel.findById(id);

    if (!mcq) {
      return res.status(404).json({ error: 'MCQ not found' });
    }

    // Remove answer for non-admin
    if (isAdmin) {
      res.json(mcq);
    } else {
      const { answer, ...mcqWithoutAnswer } = mcq;
      res.json(mcqWithoutAnswer);
    }
  } catch (error) {
    console.error('Get MCQ error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createMcq = async (req, res) => {
  try {
    const { question, optionA, optionB, optionC, optionD, answer, category } = req.body;

    if (!question || !optionA || !optionB || !optionC || !optionD || !answer) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['A', 'B', 'C', 'D'].includes(answer)) {
      return res.status(400).json({ error: 'Answer must be A, B, C, or D' });
    }

    // Generate unique ID (using yymmdd format or UUID)
    const now = new Date();
    const yymmdd = now.toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const id = `MCQ-${yymmdd}-${random}`;

    // Handle image upload if present
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const newMcq = {
      id,
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      answer,
      category: category || null,
      image: imagePath,
      createdAt: new Date().toISOString()
    };

    await mcqModel.create(newMcq);

    res.status(201).json({
      message: 'MCQ created successfully',
      mcq: newMcq
    });
  } catch (error) {
    console.error('Create MCQ error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMcq = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate answer if provided
    if (updates.answer && !['A', 'B', 'C', 'D'].includes(updates.answer)) {
      return res.status(400).json({ error: 'Answer must be A, B, C, or D' });
    }

    // Don't allow updating ID
    delete updates.id;

    // Handle image upload if present
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const updatedMcq = await mcqModel.update(id, updates);

    if (!updatedMcq) {
      return res.status(404).json({ error: 'MCQ not found' });
    }

    res.json({
      message: 'MCQ updated successfully',
      mcq: updatedMcq
    });
  } catch (error) {
    console.error('Update MCQ error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMcq = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await mcqModel.delete(id);

    if (!result) {
      return res.status(404).json({ error: 'MCQ not found' });
    }

    res.json({ message: 'MCQ deleted successfully' });
  } catch (error) {
    console.error('Delete MCQ error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

