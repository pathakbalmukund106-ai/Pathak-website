import React, { useState, useEffect, useCallback } from 'react';
// 🔥 SAFE ICONS ONLY
import {
    LayoutDashboard, ShoppingBag, Share2, BarChart2, FileText, User, HelpCircle,
    LogOut, Menu, X, DollarSign, Bell, Plus, Copy,
    Trash2, Edit, CheckCircle, RefreshCw, Link as LinkIcon,
    Settings, Send, Power, Search, Filter, ChevronRight, ChevronDown, ChevronUp,
    Zap, CreditCard, Info, MousePointer, ArrowUpRight, Wallet, PlusCircle, Lock, Clock, List,
    CheckSquare, Eye, EyeOff
} from 'lucide-react';

// 🔥 LOCALHOST URL (Mobile check ke liye DevTunnel link yahan daalna)
const DEFAULT_SERVER_URL = "https://3g21djpq-5000.inc1.devtunnels.ms";

const formatCurrency = (a) => '₹' + (Number(a)||0).toFixed(2);
const getTotalPayout = (offer) => {
    let t = offer.payout || 0;
    if (offer.goals) t += offer.goals.reduce((s, g) => s + (g.payout || 0), 0);
    return t;
};

const HeavyLoader = () => (<div className="h-screen flex flex-col items-center justify-center bg-gray-50"><div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div><div className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Loading Panel...</div></div>);
const ServerErrorScreen = ({ onRetry, currentUrl, onUrlChange }) => (<div className="h-screen flex flex-col items-center justify-center bg-red-50 p-6 text-center"><WifiOff size={48} className="text-red-500 mx-auto mb-4"/><h2 className="text-lg font-black text-gray-900 mb-2">Connection Failed</h2><input className="w-full max-w-xs border-2 border-red-200 p-3 rounded-xl font-bold text-center text-xs mb-4" value={currentUrl} onChange={(e)=>onUrlChange(e.target.value)}/><button onClick={onRetry} className="bg-red-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase shadow-lg">Retry Login</button></div>);

// --- 1. OFFER MODAL ---
const OfferModal = ({ offer, user, onClose, serverUrl }) => {
    const [directLink, setDirectLink] = useState('Checking Access...');
    const [showSteps, setShowSteps] = useState(false);

    useEffect(() => {
        let isMounted = true;
        if (offer.accessStatus === 'unlocked') {
            setDirectLink("Generating...");
            fetch(`${serverUrl}/api/get-link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, offerId: offer._id })
            })
            .then(res => res.json()).then(d => {
                if (isMounted && d.success && d.linkId) {
                    setDirectLink(`${serverUrl}/click/${d.linkId}`);
                } else if (isMounted) setDirectLink('Error generating link');
            }).catch(() => { if (isMounted) setDirectLink('Connection Error'); });
        } else {
            setDirectLink("🔒 Approval Required");
        }
        return () => { isMounted = false; };
    }, [offer._id, user._id, serverUrl, offer.accessStatus]);

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full md:max-w-lg rounded-t-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl relative h-[90vh] flex flex-col">
                <div className="bg-gray-900 p-5 text-white shrink-0 relative flex gap-4 items-center">
                    <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/40"><X size={16}/></button>
                    <img src={offer.thumbnail} className="w-20 h-20 rounded-2xl border-2 border-white/20 bg-white object-cover shadow-sm shrink-0"/>
                    <div>
                        <h2 className="text-xl font-black leading-none mb-1 pr-8">{offer.name}</h2>
                        <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-[10px] font-bold bg-green-500 text-black px-2 py-0.5 rounded uppercase">Total: {formatCurrency(getTotalPayout(offer))}</span>
                            <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                <Clock size={10}/> {offer.paymentTerms || 'Net-30'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-10">
                    {offer.accessStatus === 'unlocked' ? (
                        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center">
                            <div className="flex gap-2 items-center justify-center text-orange-700 font-black text-[10px] uppercase tracking-widest mb-2"><Zap size={12}/> Your Tracking Link</div>
                            <div className="bg-white p-3 rounded-xl border border-orange-200 font-mono text-[10px] break-all text-orange-900 font-bold mb-3 select-all">{directLink}</div>
                            <div className="flex gap-2">
                                <button onClick={()=>{navigator.clipboard.writeText(directLink); alert("Copied!");}} className="flex-1 bg-orange-600 text-white px-4 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 flex items-center justify-center gap-2"><Copy size={12}/> Copy Link</button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-100 p-4 rounded-2xl border border-gray-200 text-center">
                            <p className="text-gray-500 font-bold text-xs uppercase mb-2">Access Restricted</p>
                            <div className="text-[10px] text-gray-400">You must request approval to get the tracking link for this offer.</div>
                        </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><Info size={14}/> Caps</span>
                        <span className="text-xs font-black text-gray-900">{offer.cap > 0 ? `${offer.leadsToday} / ${offer.cap} Leads` : 'Unlimited'}</span>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <div className="flex gap-2 items-center text-blue-800 font-black text-[10px] uppercase tracking-widest mb-3"><CreditCard size={12}/> Payout Breakdown</div>
                        <div className="space-y-2">
                            {offer.payout > 0 && (<div className="flex justify-between bg-white p-3 rounded-xl border border-blue-100 text-xs font-bold shadow-sm"><span className="uppercase text-gray-600">Install / CPA</span><span className="text-green-600 font-black">₹{offer.payout}</span></div>)}
                            {offer.goals && offer.goals.map((g, i) => (<div key={i} className="flex justify-between bg-white p-3 rounded-xl border border-blue-100 text-xs font-bold shadow-sm"><span className="uppercase text-gray-600">{g.name}</span><span className="text-green-600 font-black">₹{g.payout}</span></div>))}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                        <div className="flex gap-2 items-center text-gray-400 font-black text-[10px] uppercase tracking-widest"><Info size={12}/> Description</div>
                        <p className="text-xs text-gray-700 font-medium leading-relaxed whitespace-pre-line">{offer.description || "No description available."}</p>
                    </div>

                    {offer.steps && (
                        <div className="border-t border-gray-200 pt-4">
                            <button onClick={() => setShowSteps(!showSteps)} className="w-full flex justify-between items-center bg-black text-white p-4 rounded-xl font-bold text-xs uppercase shadow-lg active:scale-95 transition">
                                <span className="flex items-center gap-2"><List size={14}/> How to Complete (Steps)</span>
                                {showSteps ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                            </button>
                            {showSteps && <div className="mt-2 bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-xs text-gray-800 font-bold whitespace-pre-line leading-relaxed shadow-inner">{offer.steps}</div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- 2. CAMPAIGNS PAGE ---
const CampaignsPage = ({ user, offers = [], serverUrl }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [activeCamp, setActiveCamp] = useState(null);
    const [form, setForm] = useState({
        offerId: '', payouts: [], userTitle: '', userSubtitle: '', userAnnouncement: '',
        userSteps: '', referTitle: '', referDesc: '', referTerms: '', promo: '', ptype: 'telegram', status: 'active'
    });

    const fetchCampaigns = async () => {
        try {
            const res = await fetch(`${serverUrl}/api/campaigns/user/${user._id}?t=${Date.now()}`);
            const d = await res.json();
            if(d.success) setCampaigns(d.campaigns || []);
        } catch(e) { console.error(e); }
    };

    useEffect(() => { fetchCampaigns(); }, [user._id]);

    const approvedOffers = offers.filter(o => o.accessStatus === 'unlocked');

    const handleOfferSelect = (offerId) => {
        const offer = offers.find(o => o._id === offerId);
        if (offer) {
            const settings = [];
            offer.goals?.forEach(g => settings.push({ eventName: g.name, eventId: g.eventId, maxPay: g.payout, userPay: '', referPay: '' }));
            setForm({ ...form, offerId, payouts: settings, userTitle: offer.name, userSubtitle: '', userAnnouncement: '', referTitle: '', referDesc: '', referTerms: '' });
        }
    };

    const handlePayChange = (index, field, value) => {
        const n = [...form.payouts];
        const currentVal = Number(value);
        const otherVal = field === 'userPay' ? Number(n[index].referPay || 0) : Number(n[index].userPay || 0);
        if (currentVal + otherVal > n[index].maxPay) return alert(`Total payout cannot exceed Admin Payout: ₹${n[index].maxPay}`);
        n[index][field] = value; setForm({ ...form, payouts: n });
    };

    const saveCampaign = async () => {
        if(!form.offerId) return alert("Select an offer first!");
        if(!form.userTitle) return alert("Title is required!");

        const extraDataString = JSON.stringify({
            userTitle: form.userTitle, userSubtitle: form.userSubtitle,
            userAnnouncement: form.userAnnouncement, referTitle: form.referTitle,
            referDesc: form.referDesc, referTerms: form.referTerms
        });

        const body = {
            userId: user._id, offerId: form.offerId,
            payoutSettings: form.payouts.map(p => ({...p, userPay: Number(p.userPay), referPay: Number(p.referPay)})),
            customInstructions: form.userSteps, extraData: extraDataString,
            promoLink: form.promo, promoType: form.ptype, status: form.status, id: activeCamp?._id
        };
        try {
            await fetch(`${serverUrl}/api/campaigns/save-advanced`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
            alert("✅ Saved!"); setIsEditing(false); setActiveCamp(null); fetchCampaigns();
        } catch(e) { alert("Error saving campaign"); }
    };

    const deleteCamp = async (id) => { if(confirm("Delete?")) { await fetch(`${serverUrl}/api/campaigns/delete`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id}) }); fetchCampaigns(); }};
    const toggleCamp = async (camp) => {
        const newStatus = camp.status === 'active' ? 'inactive' : 'active';
        const body = { ...camp, status: newStatus, id: camp._id };
        await fetch(`${serverUrl}/api/campaigns/save-advanced`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
        fetchCampaigns();
    };

    return (
        <div className="pb-24 animate-fade-in space-y-8">
            <div className="flex justify-between items-center bg-white p-5 rounded-[2rem] border-2 border-gray-100 shadow-sm">
                <div><h1 className="text-2xl font-black text-gray-900">My Smart Links</h1><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Create & Manage Custom Links</p></div>
                {!isEditing && <button onClick={()=>{setIsEditing(true); setActiveCamp(null); setForm({ offerId: '', payouts: [], userTitle: '', userSubtitle: '', userAnnouncement: '', userSteps: '', referTitle: '', referDesc: '', referTerms: '', promo: '', ptype: 'telegram', status: 'active' });}} className="bg-black text-white px-6 py-3 rounded-2xl font-black text-xs shadow-xl flex items-center gap-2 hover:bg-gray-800 active:scale-95 transition"><PlusCircle size={18}/> CREATE NEW</button>}
            </div>
         
            {isEditing && (
                <div className="bg-white p-8 rounded-[2.5rem] border-4 border-blue-50 shadow-2xl space-y-8 relative overflow-hidden animate-fade-in">
                    <h3 className="font-black text-xl text-blue-900 uppercase tracking-widest border-b border-gray-100 pb-4">{activeCamp ? 'Edit Campaign' : 'Create New Campaign'}</h3>
                    {!activeCamp && (<div><label className="text-[10px] font-black text-gray-400 uppercase ml-2 block mb-2 tracking-widest">Select Offer</label><select className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-blue-600 transition" value={form.offerId} onChange={e=>handleOfferSelect(e.target.value)}><option value="">-- Choose an Approved Offer --</option>{approvedOffers.map(o=><option key={o._id} value={o._id}>{o.name}</option>)}</select>{approvedOffers.length === 0 && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2">* No approved offers available. Go to Marketplace to request.</p>}</div>)}
                    {form.payouts.length > 0 && (<div className="space-y-4"><label className="text-[10px] font-black text-white bg-black uppercase px-3 py-1 rounded-lg w-fit block tracking-widest">● Payout Splitter</label><div className="grid grid-cols-1 gap-4">{form.payouts.map((s,i)=>(<div key={i} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 shadow-sm"><div className="flex justify-between items-center mb-3"><span className="font-black text-sm text-gray-900">{s.eventName}</span><span className="text-[10px] font-black bg-green-200 text-green-800 px-3 py-1 rounded-full">TOTAL: ₹{s.maxPay}</span></div><div className="grid grid-cols-2 gap-4"><div><p className="text-[9px] font-black text-gray-400 mb-1 uppercase">P1 (User)</p><input type="number" className="w-full border-2 p-3 rounded-xl font-bold text-blue-600" value={s.userPay} onChange={e=>handlePayChange(i,'userPay',e.target.value)}/></div><div><p className="text-[9px] font-black text-gray-400 mb-1 uppercase">P2 (Refer)</p><input type="number" className="w-full border-2 p-3 rounded-xl font-bold text-purple-600" value={s.referPay} onChange={e=>handlePayChange(i,'referPay',e.target.value)}/></div></div></div>))}</div></div>)}
                    <div className="space-y-4 border-t pt-4"><label className="text-[10px] font-black text-white bg-black uppercase px-3 py-1 rounded-lg w-fit block tracking-widest">● Landing Content</label><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input className="border-2 p-3 rounded-xl font-bold text-xs" placeholder="Title (Required)" value={form.userTitle} onChange={e=>setForm({...form, userTitle:e.target.value})}/><input className="border-2 p-3 rounded-xl font-bold text-xs" placeholder="Subtitle" value={form.userSubtitle} onChange={e=>setForm({...form, userSubtitle:e.target.value})}/><input className="border-2 p-3 rounded-xl font-bold text-xs col-span-2" placeholder="Announcement" value={form.userAnnouncement} onChange={e=>setForm({...form, userAnnouncement:e.target.value})}/><textarea className="border-2 p-3 rounded-xl font-medium text-xs h-24 col-span-2" placeholder="Steps (Split by comma)" value={form.userSteps} onChange={e=>setForm({...form, userSteps:e.target.value})}/></div></div>
                    <div className="flex gap-4"><button onClick={saveCampaign} className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg active:scale-95">SAVE CHANGES</button><button onClick={()=>setIsEditing(false)} className="px-8 bg-gray-100 rounded-2xl font-black text-xs uppercase">CANCEL</button></div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {campaigns.map(c => {
                    let extra = c.extraData;
                    if (typeof extra === 'string') { try { extra = JSON.parse(extra); } catch(e) {} }
                    extra = extra || {};
                    if (!c.offerId || !extra.userTitle) return null;

                    return (
                        <div key={c._id} className={`bg-white p-6 rounded-[2.5rem] border-2 shadow-sm relative overflow-hidden transition-all ${c.status === 'inactive' ? 'border-red-100 opacity-60' : 'border-gray-50'}`}>
                            <div className="flex justify-between items-center mb-4"><h4 className="font-black text-sm">{extra.userTitle}</h4><div className="flex items-center gap-2"><button onClick={()=>toggleCamp(c)} className={`text-[9px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1 transition ${c.status==='active'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}><Power size={10}/> {c.status}</button></div></div>
                            <div className="space-y-2 mb-4">
                                <div className="bg-blue-50 p-3 rounded-xl"><p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">User Link (P1)</p><div className="flex justify-between"><div className="text-[10px] font-mono text-blue-900 truncate w-40">{window.location.origin}/campaign/{c._id}</div><button onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/campaign/${c._id}`); alert("Copied!");}}><Copy size={12} className="text-blue-600"/></button></div></div>
                                <div className="bg-purple-50 p-3 rounded-xl"><p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">Refer Link (P2)</p><div className="flex justify-between"><div className="text-[10px] font-mono text-purple-900 truncate w-40">{window.location.origin}/refer/{c._id}</div><button onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/refer/${c._id}`); alert("Copied!");}}><Copy size={12} className="text-purple-600"/></button></div></div>
                            </div>
                            <div className="flex gap-2"><button onClick={()=>{setActiveCamp(c); setForm({offerId:c.offerId?._id, payouts:c.payoutSettings, userTitle:extra.userTitle||'', userSubtitle:extra.userSubtitle||'', userAnnouncement:extra.userAnnouncement||'', userSteps:c.customInstructions, referTitle:extra.referTitle||'', referDesc:extra.referDesc||'', referTerms:extra.referTerms||'', promo:c.promoLink, ptype:c.promoType, status:c.status}); setIsEditing(true);}} className="flex-1 bg-gray-100 py-2 rounded-lg font-bold text-[10px] flex justify-center items-center gap-1 hover:bg-gray-200"><Edit size={12}/> Edit</button><button onClick={()=>deleteCamp(c._id)} className="bg-red-50 text-red-500 px-3 rounded-lg hover:bg-red-100"><Trash2 size={14}/></button></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- 3. DASHBOARD PAGE ---
const DashboardPage = ({ data }) => {
    const StatCard = ({ title, today, yesterday, mtd, color, icon: Icon }) => (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
            <div className={`absolute top-0 right-0 p-4 opacity-10 ${color} rounded-bl-3xl`}><Icon size={40} /></div>
            <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">{title}</h3>
            <div className="flex items-baseline gap-2 mb-4"><span className="text-4xl font-black text-gray-900">{today}</span><span className={`text-[10px] font-bold text-white ${color} px-2 py-0.5 rounded-full uppercase`}>Today</span></div>
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 text-center"><p className="text-[9px] font-bold text-gray-400 uppercase">Yesterday</p><p className="text-sm font-black text-gray-700">{yesterday}</p></div>
                <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 text-center"><p className="text-[9px] font-bold text-gray-400 uppercase">MTD</p><p className="text-sm font-black text-gray-700">{mtd}</p></div>
            </div>
        </div>
    );

    return (
        <div className="pb-24 animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Traffic" today={data?.stats?.today?.clicks || 0} yesterday={data?.stats?.yesterday?.clicks || 0} mtd={data?.stats?.mtd?.clicks || 0} color="bg-blue-500" icon={MousePointer}/>
                <StatCard title="Total Leads" today={data?.stats?.today?.leads || 0} yesterday={data?.stats?.yesterday?.leads || 0} mtd={data?.stats?.mtd?.leads || 0} color="bg-purple-500" icon={CheckCircle}/>
                <StatCard title="My Earnings" today={`₹${data?.stats?.today?.income || 0}`} yesterday={`₹${data?.stats?.yesterday?.income || 0}`} mtd={`₹${data?.stats?.mtd?.income || 0}`} color="bg-green-500" icon={DollarSign}/>
            </div>
            <a href="https://t.me/YOUR_CHANNEL_LINK" target="_blank" rel="noopener noreferrer" className="block w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white p-5 rounded-[2rem] shadow-lg shadow-blue-200 hover:shadow-xl transition active:scale-95 flex items-center justify-center gap-3">
                <Send size={24} className="animate-pulse"/>
                <span className="font-black text-sm uppercase tracking-[0.2em]">Join Official Telegram Channel For Updates</span>
            </a>
        </div>
    );
};

// --- 4. ACCOUNT PAGE (WITHDRAWAL API CONNECTED) ---
const AccountPage = ({ user, setUser, serverUrl, walletBalance, data = {} }) => {
    const [upi, setUpi] = useState(user.upi || '');
    const [pass, setPass] = useState('');
    const [amount, setAmount] = useState('');
    const [withdrawTab, setWithdrawTab] = useState('request');
    const payouts = data.payouts || [];

    const saveUpi = async () => { await fetch(`${serverUrl}/api/users/update`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: user._id, upi }) }); alert("UPI Updated"); };
    const savePassword = async () => { if(!pass) return; await fetch(`${serverUrl}/api/users/update`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: user._id, password: pass }) }); alert("Password Changed"); };
  
    // 🔥 FIXED: THIS FUNCTION NOW CALLS THE SERVER
    const handleWithdraw = async () => {
        if(!amount || Number(amount) < 100) return alert("Minimum withdrawal is ₹100");
        if(Number(amount) > walletBalance) return alert("Insufficient Balance");

        try {
            // 🔥 SEND REQUEST TO BACKEND
            const res = await fetch(`${serverUrl}/api/payouts/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, amount: Number(amount), method: 'UPI' })
            });
           
            const responseData = await res.json();
           
            if (responseData.success) {
                alert(`✅ Withdrawal Request of ₹${amount} Sent Successfully!`);
                setAmount('');
                window.location.reload(); // Refresh to update balance & history
            } else {
                alert(`❌ Failed: ${responseData.message}`);
            }
        } catch(e) {
            alert("❌ Server Error: Could not send request.");
        }
    };

    return (
        <div className="pb-24 space-y-8 animate-fade-in">
            <h1 className="text-2xl font-black text-gray-900">My Profile & Finance</h1>
            <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Available Balance</p><h2 className="text-5xl font-black tracking-tighter">₹{walletBalance || 0}</h2></div>
                        <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md"><Wallet size={32} className="text-green-400"/></div>
                    </div>
                    <div className="mt-8 flex items-center gap-2 opacity-60"><User size={14}/><span className="text-xs font-bold uppercase tracking-widest">{user.name || 'Publisher Account'}</span></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-sm space-y-5">
                    <h3 className="font-black text-lg flex items-center gap-2"><Settings size={18}/> Account Settings</h3>
                    <div><label className="text-[10px] font-bold text-gray-400 uppercase">Name</label><input className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl font-bold text-sm text-gray-500" value={user.name} disabled/></div>
                    <div><label className="text-[10px] font-bold text-gray-400 uppercase">Email</label><input className="w-full bg-gray-50 border-2 border-gray-100 p-3 rounded-xl font-bold text-sm text-gray-500" value={user.email} disabled/></div>
                    <div><label className="text-[10px] font-bold text-gray-400 uppercase">Payout UPI</label><input className="w-full border-2 border-gray-200 p-3 rounded-xl font-bold text-sm focus:border-black outline-none transition" placeholder="Enter UPI ID" value={upi} onChange={e=>setUpi(e.target.value)}/></div>
                    <button onClick={saveUpi} className="w-full bg-black text-white py-3 rounded-xl font-black text-xs uppercase shadow-lg active:scale-95">Update UPI</button>
                    <div className="pt-4 border-t border-gray-100"><label className="text-[10px] font-bold text-gray-400 uppercase">Change Password</label><div className="flex gap-2 mt-1"><input className="w-full border-2 border-gray-200 p-3 rounded-xl font-bold text-sm focus:border-red-500 outline-none transition" type="password" placeholder="New Password" value={pass} onChange={e=>setPass(e.target.value)}/><button onClick={savePassword} className="bg-red-50 text-red-600 border border-red-100 px-4 rounded-xl font-black text-xs uppercase active:scale-95">Save</button></div></div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-sm space-y-5">
                    <h3 className="font-black text-lg flex items-center gap-2"><ArrowUpRight size={18}/> Withdrawal Center</h3>
                    <div className="flex gap-2 bg-gray-50 p-1 rounded-xl w-fit">
                        <button onClick={()=>setWithdrawTab('request')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition ${withdrawTab==='request'?'bg-white shadow text-black':'text-gray-400'}`}>Request</button>
                        <button onClick={()=>setWithdrawTab('history')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition ${withdrawTab==='history'?'bg-white shadow text-black':'text-gray-400'}`}>History</button>
                    </div>
                    {withdrawTab === 'request' ? (
                        <div className="space-y-4">
                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100"><p className="text-[10px] font-bold text-yellow-800 uppercase leading-relaxed"> Minimum Withdrawal: ₹100 <br/> Payment Time: 24-48 Hours</p></div>
                            <div><label className="text-[10px] font-bold text-gray-400 uppercase">Enter Amount</label><div className="relative"><span className="absolute left-4 top-3.5 font-bold text-gray-400">₹</span><input type="number" className="w-full border-2 border-gray-200 p-3 pl-8 rounded-xl font-bold text-lg outline-none focus:border-green-500 transition" placeholder="0" value={amount} onChange={e=>setAmount(e.target.value)}/></div></div>
                            <button onClick={handleWithdraw} className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-xs uppercase shadow-xl shadow-green-200 active:scale-95 flex items-center justify-center gap-2">Withdraw Money <ArrowUpRight size={16}/></button>
                        </div>
                    ) : (
                        <div className="h-64 overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left"><thead className="text-[9px] uppercase text-gray-400 font-black sticky top-0 bg-white"><tr><th className="pb-2">Date</th><th className="pb-2">Amount</th><th className="pb-2">Status</th></tr></thead><tbody className="text-xs font-bold text-gray-600">{payouts.length > 0 ? payouts.map(p => (<tr key={p._id} className="border-b border-gray-50"><td className="py-3">{new Date(p.date).toLocaleDateString()}</td><td className="py-3 text-gray-900">₹{p.amount}</td><td className="py-3"><span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[9px] uppercase">{p.status}</span></td></tr>)) : (<tr><td colSpan="3" className="py-10 text-center text-gray-300 text-[10px]">No transaction history found.</td></tr>)}</tbody></table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- 5. OFFERS PAGE (MARKETPLACE WITH TABS) ---
const OffersPage = ({ data, onOpenModal, onRequest }) => {
    const [filterType, setFilterType] = useState('all');

    const filteredOffers = (data.offers || []).filter(o => {
        if (filterType === 'all') return true;
        if (filterType === 'approved') return o.accessStatus === 'unlocked';
        if (filterType === 'needed') return o.accessStatus === 'request_needed' || o.accessStatus === 'locked';
        return true;
    });

    return (
        <div className="pb-24 animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-black text-gray-900">Marketplace</h1>
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                    <button onClick={()=>setFilterType('all')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition ${filterType==='all' ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-900'}`}>All Offers</button>
                    <button onClick={()=>setFilterType('approved')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition ${filterType==='approved' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-green-600'}`}>Approved</button>
                    <button onClick={()=>setFilterType('needed')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition ${filterType==='needed' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-blue-600'}`}>Need Approval</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredOffers.map(o => {
                    const totalPay = getTotalPayout(o);
                    const isCapped = o.cap > 0 && o.leadsToday >= o.cap;
                    const isLocked = o.accessStatus === 'locked';
                    const isRequestNeeded = o.accessStatus === 'request_needed';
                    return (
                        <div key={o._id} className={`bg-white p-5 rounded-[2rem] border-2 border-gray-50 shadow-sm relative overflow-hidden ${isCapped ? 'opacity-75' : ''}`}>
                            {isCapped && <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-sm"><span className="bg-red-600 text-white px-4 py-1 rounded-full font-black text-[10px] shadow-xl uppercase tracking-widest">Cap Reached</span></div>}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4 items-center">
                                    <img src={o.thumbnail} className="w-16 h-16 rounded-xl border object-cover bg-gray-50 shadow-sm"/>
                                    <div>
                                        <h3 className="font-black text-lg leading-none mb-1 text-gray-900">{o.name}</h3>
                                        <div className="flex gap-2">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-blue-100">{o.category}</span>
                                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-gray-200">{o.paymentTerms || 'Net-30'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Caps</p>
                                    <p className={`text-xs font-black ${isCapped ? 'text-red-500' : 'text-gray-800'}`}>{o.cap > 0 ? `${o.leadsToday}/${o.cap}` : '∞'}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                                <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Pay</p><p className="text-2xl font-black text-green-600 tracking-tighter">₹{totalPay}</p></div>
                                {isLocked ? (<button disabled className="bg-gray-100 text-gray-400 px-6 py-3 rounded-xl font-bold text-[10px] uppercase cursor-not-allowed flex items-center gap-2"><Lock size={12}/> Locked</button>) : isRequestNeeded ? (<button onClick={()=>onRequest(o._id)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase shadow-lg shadow-blue-200 active:scale-95 transition flex items-center gap-2">Request Access <ArrowUpRight size={12}/></button>) : (<button onClick={()=>onOpenModal(o)} className="bg-black text-white px-8 py-3 rounded-xl font-bold text-[10px] uppercase shadow-lg active:scale-95 transition flex items-center gap-2">Get Link <ChevronRight size={12}/></button>)}
                            </div>
                        </div>
                    );
                })}
                {filteredOffers.length === 0 && <div className="col-span-full text-center py-20 text-gray-400 font-bold uppercase text-xs">No offers found.</div>}
            </div>
        </div>
    );
};

// --- 6. REPORTS PAGE ---
const GeneralReportsPage = ({ user, serverUrl }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportTab, setReportTab] = useState('general'); // 'general' or 'conversions'
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterOffer, setFilterOffer] = useState('all');

    const loadReports = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${serverUrl}/api/pub/reports/${user._id}`);
            const d = await res.json();
            if(d.success) setReports(d.reports);
        } catch(e) {}
        setLoading(false);
    };

    useEffect(() => { loadReports(); }, [user._id]);

    const uniqueOffers = [...new Set(reports.map(r => r.offerId?.name))].filter(Boolean);

    const filteredReports = reports.filter(r => {
        if (reportTab === 'conversions' && r.status !== 'converted') return false;
        if (filterStatus !== 'all' && r.status !== filterStatus) return false;
        if (filterOffer !== 'all' && r.offerId?.name !== filterOffer) return false;
        if (filterDate && filterDate !== '') {
            const rDate = new Date(r.createdAt).toISOString().split('T')[0];
            if(rDate !== filterDate) return false;
        }
        return true;
    });

    return (
        <div className="space-y-6 pb-24 animate-fade-in">
             <div className="flex justify-between items-center bg-white p-5 rounded-[2rem] border-2 border-gray-100 shadow-sm">
                <div><h1 className="text-2xl font-black text-gray-900">Reports</h1><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Traffic Logs</p></div>
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                    <button onClick={()=>setReportTab('general')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition ${reportTab==='general' ? 'bg-black text-white' : 'text-gray-400'}`}>All Logs</button>
                    <button onClick={()=>setReportTab('conversions')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition ${reportTab==='conversions' ? 'bg-green-600 text-white' : 'text-gray-400'}`}>Conversions</button>
                </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[150px]"><label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Date</label><input type="date" className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-xs font-bold outline-none" value={filterDate} onChange={e=>setFilterDate(e.target.value)} /></div>
                {reportTab === 'general' && (
                    <div className="flex-1 min-w-[150px]"><label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Status</label><select className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-xs font-bold outline-none" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="all">All</option><option value="clicked">Clicked</option><option value="converted">Converted</option></select></div>
                )}
                <div className="flex-1 min-w-[150px]"><label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Offer</label><select className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-xs font-bold outline-none" value={filterOffer} onChange={e=>setFilterOffer(e.target.value)}><option value="all">All Offers</option>{uniqueOffers.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                <button onClick={()=>{setFilterDate(''); setFilterStatus('all'); setFilterOffer('all'); loadReports();}} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg font-black text-xs uppercase flex items-center gap-2"><RefreshCw size={12}/> Reset</button>
            </div>
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[800px]">
                        <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="p-4">Time</th>
                                {reportTab === 'general' && <th className="p-4">Worker (P1) / Referrer (P2)</th>}
                                <th className="p-4">Offer</th>
                                <th className="p-4">Event / Goal</th>
                                <th className="p-4 text-green-700">Earnings</th>
                                {reportTab === 'general' && <th className="p-4">Status</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredReports.map(log => (
                                <tr key={log._id} className="hover:bg-gray-50 transition">
                                    <td className="p-4"><div className="text-xs font-bold text-gray-800">{new Date(log.createdAt).toLocaleTimeString()}</div><div className="text-[9px] text-gray-400 font-mono mt-1">{new Date(log.createdAt).toLocaleDateString()}</div></td>
                                   
                                    {reportTab === 'general' && (
                                        <td className="p-4">
                                            {log.sub1 ? <div className="mb-1"><span className="text-[9px] font-bold text-gray-400">P1:</span> <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">{log.sub1}</span></div> : <div className="text-[10px] text-gray-300">No P1</div>}
                                            {log.sub2 ? <div><span className="text-[9px] font-bold text-gray-400">P2:</span> <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">{log.sub2}</span></div> : <div className="text-[10px] text-gray-300">No P2</div>}
                                        </td>
                                    )}

                                    <td className="p-4"><div className="font-bold text-gray-900">{log.offerId?.name}</div></td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${log.event !== 'Install' && log.event !== '-' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{log.event && log.event !== '-' ? log.event : 'Visit/Click'}</span></td>
                                    <td className="p-4 text-green-600 font-bold">₹{log.revenue || 0}</td>
                                    {reportTab === 'general' && (<td className="p-4">{log.status === 'converted' ? <span className="bg-green-500 text-white px-2 py-1 rounded text-[10px] font-black uppercase shadow-sm">APPROVED</span> : <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-bold uppercase">CLICKED</span>}</td>)}
                                </tr>
                            ))}
                            {filteredReports.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-400 font-bold text-xs">No records found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- 7. WORKER PAYOUTS PAGE (DATA FIX) ---
const UserPayoutsPage = ({ leads = [], user, serverUrl, onRefresh }) => {
    const [view, setView] = useState('pending');
    const [filterDate, setFilterDate] = useState('');
    const [filterOffer, setFilterOffer] = useState('all');
    const [filterEvent, setFilterEvent] = useState('all');
    const [showClicks, setShowClicks] = useState(false);
    const [clicksData, setClicksData] = useState([]); // 🔥 Store fetched clicks

    // 🔥 FETCH CLICKS FOR THIS USER TO MIX IN
    useEffect(() => {
        if(showClicks && user?._id) {
            fetch(`${serverUrl}/api/pub/reports/${user._id}`)
                .then(res => res.json())
                .then(d => { if(d.success) setClicksData(d.reports); })
                .catch(err => console.error("Error loading clicks", err));
        }
    }, [showClicks, user, serverUrl]);

    // 🔥 MERGE LEADS (CONVERSIONS) AND CLICKS (REPORTS)
    // Convert click objects to match Lead structure roughly
    const mappedClicks = showClicks ? clicksData.map(c => ({
        _id: c._id,
        date: c.createdAt,
        offerName: c.offerId?.name || 'Unknown Offer',
        eventName: 'Visit/Click',
        payoutToUser: 0, // Clicks usually 0
        payoutToReferrer: 0,
        endUserWorkerId: c.sub1 || '-',
        referrerId: c.sub2 || '-',
        userPaymentStatus: 'Unpaid', // Treat as unpaid so it shows in pending
        type: 'Click'
    })) : [];

    // Filter out clicks that are actually converted (to avoid duplicates if backend keeps both)
    // Actually, usually we just show all. Let's simple merge.
    const allData = [...leads, ...mappedClicks];

    const baseList = allData.filter(l => view === 'pending' ? l.userPaymentStatus !== 'Paid' : l.userPaymentStatus === 'Paid');
   
    const uniqueOffers = [...new Set(allData.map(l => l.offerName))].filter(Boolean);
    const uniqueEvents = [...new Set(allData.map(l => l.eventName))].filter(Boolean);

    const displayLeads = baseList.filter(l => {
        if (!showClicks) {
            if (!l.amount || l.amount <= 0 || l.status === 'clicked') return false;
        }

        if (filterDate) { const lDate = new Date(l.date).toISOString().split('T')[0]; if (lDate !== filterDate) return false; }
        if (filterOffer !== 'all' && l.offerName !== filterOffer) return false;
        if (filterEvent !== 'all' && (l.eventName || 'CPI') !== filterEvent) return false;
        return true;
    });

    const markAsPaid = async (leadId) => {
        // If it's a raw click (type === Click), we can't really "pay" it in the Leads DB unless we create a Lead.
        // For now, let's assume we only mark actual Leads as paid.
        // Or strictly strictly: "Mark Paid" button only works for real Leads.
        // If user wants to "hide" a click from pending, we'd need a backend update for Clicks too.
        // For safety: only allow marking Real Leads.
       
        const isRealLead = leads.some(real => real._id === leadId);
        if(!isRealLead) return alert("Cannot mark raw clicks as paid yet (Only Conversions).");

        if (!confirm("Confirm mark this as PAID?")) return;
        try {
            await fetch(`${serverUrl}/api/pub/mark-paid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId })
            });
            alert("✅ Marked as Paid!");
            if (onRefresh) onRefresh();
        } catch(e) { alert("Error updating status"); }
    };

    return (
        <div className="space-y-6 pb-24 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-5 rounded-[2rem] border-2 border-gray-100 shadow-sm">
                <div><h1 className="text-2xl font-black text-gray-900">Workers Pay</h1><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Manage User Payments</p></div>
               
                {/* 🔥 TOGGLE FOR ZERO/CLICKS */}
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-bold uppercase text-gray-500">Show Zero/Clicks</span>
                    <button onClick={()=>setShowClicks(!showClicks)} className={`w-8 h-4 rounded-full transition-colors relative ${showClicks ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${showClicks ? 'left-4.5' : 'left-0.5'}`}></div>
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-wrap gap-4 items-end">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit mr-4">
                    <button onClick={()=>setView('pending')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition ${view==='pending' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Pending</button>
                    <button onClick={()=>setView('paid')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition ${view==='paid' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}>Paid</button>
                </div>
                <div className="flex-1 min-w-[120px]"><label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Date</label><input type="date" className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-xs font-bold outline-none" value={filterDate} onChange={e=>setFilterDate(e.target.value)} /></div>
               
                {/* 🔥 OFFER & EVENT FILTERS */}
                <div className="flex-1 min-w-[120px]"><label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Offer</label><select className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-xs font-bold outline-none" value={filterOffer} onChange={e=>setFilterOffer(e.target.value)}><option value="all">All Offers</option>{uniqueOffers.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
                <div className="flex-1 min-w-[120px]"><label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Event Goal</label><select className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-xs font-bold outline-none" value={filterEvent} onChange={e=>setFilterEvent(e.target.value)}><option value="all">All Events</option>{uniqueEvents.map(e=><option key={e} value={e}>{e}</option>)}</select></div>
               
                <button onClick={()=>{setFilterDate(''); setFilterOffer('all'); setFilterEvent('all');}} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg font-black text-xs uppercase">Clear</button>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[1000px]">
                        <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-blue-900 border-r border-gray-100">Worker ID (P1)</th>
                                <th className="p-4 text-green-700 border-r border-gray-100">P1 Amount</th>
                                <th className="p-4 text-purple-900 border-r border-gray-100">Referrer ID (P2)</th>
                                <th className="p-4 text-blue-700 border-r border-gray-100">P2 Amount</th>
                                <th className="p-4">Offer / Task</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                             {displayLeads.length > 0 ? displayLeads.map((lead, idx) => (
                                 <tr key={lead._id || idx} className="hover:bg-gray-50 transition">
                                     <td className="p-4 text-xs font-bold text-gray-500">{new Date(lead.date).toLocaleDateString()}</td>
                                     <td className="p-4 border-r border-gray-50"><span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded w-fit select-all">{lead.endUserWorkerId || '-'}</span></td>
                                     <td className="p-4 font-bold text-green-700 text-base border-r border-gray-50">₹{lead.payoutToUser || 0}</td>
                                     <td className="p-4 border-r border-gray-50"><span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded w-fit select-all">{lead.referrerId || '-'}</span></td>
                                     <td className="p-4 font-bold text-blue-700 text-base border-r border-gray-50">₹{lead.payoutToReferrer || 0}</td>
                                     <td className="p-4"><div className="font-bold text-gray-900">{lead.offerName}</div><div className={`text-[9px] px-2 py-0.5 rounded w-fit mt-1 font-bold uppercase ${lead.type === 'Click' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>{lead.eventName}</div></td>
                                     <td className="p-4">
                                         {lead.type === 'Click' ? (
                                             <span className="text-[10px] text-gray-400 font-bold uppercase">View Only</span>
                                         ) : view === 'pending' ? (
                                             <button onClick={()=>markAsPaid(lead._id)} className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase shadow active:scale-95 flex items-center gap-1 hover:bg-gray-800 transition"><CheckSquare size={14}/> Pay</button>
                                         ) : (
                                             <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit border border-green-200"><CheckCircle size={12}/> Paid</span>
                                         )}
                                     </td>
                                 </tr>
                             )) : (<tr><td colSpan="7" className="p-8 text-center text-gray-400 font-bold text-xs">No records found.</td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- 8. SUPPORT & AUTH (UNCHANGED) ---
const SupportPage = ({ user, serverUrl }) => { const [sub, setSub] = useState(''); const [msg, setMsg] = useState(''); const [tickets, setTickets] = useState([]); useEffect(()=>{fetch(`${serverUrl}/api/tickets/user/${user._id}`).then(r=>r.json()).then(d=>setTickets(d.tickets||[]))},[user._id,serverUrl]); const send = async () => { if(!sub||!msg) return; await fetch(`${serverUrl}/api/tickets/create`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:user._id,subject:sub,message:msg})}); alert("Ticket Sent!"); setSub(''); setMsg(''); }; return (<div className="pb-24 space-y-6"><h1 className="text-2xl font-black text-gray-900">Support Center</h1><div className="bg-white p-6 rounded-[2rem] border-2 border-gray-100 shadow-sm space-y-4"><input className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm" placeholder="Subject" value={sub} onChange={e=>setSub(e.target.value)}/><textarea className="w-full border-2 border-gray-100 p-3 rounded-xl font-medium text-sm h-32 resize-none" placeholder="Describe issue..." value={msg} onChange={e=>setMsg(e.target.value)}/><button onClick={send} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-xs uppercase shadow-lg">Send Ticket</button></div><div className="space-y-3">{tickets.map(t=>(<div key={t._id} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm"><div className="flex justify-between mb-2"><span className="font-black text-sm text-gray-900">{t.subject}</span><span className={`text-[10px] px-2 py-1 rounded uppercase font-black ${t.status==='open'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{t.status}</span></div><p className="text-xs text-gray-600 font-medium">{t.message}</p>{t.reply && <div className="mt-3 bg-blue-50 p-3 rounded-xl text-xs text-blue-900 font-bold border border-blue-100">Reply: {t.reply}</div>}</div>))}</div></div>); };

const AuthPage = ({ onLogin, serverUrl }) => { const [isRegister, setIsRegister] = useState(false); const [form, setForm] = useState({ name: '', email: '', password: '', trafficSource: '', promotionMethod: '' }); const [loading, setLoading] = useState(false); const handleAuth = async () => { if(!form.email || !form.password) return alert("Required fields missing!"); setLoading(true); try { const endpoint = isRegister ? '/api/register' : '/api/login'; const res = await fetch(`${serverUrl}${endpoint}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) }); const d = await res.json(); if(d.success) { if(isRegister) { alert("Registration Successful! Please Login."); setIsRegister(false); } else { localStorage.setItem('user_data', JSON.stringify(d.user)); onLogin(d.user); } } else alert(d.message); } catch(e) { alert("Server Not Reachable!"); } setLoading(false); }; return (<div className="h-screen flex items-center justify-center bg-[#F8F9FA] p-6 font-sans"><div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border-4 border-white animate-fade-in"><h1 className="text-4xl font-black text-center mb-2 italic text-gray-900 tracking-tighter">BHARAT<span className="text-blue-600">CPA</span></h1><p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Publisher Access Portal</p><div className="space-y-4">{isRegister && <><input className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-blue-600 transition" placeholder="Full Name" onChange={e=>setForm({...form, name:e.target.value})}/><input className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-blue-600 transition" placeholder="Traffic Source (e.g. Telegram Channel)" onChange={e=>setForm({...form, trafficSource:e.target.value})}/><input className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-blue-600 transition" placeholder="Promotion Method" onChange={e=>setForm({...form, promotionMethod:e.target.value})}/></>}<input className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-blue-600 transition" placeholder="Email Address" onChange={e=>setForm({...form, email:e.target.value})}/><input type="password" className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-blue-600 transition" placeholder="Password" onChange={e=>setForm({...form, password:e.target.value})}/><button onClick={handleAuth} disabled={loading} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-600 active:scale-95 transition disabled:opacity-50">{loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Login Now')}</button></div><button onClick={()=>setIsRegister(!isRegister)} className="w-full mt-6 text-xs font-bold text-gray-400 uppercase hover:text-black transition tracking-widest">{isRegister ? "Already have an account? Login" : "New Publisher? Register Here"}</button></div></div>); };

// --- 9. MAIN APP SHELL ---
export default function PublisherPanel({ onLogout }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user_data')) || null; } catch { return null; } });
  const [page, setPage] = useState('Dashboard');
  const [data, setData] = useState({
      offers: [],
      leads: [],
      transactions: [],
      payouts: [],
      stats: {
          clicks: {today:0},
          leads: {today:0},
          income: {today:0},
          yesterday: {clicks:0, leads:0, income:0},
          mtd: {clicks:0, leads:0, income:0}
      },
      news: ''
  });
  const [modal, setModal] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
 
  const [serverUrl, setServerUrl] = useState("https://3g21djpq-5000.inc1.devtunnels.ms");

  const loadData = useCallback(async () => {
      if(!user?._id) return;
      try {
          const res = await fetch(`${serverUrl}/api/pub/dashboard/${user._id}`);
          const d = await res.json();
          if(d.success) { setData(prev => ({ ...prev, ...d })); setIsLoaded(true); setIsError(false); }
      } catch(e) { setIsError(true); }
  }, [user?._id, serverUrl]);

  useEffect(() => {
      if(user) { loadData(); const i = setInterval(loadData, 5000); return () => clearInterval(i); }
  }, [loadData, user]);

  if(isError) return <ServerErrorScreen onRetry={()=>{setIsError(false); loadData();}} currentUrl={serverUrl} onUrlChange={setServerUrl}/>;
  if(!user) return <AuthPage onLogin={setUser} serverUrl={serverUrl}/>;
  if(!isLoaded) return <HeavyLoader/>;

  const NavItem = ({ id, icon: Icon, label }) => (
      <button onClick={()=>{ setPage(id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all group ${page===id?'bg-black text-white shadow-xl':'text-gray-400 hover:bg-gray-100 hover:text-gray-900'}`}>
          <Icon size={20} className={`${page===id?'text-blue-500':'group-hover:text-blue-600'}`}/>
          <span className="text-[10px] uppercase tracking-[0.2em]">{label}</span>
      </button>
  );

  // 🔥 SIDEBAR TELEGRAM BUTTON (FIXED LOCATION)
  const TelegramButton = () => (
      <a href="https://t.me/YOUR_CHANNEL_LINK" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white mt-auto border border-blue-100">
          <Send size={20} className="animate-pulse"/>
          <span className="text-[10px] uppercase tracking-[0.2em]">Join Updates</span>
      </a>
  );

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans text-gray-900 overflow-hidden">
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fadeIn 0.4s ease-out; } .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }`}</style>
        <div className="md:hidden fixed top-0 w-full bg-white border-b-2 border-gray-100 z-30 px-6 py-4 flex justify-between items-center shadow-sm"><div className="font-black text-xl italic tracking-tighter">BHARAT<span className="text-blue-600">CPA</span></div><button onClick={()=>setIsMobileMenuOpen(true)} className="p-3 bg-gray-900 rounded-2xl text-white shadow-lg"><Menu size={20}/></button></div>
        {isMobileMenuOpen && (<div className="fixed inset-0 bg-black/90 z-40 md:hidden backdrop-blur-sm animate-fade-in" onClick={()=>setIsMobileMenuOpen(false)}><div className="bg-white w-72 h-full p-8 shadow-2xl flex flex-col" onClick={e=>e.stopPropagation()}><div className="flex justify-between items-center mb-10"><span className="font-black text-2xl tracking-tighter italic">MENU</span><button onClick={()=>setIsMobileMenuOpen(false)} className="bg-gray-100 p-2 rounded-xl text-gray-900 shadow-sm"><X/></button></div><nav className="space-y-2"><NavItem id="Dashboard" icon={LayoutDashboard} label="Statistics" /><NavItem id="Offers" icon={ShoppingBag} label="Marketplace" /><NavItem id="Campaigns" icon={Share2} label="My Links" /><NavItem id="GeneralReports" icon={BarChart2} label="Reports" /><NavItem id="UserPayouts" icon={FileText} label="Worker Pays" /><NavItem id="Account" icon={User} label="Profile/Wallet" /><NavItem id="Support" icon={HelpCircle} label="Help Center" /><TelegramButton/></nav><button onClick={onLogout} className="mt-4 flex items-center justify-center gap-3 py-5 text-red-600 bg-red-50 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-red-100"><LogOut size={18}/> Logout</button></div></div>)}
        <aside className="w-72 bg-white border-r hidden md:flex flex-col p-8 z-20 shadow-xl"><div className="font-black text-3xl italic tracking-tighter mb-12 text-gray-900">BHARAT<span className="text-blue-600">CPA</span></div><nav className="space-y-2 flex-1"><NavItem id="Dashboard" icon={LayoutDashboard} label="Statistics" /><NavItem id="Offers" icon={ShoppingBag} label="Marketplace" /><NavItem id="Campaigns" icon={Share2} label="My Links" /><NavItem id="GeneralReports" icon={BarChart2} label="Reports" /><NavItem id="UserPayouts" icon={FileText} label="Worker Pays" /><div className="h-px bg-gray-100 my-6"></div><NavItem id="Account" icon={User} label="Profile/Wallet" /><NavItem id="Support" icon={HelpCircle} label="Help Center" /></nav><div className="mt-auto space-y-4"><TelegramButton/><button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-5 text-red-600 hover:bg-red-50 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em] border-2 border-red-50">Logout Account</button></div></aside>
        <main className="flex-1 p-6 md:p-12 overflow-y-auto mt-20 md:mt-0 bg-[#F8F9FA] custom-scrollbar">
            <div className="max-w-7xl mx-auto">
                {page==='Dashboard' && <DashboardPage data={data} />}
                {page==='Offers' && <OffersPage data={data} onOpenModal={setModal} onRequest={(id)=>fetch(`${serverUrl}/api/offers/request`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:user._id,offerId:id})}).then(()=>alert("Request Sent! Admin will approve shortly."))} />}
                {page==='Campaigns' && <CampaignsPage user={user} offers={data.offers} serverUrl={serverUrl} />}
                {page==='GeneralReports' && <GeneralReportsPage user={user} serverUrl={serverUrl} />}
                {page==='UserPayouts' && <UserPayoutsPage leads={data.leads} user={user} serverUrl={serverUrl} onRefresh={loadData} />}
                {/* 🔥 WALLET BALANCE NOW USING 'data.user.balance' DIRECTLY */}
                {page==='Account' && <AccountPage user={user} setUser={setUser} data={data} serverUrl={serverUrl} walletBalance={data.user?.balance || 0}/>}
                {page==='Support' && <SupportPage user={user} serverUrl={serverUrl} />}
            </div>
        </main>
        {modal && <OfferModal offer={modal} user={user} onClose={()=>setModal(null)} serverUrl={serverUrl} />}
    </div>
  );
} 
