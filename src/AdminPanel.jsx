import React, { useState, useEffect } from 'react';
// 🔥 FIXED: ALL ICONS IMPORTED CORRECTLY
import {
    LayoutDashboard, Users, ShoppingBag, DollarSign, FileText, Settings,
    Search, Bell, LogOut, CheckCircle, X, Filter, Download,
    AlertTriangle, RefreshCw, Power, Plus, Trash2, Edit2,
    ChevronDown, ChevronUp, AlertOctagon, CheckSquare, Eye, EyeOff, Lock, Globe, Smartphone,
    UserCheck, Trophy, Briefcase, Target
} from 'lucide-react';

const SERVER_URL = "http://localhost:5000";

const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`;

const HeavyLoader = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-6"></div>
        <div className="text-sm font-black uppercase tracking-[0.3em] animate-pulse text-blue-400">Loading Admin Dashboard...</div>
    </div>
);

// =========================================================
// 1. DASHBOARD
// =========================================================
const Dashboard = ({ data }) => {
    if (!data || !data.users) return <HeavyLoader />;

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">System <span className="text-blue-600">Overview</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Users size={60} /></div>
                    <div className="text-xs font-bold uppercase tracking-widest opacity-80">Total Users</div>
                    <div className="text-4xl font-black mt-2">{data.users?.length || 0}</div>
                    <div className="mt-4 text-[10px] font-bold bg-blue-900/30 w-fit px-2 py-1 rounded">ACTIVE NETWORK</div>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-emerald-800 p-6 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle size={60} /></div>
                    <div className="text-xs font-bold uppercase tracking-widest opacity-80">Total Leads</div>
                    <div className="text-4xl font-black mt-2">{data.leads?.length || 0}</div>
                    <div className="mt-4 text-[10px] font-bold bg-green-900/30 w-fit px-2 py-1 rounded">ALL TIME CONVERSIONS</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={60} /></div>
                    <div className="text-xs font-bold uppercase tracking-widest opacity-80">Pending Payouts</div>
                    <div className="text-4xl font-black mt-2">{data.payouts?.filter(p => p.status === 'pending').length || 0}</div>
                    <div className="mt-4 text-[10px] font-bold bg-red-900/30 w-fit px-2 py-1 rounded">ACTION REQUIRED</div>
                </div>
            </div>
        </div>
    );
};

// =========================================================
// 2. OFFERS PAGE (GOALS + NO ADMIN REVENUE)
// =========================================================
const OffersPage = ({ data, fetchData }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({ goals: [] });

    const addGoal = () => setForm({ ...form, goals: [...(form.goals || []), { eventId: '', name: '', payout: 0 }] });
    const removeGoal = (idx) => { const n = [...form.goals]; n.splice(idx, 1); setForm({ ...form, goals: n }); };
    const handleGoalChange = (idx, f, v) => { const n = [...form.goals]; n[idx][f] = v; setForm({ ...form, goals: n }); };

    const handleSubmit = async () => {
        const endpoint = form._id ? '/api/offers/edit' : '/api/offers/add';
        await fetch(`${SERVER_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        fetchData(); setIsEditing(false); setForm({ goals: [] });
    };

    const deleteOffer = async (id) => {
        if(confirm("Delete Offer?")) {
            await fetch(`${SERVER_URL}/api/offers/delete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
            fetchData();
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Marketplace</h2>
                <button onClick={() => { setForm({ goals: [] }); setIsEditing(true); }} className="bg-black text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase shadow-lg flex items-center gap-2 hover:bg-gray-800 transition"><Plus size={16}/> New Offer</button>
            </div>

            {isEditing && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="font-black text-2xl text-gray-900 uppercase tracking-tight">{form._id ? 'Edit Offer' : 'Add New Offer'}</h3>
                            <button onClick={() => setIsEditing(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><X size={20} /></button>
                        </div>
                       
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="text-[10px] font-black text-gray-400 uppercase">Offer Name</label><input className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm focus:border-black outline-none" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} /></div>
                            <div><label className="text-[10px] font-black text-gray-400 uppercase">Category</label><input className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm focus:border-black outline-none" value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})} /></div>
                            <div><label className="text-[10px] font-black text-gray-400 uppercase">User Payout (₹)</label><input type="number" className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm focus:border-black outline-none" value={form.payout || ''} onChange={e => setForm({...form, payout: e.target.value})} /></div>
                            <div><label className="text-[10px] font-black text-gray-400 uppercase">Cap (0 = Unlimited)</label><input type="number" className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm focus:border-black outline-none" value={form.cap || 0} onChange={e => setForm({...form, cap: e.target.value})} /></div>
                           
                            <div className="col-span-2"><label className="text-[10px] font-black text-gray-400 uppercase">Tracking Link ({'{click_id}'})</label><input className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm focus:border-black outline-none" value={form.originalLink || ''} onChange={e => setForm({...form, originalLink: e.target.value})} /></div>
                            <div className="col-span-2"><label className="text-[10px] font-black text-gray-400 uppercase">Thumbnail URL</label><input className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm focus:border-black outline-none" value={form.thumbnail || ''} onChange={e => setForm({...form, thumbnail: e.target.value})} /></div>
                           
                            <div className="col-span-2"><label className="text-[10px] font-black text-gray-400 uppercase">Description</label><textarea className="w-full border-2 border-gray-100 p-3 rounded-xl font-medium text-sm h-24 focus:border-black outline-none" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} /></div>
                            <div className="col-span-2"><label className="text-[10px] font-black text-gray-400 uppercase">Steps (Line separated)</label><textarea className="w-full border-2 border-gray-100 p-3 rounded-xl font-medium text-sm h-24 focus:border-black outline-none" value={form.steps || ''} onChange={e => setForm({...form, steps: e.target.value})} /></div>
                           
                            {/* GOALS SECTION */}
                            <div className="col-span-2 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-xs font-black text-gray-800 uppercase flex items-center gap-2"><Trophy size={14}/> Offer Goals (Events)</label>
                                    <button onClick={addGoal} className="text-[10px] bg-black text-white px-3 py-1.5 rounded-lg font-bold uppercase hover:bg-gray-800 transition">+ Add Goal</button>
                                </div>
                                {form.goals?.map((g, i) => (
                                    <div key={i} className="flex gap-3 mb-2 items-center">
                                        <input placeholder="Event ID (e.g. dep)" className="border-2 border-gray-200 p-2 rounded-lg text-xs font-bold flex-1" value={g.eventId} onChange={e => handleGoalChange(i, 'eventId', e.target.value)} />
                                        <input placeholder="Name (e.g. Deposit)" className="border-2 border-gray-200 p-2 rounded-lg text-xs font-bold flex-1" value={g.name} onChange={e => handleGoalChange(i, 'name', e.target.value)} />
                                        <input type="number" placeholder="₹ Pay" className="border-2 border-gray-200 p-2 rounded-lg text-xs font-bold w-24" value={g.payout} onChange={e => handleGoalChange(i, 'payout', e.target.value)} />
                                        <button onClick={() => removeGoal(i)} className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100"><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>

                            <div><label className="text-[10px] font-black text-gray-400 uppercase">Status</label><select className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm" value={form.status || 'active'} onChange={e => setForm({...form, status: e.target.value})}><option value="active">Active</option><option value="paused">Paused</option></select></div>
                            <div><label className="text-[10px] font-black text-gray-400 uppercase">Privacy</label><select className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm" value={form.privacy || 'public'} onChange={e => setForm({...form, privacy: e.target.value})}><option value="public">Public</option><option value="vip">VIP Only</option><option value="private">Private</option></select></div>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <button onClick={handleSubmit} className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-sm uppercase shadow-xl hover:bg-gray-900 active:scale-95 transition">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.offers?.map(o => (
                    <div key={o._id} className="bg-white p-5 rounded-[2.5rem] border-2 border-gray-50 shadow-sm relative group hover:border-blue-100 transition">
                        <div className="flex gap-4 mb-4">
                            <img src={o.thumbnail} className="w-16 h-16 rounded-2xl object-cover bg-gray-100 shadow-inner" />
                            <div>
                                <h3 className="font-bold text-gray-900 leading-tight text-lg">{o.name}</h3>
                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] uppercase font-black mt-1 block w-fit border border-blue-100">{o.category}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                            <div><span className="text-[10px] font-bold text-gray-400 uppercase">Payout</span><div className="text-green-600 font-black text-xl">₹{o.payout}</div></div>
                            <div className="flex gap-2">
                                <button onClick={() => { setForm(o); setIsEditing(true); }} className="bg-gray-100 p-3 rounded-xl hover:bg-black hover:text-white transition"><Edit2 size={16} /></button>
                                <button onClick={() => deleteOffer(o._id)} className="bg-gray-100 p-3 rounded-xl hover:bg-red-500 hover:text-white transition"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// =========================================================
// 3. APPROVALS PAGE (RESTORED)
// =========================================================
const ApprovalsPage = () => {
    const [requests, setRequests] = useState([]);
   
    const fetchApprovals = () => {
        fetch(`${SERVER_URL}/api/admin/approvals`)
            .then(res => res.json())
            .then(d => { if(d.success) setRequests(d.requests); })
            .catch(()=>{});
    };

    useEffect(() => { fetchApprovals(); }, []);

    const handleAction = async (requestId, action) => {
        await fetch(`${SERVER_URL}/api/admin/approvals/action`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ requestId, action })
        });
        fetchApprovals();
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter mb-6">Offer Approvals</h2>
            <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 uppercase text-[10px] font-black text-gray-500 tracking-widest border-b"><tr><th className="p-6">Publisher</th><th className="p-6">Requested Offer</th><th className="p-6">Time</th><th className="p-6 text-right">Action</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">
                        {requests.length > 0 ? requests.map(r => (
                            <tr key={r._id} className="hover:bg-gray-50 transition">
                                <td className="p-6"><div className="font-bold text-gray-900">{r.userId?.name}</div><div className="text-[10px] text-blue-500 font-mono">{r.userId?.websiteId}</div></td>
                                <td className="p-6 font-bold">{r.offerId?.name}</td>
                                <td className="p-6 text-xs text-gray-500">{new Date(r.date).toLocaleString()}</td>
                                <td className="p-6 text-right flex justify-end gap-2">
                                    <button onClick={()=>handleAction(r._id, 'approved')} className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase shadow-md active:scale-95">Accept</button>
                                    <button onClick={()=>handleAction(r._id, 'rejected')} className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold text-[10px] uppercase hover:bg-red-200">Reject</button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="4" className="p-10 text-center text-gray-400 font-bold uppercase text-xs">No pending requests.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// =========================================================
// 4. REPORTS PAGE (DETAILS + FILTERS + IP CHECK)
// =========================================================
const ReportsPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ status: 'all', offer: '', search: '', date: '' });

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${SERVER_URL}/api/admin/reports`);
            const d = await res.json();
            if (d.success) setReports(d.clicks);
        } catch (e) {}
        setLoading(false);
    };

    useEffect(() => { fetchReports(); }, []);

    // Helper for IP Duplicates
    const ipCounts = {};
    reports.forEach(r => { if(r.ip) ipCounts[r.ip] = (ipCounts[r.ip] || 0) + 1; });

    const filteredReports = reports.filter(r => {
        if (filters.status !== 'all' && r.status !== filters.status) return false;
        if (filters.offer && !r.offerId?.name.toLowerCase().includes(filters.offer.toLowerCase())) return false;
        if (filters.search) {
            const q = filters.search.toLowerCase();
            const userName = r.userId?.name?.toLowerCase() || '';
            const userEmail = r.userId?.email?.toLowerCase() || '';
            const webId = r.userId?.websiteId?.toLowerCase() || '';
            const ip = r.ip || '';
            if (!userName.includes(q) && !userEmail.includes(q) && !ip.includes(q) && !webId.includes(q)) return false;
        }
        if (filters.date) {
            const rDate = new Date(r.createdAt).toISOString().split('T')[0];
            if (rDate !== filters.date) return false;
        }
        return true;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Traffic Logs</h2>
                <button onClick={fetchReports} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-gray-200 transition"><RefreshCw size={14}/> Refresh</button>
            </div>

            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]"><label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Search</label><input placeholder="Name / Email / ID / IP" className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-xs outline-none focus:border-black" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} /></div>
                <div className="flex-1 min-w-[200px]"><label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Offer</label><input placeholder="Offer Name" className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-xs outline-none focus:border-black" value={filters.offer} onChange={e => setFilters({...filters, offer: e.target.value})} /></div>
                <div className="flex-1 min-w-[150px]"><label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Status</label><select className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-xs outline-none focus:border-black bg-white" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}><option value="all">All Status</option><option value="clicked">Clicked</option><option value="converted">Converted</option></select></div>
                <div className="flex-1 min-w-[150px]"><label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Date</label><input type="date" className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-xs outline-none focus:border-black" value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} /></div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest border-b"><tr><th className="p-5">Time</th><th className="p-5">Publisher Detail</th><th className="p-5">Offer / Event</th><th className="p-5">IP / Risk</th><th className="p-5">Status</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? <tr><td colSpan="5" className="p-10 text-center font-bold text-gray-300">Loading Data...</td></tr> :
                        filteredReports.map(r => {
                            const isHighRisk = ipCounts[r.ip] > 5;
                            return (
                            <tr key={r._id} className="hover:bg-gray-50 transition">
                                <td className="p-5 text-[10px] font-bold text-gray-500">{new Date(r.createdAt).toLocaleString()}</td>
                                <td className="p-5">
                                    <div className="font-bold text-gray-900 text-xs">{r.userId?.name}</div>
                                    <div className="text-[9px] text-gray-500">{r.userId?.email}</div>
                                    <div className="text-[9px] text-blue-600 font-mono font-bold bg-blue-50 px-1 rounded w-fit">{r.userId?.websiteId}</div>
                                </td>
                                <td className="p-5"><div className="font-bold text-xs text-gray-800">{r.offerId?.name}</div><span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${r.event!=='-'?'bg-purple-100 text-purple-700':'bg-gray-100 text-gray-400'}`}>{r.event}</span></td>
                                <td className="p-5">
                                    <div className={`font-mono text-[10px] px-2 py-1 rounded w-fit font-bold ${isHighRisk ? 'bg-red-100 text-red-600' : 'bg-gray-100'}`}>{r.ip}</div>
                                    {isHighRisk && <div className="text-[8px] text-red-500 font-black mt-1">⚠️ HIGH TRAFFIC</div>}
                                </td>
                                <td className="p-5">{r.status === 'converted' ? <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase shadow-md">APPROVED</span> : <span className="text-gray-400 text-[9px] font-black uppercase bg-gray-100 px-2 py-1 rounded">Clicked</span>}</td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// =========================================================
// 5. PAYOUTS PAGE
// =========================================================
const PayoutsPage = ({ data, fetchData }) => {
    const [rejectModal, setRejectModal] = useState(null);
    const [reason, setReason] = useState('');
    const [refund, setRefund] = useState(true);

    const handleAction = async (id, status, rsn = '', ref = false) => {
        await fetch(`${SERVER_URL}/api/payouts/action`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, reason: rsn, refund: ref }) });
        fetchData(); setRejectModal(null); setReason('');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Withdrawals</h2>

            {rejectModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl">
                        <h3 className="font-black text-xl uppercase mb-6 text-red-600">Reject Request</h3>
                        <textarea className="w-full border-2 border-gray-200 p-4 rounded-2xl font-medium text-sm mb-4 h-32 resize-none focus:border-red-500 outline-none" placeholder="Reason for rejection (Visible to user)" value={reason} onChange={e=>setReason(e.target.value)} />
                        <div className="flex items-center gap-3 mb-8 bg-red-50 p-4 rounded-2xl cursor-pointer hover:bg-red-100 transition" onClick={()=>setRefund(!refund)}>
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition ${refund ? 'bg-red-600 border-red-600' : 'border-gray-400'}`}>{refund && <CheckSquare size={16} className="text-white"/>}</div>
                            <span className="text-xs font-bold text-gray-700 select-none uppercase tracking-wide">Refund Money to Wallet?</span>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={()=>setRejectModal(null)} className="flex-1 bg-gray-100 py-4 rounded-2xl font-black text-xs uppercase text-gray-500 hover:bg-gray-200">Cancel</button>
                            <button onClick={()=>handleAction(rejectModal, 'rejected', reason, refund)} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-red-700">Confirm Reject</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {data.payouts?.map(p => (
                    <div key={p._id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex justify-between items-center shadow-sm hover:shadow-md transition">
                        <div>
                            <div className="font-bold text-gray-900 text-lg">{p.userName}</div>
                            <div className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded w-fit mt-1 font-mono">{p.method}</div>
                            {p.status === 'rejected' && <div className="text-[10px] text-red-500 font-bold mt-2 bg-red-50 px-3 py-1 rounded-full w-fit flex items-center gap-1"><AlertOctagon size={12}/> {p.rejectReason}</div>}
                        </div>
                        <div className="text-right">
                            <div className="font-black text-2xl text-gray-900">{formatCurrency(p.amount)}</div>
                            <div className="mt-2">
                                {p.status === 'pending' ? (
                                    <div className="flex gap-2">
                                        <button onClick={()=>handleAction(p._id, 'paid')} className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase shadow-lg active:scale-95">Approve</button>
                                        <button onClick={()=>setRejectModal(p._id)} className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold text-[10px] uppercase hover:bg-red-200 active:scale-95">Reject</button>
                                    </div>
                                ) : (
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.status}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// =========================================================
// 6. USERS PAGE (PRO VERSION + FILTERS RESTORED)
// =========================================================
const UsersPage = ({ data, fetchData }) => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // 🔥 RESTORED FILTER
    const [selectedUser, setSelectedUser] = useState(null);
    const [walletAmt, setWalletAmt] = useState('');
    const [showPass, setShowPass] = useState(false); // 🔥 Added Password Toggle

    const handleUpdate = async (id, payload) => { await fetch(`${SERVER_URL}/api/users/update`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id, ...payload}) }); fetchData(); setSelectedUser(null); };
    const handleWallet = async (type) => { if(!walletAmt) return; await fetch(`${SERVER_URL}/api/admin/wallet`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ userId: selectedUser._id, amount: walletAmt, type }) }); fetchData(); setWalletAmt(''); alert("Wallet Updated!"); };

    const filteredUsers = data.users?.filter(u => {
        const matchesFilter = filter === 'all' || u.status === filter || (filter === 'vip' && u.isVip);
        const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase()) || u.websiteId.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Users</h2>
                <div className="flex gap-2">
                    <select className="border-2 border-gray-100 rounded-2xl px-4 py-3 font-bold text-xs bg-white outline-none focus:border-black" value={filter} onChange={e=>setFilter(e.target.value)}>
                        <option value="all">All Users</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="banned">Banned</option>
                        <option value="vip">VIP Only</option>
                    </select>
                    <div className="relative"><Search className="absolute left-3 top-3 text-gray-400" size={16}/><input placeholder="Search..." className="pl-10 pr-4 py-3 border-2 border-gray-100 rounded-2xl font-bold text-sm focus:border-black outline-none w-64" value={search} onChange={e=>setSearch(e.target.value)} /></div>
                </div>
            </div>
           
            <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 uppercase text-[10px] font-black text-gray-500 tracking-widest border-b"><tr><th className="p-6">User Profile</th><th className="p-6">Wallet</th><th className="p-6">Status</th><th className="p-6 text-right">Actions</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredUsers?.map(u => (
                            <tr key={u._id} className="hover:bg-gray-50 transition">
                                <td className="p-6">
                                    <div className="font-bold text-gray-900 text-sm">{u.name}</div>
                                    <div className="text-[10px] text-gray-400 font-medium">{u.email}</div>
                                    <div className="text-[9px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded w-fit mt-1">{u.websiteId}</div>
                                </td>
                                <td className="p-6 font-black text-green-600 text-lg">{formatCurrency(u.balance)}</td>
                                <td className="p-6"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.status === 'active' ? 'bg-green-100 text-green-800' : u.status === 'banned' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>{u.status}</span></td>
                                <td className="p-6 text-right"><button onClick={()=>{setSelectedUser(u); setShowPass(false);}} className="bg-black text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase shadow-lg hover:bg-gray-800 active:scale-95 transition">Manage User</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 🔥 PRO USER MODAL (PASSWORD + TRAFFIC DETAILS) */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                        <div className="bg-gray-50 p-6 border-b flex justify-between items-center"><div><h2 className="text-xl font-black uppercase text-gray-900 tracking-tight">User Control</h2><p className="text-[10px] font-bold text-gray-400 mt-1">ID: {selectedUser.websiteId}</p></div><button onClick={()=>setSelectedUser(null)} className="bg-white p-2 rounded-full shadow hover:bg-gray-200"><X size={18}/></button></div>
                        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                           
                            {/* 1. CREDENTIALS & SECURITY */}
                            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-red-400 uppercase flex items-center gap-1"><Lock size={10}/> Password</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-xs text-red-800 bg-white px-2 py-1 rounded border border-red-200">{showPass ? selectedUser.password : '••••••••'}</span>
                                        <button onClick={()=>setShowPass(!showPass)} className="text-red-400 hover:text-red-600">{showPass ? <EyeOff size={14}/> : <Eye size={14}/>}</button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center"><span className="text-[10px] font-black text-red-400 uppercase flex items-center gap-1"><Globe size={10}/> Reg IP</span><span className="font-mono font-bold text-xs text-gray-700">{selectedUser.registrationIp}</span></div>
                            </div>

                            {/* 2. PROMOTION STRATEGY (VISTAR SE) */}
                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-3">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1"><Smartphone size={10}/> Traffic & Promotion</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-xl border border-blue-50"><p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Source</p><p className="font-bold text-xs text-gray-900 break-words">{selectedUser.trafficSource}</p></div>
                                    <div className="bg-white p-3 rounded-xl border border-blue-50"><p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Method</p><p className="font-bold text-xs text-gray-900 break-words">{selectedUser.promotionMethod}</p></div>
                                </div>
                            </div>

                            {/* 3. LINKS & PAYMENT */}
                            <div className="space-y-2">
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100"><p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Postback URL</p><p className="font-mono text-[10px] break-all text-gray-600">{selectedUser.publisherPostback || 'Not Set'}</p></div>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100"><p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Payout UPI</p><p className="font-mono text-xs font-bold text-gray-800">{selectedUser.upi || 'Not Set'}</p></div>
                            </div>

                            {/* 4. ACTIONS */}
                            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                                {selectedUser.status === 'pending' && <button onClick={()=>handleUpdate(selectedUser._id, {status: 'active'})} className="col-span-2 bg-green-500 text-white py-3 rounded-xl font-bold text-xs uppercase shadow-lg hover:bg-green-600">✅ Approve User</button>}
                                {selectedUser.status === 'active' && <button onClick={()=>handleUpdate(selectedUser._id, {status: 'banned'})} className="bg-red-500 text-white py-3 rounded-xl font-bold text-xs uppercase shadow-lg hover:bg-red-600">🚫 Ban User</button>}
                                {selectedUser.status === 'banned' && <button onClick={()=>handleUpdate(selectedUser._id, {status: 'active'})} className="bg-gray-500 text-white py-3 rounded-xl font-bold text-xs uppercase shadow-lg hover:bg-gray-600">♻ Unban User</button>}
                                <button onClick={()=>handleUpdate(selectedUser._id, {isVip: !selectedUser.isVip})} className={`py-3 rounded-xl font-bold text-xs uppercase border-2 ${selectedUser.isVip?'border-yellow-400 text-yellow-600':'border-gray-200 text-gray-500'}`}>{selectedUser.isVip ? 'Remove VIP' : 'Make VIP'}</button>
                            </div>

                            {/* 5. WALLET */}
                            <div className="bg-gray-50 p-4 rounded-2xl flex gap-2">
                                <input type="number" placeholder="Amt" className="flex-1 border-2 border-gray-200 p-2 rounded-xl font-bold text-sm outline-none focus:border-black" value={walletAmt} onChange={e=>setWalletAmt(e.target.value)}/>
                                <button onClick={()=>handleWallet('credit')} className="bg-green-100 text-green-700 px-4 rounded-xl font-bold text-xs uppercase hover:bg-green-200">+ Add</button>
                                <button onClick={()=>handleWallet('debit')} className="bg-red-100 text-red-700 px-4 rounded-xl font-bold text-xs uppercase hover:bg-red-200">- Cut</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// =========================================================
// 7. MAIN SHELL (SIDEBAR & MAINTENANCE)
// =========================================================
export default function AdminPanel() {
    const [page, setPage] = useState('Dashboard');
    const [data, setData] = useState({ users: [], leads: [], offers: [], payouts: [], news: '' });
    const [maintenance, setMaintenance] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch(`${SERVER_URL}/api/admin/dashboard`);
            const d = await res.json();
            if(d) {
                setData(d);
                setMaintenance(d.maintenance);
            }
        } catch (e) { console.log("Connection Error"); }
    };

    useEffect(() => { fetchData(); const i = setInterval(fetchData, 5000); return () => clearInterval(i); }, []);

    const toggleMaintenance = async () => {
        const newVal = !maintenance;
        if(confirm(`Turn Maintenance ${newVal ? 'ON' : 'OFF'}?`)) {
            await fetch(`${SERVER_URL}/api/admin/maintenance`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newVal }) });
            setMaintenance(newVal);
        }
    };

    const NavItem = ({ id, icon: Icon, label }) => (
        <button onClick={() => setPage(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${page === id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
            <Icon size={18} /> <span>{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
            <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 shadow-xl">
                <div className="font-black text-2xl tracking-tighter mb-8 px-2">BHARAT<span className="text-blue-500">ADMIN</span></div>
                <nav className="space-y-1 flex-1">
                    <NavItem id="Dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem id="Users" icon={Users} label="Users & Wallets" />
                    <NavItem id="Offers" icon={ShoppingBag} label="Offers & Goals" />
                    <NavItem id="Approvals" icon={UserCheck} label="Approvals" />
                    <NavItem id="Payouts" icon={DollarSign} label="Payouts" />
                    <NavItem id="Reports" icon={FileText} label="Traffic Logs" />
                </nav>
                <div className="mt-auto pt-4 border-t border-gray-800">
                    <button onClick={toggleMaintenance} className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase ${maintenance ? 'bg-red-600 text-white animate-pulse' : 'bg-green-600 text-white'}`}>
                        {maintenance ? <><AlertOctagon size={14}/> Maintenance ON</> : <><CheckCircle size={14}/> System Active</>}
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {page === 'Dashboard' && <Dashboard data={data} />}
                    {page === 'Users' && <UsersPage data={data} fetchData={fetchData} />}
                    {page === 'Offers' && <OffersPage data={data} fetchData={fetchData} />}
                    {page === 'Approvals' && <ApprovalsPage />}
                    {page === 'Payouts' && <PayoutsPage data={data} fetchData={fetchData} />}
                    {page === 'Reports' && <ReportsPage />}
                </div>
            </main>
        </div>
    );
} 
