import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import {
  ArrowLeft,
  LifeBuoy,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  FileText,
  User,
  Paperclip,
  Send,
  UploadCloud,
  X,
  ShieldAlert
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import { ROLE_CODES } from "../../config/roleConfig";

const STATUS_COLORS = {
  "Draft": "bg-slate-100 text-slate-600",
  "Submitted": "bg-blue-50 text-blue-600",
  "Under Review": "bg-purple-50 text-purple-600",
  "Awaiting Information": "bg-amber-50 text-amber-600",
  "Response Drafted": "bg-indigo-50 text-indigo-600",
  "Resolved": "bg-emerald-50 text-emerald-600",
  "Closed": "bg-slate-100 text-slate-500"
};

const PRIORITY_COLORS = {
  "Low": "text-slate-500 bg-slate-100",
  "Medium": "text-blue-600 bg-blue-50",
  "High": "text-orange-600 bg-orange-50",
  "Critical": "text-red-600 bg-red-50"
};

const QueryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [query, setQuery] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [responseText, setResponseText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const [statusUpdate, setStatusUpdate] = useState("");
  
  const isAdminOrHead = ROLE_CODES.HEAD.includes(user?.role) || 
                        ROLE_CODES.ORG_ADMIN.includes(user?.role) || 
                        ROLE_CODES.REGION_ADMIN.includes(user?.role) || 
                        ROLE_CODES.PLANT_ADMIN.includes(user?.role);

  useEffect(() => {
    fetchQueryDetails();
  }, [id]);

  const fetchQueryDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/queries/${id}`);
      setQuery(res.data.data);
      setStatusUpdate(res.data.data.status);
    } catch (error) {
      console.error("Failed to fetch query details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (attachments.length + files.length > 3) {
      alert("Maximum 3 attachments allowed per response.");
      return;
    }
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = null;
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendResponse = async () => {
    if (!responseText.trim()) return;
    
    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append("message", responseText);
      attachments.forEach((file) => payload.append("attachments", file));

      const res = await api.post(`/api/queries/${id}/responses`, payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setQuery(res.data.data);
      setStatusUpdate(res.data.data.status);
      setResponseText("");
      setAttachments([]);
    } catch (error) {
      console.error("Failed to send response:", error);
      alert("Failed to send response.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setSubmitting(true);
      const res = await api.put(`/api/queries/${id}/status`, { status: newStatus });
      setQuery(res.data.data);
      setStatusUpdate(newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignToMe = async () => {
    try {
      setSubmitting(true);
      const res = await api.put(`/api/queries/${id}/assign`, { assignedTo: user._id });
      setQuery(res.data.data);
    } catch (error) {
      console.error("Failed to assign:", error);
      alert("Failed to assign query.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500">Loading query details...</div>;
  }

  if (!query) {
    return <div className="p-10 text-center text-red-500">Query not found or you don't have access.</div>;
  }

  return (
    <div className="p-4 space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate("/helpdesk/dashboard")}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col - Details & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Query Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono font-bold text-slate-400">#{query._id.slice(-6).toUpperCase()}</span>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[query.status]}`}>
                      {query.status}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${PRIORITY_COLORS[query.priority]}`}>
                      {query.priority} Priority
                    </span>
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 leading-tight">{query.title}</h1>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  Requested by <strong className="text-slate-700">{query.createdBy?.username || "Unknown"}</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {dayjs(query.createdAt).format("MMMM Do YYYY, h:mm a")}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg text-slate-700">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                  Category: {query.category}
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50">
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {query.description}
              </p>
              
              {query.attachments?.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Attachments</h4>
                  <div className="flex flex-wrap gap-3">
                    {query.attachments.map((file, idx) => (
                      <a 
                        key={idx}
                        href={file.fileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:border-emerald-300 transition-colors"
                      >
                        <Paperclip className="w-4 h-4 text-slate-400" />
                        <span className="text-emerald-600 font-medium">{file.fileName}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline / Responses */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Communication History
            </h3>
            
            {query.responses?.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 border-dashed text-slate-500 text-sm">
                No responses yet.
              </div>
            ) : (
              <div className="space-y-4">
                {query.responses?.map((resp, i) => {
                  const isAdmin = resp.role !== ROLES?.ENERGY_MANAGER?.code && resp.role !== "ENERGY_MANAGER"; // Fallback string check
                  return (
                    <div key={i} className={`flex gap-4 ${!isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div className={`flex flex-col max-w-[80%] ${!isAdmin ? 'items-start' : 'items-end'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-700">{resp.sender?.username}</span>
                          <span className="text-[10px] text-slate-400">{dayjs(resp.createdAt).fromNow()}</span>
                        </div>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${isAdmin ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}`}>
                          <p className="whitespace-pre-wrap">{resp.message}</p>
                          
                          {resp.attachments?.length > 0 && (
                            <div className={`mt-3 pt-3 flex flex-col gap-2 border-t ${isAdmin ? 'border-emerald-500/30' : 'border-slate-100'}`}>
                              {resp.attachments.map((file, idx) => (
                                <a 
                                  key={idx}
                                  href={file.fileUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className={`flex items-center gap-2 text-xs font-medium hover:underline ${isAdmin ? 'text-emerald-100' : 'text-emerald-600'}`}
                                >
                                  <Paperclip className="w-3 h-3" />
                                  {file.fileName}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Response Box */}
          {query.status !== "Closed" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="relative">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response or additional information here..."
                  className="w-full min-h-[120px] p-4 pb-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-y"
                />
                
                {attachments.length > 0 && (
                  <div className="absolute bottom-16 left-4 right-4 flex gap-2 overflow-x-auto pb-2">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-medium text-slate-600 shrink-0">
                        <span className="truncate max-w-[100px]">{file.name}</span>
                        <button onClick={() => removeAttachment(idx)} className="text-slate-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Attach Files"
                  >
                    <Paperclip className="w-5 h-5" />
                    <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  </button>
                  
                  <button 
                    onClick={handleSendResponse}
                    disabled={submitting || !responseText.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Sending..." : "Send Response"}
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Col - Workflow & Properties */}
        <div className="space-y-6">
          {/* Assignment & SLA Panel (Admins Only) */}
          {isAdminOrHead && (
            <div className="bg-slate-900 rounded-2xl shadow-sm overflow-hidden text-slate-300">
              <div className="p-5 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  Expert Dashboard
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Assigned To</p>
                  {query.assignedTo ? (
                    <div className="flex items-center gap-2 text-sm text-white font-medium">
                      <User className="w-4 h-4 text-emerald-400" />
                      {query.assignedTo.username}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <span className="text-sm text-amber-400 font-medium">Unassigned</span>
                      <button 
                        onClick={handleAssignToMe}
                        disabled={submitting}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-all text-center"
                      >
                        Assign to Me
                      </button>
                    </div>
                  )}
                </div>

                {query.slaDeadline && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">SLA Deadline</p>
                    <div className="flex items-center gap-2 text-sm text-white font-medium">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      {dayjs(query.slaDeadline).format("MMM DD, YYYY HH:mm")}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-slate-800">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Update Workflow Status</label>
                  <select
                    value={statusUpdate}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={submitting}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Awaiting Information">Awaiting Information</option>
                    <option value="Response Drafted">Response Drafted</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Additional Meta Properties */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Query Properties</h3>
            
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Reporting Year</p>
              <p className="text-sm font-medium text-slate-700">{query.reportingYear || "N/A"}</p>
            </div>
            
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Sub-Category</p>
              <p className="text-sm font-medium text-slate-700">{query.subCategory || "N/A"}</p>
            </div>
            
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Facility / Branch</p>
              <p className="text-sm font-medium text-slate-700">{query.officeBranch?.name || "Global / Organization Level"}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Calculation Module</p>
              <p className="text-sm font-medium text-slate-700">{query.calculationModule || "General Platform"}</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default QueryDetails;
