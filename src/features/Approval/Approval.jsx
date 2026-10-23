
import React, { useState } from 'react';
import { Clock, FileText, AlertCircle, DollarSign, Eye, Check, X, MessageSquare } from 'lucide-react';

export default function ApprovalWorkflow() {
  const [showDecision, setShowDecision] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedAction, setSelectedAction] = useState(null);

  const handleReviewDecide = () => {
    setShowDecision(true);
  };

  const handleAction = (action) => {
    if (!comment && (action === 'reject' || action === 'query')) {
      alert('Please add a comment for reject/query actions');
      return;
    }
    setSelectedAction(action);
    alert(`Action: ${action.toUpperCase()}\nComment: ${comment || 'No comment'}`);
  };

  const handleCancel = () => {
    setShowDecision(false);
    setComment('');
    setSelectedAction(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Requires My Approval</p>
              <p className="text-4xl font-bold">2</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Pending</p>
              <p className="text-4xl font-bold">5</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <FileText className="text-gray-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Critical Items</p>
              <p className="text-4xl font-bold text-red-600">1</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Value</p>
              <p className="text-4xl font-bold">$28,000</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-gray-700 font-medium">Filter:</span>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
            All
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">
            Critical
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">
            High Priority
          </button>
        </div>
      </div>

      {/* Variation Order Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
              <DollarSign size={16} />
              Variation Order
            </span>
            <span className="text-gray-600">VO-002</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium">
              MEDIUM
            </span>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Amount</p>
            <p className="text-2xl font-bold">$28,000</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-3">Change in Flooring Material</h2>
        <p className="text-gray-700 mb-4">
          Client requested upgrade from standard tiles to premium marble flooring in main lobby.
        </p>

        <div className="flex gap-6 text-sm text-gray-600 mb-6">
          <span>
            <strong>Project:</strong> Downtown Plaza Construction
          </span>
          <span>
            <strong>Submitted by:</strong> Architect
          </span>
          <span>
            <strong>Date:</strong> 2024-12-22
          </span>
        </div>

        {!showDecision ? (
          <div className="flex gap-4">
            <button
              onClick={handleReviewDecide}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Review & Decide
            </button>
            <button className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2">
              <Eye size={20} />
              View Details
            </button>
          </div>
        ) : (
          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your comment (required for reject/query)"
              className="w-full border border-gray-300 rounded-lg p-4 mb-4 min-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-4">
              <button
                onClick={() => handleAction('approve')}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Approve
              </button>
              <button
                onClick={() => handleAction('query')}
                className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition flex items-center justify-center gap-2"
              >
                <MessageSquare size={20} />
                Query
              </button>
              <button
                onClick={() => handleAction('reject')}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <X size={20} />
                Reject
              </button>
              <button
                onClick={handleCancel}
                className="px-8 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Second Item Preview */}
      {/* <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
            <FileText size={16} />
            RFI
          </span>
          <span className="text-gray-600">RFI-004</span>
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium">
            MEDIUM
          </span>
        </div>
      </div> */}
    </div>
  );
}
