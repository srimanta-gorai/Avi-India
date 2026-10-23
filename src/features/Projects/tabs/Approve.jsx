import React, { useState, useEffect } from 'react';
import ApproveCard from '../../../components/Approve_card';

export default function Approve() {
  
  const approvalItems = [
    {
      id: 1,
      title: 'Project Budget Approval',
      description: 'Request for additional budget of $5,000 for Q4 marketing campaign',
      requester: 'John Doe',
      date: '2025-12-29',
      status: 'pending'
    },

  ];

  const handleApprove = (id) => {
    console.log('Approved item:', id);
    // Add your approval logic here
  };

  const handleReject = (id) => {
    console.log('Rejected item:', id);
    // Add your rejection logic here
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Approval Requests</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        {approvalItems.map((item) => (
          <ApproveCard
            key={item.id}
            item={item}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
      </div>
    </div>
  );
};