import { StructuredQuestionModel } from '../models/StructuredQuestionModel.js';

const structuredQuestionModel = new StructuredQuestionModel();

export const getAllStructuredQuestions = async (req, res) => {
  try {
    const questions = await structuredQuestionModel.findAll();
    res.json({
      structuredQuestions: questions,
      count: questions.length
    });
  } catch (error) {
    console.error('Get structured questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStructuredQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await structuredQuestionModel.findById(id);

    if (!question) {
      return res.status(404).json({ error: 'Structured question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Get structured question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStructuredQuestion = async (req, res) => {
  try {
    const { id, title, paragraph, mcqs, category } = req.body;

    if (!paragraph || !mcqs || !Array.isArray(mcqs) || mcqs.length === 0) {
      return res.status(400).json({ error: 'Paragraph and at least one MCQ are required' });
    }

    // Validate MCQs structure
    for (const mcq of mcqs) {
      if (!mcq.question || !mcq.optionA || !mcq.optionB || !mcq.optionC || !mcq.optionD || !mcq.answer) {
        return res.status(400).json({ error: 'Each MCQ must have question, all options, and answer' });
      }
      if (!['A', 'B', 'C', 'D'].includes(mcq.answer)) {
        return res.status(400).json({ error: 'Answer must be A, B, C, or D' });
      }
    }

    // Use provided ID or generate unique ID
    let questionId = id;
    if (!questionId) {
      const now = new Date();
      const yymmdd = now.toISOString().slice(2, 10).replace(/-/g, '');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      questionId = `STRUCT-${yymmdd}-${random}`;
    }

    const newQuestion = {
      id: questionId,
      title: title || null,
      paragraph,
      mcqs: mcqs.map((mcq, index) => ({
        id: mcq.id || `MCQ-${index + 1}`,
        question: mcq.question,
        optionA: mcq.optionA,
        optionB: mcq.optionB,
        optionC: mcq.optionC,
        optionD: mcq.optionD,
        answer: mcq.answer,
        order: mcq.order !== undefined ? mcq.order : index
      })),
      category: category || null,
      createdAt: new Date().toISOString()
    };

    await structuredQuestionModel.create(newQuestion);

    res.status(201).json({
      message: 'Structured question created successfully',
      structuredQuestion: newQuestion
    });
  } catch (error) {
    console.error('Create structured question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStructuredQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating ID
    delete updates.id;

    // Validate MCQs if provided
    if (updates.mcqs) {
      if (!Array.isArray(updates.mcqs) || updates.mcqs.length === 0) {
        return res.status(400).json({ error: 'At least one MCQ is required' });
      }
      for (const mcq of updates.mcqs) {
        if (!mcq.question || !mcq.optionA || !mcq.optionB || !mcq.optionC || !mcq.optionD || !mcq.answer) {
          return res.status(400).json({ error: 'Each MCQ must have question, all options, and answer' });
        }
        if (!['A', 'B', 'C', 'D'].includes(mcq.answer)) {
          return res.status(400).json({ error: 'Answer must be A, B, C, or D' });
        }
      }
    }

    const updatedQuestion = await structuredQuestionModel.update(id, updates);

    if (!updatedQuestion) {
      return res.status(404).json({ error: 'Structured question not found' });
    }

    res.json({
      message: 'Structured question updated successfully',
      structuredQuestion: updatedQuestion
    });
  } catch (error) {
    console.error('Update structured question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteStructuredQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await structuredQuestionModel.delete(id);

    if (!result) {
      return res.status(404).json({ error: 'Structured question not found' });
    }

    res.json({
      message: 'Structured question deleted successfully'
    });
  } catch (error) {
    console.error('Delete structured question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

