// export default function History() {
//   return <div>History content</div>;
// }
import React, { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronRight, Clock, DollarSign, MessageSquare, Paperclip, Download, Shield, Edit, Eye, Lock, History as historyTab, Upload, User, FileText } from 'lucide-react';

const HistoryScreen = () => {
  const [expandedVersions, setExpandedVersions] = useState([5]);

  const project = {
    name: 'Riverside Commercial Complex',
    client: 'Harbor Developments Ltd'
  };

  const versions = [
    {
      version: 5,
      status: 'current',
      title: 'Version 5 - Owner Approved',
      author: 'Emma Wilson',
      authorRole: 'Owner',
      timestamp: '2024-12-16 03:45 PM',
      action: 'Approved',
      actionIcon: CheckCircle,
      actionColor: 'green',
      description: 'Final approved version with all technical reviews completed. Ready for implementation. Installation of comprehensive fire safety system in basement level including fire suppression equipment, emergency signage, and alarm system integration.',
      costSummary: {
        labour: 10900,
        materials: 30875,
        equipment: 5500,
        testing: 2500,
        total: 49775
      },
      attachments: [
        { name: 'final-approval-signed.pdf', size: '1.2 MB', type: 'PDF' },
        { name: 'owner-authorization.pdf', size: '856 KB', type: 'PDF' }
      ],
      comments: [
        { user: 'Emma Wilson', message: 'Approved for implementation. Please proceed with scheduling.', time: '3:45 PM' }
      ],
      changes: ['Owner approved the variation', 'Authorization documents signed']
    },
    {
      version: 4,
      status: 'superseded',
      title: 'Version 4 - QS Cost Review',
      author: 'Mike Chen',
      authorRole: 'Quantity Surveyor',
      timestamp: '2024-12-16 10:30 AM',
      action: 'Cost Updated',
      actionIcon: DollarSign,
      actionColor: 'blue',
      description: 'QS reviewed and finalized cost breakdown. Adjusted labour rates based on specialist requirements and added contingency allowance. Installation of comprehensive fire safety system in basement level.',
      costSummary: {
        labour: 10900,
        materials: 30875,
        equipment: 5500,
        testing: 2500,
        total: 49775
      },
      attachments: [
        { name: 'detailed-cost-breakdown-v4.xlsx', size: '1.8 MB', type: 'XLSX' },
        { name: 'vendor-quotes-compiled.pdf', size: '3.2 MB', type: 'PDF' }
      ],
      comments: [
        { user: 'Mike Chen', message: 'Updated labour rates to reflect specialist fire safety installation requirements.', time: '10:30 AM' },
        { user: 'Sarah Chen', message: 'Cost breakdown looks accurate. Ready for owner review.', time: '11:15 AM' }
      ],
      changes: ['Labour costs adjusted from $9,200 to $10,900', 'Added equipment hire line item', 'Total updated to $49,775']
    },
    {
      version: 3,
      status: 'superseded',
      title: 'Version 3 - Architect Technical Review',
      author: 'Sarah Chen',
      authorRole: 'Architect',
      timestamp: '2024-12-15 02:30 PM',
      action: 'Approved for Costing',
      actionIcon: CheckCircle,
      actionColor: 'green',
      description: 'Technical review completed. Specifications verified against AS 1851-2024 standards. Added clarification on BMS integration requirements. Installation of fire safety system in basement level.',
      costSummary: {
        labour: 9200,
        materials: 28500,
        equipment: 0,
        testing: 2500,
        total: 40200
      },
      attachments: [
        { name: 'architect-review-notes.pdf', size: '945 KB', type: 'PDF' },
        { name: 'technical-specifications.pdf', size: '2.1 MB', type: 'PDF' },
        { name: 'bms-integration-diagram.dwg', size: '1.5 MB', type: 'DWG' }
      ],
      comments: [
        { user: 'Sarah Chen', message: 'All specifications meet current fire safety standards. Approved to proceed with cost estimation.', time: '2:30 PM' },
        { user: 'John Smith', message: 'Thank you. Will coordinate with QS for detailed pricing.', time: '3:15 PM' }
      ],
      changes: ['Added BMS integration specifications', 'Clarified emergency signage requirements', 'Technical drawings updated']
    },
    {
      version: 2,
      status: 'superseded',
      title: 'Version 2 - Additional Evidence Submitted',
      author: 'John Smith',
      authorRole: 'Contractor',
      timestamp: '2024-12-15 10:15 AM',
      action: 'Updated',
      actionIcon: Edit,
      actionColor: 'orange',
      description: 'Added site measurements and fire consultant report as requested. Expanded description to include BMS integration requirements. Installation of fire safety system in basement level.',
      costSummary: {
        labour: 9200,
        materials: 28500,
        equipment: 0,
        testing: 2500,
        total: 40200
      },
      attachments: [
        { name: 'fire-consultant-report.pdf', size: '2.4 MB', type: 'PDF' },
        { name: 'site-measurements.pdf', size: '1.1 MB', type: 'PDF' },
        { name: 'site-photos-updated.zip', size: '5.3 MB', type: 'ZIP' }
      ],
      comments: [
        { user: 'Sarah Chen', message: 'Please provide fire safety consultant report and detailed measurements.', time: '9:00 AM' },
        { user: 'John Smith', message: 'Added consultant report and site measurements as requested.', time: '10:15 AM' }
      ],
      changes: ['Added fire consultant report', 'Included detailed site measurements', 'Uploaded additional site photos']
    },
    {
      version: 1,
      status: 'superseded',
      title: 'Version 1 - Initial Submission',
      author: 'John Smith',
      authorRole: 'Contractor',
      timestamp: '2024-12-14 04:30 PM',
      action: 'Submitted',
      actionIcon: Upload,
      actionColor: 'purple',
      description: 'Initial variation order submission for additional fire safety system installation in basement level. Basic scope and preliminary cost estimate provided.',
      costSummary: {
        labour: 8500,
        materials: 25000,
        equipment: 0,
        testing: 0,
        total: 33500
      },
      attachments: [
        { name: 'site-photo-basement-01.jpg', size: '2.4 MB', type: 'JPG' },
        { name: 'initial-scope.pdf', size: '856 KB', type: 'PDF' }
      ],
      comments: [
        { user: 'John Smith', message: 'Initial submission for fire safety system upgrade as per new regulations.', time: '4:30 PM' }
      ],
      changes: ['Initial variation order created']
    }
  ];

  const toggleVersion = (version) => {
    if (expandedVersions.includes(version)) {
      setExpandedVersions(expandedVersions.filter(v => v !== version));
    } else {
      setExpandedVersions([...expandedVersions, version]);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'current') {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          CURRENT VERSION
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold flex items-center gap-1">
        <Lock className="w-3 h-3" />
        READ ONLY
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <historyTab className="w-4 h-4" />
              <span>Variation Orders / VO-058</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Version History</h1>
                <p className="text-gray-600">
                  Complete audit trail for VO-058: Additional Fire Safety System Installation
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <div className="flex items-center gap-2 text-blue-700 font-medium mb-1">
                    <Shield className="w-4 h-4" />
                    Audit-compliant
                  </div>
                  <div className="text-xs text-blue-600">
                    • All changes tracked
                    <br />• {versions.length} versions recorded
                  </div>
                </div>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export History
                </button>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-linear-to-b from-blue-400 via-blue-300 to-gray-200"></div>

            <div className="space-y-6">
              {versions.map((version, index) => {
                const isExpanded = expandedVersions.includes(version.version);
                const ActionIcon = version.actionIcon;
                return (
                  <div key={version.version} className="relative pl-20">
                    <div
                      className={`absolute left-4 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-lg ${version.status === 'current'
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                        }`}
                    >
                      <span className="text-white text-xs font-bold">
                        {version.version}
                      </span>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div
                        onClick={() => toggleVersion(version.version)}
                        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {version.title}
                            </h3>
                            {getStatusBadge(version.status)}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                {version.author.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {version.author}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {version.authorRole}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{version.timestamp}</span>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-${version.actionColor}-700 bg-${version.actionColor}-100`}>
                              <ActionIcon className="w-4 h-4" />
                              <span>{version.action}</span>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5" />
                              ) : (
                                <ChevronRight className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">Cost</div>
                              <div className="text-sm font-semibold text-gray-900">
                                ${version.costSummary.total.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Paperclip className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">Attachments</div>
                              <div className="text-sm font-semibold text-gray-900">
                                {version.attachments.length}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">Comments</div>
                              <div className="text-sm font-semibold text-gray-900">
                                {version.comments.length}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Edit className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">Changes</div>
                              <div className="text-sm font-semibold text-gray-900">
                                {version.changes.length}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-6">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Description Snapshot
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed bg-white p-4 rounded-lg">
                              {version.description}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <Edit className="w-4 h-4" />
                              Changes Made in This Version
                            </h4>
                            <ul className="space-y-2">
                              {version.changes.map((change, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg">
                                  <span className="text-blue-500 mt-0.5">•</span>
                                  <span>{change}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Cost Summary
                            </h4>
                            <div className="bg-white rounded-lg p-4 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Labour</span>
                                <span className="font-medium text-gray-900">
                                  ${version.costSummary.labour.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Materials</span>
                                <span className="font-medium text-gray-900">
                                  ${version.costSummary.materials.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Equipment</span>
                                <span className="font-medium text-gray-900">
                                  ${version.costSummary.equipment.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Testing</span>
                                <span className="font-medium text-gray-900">
                                  ${version.costSummary.testing.toLocaleString()}
                                </span>
                              </div>
                              <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-bold">
                                <span className="text-gray-900">Total</span>
                                <span className="text-blue-600">
                                  ${version.costSummary.total.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <Paperclip className="w-4 h-4" />
                              Attached Files ({version.attachments.length})
                            </h4>
                            <div className="space-y-2">
                              {version.attachments.map((file, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between bg-white p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs font-bold">
                                      {file.type}
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {file.name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {file.type} • {file.size}
                                      </div>
                                    </div>
                                  </div>
                                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Comments ({version.comments.length})
                            </h4>
                            <div className="space-y-3">
                              {version.comments.map((comment, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-lg">
                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-semibold">
                                      {comment.user.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold text-gray-900">
                                          {comment.user}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {comment.time}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600">{comment.message}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                              <Eye className="w-4 h-4" />
                              View Full Details
                            </button>
                            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                              <Download className="w-4 h-4" />
                              Download Version
                            </button>
                            {version.status === 'superseded' && (
                              <button className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Read Only
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Audit Trail Integrity
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  This version history is immutable and audit-compliant. All changes, approvals,
                  and modifications are permanently recorded with timestamps and user attribution.
                  Historical versions cannot be edited or deleted to maintain complete
                  transparency and accountability.
                </p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700 font-medium">Tamper-proof</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700 font-medium">Timestamped</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700 font-medium">User-attributed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700 font-medium">Compliant with ISO 19650</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryScreen;
