const { z } = require('zod');

const aiSuggestSchema = z.object({
  prompt: z.string({ required_error: 'Prompt is required' }).min(3, 'Prompt must be at least 3 characters').max(500, 'Prompt too long').trim(),
  type: z.enum(['description', 'syllabus', 'study_tips', 'summary']).optional().default('description')
});

module.exports = { aiSuggestSchema };
