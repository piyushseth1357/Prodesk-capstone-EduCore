const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const validateRequest = require('../middleware/validateRequest');
const { aiSuggestSchema } = require('../validators/aiValidator');
const { protect } = require('../middleware/authMiddleware');

// Initialize Google Generative AI client if API key is provided
let genAI;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (e) {
  // Graceful fallback notice
}

// @route   POST /api/ai/suggest
// @desc    Generate AI course descriptions, syllabus, or study tips
// @access  Private (Authenticated Users)
router.post('/suggest', protect, validateRequest(aiSuggestSchema), async (req, res, next) => {
  try {
    const { prompt, type } = req.body;

    // Check if live Gemini API key is configured
    if (process.env.GEMINI_API_KEY && genAI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = `You are an AI assistant for EduCore LMS. You MUST respond ONLY with a valid, parsable JSON object matching this exact schema: {"title": "String", "summary": "String", "keyPoints": ["String"], "suggestedLessons": ["String"]}. Do not include markdown formatting, backticks, or extra text. Prompt: ${prompt}`;

      const result = await model.generateContent(systemPrompt);
      const responseText = result.response.text();

      // Clean markdown code blocks if any
      const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(cleanedJson);
      } catch (err) {
        parsedPayload = {
          title: `AI Recommendation for "${prompt}"`,
          summary: cleanedJson,
          keyPoints: ['Comprehensive Curriculum', 'Interactive Exercises', 'Real-world Projects'],
          suggestedLessons: ['1. Introduction & Overview', '2. Core Concepts', '3. Advanced Mastery']
        };
      }

      return res.json({
        status: 'success',
        provider: 'Google Gemini AI',
        data: parsedPayload
      });
    }

    // Graceful Intelligent AI Engine Fallback (when GEMINI_API_KEY is in development / unconfigured)
    let simulatedPayload;
    if (type === 'syllabus') {
      simulatedPayload = {
        title: `Complete AI Syllabus: ${prompt}`,
        summary: `A structured learning journey designed to master ${prompt} step-by-step.`,
        keyPoints: ['Foundational Concepts', 'Hands-on Coding Labs', 'Capstone Project Build'],
        suggestedLessons: [
          `Module 1: Introduction to ${prompt}`,
          `Module 2: Deep Dive into Core Principles`,
          `Module 3: Building Real-World Applications`,
          `Module 4: Performance Optimization & Security`,
          `Module 5: Capstone Project Deployment`
        ]
      };
    } else {
      simulatedPayload = {
        title: `Professional Course Outline: ${prompt}`,
        summary: `Master ${prompt} with this comprehensive, industry-aligned course syllabus. Designed for beginners and intermediate learners.`,
        keyPoints: [
          'Step-by-step practical guides and video walkthroughs',
          'Industry best practices and security fundamentals',
          'Fullstack integration and capstone portfolio projects'
        ],
        suggestedLessons: [
          `Lesson 1: Getting Started with ${prompt}`,
          `Lesson 2: Architecture & Data Modeling`,
          `Lesson 3: Advanced Feature Implementation`,
          `Lesson 4: Testing & Deployment Best Practices`
        ]
      };
    }

    return res.json({
      status: 'success',
      provider: 'EduCore Intelligent AI Engine',
      data: simulatedPayload
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
