import React, { useState, useEffect } from 'react';
import { Upload, X, AlertCircle, Sparkles, RefreshCw, Save, Send, Image, FileText } from 'lucide-react';

// ============================================
// COLUMN 1: Evidence & Documentation Component
// ============================================
const EvidenceColumn = ({ files, setFiles }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isNewVOFromOpen, setIsNewVOFromOpen] = useState(true);

  const handleRemoveFile = (id) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop logic here
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = selectedFiles.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type.includes('image') ? 'image' : 'pdf',
      uploadedAt: 'Just now'
    }));
    setFiles([...files, ...newFiles]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Evidence & Documentation</h3>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {files.length} files
        </span>
      </div>
      
      {/* Drag & Drop Upload Area */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-all duration-200 cursor-pointer ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <Upload className={`w-12 h-12 mx-auto mb-3 transition-all ${isDragging ? 'text-blue-500 scale-110' : 'text-gray-400'}`} />
        <p className="text-sm font-semibold text-gray-700 mb-1">
          Drag and drop files here
        </p>
        <p className="text-xs text-gray-500 mb-4">
          or click to browse from your device
        </p>
        <label className="inline-block">
          <input 
            type="file" 
            multiple 
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.xlsx,.xls"
          />
          <span className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition cursor-pointer inline-block">
            Browse Files
          </span>
        </label>
        <p className="text-xs text-gray-400 mt-4">
          Supports: JPG, PNG, PDF, XLSX (Max 10MB)
        </p>
      </div>

      {/* Uploaded Files List */}
      <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
        <h4 className="text-sm font-bold text-gray-700 sticky top-0 bg-white pb-2">
          Uploaded Files ({files.length})
        </h4>
        {files.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No files uploaded yet</p>
          </div>
        ) : (
          files.map(file => (
            <div 
              key={file.id} 
              className="flex items-center gap-3 p-4 bg-linear-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              {/* File Preview/Icon */}
              <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-md">
                {file.type === 'image' ? (
                  <Image className="w-7 h-7 text-white" />
                ) : (
                  <FileText className="w-7 h-7 text-white" />
                )}
              </div>
              
              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {file.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-gray-600">{file.size}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{file.uploadedAt}</span>
                </div>
              </div>
              
              {/* Remove Button */}
              <button 
                onClick={() => handleRemoveFile(file.id)}
                className="text-gray-400 hover:text-red-500 transition p-2 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Upload Tips */}
      <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-900 mb-2">Upload Tips</p>
            <ul className="text-xs text-blue-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Include clear photos from multiple angles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Add relevant drawings and specifications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Timestamp photos for better documentation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COLUMN 2: VO Details Form Component
// ============================================
const VODetailsColumn = ({ formData, setFormData }) => {
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Variation Order Details</h3>
      
      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
            placeholder="Brief descriptive title of the variation"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
            required
          >
            <option value="">Select category</option>
            <option value="structural">🏗 Structural</option>
            <option value="mep">⚡ MEP (Mechanical, Electrical, Plumbing)</option>
            <option value="finishes">🎨 Finishes</option>
            <option value="civil">🚧 Civil Works</option>
            <option value="architectural">📐 Architectural</option>
            <option value="other">📋 Other</option>
          </select>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Reason for Variation <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.reason}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
            required
          >
            <option value="">Select reason</option>
            <option value="design-change">📝 Design Change</option>
            <option value="site-condition">🏗 Unforeseen Site Condition</option>
            <option value="client-request">👤 Client Request</option>
            <option value="regulation">⚖ Regulatory Requirement</option>
            <option value="quality">✨ Quality Improvement</option>
            <option value="safety">🦺 Safety Enhancement</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Detailed Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none font-medium"
            rows="5"
            placeholder="Provide detailed description of the variation including scope, location, and impact..."
            required
          />
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Be as detailed as possible for faster review
          </p>
        </div>

        {/* Quantity and Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
              placeholder="0"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Unit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
              placeholder="e.g., m², pcs, ton"
              required
            />
          </div>
        </div>

        {/* Unit Price (Disabled) */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Unit Price
          </label>
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed font-medium"
              placeholder="Will be filled by Quantity Surveyor"
              disabled
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full font-bold border border-yellow-300">
                QS Only
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            This field will be completed by the Quantity Surveyor during review
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COLUMN 3: AI Summary Component
// ============================================
const AISummaryColumn = ({ aiSummary, setAiSummary, filesCount }) => {
  const handleRegenerate = () => {
    // AI regeneration logic
    alert('Regenerating AI summary...');
  };

  const wordCount = aiSummary.trim().split(/\s+/).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">AI Generated Summary</h3>
        </div>
        <button 
          onClick={handleRegenerate}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold transition hover:bg-blue-50 px-3 py-1.5 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </button>
      </div>
      
      {/* AI Summary Editor */}
      <div className="mb-6">
        <div className="bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-5 mb-3 shadow-inner">
          <textarea 
            value={aiSummary}
            onChange={(e) => setAiSummary(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-800 leading-relaxed resize-none focus:outline-none font-medium"
            rows="10"
            placeholder="AI will generate a professional summary based on your inputs..."
          />
        </div>
        <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
          <span>✓</span>
          AI has analyzed {filesCount} documents and form data
        </p>
      </div>

      {/* Warning Notice */}
      <div className="bg-linear-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-yellow-900 mb-1">Review Required</p>
            <p className="text-xs text-yellow-800 leading-relaxed">
              Please review and edit the AI-generated summary before submission to ensure accuracy and completeness. This summary will be visible to all reviewers.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
          <p className="text-xs font-bold text-blue-700 mb-1">Word Count</p>
          <p className="text-2xl font-black text-blue-900">
            {wordCount}
          </p>
        </div>
        <div className="p-4 bg-linear-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
          <p className="text-xs font-bold text-green-700 mb-1">Confidence</p>
          <p className="text-2xl font-black text-green-900">94%</p>
        </div>
      </div>

      {/* AI Features Info */}
      <div className="p-4 bg-linear-to-r from-purple-50 via-blue-50 to-indigo-50 border-2 border-purple-300 rounded-xl">
        <p className="text-xs font-bold text-purple-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          AI Summary Features:
        </p>
        <ul className="text-xs text-purple-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">✓</span>
            <span className="font-semibold">Extracted key details from evidence</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">✓</span>
            <span className="font-semibold">Professional technical language</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">✓</span>
            <span className="font-semibold">Clear scope definition</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 font-bold">✓</span>
            <span className="font-semibold">Impact assessment included</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT: Create VO Screen
// ============================================
const CreateVOScreen = () => {
  const [files, setFiles] = useState([
    { id: 1, name: 'Foundation_Site_Photo_1.jpg', size: '2.4 MB', type: 'image', uploadedAt: '2 min ago' },
    { id: 2, name: 'Structural_Drawing_Rev_C.pdf', size: '1.8 MB', type: 'pdf', uploadedAt: '3 min ago' }
  ]);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    reason: '',
    description: '',
    quantity: '',
    unit: ''
  });

  const [aiSummary, setAiSummary] = useState(
    'Based on the uploaded evidence and description, this variation order addresses additional steel reinforcement requirements identified during foundation inspection. The work involves installing extra support beams to accommodate increased load specifications discovered during structural analysis. This change is necessary to ensure compliance with updated engineering standards and maintain structural integrity of the building.'
  );

  const handleSubmit = () => {
    alert('Variation Order submitted successfully!');
  };

  const handleSaveDraft = () => {
    alert('Draft saved successfully!');
  };

  // Prevent background scroll when this overlay is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      {/* Scrollable Content */}
      <div
        className="overflow-y-auto"
        style={{
          height: "calc(100vh - 80px)", // 80px: adjust if your top bar is a different height
          paddingBottom: "96px" // space for sticky action bar
        }}
      >
        {/* Header */}
        <div className="mb-8 px-4 md:px-6 py-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-2 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create New Variation Order
          </h1>
          <p className="text-gray-600 font-medium">Document and submit variation order with supporting evidence</p>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-6">
          <EvidenceColumn files={files} setFiles={setFiles} />
          <VODetailsColumn formData={formData} setFormData={setFormData} />
          <AISummaryColumn aiSummary={aiSummary} setAiSummary={setAiSummary} filesCount={files.length} />
        </div>
      </div>

      {/* Bottom Action Bar (Sticky) */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t-2 border-gray-200 shadow-2xl z-50">
        <div className="px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
            Auto-saved 2 seconds ago
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSaveDraft}
              className="px-4 md:px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Save className="w-5 h-5" />
              Save Draft
            </button>
            <button 
              onClick={handleSubmit}
              className="px-6 md:px-8 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Submit VO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
  
 

export default CreateVOScreen;