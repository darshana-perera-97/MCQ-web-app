import { SummaryModel } from '../models/SummaryModel.js';

const summaryModel = new SummaryModel();

export const getAllSummaries = async (req, res) => {
  try {
    const summaries = await summaryModel.findAll();
    res.json({
      summaries,
      count: summaries.length
    });
  } catch (error) {
    console.error('Get summaries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSummaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const summary = await summaryModel.findById(id);

    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    res.json(summary);
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createSummary = async (req, res) => {
  try {
    const { title, question, paragraph, paragraphs, textInputs } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Generate unique ID
    const now = new Date();
    const yymmdd = now.toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const summaryId = `SUM-${yymmdd}-${random}`;

    // Auto-create a single textarea input if none provided
    const defaultTextInputs = textInputs && Array.isArray(textInputs) && textInputs.length > 0
      ? textInputs
      : [{ label: 'Summary', placeholder: 'Enter your summary here...', required: true }];

    // Handle both old format (paragraph) and new format (paragraphs array)
    let passagesArray = [];
    if (paragraphs && Array.isArray(paragraphs)) {
      passagesArray = paragraphs.filter(p => p && p.trim() !== '');
    } else if (paragraph && paragraph.trim() !== '') {
      passagesArray = [paragraph];
    }

    const newSummary = {
      id: summaryId,
      title,
      question: question || '',
      paragraph: passagesArray.length > 0 ? passagesArray[0] : '', // Keep for backward compatibility
      paragraphs: passagesArray, // New format: array of paragraphs
      textInputs: defaultTextInputs.map((input, index) => ({
        id: input.id || `input-${index + 1}`,
        label: input.label || `Input ${index + 1}`,
        placeholder: input.placeholder || '',
        required: input.required !== false,
        inputType: 'paragraph' // Always paragraph/textarea
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await summaryModel.create(newSummary);

    res.status(201).json({
      message: 'Summary created successfully',
      summary: newSummary
    });
  } catch (error) {
    console.error('Create summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, question, paragraph, paragraphs, textInputs } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (question !== undefined) updates.question = question;
    
    // Handle paragraphs update
    if (paragraphs !== undefined && Array.isArray(paragraphs)) {
      const passagesArray = paragraphs.filter(p => p && p.trim() !== '');
      updates.paragraphs = passagesArray;
      updates.paragraph = passagesArray.length > 0 ? passagesArray[0] : ''; // Keep for backward compatibility
    } else if (paragraph !== undefined) {
      updates.paragraph = paragraph;
      updates.paragraphs = paragraph && paragraph.trim() !== '' ? [paragraph] : [];
    }
    if (textInputs !== undefined) {
      // Auto-create a single textarea input if empty array provided
      const defaultTextInputs = Array.isArray(textInputs) && textInputs.length > 0
        ? textInputs
        : [{ label: 'Summary', placeholder: 'Enter your summary here...', required: true }];
      
      updates.textInputs = defaultTextInputs.map((input, index) => ({
        id: input.id || `input-${index + 1}`,
        label: input.label || `Input ${index + 1}`,
        placeholder: input.placeholder || '',
        required: input.required !== false,
        inputType: 'paragraph' // Always paragraph/textarea
      }));
    }
    updates.updatedAt = new Date().toISOString();

    const updatedSummary = await summaryModel.update(id, updates);

    if (!updatedSummary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    res.json({
      message: 'Summary updated successfully',
      summary: updatedSummary
    });
  } catch (error) {
    console.error('Update summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await summaryModel.delete(id);

    if (!result) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    res.json({ message: 'Summary deleted successfully' });
  } catch (error) {
    console.error('Delete summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

