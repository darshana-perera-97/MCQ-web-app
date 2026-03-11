import { StructuredWritingModel } from '../models/StructuredWritingModel.js';

const structuredWritingModel = new StructuredWritingModel();

export const getAllStructuredWritings = async (req, res) => {
  try {
    const items = await structuredWritingModel.findAll();
    res.json({
      structuredWritings: items,
      count: items.length
    });
  } catch (error) {
    console.error('Get structured writings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStructuredWritingById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await structuredWritingModel.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Structured writing not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Get structured writing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStructuredWriting = async (req, res) => {
  try {
    const { id, title, paragraph, qaPairs, category } = req.body;

    if (!paragraph || !qaPairs || !Array.isArray(qaPairs) || qaPairs.length === 0) {
      return res.status(400).json({ error: 'Paragraph and at least one question-answer pair are required' });
    }

    for (const qa of qaPairs) {
      if (!qa.question || !qa.answer) {
        return res.status(400).json({ error: 'Each item must have question and answer' });
      }
    }

    let itemId = id;
    if (!itemId) {
      const now = new Date();
      const yymmdd = now.toISOString().slice(2, 10).replace(/-/g, '');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      itemId = `WRITE-${yymmdd}-${random}`;
    }

    const newItem = {
      id: itemId,
      title: title || null,
      paragraph,
      qaPairs: qaPairs.map((qa, index) => ({
        id: qa.id || `QA-${index + 1}`,
        question: qa.question,
        answer: qa.answer,
        order: qa.order !== undefined ? qa.order : index
      })),
      category: category || null,
      createdAt: new Date().toISOString()
    };

    await structuredWritingModel.create(newItem);

    res.status(201).json({
      message: 'Structured writing created successfully',
      structuredWriting: newItem
    });
  } catch (error) {
    console.error('Create structured writing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStructuredWriting = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    delete updates.id;

    if (updates.qaPairs) {
      if (!Array.isArray(updates.qaPairs) || updates.qaPairs.length === 0) {
        return res.status(400).json({ error: 'At least one question-answer pair is required' });
      }
      for (const qa of updates.qaPairs) {
        if (!qa.question || !qa.answer) {
          return res.status(400).json({ error: 'Each item must have question and answer' });
        }
      }
    }

    const updated = await structuredWritingModel.update(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Structured writing not found' });
    }

    res.json({
      message: 'Structured writing updated successfully',
      structuredWriting: updated
    });
  } catch (error) {
    console.error('Update structured writing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteStructuredWriting = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await structuredWritingModel.delete(id);
    if (!result) {
      return res.status(404).json({ error: 'Structured writing not found' });
    }
    res.json({ message: 'Structured writing deleted successfully' });
  } catch (error) {
    console.error('Delete structured writing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
