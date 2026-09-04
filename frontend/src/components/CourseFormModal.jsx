import React, { useState, useEffect } from 'react';
import { X, BookOpen, DollarSign, Image, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AICourseAssistant from './AICourseAssistant';

const CourseFormModal = ({ isOpen, onClose, onSave, editingCourse = null }) => {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [level, setLevel] = useState('Beginner');
  const [price, setPrice] = useState(29.99);
  const [thumbnail, setThumbnail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    if (editingCourse) {
      setTitle(editingCourse.title || '');
      setDescription(editingCourse.description || '');
      setCategory(editingCourse.category || 'Web Development');
      setLevel(editingCourse.level || 'Beginner');
      setPrice(editingCourse.price !== undefined ? editingCourse.price : 29.99);
      setThumbnail(editingCourse.thumbnail || '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('Web Development');
      setLevel('Beginner');
      setPrice(29.99);
      setThumbnail('');
    }
    setError('');
  }, [editingCourse, isOpen]);

  if (!isOpen) return null;

  const handleApplyAiSyllabus = (aiData) => {
    if (aiData.title) setTitle(aiData.title);
    if (aiData.summary) {
      let fullDesc = aiData.summary;
      if (aiData.keyPoints?.length > 0) {
        fullDesc += '\n\nKey Highlights:\n' + aiData.keyPoints.join('\n');
      }
      setDescription(fullDesc);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const url = editingCourse
        ? `/api/courses/${editingCourse._id}`
        : '/api/courses';
      const method = editingCourse ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          category,
          level,
          price: Number(price),
          thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save course');
      }

      onSave(data, !!editingCourse);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {editingCourse ? 'Edit Course Details' : 'Create New Course'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* AI Copilot Trigger Button */}
          <div className="mb-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span className="font-semibold text-gray-800">Need help writing curriculum?</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition flex items-center space-x-1"
            >
              <span>✨ Generate with AI</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Course Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master React & Node.js Development"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed course description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Mobile Apps">Mobile Apps</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Skill Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Price ($ USD)</label>
                <div className="relative">
                  <DollarSign className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Thumbnail URL</label>
                <div className="relative">
                  <Image className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow transition disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <AICourseAssistant
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplySyllabus={handleApplyAiSyllabus}
      />
    </>
  );
};

export default CourseFormModal;
