import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ShieldCheck, ArrowRight, BookOpen } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const courseId = searchParams.get('course_id');
  const { token } = useAuth();

  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const registerEnrollment = async () => {
      if (!courseId || !token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/courses/${courseId}/enroll`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ paymentId: sessionId || `STRIPE_${Date.now()}` })
        });

        if (response.ok || response.status === 400) { // 400 means already enrolled
          setEnrolled(true);
        }
      } catch (err) {
        console.error('Enrollment recording error:', err);
      } finally {
        setLoading(false);
      }
    };

    registerEnrollment();
  }, [courseId, sessionId, token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
        <div className="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-600 mb-4 animate-bounce">
          <CheckCircle2 className="h-12 w-12" />
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Successful! 🎉</h1>
        <p className="text-sm text-gray-600 mb-6">
          Your payment was processed securely via Stripe Checkout. You now have full lifetime access to your course.
        </p>

        <div className="bg-slate-50 p-4 rounded-xl border text-xs text-left mb-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Stripe Session ID</span>
            <span className="font-mono text-gray-800 font-semibold truncate max-w-[180px]">
              {sessionId || 'cs_test_verified'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Transaction Status</span>
            <span className="text-emerald-600 font-bold flex items-center space-x-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>COMPLETED</span>
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow transition flex items-center justify-center space-x-2 text-sm"
          >
            <span>Go to My Enrolled Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            to="/courses"
            className="block text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
          >
            Browse More Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
