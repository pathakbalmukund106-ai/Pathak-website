import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, Share2, FileText, Copy, CheckCircle, Lock, Send, List } from 'lucide-react';

const ReferLanding = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [upiId, setUpiId] = useState('');
    const [tgId, setTgId] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // 🔥 IMP: Yahan apna Naya Terminal wala Link dalo
    const API_BASE = "https://3g21djpq-5000.inc1.devtunnels.ms";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/landing/${id}`);
                const json = await res.json();
                if (json.success && json.campaign) {
                    setData(json.campaign);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Connection Error:", err);
                setError(true);
            }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    const handleGenerate = () => {
        if (!upiId) {
            alert("Please enter UPI ID.");
            return;
        }

        // 🔥 LINK GENERATION (Redirects to User Page with ?ref=UPI)
        const trackingParam = `?ref=${upiId}`;
        const link = `${window.location.origin}/campaign/${id}${trackingParam}`;
       
        setGeneratedLink(link);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="min-h-screen bg-[#022c22] flex items-center justify-center text-white font-bold text-xs uppercase">Loading Program...</div>;
    if (error || !data) return <div className="min-h-screen bg-[#022c22] flex items-center justify-center text-red-400 font-bold text-xs uppercase">Program Not Found</div>;

    // --- MAPPING ---
    const pageTitle = data.extraData?.referTitle || "Refer & Earn";
    const pageDesc = data.extraData?.referDesc || "";
    const termsText = data.extraData?.referTerms || "";
   
    // Referral Calculation
    const payoutList = data.payoutSettings || [];
    const totalReferAmount = payoutList.reduce((acc, item) => acc + (item.referPay || 0), 0);
    const displayReferAmount = totalReferAmount > 0 ? totalReferAmount : (data.offerId.payout || 0);

    return (
        <div className="min-h-screen bg-[#022c22] font-sans flex flex-col relative overflow-hidden">
           
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <div className="flex-1 flex flex-col items-center p-4 pt-8 pb-24 relative z-10">
               
                {/* SIMPLE BADGE */}
                <div className="flex items-center gap-2 bg-[#064e3b] border border-[#10b981]/30 px-4 py-1.5 rounded-full mb-6 shadow-md">
                    <Share2 size={12} className="text-[#34d399]" />
                    <span className="text-gray-300 text-[10px] font-bold uppercase tracking-widest">Partner Program</span>
                </div>

                <h1 className="text-white text-xl font-bold uppercase tracking-wide mb-2 text-center leading-tight">
                    {pageTitle}
                </h1>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-6">ID: {data._id.slice(-6)}</p>

                {/* CARD */}
                <div className="bg-white w-full max-w-md rounded-2xl p-1.5 shadow-2xl relative">
                    <div className="h-1.5 bg-yellow-500 rounded-t-xl w-full absolute top-0 left-0"></div>

                    <div className="bg-white rounded-xl p-5 pt-8 border border-gray-100">

                        <div className="text-center mb-6">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Commission / Valid User</p>
                            <h2 className="text-5xl font-black text-[#064e3b] tracking-tighter">
                                <span className="text-2xl align-top text-gray-400 font-bold">₹</span>{displayReferAmount}
                            </h2>

                            {/* REFERRAL BREAKDOWN LIST */}
                            {payoutList.length > 0 && (
                                <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden text-left">
                                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                                        <List size={12} className="text-gray-500"/>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Commission Rates</span>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {payoutList.map((goal, index) => (
                                            <div key={index} className="flex justify-between items-center px-4 py-2 hover:bg-white transition-colors">
                                                <span className="text-xs font-bold text-gray-600 uppercase">{goal.eventName || 'Refer Bonus'}</span>
                                                <span className="text-xs font-black text-[#064e3b] bg-green-100 px-2 py-0.5 rounded">₹{goal.referPay}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                           
                            {pageDesc && (
                                <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-3 text-left rounded-r-lg">
                                    <p className="text-blue-900 text-xs font-semibold leading-relaxed">
                                        {pageDesc}
                                    </p>
                                </div>
                            )}
                        </div>

                        {!generatedLink ? (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="text-gray-700 font-bold text-[11px] mb-1.5 block uppercase">Your UPI ID</label>
                                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 focus-within:border-[#064e3b] focus-within:ring-1 ring-[#064e3b] transition-all">
                                        <input
                                            type="text"
                                            placeholder="Ex: user@ybl"
                                            className="w-full outline-none text-gray-900 font-semibold text-sm bg-transparent"
                                            value={upiId}
                                            onChange={(e) => setUpiId(e.target.value)}
                                        />
                                        <Lock size={12} className="text-gray-400"/>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-gray-700 font-bold text-[11px] mb-1.5 block uppercase flex justify-between">
                                        <span>Telegram Channel</span>
                                        <span className="text-gray-400 text-[9px] lowercase italic">(Optional)</span>
                                    </label>
                                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 focus-within:border-[#064e3b] focus-within:ring-1 ring-[#064e3b] transition-all">
                                        <input
                                            type="text"
                                            placeholder="@channelname"
                                            className="w-full outline-none text-gray-900 font-semibold text-sm bg-transparent"
                                            value={tgId}
                                            onChange={(e) => setTgId(e.target.value)}
                                        />
                                        <Send size={12} className="text-gray-400"/>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    className="w-full bg-[#064e3b] text-white py-4 rounded-lg font-bold text-sm uppercase shadow-lg hover:bg-[#022c22] transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    Get Referral Link <Share2 size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center space-y-4 animate-fade-in">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 border border-green-200">
                                    <CheckCircle size={24} />
                                </div>
                               
                                <h3 className="text-sm font-bold text-gray-800 uppercase">Link Generated!</h3>
                               
                                <div className="bg-gray-100 p-3 rounded-lg border border-gray-300 break-all">
                                    <p className="text-[10px] font-mono text-gray-600 leading-tight">{generatedLink}</p>
                                </div>

                                <button
                                    onClick={copyToClipboard}
                                    className={`w-full py-3 rounded-lg font-bold uppercase text-xs flex items-center justify-center gap-2 transition-all ${copied ? 'bg-black text-white' : 'bg-[#10b981] text-white shadow-lg'}`}
                                >
                                    {copied ? 'Copied' : 'Copy Link'} <Copy size={14}/>
                                </button>

                                <button onClick={() => setGeneratedLink('')} className="text-[10px] text-gray-400 font-bold underline decoration-dotted mt-4">Generate Another</button>
                            </div>
                        )}

                        {termsText && (
                            <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2 mb-2 text-gray-500 border-b border-gray-200 pb-2">
                                    <FileText size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Terms & Conditions</span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-medium leading-relaxed whitespace-pre-line text-left">
                                    {termsText}
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferLanding; 