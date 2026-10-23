import { Check, X } from "lucide-react";

const ApproveCard = ({ item, onApprove, onReject }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{item.title}</h3>
          <p className="text-sm text-gray-600">{item.description}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          item.status === 'approved' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {item.status}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <span>Requested by: {item.requester}</span>
        <span>{item.date}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onApprove(item.id)}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Approve
        </button>
        <button
          onClick={() => onReject(item.id)}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Reject
        </button>
      </div>
    </div>
  );
};

export default ApproveCard;
