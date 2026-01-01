import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Clock, Lock, List } from 'lucide-react';

const UserLanding = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [data, setData] = useState(null);
    const [upiId, setUpiId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // 🔥 आपकी API URL
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

    const handleSubmit = () => {
        if (!upiId) {
            alert("Please enter your UPI ID first.");
            return;
        }
        // ✅ साफ़ ट्रैकिंग: P1 में User UPI, P2 में Referrer UPI
        const referrerId = searchParams.get('ref') || "Direct";
        window.location.href = `${API_BASE}/click/${data._id}?sub1=${encodeURIComponent(upiId)}&sub2=${encodeURIComponent(referrerId)}`;
    };

    if (loading) return <div className="min-h-screen bg-[#064e3b] flex items-center justify-center text-white font-bold tracking-wider text-xs">LOADING OFFER...</div>;
    if (error || !data) return <div className="min-h-screen bg-[#064e3b] flex items-center justify-center text-red-400 font-bold text-xs">OFFER NOT FOUND OR EXPIRED</div>;

    // --- ✅ एडमिन के हर बॉक्स का डेटा यहाँ से निकलेगा ---
    const displayTitle = data.extraData?.userTitle || data.extraData?.title || data.offerId?.name || "Verified Task";
    const subTitle = data.extraData?.userSubtitle || data.extraData?.subtitle || "";
    const announcement = data.extraData?.userAnnouncement || data.extraData?.announcement || "";
  
    const rawSteps = data.customInstructions || data.extraData?.steps || data.offerId?.steps || "";
    const stepsList = rawSteps ? rawSteps.split(',').map(s => s.trim()).filter(s => s !== "") : [];

    const payoutList = data.payoutSettings || [];
    const totalAmount = payoutList.reduce((acc, item) => acc + (item.userPay || 0), 0);
    const displayAmount = totalAmount > 0 ? totalAmount : (data.offerId?.payout || 0);

    return (
        <div className="min-h-screen bg-[#064e3b] font-sans flex flex-col relative overflow-hidden text-left">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
           
            <div className="flex-1 flex flex-col items-center p-4 pt-8 pb-24 relative z-10">
               
                <div className="flex items-center gap-2 bg-[#047857] px-4 py-1.5 rounded-full mb-6 shadow-md border border-[#10b981]/30">
                    <ShieldCheck size={14} className="text-[#34d399]" />
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">Verified Task • 100% Safe</span>
                </div>

                {/* ✅ Title और Subtitle (अब 100% दिखेंगे) */}
                <div className="text-center mb-6">
                    <h1 className="text-white text-xl font-bold uppercase tracking-wide leading-tight">{displayTitle}</h1>
                    {subTitle && <p className="text-[#34d399] text-[11px] font-bold uppercase tracking-widest mt-1">{subTitle}</p>}
                </div>

                <div className="bg-white w-full max-w-md rounded-2xl p-1.5 shadow-2xl relative">
                    <div className="h-1.5 bg-[#10b981] rounded-t-xl w-full absolute top-0 left-0"></div>
                    <div className="bg-white rounded-xl p-5 pt-8 border border-gray-100">
                       
                        <div className="text-center mb-6">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Earning Potential</p>
                            <h2 className="text-5xl font-black text-[#064e3b] tracking-tighter"><span className="text-2xl align-top text-gray-400 font-bold">₹</span>{displayAmount}</h2>
                           
                            {/* ✅ Announcement Box (वापस लगा दिया) */}
                            {announcement && (
                                <div className="mt-4 bg-orange-50 border-l-4 border-orange-400 p-3 text-left">
                                    <p className="text-orange-900 text-xs font-semibold leading-relaxed">{announcement}</p>
                                </div>
                            )}

                            {/* Payout Breakdown */}
                            {payoutList.length > 0 && (
                                <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden text-left">
                                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                                        <List size={12} className="text-gray-500"/>
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Payout Breakdown</span>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {payoutList.map((goal, index) => (
                                            <div key={index} className="flex justify-between items-center px-4 py-3 hover:bg-white transition-colors">
                                                <span className="text-xs font-bold text-gray-700 uppercase">{goal.eventName || 'Task'}</span>
                                                <span className="text-sm font-black text-[#064e3b]">₹{goal.userPay}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Field */}
                        <div className="space-y-4 mb-8">
                            <label className="text-gray-700 font-bold text-[11px] mb-1.5 block uppercase tracking-wide">Enter Your UPI ID</label>
                            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 focus-within:border-[#10b981]">
                                <input
                                    type="text"
                                    placeholder="example@upi"
                                    className="w-full outline-none text-gray-900 font-semibold text-sm bg-transparent"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                />
                                <Lock size={12} className="text-gray-400"/>
                            </div>
                        </div>

                        <button onClick={handleSubmit} className="w-full bg-[#10b981] text-white py-4 rounded-lg font-bold text-sm uppercase shadow-lg hover:bg-[#059669] transition-all mb-8">
                            Start Task Now
                        </button>

                        {/* ✅ Steps List */}
                        {stepsList.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-left">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Steps to Follow</h3>
                                <div className="space-y-3">
                                    {stepsList.map((step, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="min-w-[16px] h-[16px] rounded-full bg-[#10b981] text-white flex items-center justify-center text-[9px] font-bold mt-0.5">{i+1}</div>
                                            <p className="text-gray-700 text-xs font-medium leading-tight">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserLanding; 
