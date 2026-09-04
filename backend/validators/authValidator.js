const { z } = require('zod');

const registerSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters').trim(),
  email: z.string({ required_error: 'Email is required' }).email('Please provide a valid email address').trim().toLowerCase(),
  password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'instructor'], { invalid_type_error: 'Role must be student or instructor' }).optional().default('student')
});

const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).email('Please provide a valid email address').trim().toLowerCase(),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password cannot be empty')
});

module.exports = { registerSchema, loginSchema };
