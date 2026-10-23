// features/Projects/modules/DocumentVault.jsx
import React, { useState, useEffect } from "react";
import {
  FolderOpen,
  File,
  Image,
  FileText,
  Download,
  Upload,
  Plus,
  Search,
  Eye,
  Trash2,
  Share2,
  ChevronRight,
  ChevronDown,
  Clock,
  User,
  Archive,
  RefreshCw,
} from "lucide-react";

const DocumentVault = ({ projectId }) => {
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchFolderStructure();
  }, [projectId]);

  const fetchFolderStructure = async () => {
    setLoading(true);
    try {
      // Mock data
      setFolders([
        { id: "1", name: "Contracts", children: [] },
        {
          id: "2",
          name: "Drawings",
          children: [
            { id: "2-1", name: "Architectural", children: [] },
            { id: "2-2", name: "Structural", children: [] },
            { id: "2-3", name: "MEP", children: [] },
          ],
        },
        { id: "3", name: "Reports", children: [] },
        { id: "4", name: "Correspondence", children: [] },
        { id: "5", name: "Photos", children: [] },
      ]);

      setFiles([
        {
          id: "f1",
          name: "Contract_Agreement.pdf",
          version: "2.0",
          uploadedBy: "John Doe",
          date: "2024-01-15",
          size: "2.5 MB",
          type: "pdf",
        },
        {
          id: "f2",
          name: "Site_Plan_RevA.dwg",
          version: "1.0",
          uploadedBy: "Sarah Williams",
          date: "2024-01-14",
          size: "5.8 MB",
          type: "dwg",
        },
        {
          id: "f3",
          name: "Progress_Report_Jan.pdf",
          version: "1.0",
          uploadedBy: "Mike Johnson",
          date: "2024-01-13",
          size: "1.2 MB",
          type: "pdf",
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "dwg":
        return <File className="w-5 h-5 text-blue-500" />;
      case "jpg":
      case "png":
        return <Image className="w-5 h-5 text-green-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const FolderTree = ({ items, level = 0 }) => {
    const [expanded, setExpanded] = useState({});

    const toggleFolder = (folderId) => {
      setExpanded((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
    };

    return (
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.id}>
            <div
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-slate-50 ${
                currentFolder?.id === item.id ? "bg-teal-50 text-teal-600" : ""
              }`}
              style={{ paddingLeft: `${level * 12 + 8}px` }}
              onClick={() => setCurrentFolder(item)}
            >
              {item.children && item.children.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(item.id);
                  }}
                >
                  {expanded[item.id] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
              <FolderOpen className="w-4 h-4" />
              <span className="text-sm">{item.name}</span>
            </div>
            {expanded[item.id] && item.children && (
              <FolderTree items={item.children} level={level + 1} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const UploadModal = ({ onClose }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
      setUploading(true);
      // Simulate upload
      setTimeout(() => {
        setUploading(false);
        onClose();
        fetchFolderStructure();
      }, 2000);
    };

    return (
      <div className="fixed inset-0 bg-black/60 bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">
              Upload Documents
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">
                Drag and drop files here or click to browse
              </p>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
              />
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                Select Files
              </button>
            </div>
            {selectedFiles.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Selected Files:
                </p>
                <div className="space-y-2">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded"
                    >
                      {getFileIcon(file.type.split("/")[1])}
                      <span className="text-sm flex-1">{file.name}</span>
                      <span className="text-xs text-slate-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FilePreview = ({ file, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFileIcon(file.type)}
              <h3 className="font-bold text-slate-900">{file.name}</h3>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg">
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
            {file.type === "pdf" ? (
              <div className="text-center text-slate-500">
                <FileText className="w-24 h-24 mx-auto mb-4" />
                <p>PDF Preview would appear here</p>
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <File className="w-24 h-24 mx-auto mb-4" />
                <p>Preview not available for this file type</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700"
        >
          <Upload className="w-5 h-5" />
          Upload
        </button>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Folder Tree */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <h3 className="font-bold text-slate-900 mb-4">Folders</h3>
            <FolderTree items={folders} />
          </div>
        </div>

        {/* File List */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">
                  {currentFolder ? currentFolder.name : "All Documents"}
                </h3>
                <p className="text-xs text-slate-500">{files.length} files</p>
              </div>
              <button className="p-2 hover:bg-slate-200 rounded-lg">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                      Version
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                      Uploaded By
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                      Size
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type)}
                          <span className="text-sm text-slate-900">
                            {file.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        v{file.version}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {file.uploadedBy}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {file.date}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {file.size}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedFile(file);
                              setShowPreview(true);
                            }}
                            className="p-1 text-teal-600 hover:bg-teal-50 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-600 hover:bg-gray-50 rounded">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}
      {showPreview && selectedFile && (
        <FilePreview
          file={selectedFile}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default DocumentVault;
