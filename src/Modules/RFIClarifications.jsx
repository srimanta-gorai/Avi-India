// features/Projects/modules/RFIClarifications.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Calendar,
  Paperclip,
  Send,
  MessageSquare,
  FileText,
  AlertCircle,
} from "lucide-react";

const RFIClarifications = ({ projectId }) => {
  const [rfis, setRFIs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRFI, setSelectedRFI] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchRFIs();
  }, [projectId]);

  const fetchRFIs = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const response = await fetch(`/api/projects/${projectId}/rfis`);
      const result = await response.json();
      setRFIs(result);
    } catch (error) {
      console.error("Failed to fetch RFIs:", error);
      // Mock data
      setRFIs([
        {
          id: "RFI-001",
          question:
            "What are the specifications for the foundation concrete mix?",
          raisedBy: "John Doe (Site Engineer)",
          assignedTo: "Sarah Williams (Structural Engineer)",
          dueDate: "2024-01-20",
          status: "Open",
          createdAt: "2024-01-15",
          responses: [],
          attachments: [],
        },
        {
          id: "RFI-002",
          question: "Clarification needed on electrical conduit routing",
          raisedBy: "Mike Johnson (MEP Engineer)",
          assignedTo: "David Chen (Electrical Engineer)",
          dueDate: "2024-01-18",
          status: "Answered",
          createdAt: "2024-01-14",
          responses: [
            {
              user: "David Chen (Electrical Engineer)",
              text: 'Conduits should follow the path shown in drawing E-102, with minimum 2" clearance from structural elements.',
              timestamp: "2024-01-16T10:30:00",
              attachments: ["E-102_rev2.pdf"],
            },
          ],
          attachments: ["drawing_E101.pdf"],
        },
        {
          id: "RFI-003",
          question: "Window frame material specification confirmation",
          raisedBy: "Sarah Williams (Architect)",
          assignedTo: "Client",
          dueDate: "2024-01-22",
          status: "Closed",
          createdAt: "2024-01-13",
          responses: [
            {
              user: "Client",
              text: "Approved as per sample submitted",
              timestamp: "2024-01-17T14:20:00",
              attachments: [],
            },
          ],
          attachments: ["window_spec.pdf", "sample_photo.jpg"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Open: "bg-yellow-100 text-yellow-700",
      Answered: "bg-blue-100 text-blue-700",
      Closed: "bg-green-100 text-green-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Open":
        return <Clock className="w-4 h-4" />;
      case "Answered":
        return <MessageSquare className="w-4 h-4" />;
      case "Closed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const StatusBadge = ({ status }) => (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
    >
      {getStatusIcon(status)}
      {status}
    </span>
  );

  const RFIDetailView = ({ rfi, onClose, onUpdate }) => {
    const [newResponse, setNewResponse] = useState("");
    const [attachments, setAttachments] = useState([]);

    const handleAddResponse = () => {
      if (newResponse.trim()) {
        // Handle adding response
        console.log("Adding response:", newResponse);
        setNewResponse("");
      }
    };

    const isOverdue =
      new Date(rfi.dueDate) < new Date() && rfi.status === "Open";

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{rfi.id}</h2>
              <p className="text-sm text-slate-500">
                Request for Information / Clarification
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
            >
              Close
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Question Card */}
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Question</p>
                    <p className="text-sm text-slate-500">
                      Raised by {rfi.raisedBy}
                    </p>
                  </div>
                </div>
                <StatusBadge status={rfi.status} />
              </div>
              <p className="text-slate-700 leading-relaxed">{rfi.question}</p>
              {isOverdue && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-700">
                    This RFI is overdue
                  </span>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Assigned To</p>
                  <p className="text-sm font-medium text-slate-700">
                    {rfi.assignedTo}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Due Date</p>
                  <p
                    className={`text-sm font-medium ${isOverdue ? "text-red-600" : "text-slate-700"}`}
                  >
                    {rfi.dueDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Created</p>
                  <p className="text-sm font-medium text-slate-700">
                    {rfi.createdAt}
                  </p>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {rfi.attachments && rfi.attachments.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Attachments
                </h3>
                <div className="space-y-2">
                  {rfi.attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <Paperclip className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700 flex-1">
                        {file}
                      </span>
                      <button className="text-teal-600 hover:text-teal-700 text-sm">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Response Thread */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Responses
              </h3>
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {rfi.responses &&
                  rfi.responses.map((response, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900">
                            {response.user}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(response.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {response.text}
                        </p>
                        {response.attachments &&
                          response.attachments.length > 0 && (
                            <div className="mt-2 flex gap-2">
                              {response.attachments.map((file, fileIdx) => (
                                <div
                                  key={fileIdx}
                                  className="flex items-center gap-1 text-xs text-teal-600"
                                >
                                  <Paperclip className="w-3 h-3" />
                                  <span>{file}</span>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
              </div>
              {rfi.status !== "Closed" && (
                <div className="flex gap-2">
                  <textarea
                    placeholder="Write your response..."
                    rows={3}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                  />
                  <div className="flex flex-col gap-2">
                    <button className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200">
                      <Paperclip className="w-5 h-5 text-slate-600" />
                    </button>
                    <button
                      onClick={handleAddResponse}
                      className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CreateRFForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
      question: "",
      assignedTo: "",
      dueDate: "",
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      // Handle RFI creation
      console.log("Creating RFI:", formData);
      onClose();
      fetchRFIs();
    };

    return (
      <div className="fixed inset-0 bg-black/60 bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">
              Create New RFI
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Question / Clarification Required
              </label>
              <textarea
                rows={4}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Assign To
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTo: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Attachments
              </label>
              <input
                type="file"
                multiple
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Create RFI
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search RFIs..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Open">Open</option>
            <option value="Answered">Answered</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create RFI
        </button>
      </div>

      {/* RFI Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  RFI ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Question
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Raised By
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Assigned To
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Due Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {rfis.map((rfi) => {
                const isOverdue =
                  new Date(rfi.dueDate) < new Date() && rfi.status === "Open";
                return (
                  <tr
                    key={rfi.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-mono text-sm font-medium text-teal-600">
                      {rfi.id}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900 max-w-md truncate">
                        {rfi.question}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {rfi.raisedBy}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {rfi.assignedTo}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm ${isOverdue ? "text-red-600 font-medium" : "text-slate-600"}`}
                      >
                        {rfi.dueDate}
                        {isOverdue && <Clock className="w-3 h-3 inline ml-1" />}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={rfi.status} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedRFI(rfi);
                          setShowDetailView(true);
                        }}
                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showCreateForm && (
        <CreateRFForm onClose={() => setShowCreateForm(false)} />
      )}
      {showDetailView && selectedRFI && (
        <RFIDetailView
          rfi={selectedRFI}
          onClose={() => {
            setShowDetailView(false);
            setSelectedRFI(null);
          }}
        />
      )}
    </div>
  );
};

export default RFIClarifications;
