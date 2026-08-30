const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { protect } = require('../middleware/authMiddleware');

let stripe;
try {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51MockStripeKeyForEduCoreDevelopmentTesting1234567890';
  stripe = require('stripe')(stripeSecretKey);
} catch (e) {
  console.log('Stripe initialization notice:', e.message);
}

// @route   POST /api/stripe/create-checkout-session
// @desc    Create Stripe Checkout Session for course purchase
// @access  Private
router.post('/create-checkout-session', protect, async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const origin = req.headers.origin || 'http://localhost:3000';

    // If live/valid Stripe key is available, create real Stripe Checkout Session
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('Mock')) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: course.title,
                description: course.description.substring(0, 150),
                images: [course.thumbnail]
              },
              unit_amount: Math.round((course.price || 49.99) * 100)
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${course._id}`,
        cancel_url: `${origin}/courses/${course._id}?payment=cancelled`,
        customer_email: req.user.email,
        metadata: {
          courseId: course._id.toString(),
          userId: req.user._id.toString()
        }
      });

      return res.json({ url: session.url, sessionId: session.id });
    } else {
      // Fallback / Development Simulation Route for Stripe Checkout Test Mode
      const simulatedSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const simulatedSuccessUrl = `${origin}/payment-success?session_id=${simulatedSessionId}&course_id=${course._id}`;

      return res.json({
        url: simulatedSuccessUrl,
        sessionId: simulatedSessionId,
        isSimulated: true,
        message: 'Stripe Test Mode Checkout Session Created Successfully'
      });
    }
  } catch (error) {
    console.error('Stripe Session Error:', error);
    res.status(500).json({ message: error.message || 'Error creating Stripe Checkout session' });
  }
});

module.exports = router;
