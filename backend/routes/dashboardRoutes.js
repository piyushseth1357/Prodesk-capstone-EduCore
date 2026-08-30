const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/dashboard/summary
// @desc    Get protected dashboard data
// @access  Private
router.get('/summary', protect, async (req, res) => {
  res.json({
    message: `Welcome to your EduCore Dashboard, ${req.user.name}!`,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    },
    stats: {
      enrolledCourses: req.user.role === 'student' ? 3 : undefined,
      createdCourses: req.user.role === 'instructor' ? 5 : undefined,
      completedLessons: req.user.role === 'student' ? 12 : undefined
    }
  });
});

module.exports = router;
