import React from 'react';
import { Link } from 'react-router';
import { CheckCircle, ArrowRight, Calendar } from 'lucide-react';

export function SubmissionConfirmation() {
  const submissionDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-semibold text-gray-900 mb-4">
          Assessment Submitted Successfully
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Your institutional capacity assessment has been recorded and is now
          submitted for review.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center gap-3 text-gray-700">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Submitted on {submissionDate}</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Campaign: Q1 2026 Assessment
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/campaigns"
            className="block w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Campaigns
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Preliminary Results
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Complete results will be available after validation by the auditor.
        </p>
      </div>
    </div>
  );
}
