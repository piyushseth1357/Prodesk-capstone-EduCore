import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CourseFormModal from '../components/CourseFormModal';
import {
  Search, Filter, Plus, Edit3, Trash2, BookOpen,
  DollarSign, Sparkles, User, AlertCircle, CheckCircle
} from 'lucide-react';

const CourseCatalog = () => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch courses from backend
  const fetchCourses = async () => {
    try {
      setLoading(true);
      let queryParams = new URLSearchParams();
      if (category !== 'All') queryParams.append('category', category);
      if (level !== 'All') queryParams.append('level', level);
      if (search) queryParams.append('search', search);

      const response = await fetch(`/api/courses?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [category, level, search]);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // OPTIMISTIC UI DELETION (Phase 2 P1 Priority Requirement)
  const handleDeleteCourse = async (courseId, instructorId) => {
    // 1. Data Ownership Pre-Check
    if (user && instructorId && instructorId._id !== user._id && instructorId !== user._id) {
      showToast('403 Forbidden: You do not own this course', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this course?')) return;

    // 2. OPTIMISTIC UI UPDATE: Instantly mutate DOM state array without reload or waiting
    const previousCourses = [...courses];
    setCourses(prev => prev.filter(c => c._id !== courseId));
    showToast('Course removed instantly from UI (Optimistic Update)', 'success');

    // 3. Asynchronous API call in background
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Rollback state if backend returns error (e.g. 403 Forbidden)
        setCourses(previousCourses);
        showToast(errorData.message || 'Deletion failed on server', 'error');
      }
    } catch (err) {
      // Rollback on network failure
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
      showToast('Course published successfully!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center space-x-2 text-sm font-medium animate-bounce ${
          toastMessage.type === 'error'
            ? 'bg-red-900 text-white border-red-700'
            : 'bg-emerald-900 text-white border-emerald-700'
        }`}>
          {toastMessage.type === 'error' ? <AlertCircle className="h-5 w-5 text-red-400" /> : <CheckCircle className="h-5 w-5 text-emerald-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>EduCore Course Directory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Browse Courses</h1>
          <p className="text-gray-500 text-sm mt-1">Explore high-quality courses or create your own</p>
        </div>

        {user?.role === 'instructor' && (
          <button
            onClick={() => { setEditingCourse(null); setIsModalOpen(true); }}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition shrink-0"
          >
            <Plus className="h-5 w-5" />
            <span>Create Course</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by course title or keyword..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-xs text-gray-500 font-semibold uppercase">
            <Filter className="h-4 w-4" />
            <span>Category:</span>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Web Development">Web Development</option>
            <option value="Data Science">Data Science</option>
            <option value="Mobile Apps">Mobile Apps</option>
            <option value="Design">Design</option>
            <option value="Business">Business</option>
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-8">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900">No courses found</h3>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your category or search filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isOwner = user && course.instructor && (course.instructor._id === user._id || course.instructor === user._id);

            return (
              <div
                key={course._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col group"
              >
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur text-white px-2.5 py-1 rounded-full text-xs font-bold shadow">
                    ${course.price} USD
                  </div>
                  <div className="absolute top-3 left-3 bg-indigo-600 text-white px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-extrabold shadow">
                    {course.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span className="font-medium text-indigo-600">{course.level}</span>
                      <span className="flex items-center space-x-1 text-gray-600">
                        <User className="h-3.5 w-3.5" />
                        <span>{course.instructor?.name || 'Instructor'}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-indigo-600 transition">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {course.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <Link
                      to={`/courses/${course._id}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                    >
                      View Details & Syllabus →
                    </Link>

                    {/* Owner controls (PUT & DELETE with Optimistic UI) */}
                    {isOwner && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => { setEditingCourse(course); setIsModalOpen(true); }}
                          title="Edit Course"
                          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course._id, course.instructor)}
                          title="Delete Course (Optimistic UI)"
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Create/Edit Modal */}
      <CourseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCourse}
        editingCourse={editingCourse}
      />
    </div>
  );
};

export default CourseCatalog;
