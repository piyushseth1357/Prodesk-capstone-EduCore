const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/courses
// @desc    Get all courses with optional filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, level, search } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (level && level !== 'All') {
      query.level = level;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email role')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error while fetching courses' });
  }
});

// @route   GET /api/courses/my-courses
// @desc    Get courses owned by instructor or enrolled by student
// @access  Private
router.get('/my-courses', protect, async (req, res) => {
  try {
    if (req.user.role === 'instructor') {
      const courses = await Course.find({ instructor: req.user._id })
        .populate('instructor', 'name email')
        .sort({ createdAt: -1 });
      return res.json({ role: 'instructor', courses });
    } else {
      const enrollments = await Enrollment.find({ student: req.user._id })
        .populate({
          path: 'course',
          populate: { path: 'instructor', select: 'name email' }
        })
        .sort({ createdAt: -1 });

      const courses = enrollments
        .filter(e => e.course != null)
        .map(e => ({
          ...e.course._doc,
          progress: e.progress,
          enrolledAt: e.enrolledAt
        }));

      return res.json({ role: 'student', courses });
    }
  } catch (error) {
    console.error('Error fetching my courses:', error);
    res.status(500).json({ message: 'Server error while fetching user courses' });
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID with lessons
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email role');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 });

    res.json({ ...course._doc, lessons });
  } catch (error) {
    console.error('Error fetching course details:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Invalid Course ID format' });
    }
    res.status(500).json({ message: 'Server error while fetching course details' });
  }
});

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Instructor)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, level, price, thumbnail, lessons } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Please provide course title and description' });
    }

    const course = await Course.create({
      title,
      description,
      category: category || 'Web Development',
      level: level || 'Beginner',
      price: price !== undefined ? Number(price) : 0,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
      instructor: req.user._id
    });

    // Optionally create lessons if provided
    if (lessons && Array.isArray(lessons) && lessons.length > 0) {
      const lessonDocs = lessons.map((l, index) => ({
        course: course._id,
        title: l.title || `Lesson ${index + 1}`,
        videoUrl: l.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: l.duration || '10 mins',
        order: index + 1
      }));
      await Lesson.insertMany(lessonDocs);
    }

    const populatedCourse = await Course.findById(course._id).populate('instructor', 'name email');
    res.status(201).json(populatedCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: error.message || 'Server error while creating course' });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course with ownership validation
// @access  Private (Owner Only)
router.put('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // DATA OWNERSHIP VALIDATION (CRITICAL P0)
    // Compare document's instructor against decoded userId from JWT token
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Forbidden: You do not have ownership rights to modify this course'
      });
    }

    const { title, description, category, level, price, thumbnail } = req.body;

    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (level) course.level = level;
    if (price !== undefined) course.price = Number(price);
    if (thumbnail) course.thumbnail = thumbnail;

    const updatedCourse = await course.save();
    const populated = await Course.findById(updatedCourse._id).populate('instructor', 'name email');

    res.json(populated);
  } catch (error) {
    console.error('Error updating course:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Invalid Course ID format' });
    }
    res.status(500).json({ message: 'Server error while updating course' });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course with ownership validation
// @access  Private (Owner Only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // DATA OWNERSHIP VALIDATION (CRITICAL P0)
    // Compare document's instructor against decoded userId from JWT token
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Forbidden: You do not have ownership rights to delete this course'
      });
    }

    // Delete associated lessons and enrollments
    await Lesson.deleteMany({ course: course._id });
    await Enrollment.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(course._id);

    res.json({ message: 'Course deleted successfully', courseId: req.params.id });
  } catch (error) {
    console.error('Error deleting course:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Invalid Course ID format' });
    }
    res.status(500).json({ message: 'Server error while deleting course' });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll student in course
// @access  Private
router.post('/:id/enroll', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: course._id
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: course._id,
      paymentId: req.body.paymentId || `PAY_${Date.now()}`
    });

    res.status(201).json({
      message: 'Successfully enrolled in course!',
      enrollment
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Server error during course enrollment' });
  }
});

module.exports = router;
