const { z } = require('zod');

const createCourseSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).min(3, 'Title must be at least 3 characters').trim(),
  description: z.string({ required_error: 'Description is required' }).min(10, 'Description must be at least 10 characters').trim(),
  category: z.enum(['Web Development', 'Data Science', 'Mobile Apps', 'Design', 'Business', 'Other']).optional().default('Web Development'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional().default('Beginner'),
  price: z.number().min(0, 'Price cannot be negative').optional().default(0),
  thumbnail: z.string().url('Thumbnail must be a valid URL').optional().or(z.literal('')),
  lessons: z.array(z.object({
    title: z.string().min(1),
    videoUrl: z.string().optional(),
    duration: z.string().optional()
  })).optional()
});

const updateCourseSchema = createCourseSchema.partial();

module.exports = { createCourseSchema, updateCourseSchema };
