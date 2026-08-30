import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CourseFormModal from '../components/CourseFormModal';
import {
  ShieldCheck, BookOpen, Key, CheckCircle, AlertTriangle, UserCheck,
  Plus, Edit3, Trash2, CreditCard, Sparkles
} from 'lucide-react';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses/my-courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load user courses');
      }
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyCourses();
    }
  }, [token]);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // OPTIMISTIC UI DELETION (Phase 2 P1 Requirement)
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    // 1. OPTIMISTIC UPDATE: Filter out instantly from state array without page reload
    const previousCourses = [...courses];
    setCourses(prev => prev.filter(c => c._id !== courseId));
    showToast('Course removed instantly from DOM (Optimistic UI)', 'success');

    // 2. Asynchronous API call in background
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Rollback state if unauthorized (403) or error
        setCourses(previousCourses);
        showToast(errorData.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      setCourses(previousCourses);
      showToast('Network error during deletion', 'error');
    }
  };

  const handleSaveCourse = (savedCourse, isEdit) => {
    if (isEdit) {
      setCourses(prev => prev.map(c => c._id === savedCourse._id ? savedCourse : c));
      showToast('Course updated successfully!');
    } else {
      setCourses(prev => [savedCourse, ...prev]);
      showToast('Course created successfully!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Banner */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center space-x-2 text-sm font-medium animate-bounce ${
          toastMessage.type === 'error' ? 'bg-red-900 text-white border-red-700' : 'bg-emerald-900 text-white border-emerald-700'
        }`}>
          {toastMessage.type === 'error' ? <AlertTriangle className="h-5 w-5 text-red-400" /> : <CheckCircle className="h-5 w-5 text-emerald-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-8 shadow-xl mb-8 border border-indigo-700/30">
        <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 border border-indigo-400/30">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Sprint 15 Fullstack Dashboard</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-indigo-200 text-sm mt-1">
              Logged in as <span className="font-semibold text-white uppercase">{user?.role}</span> • Data Ownership & Stripe Active
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {user?.role === 'instructor' && (
              <button
                onClick={() => { setEditingCourse(null); setIsModalOpen(true); }}
                className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow transition"
              >
                <Plus className="h-4 w-4" />
                <span>New Course</span>
              </button>
            )}
            <div className="bg-slate-800/80 backdrop-blur p-3 rounded-xl border border-slate-700 text-xs">
              <div className="text-slate-400">Security & Stripe Pipeline</div>
              <div className="text-emerald-400 font-mono text-xs flex items-center space-x-1 mt-0.5 font-semibold">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>403 Ownership & Stripe Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses List Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <span>{user?.role === 'instructor' ? 'Courses Managed by You' : 'Your Enrolled Courses'}</span>
          </h2>
          <Link to="/courses" className="text-sm font-bold text-indigo-600 hover:underline">
            Explore All Courses →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">
              {user?.role === 'instructor' ? 'No courses created yet' : 'No enrolled courses found'}
            </h3>
            <p className="text-gray-500 text-sm mt-1 mb-4">
              {user?.role === 'instructor'
                ? 'Click "New Course" to create your first course and start selling.'
                : 'Browse our catalog and enroll in your first course using Stripe.'}
            </p>
            {user?.role === 'instructor' ? (
              <button
                onClick={() => { setEditingCourse(null); setIsModalOpen(true); }}
                className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Course</span>
              </button>
            ) : (
              <Link to="/courses" className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow">
                <span>Browse Catalog</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative h-40 bg-gray-100 overflow-hidden">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-slate-900/80 text-white px-2 py-0.5 rounded text-xs font-bold">
                      ${course.price} USD
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                      {course.category}
                    </div>
                    <h3 className="font-bold text-gray-900 text-base line-clamp-1 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-500 text-xs line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-gray-100 mt-2 flex items-center justify-between">
                  <Link to={`/courses/${course._id}`} className="text-xs font-bold text-indigo-600 hover:underline">
                    View Course →
                  </Link>

                  {user?.role === 'instructor' && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => { setEditingCourse(course); setIsModalOpen(true); }}
                        title="Edit Course"
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        title="Delete Course (Optimistic UI)"
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CourseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCourse}
        editingCourse={editingCourse}
      />
    </div>
  );
};

export default Dashboard;
