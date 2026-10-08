import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

const RejectionModal = ({ isOpen, onClose, onConfirm, processing }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please enter a reason for rejection');
      return;
    }
    onConfirm(reason);
    setReason('');
    setError('');
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Reject Submission</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-slate-500 mb-4 text-sm">
            Please provide a specific reason for rejecting this data submission. This feedback will be shared with the personnel who submitted the report.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. Incorrect emission factor used, missing supporting evidence..."
                  className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all placeholder:text-slate-300 min-h-[100px] resize-none ${error ? 'border-red-300' : 'border-slate-200'
                    }`}
                  autoFocus
                />
                {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={processing}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm shadow-red-200 transition-all disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Reject Submission'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RejectionModal;