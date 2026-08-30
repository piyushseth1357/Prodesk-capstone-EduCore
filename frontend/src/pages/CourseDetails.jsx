import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, PlayCircle, CheckCircle, Shield,
  CreditCard, ArrowLeft, Clock, User, AlertCircle
} from 'lucide-react';

const CourseDetails = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/courses/${id}`);
        if (!response.ok) {
          throw new Error('Course not found');
        }
        const data = await response.json();
        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  // STRIPE CHECKOUT TRIGGER (Phase 3 P2 Monetization Requirement)
  const handleStripeCheckout = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setPurchasing(true);
      setError('');

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: course._id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initiate Stripe Checkout session');
      }

      // Redirect user to Stripe hosted checkout page (or simulated test success page)
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (err) {
      setError(err.message);
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900">{error || 'Course not found'}</h2>
        <Link to="/courses" className="mt-4 inline-block text-indigo-600 font-semibold hover:underline">
          ← Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/courses" className="inline-flex items-center space-x-1 text-sm font-semibold text-gray-600 hover:text-indigo-600 mb-6 transition">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Course Directory</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <span className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              {course.category} • {course.level}
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">{course.title}</h1>
            <p className="text-gray-600 leading-relaxed mb-6">{course.description}</p>

            <div className="flex items-center space-x-4 border-t pt-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4 text-indigo-600" />
                <span>Instructor: <strong className="text-gray-800">{course.instructor?.name || 'Educator'}</strong></span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span>Verified Curriculum</span>
              </div>
            </div>
          </div>

          {/* Syllabus & Lessons */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <span>Course Syllabus & Lessons</span>
            </h2>

            {course.lessons && course.lessons.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {course.lessons.map((lesson, idx) => (
                  <div key={lesson._id || idx} className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg transition">
                    <div className="flex items-center space-x-3">
                      <PlayCircle className="h-5 w-5 text-indigo-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{lesson.order || idx + 1}. {lesson.title}</div>
                        <div className="text-xs text-gray-400">Video Lesson</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {lesson.duration || '10 mins'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-xl">
                No individual lessons published yet. Enrolled students will receive full video access upon enrollment.
              </div>
            )}
          </div>
        </div>

        {/* Stripe Purchase Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 sticky top-6">
            <div className="rounded-xl overflow-hidden mb-6 bg-gray-100 h-48">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            </div>

            <div className="mb-6">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Enrollment Fee</div>
              <div className="text-3xl font-extrabold text-gray-900 mt-1">${course.price} <span className="text-sm text-gray-500 font-normal">USD</span></div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-xs flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleStripeCheckout}
              disabled={purchasing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-200 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <CreditCard className="h-5 w-5" />
              <span>{purchasing ? 'Redirecting to Stripe...' : 'Enroll Now via Stripe'}</span>
            </button>

            <div className="mt-4 text-center">
              <div className="text-[11px] text-gray-400 flex items-center justify-center space-x-1">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                <span>Encrypted 256-bit Stripe Test Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
