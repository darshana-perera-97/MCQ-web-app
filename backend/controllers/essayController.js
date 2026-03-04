import { EssayModel } from '../models/EssayModel.js';
import { v4 as uuidv4 } from 'uuid';

const essayModel = new EssayModel();

export const getAllEssays = async (req, res) => {
  try {
    const essays = await essayModel.findAll();
    res.json({
      essays,
      count: essays.length
    });
  } catch (error) {
    console.error('Get essays error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEssayById = async (req, res) => {
  try {
    const { id } = req.params;
    const essay = await essayModel.findById(id);

    if (!essay) {
      return res.status(404).json({ error: 'Essay not found' });
    }

    res.json(essay);
  } catch (error) {
    console.error('Get essay error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createEssay = async (req, res) => {
  try {
    const { id, question, category, answer } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Use provided ID or generate unique ID
    let questionId = id;
    if (!questionId) {
      const now = new Date();
      const yymmdd = now.toISOString().slice(2, 10).replace(/-/g, '');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      questionId = `ESSAY-${yymmdd}-${random}`;
    }

    const newEssay = {
      id: questionId,
      question,
      category: category || null,
      answer: answer || null,
      createdAt: new Date().toISOString()
    };

    await essayModel.create(newEssay);

    res.status(201).json({
      message: 'Essay question created successfully',
      essay: newEssay
    });
  } catch (error) {
    console.error('Create essay error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateEssay = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating ID
    delete updates.id;

    const updatedEssay = await essayModel.update(id, updates);

    if (!updatedEssay) {
      return res.status(404).json({ error: 'Essay not found' });
    }

    res.json({
      message: 'Essay updated successfully',
      essay: updatedEssay
    });
  } catch (error) {
    console.error('Update essay error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteEssay = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await essayModel.delete(id);

    if (!result) {
      return res.status(404).json({ error: 'Essay not found' });
    }

    res.json({ message: 'Essay deleted successfully' });
  } catch (error) {
    console.error('Delete essay error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

