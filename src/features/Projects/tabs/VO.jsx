// export default function VO() {
//   return <div>Variation Orders content</div>;
// }
import React, { useState } from 'react';
import { 
  Plus, 
  FileText, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  Download, 
  Upload, 
  Eye 
} from 'lucide-react';
import CreateVO from './CreateVO';

const VO = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateVOSlideOpen, setIsCreateVOSlideOpen] = useState(false);

  const stats = [
    {
      title: 'Total VOs',
      value: '47',
      subtitle: '+3 this week',
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Pending Review',
      value: '12',
      subtitle: 'Avg. 4 days',
      icon: Clock,
      color: 'orange'
    },
    {
      title: 'Total Value',
      value: '$1.2M',
      subtitle: '+$156K this month',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Approved',
      value: '28',
      subtitle: '60% approval rate',
      icon: CheckCircle,
      color: 'green'
    }
  ];

  const voData = [
    {
      id: 'VO-024',
      title: 'Additional Steel Reinforcement',
      daysOpen: '2 days open',
      category: 'Structural',
      createdBy: 'John Smith',
      status: 'Pending Review',
      amount: '$45,200',
      priority: 'High',
      lastUpdated: '2 hours ago'
    },
    {
      id: 'VO-023',
      title: 'Modified Drainage System',
      daysOpen: '5 days open',
      category: 'MEP',
      createdBy: 'Sarah Chen',
      status: 'Approved',
      amount: '$32,800',
      priority: 'Medium',
      lastUpdated: '1 day ago'
    },
    {
      id: 'VO-022',
      title: 'Upgraded Floor Finish',
      daysOpen: '8 days open',
      category: 'Finishes',
      createdBy: 'Mike Johnson',
      status: 'In Review',
      amount: '$18,500',
      priority: 'Low',
      lastUpdated: '3 days ago'
    },
    {
      id: 'VO-021',
      title: 'Additional Fire Safety Equipment',
      daysOpen: '4 days open',
      category: 'MEP',
      createdBy: 'Emma Davis',
      status: 'Pending Approval',
      amount: '$67,300',
      priority: 'High',
      lastUpdated: '4 days ago'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Pending Review':
        return 'bg-blue-100 text-blue-700';
      case 'In Review':
        return 'bg-yellow-100 text-yellow-700';
      case 'Pending Approval':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-orange-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Variation Orders
            </h1>
            <p className="text-gray-600">
              Track and manage all variation orders for Marina Bay Construction
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors" onClick={() => setIsCreateVOSlideOpen(true)}>
            <Plus size={20} />
            New VO
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-gray-600 text-sm font-medium">
                    {stat.title}
                  </span>
                  <Icon 
                    size={20} 
                    className={`text-${stat.color}-600`} 
                  />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className={`text-sm text-${stat.color}-600`}>
                  {stat.subtitle}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>All Categories</option>
                <option>Structural</option>
                <option>MEP</option>
                <option>Finishes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>All Statuses</option>
                <option>Pending Review</option>
                <option>Approved</option>
                <option>In Review</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>All Time</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search VOs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download size={20} className="text-gray-600" />
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    VO ID
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                    Priority
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                    Last Updated
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {voData.map((vo) => (
                  <tr key={vo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-blue-600">
                        {vo.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {vo.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {vo.daysOpen}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-700">{vo.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{vo.createdBy}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          vo.status
                        )}`}
                      >
                        {vo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {vo.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span
                        className={`text-sm font-medium ${getPriorityColor(
                          vo.priority
                        )}`}
                      >
                        {vo.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600">
                        {vo.lastUpdated}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium transition-colors">
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create VO Slider Form */}
      {isCreateVOSlideOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay - Click to close (covers main content area only) */}
          <div 
            className="absolute inset-0 bg-transparent backdrop-blur-sm"
            onClick={() => setIsCreateVOSlideOpen(false)}
          ></div>
          
          {/* Slider */}
          <div className="absolute right-0 top-0 h-full w-full max-w-6xl bg-white shadow-xl transform transition-all duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Create New Variation Order</h2>
                <button 
                  onClick={() => setIsCreateVOSlideOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* CreateVO Content */}
              <div className="flex-1 overflow-hidden">
                <CreateVO />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default VO;