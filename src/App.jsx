import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'; // 🔥 Routing Added
import { ShieldCheck, Globe, ArrowRight, LogIn, Mail, Send, Lock, FileText, CheckCircle, Server, CreditCard, AlertOctagon } from 'lucide-react';

// 🔥 IMPORT YOUR PAGES
import AdminPanel from './AdminPanel';
import PublisherPanel from './PublisherPanel';
import UserLanding from './UserLanding';   // ✅ New File
import ReferLanding from './ReferLanding'; // ✅ New File

// --- 1. LEGAL MODAL (Terms & Privacy) ---
const LegalModal = ({ type, onClose }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white p-8 rounded-xl max-w-2xl h-[500px] overflow-y-auto shadow-2xl border border-gray-200">
            <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase border-b pb-2">
                {type === 'terms' ? 'Terms of Service & Compliance' : 'Privacy & Data Protection'}
            </h2>
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                {type === 'terms' ? (
                    <>
                        <p><strong>1. Strict Approval:</strong> All publisher accounts undergo a mandatory 24-hour traffic verification process.</p>
                        <p><strong>2. Prohibited Traffic:</strong> Bot traffic, incent traffic (unless allowed), and adult traffic will lead to an instant permanent ban.</p>
                        <p><strong>3. Payments:</strong> Minimum payout is ₹50 via UPI. We follow a strict payment cycle.</p>
                    </>
                ) : (
                    <>
                        <p><strong>1. Data Security:</strong> Your data is encrypted using 256-bit SSL technology.</p>
                        <p><strong>2. Usage:</strong> We only use your data to track campaign performance and process payouts.</p>
                    </>
                )}
            </div>
            <button onClick={onClose} className="mt-6 bg-black text-white px-8 py-3 rounded-lg font-bold w-full hover:bg-gray-800">I Acknowledge & Close</button>
        </div>
    </div>
);

// --- 2. AUTH FORM (Login / Register) ---
function AuthPage({ mode, onBack, onAuthSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', trafficSource: 'YouTube', trafficLink: '', promotionMethod: '' });
  const [loading, setLoading] = useState(false);
  const [showLegal, setShowLegal] = useState(null);
  const [pendingMsg, setPendingMsg] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const finalForm = { ...form, promotionMethod: `LINK: ${form.trafficLink} | STRATEGY: ${form.promotionMethod}` };
    const endpoint = mode === 'login' ? 'login' : 'register';
   
    try {
        // 🔥 Make sure your Server URL is correct
        const res = await fetch(`https://3g21djpq-5000.inc1.devtunnels.ms/api/${endpoint}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mode === 'register' ? finalForm : form)
        });
        const data = await res.json();
      
        if (data.success) {
            if(mode === 'register') {
                setPendingMsg(true);
            } else {
                localStorage.setItem('user_data', JSON.stringify(data.user));
                onAuthSuccess(data.user);
            }
        } else {
            alert(data.message || "Error Occurred");
        }
    } catch (err) { alert("Server Connection Failed."); }
    setLoading(false);
  };

  if(pendingMsg) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md text-center border border-gray-200">
                <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40}/></div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Application Received</h2>
                <p className="text-gray-600 mb-8 font-medium">Your account is under review. <br/>We will verify your source: <span className="text-blue-600 font-bold">{form.trafficLink}</span></p>
                <button onClick={onBack} className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition">Back to Home</button>
            </div>
        </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
       <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md relative border border-white/50">
          <button onClick={onBack} className="absolute top-6 left-6 text-gray-400 hover:text-black font-bold text-xs flex items-center gap-1">← BACK</button>
          <h2 className="text-3xl font-black text-center mb-8 text-gray-900 uppercase tracking-tight">{mode === 'login' ? 'Secure Login' : 'Partner Application'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
             {mode === 'register' && (
                 <>
                    <input type="text" placeholder="Full Name" required className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm outline-none focus:border-black transition" onChange={e=>setForm({...form, name:e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <select className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm outline-none focus:border-black transition" onChange={e=>setForm({...form, trafficSource:e.target.value})}><option>YouTube</option><option>Telegram</option><option>Website</option><option>Paid Ads</option></select>
                        <input type="text" placeholder="Link / URL" required className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm outline-none focus:border-black transition" onChange={e=>setForm({...form, trafficLink:e.target.value})} />
                    </div>
                    <textarea placeholder="Promotion Strategy..." required className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm outline-none focus:border-black transition h-20" onChange={e=>setForm({...form, promotionMethod:e.target.value})}></textarea>
                 </>
             )}
             <input type="email" placeholder="Email Address" required className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm outline-none focus:border-black transition" onChange={e=>setForm({...form, email:e.target.value})} />
             <input type="password" placeholder="Password" required className="w-full border-2 border-gray-100 p-3 rounded-xl font-bold text-sm outline-none focus:border-black transition" onChange={e=>setForm({...form, password:e.target.value})} />
             {mode === 'register' && (
                 <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                     <input type="checkbox" required id="terms" className="mt-1 w-4 h-4 accent-black"/>
                     <label htmlFor="terms" className="text-xs text-gray-600 font-medium cursor-pointer">I agree to the <span onClick={()=>setShowLegal('terms')} className="text-blue-600 underline">Terms of Service</span>.</label>
                 </div>
             )}
             <button disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-black uppercase hover:bg-gray-800 transition text-sm shadow-lg flex justify-center items-center gap-2">{loading ? 'Processing...' : (mode === 'login' ? <><Lock size={16}/> Access Dashboard</> : 'Submit Application')}</button>
          </form>
       </div>
       {showLegal && <LegalModal type={showLegal} onClose={()=>setShowLegal(null)}/>}
    </div>
  );
}

// --- 3. LANDING PAGE (Main Website) ---
function LandingPage({ onLoginClick, onRegisterClick }) {
  const [showLegal, setShowLegal] = useState(null);
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col text-gray-900">
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-20 shadow-sm">
         <div className="flex items-center gap-2"><div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"><ShieldCheck size={20}/></div><h1 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Bharat<span className="text-blue-600">CPA</span></h1></div>
         <button onClick={() => onLoginClick('login')} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold text-xs hover:bg-black transition flex items-center gap-2 shadow-lg shadow-gray-200"><LogIn size={14}/> LOGIN</button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full z-10">
            <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 relative group overflow-hidden">
               <div className="flex items-center gap-3 mb-6"><span className="bg-blue-100 text-blue-700 p-3 rounded-lg"><Globe size={24}/></span><h2 className="text-2xl font-black text-gray-900 uppercase">Advertisers</h2></div>
               <p className="text-gray-600 text-sm font-medium mb-6 leading-relaxed">Get high-quality traffic for your campaigns. 100% Real Users, No Bots.</p>
               <div className="space-y-3">
                   <a href="mailto:business@bharatcpa.com" className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition cursor-pointer"><Mail className="text-gray-500" size={20}/><div><div className="text-[10px] font-bold text-gray-400 uppercase">Email Us</div><div className="font-bold text-sm text-gray-900">business@bharatcpa.com</div></div></a>
               </div>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black p-10 rounded-2xl shadow-2xl text-white relative group overflow-hidden cursor-pointer" onClick={() => onRegisterClick('register')}>
               <div className="flex items-center gap-3 mb-6 relative z-10"><span className="bg-white/10 text-green-400 p-3 rounded-lg"><CreditCard size={24}/></span><h2 className="text-2xl font-black text-white uppercase">Publishers</h2></div>
               <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed relative z-10">Monetize your YouTube, Telegram, or Web traffic with the highest payouts.</p>
               <div className="inline-flex items-center gap-3 bg-green-500 text-black font-black px-8 py-4 rounded-xl hover:bg-green-400 transition shadow-lg shadow-green-900/50 relative z-10">BECOME A PARTNER <ArrowRight size={18}/></div>
            </div>
         </div>
         <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl opacity-60">
             <div className="flex items-center gap-2 justify-center"><ShieldCheck className="text-gray-500"/> <span className="text-xs font-bold text-gray-600">SSL SECURED</span></div>
             <div className="flex items-center gap-2 justify-center"><Server className="text-gray-500"/> <span className="text-xs font-bold text-gray-600">99.9% UPTIME</span></div>
             <div className="flex items-center gap-2 justify-center"><AlertOctagon className="text-gray-500"/> <span className="text-xs font-bold text-gray-600">ANTI-FRAUD AI</span></div>
             <div className="flex items-center gap-2 justify-center"><FileText className="text-gray-500"/> <span className="text-xs font-bold text-gray-600">VERIFIED NETWORK</span></div>
         </div>
      </div>
      <div className="bg-white border-t border-gray-200 py-8 text-center">
         <div className="flex justify-center gap-6 mb-4 text-xs font-bold text-gray-500 cursor-pointer"><span onClick={()=>setShowLegal('terms')} className="hover:text-black">Terms of Service</span><span onClick={()=>setShowLegal('privacy')} className="hover:text-black">Privacy Policy</span></div>
         <div className="text-[10px] text-gray-400 font-bold uppercase">© 2025 BharatCPA Network. All Rights Reserved.</div>
      </div>
      {showLegal && <LegalModal type={showLegal} onClose={()=>setShowLegal(null)}/>}
    </div>
  );
}

// --- 4. MAIN APP LOGIC (For Dashboard/Login System) ---
function MainApp() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);

  useEffect(() => {
      try {
          const saved = localStorage.getItem('user_data');
          if (saved) {
              const parsed = JSON.parse(saved);
              if(parsed && parsed._id) {
                  setUser(parsed);
                  setView('dashboard');
              } else {
                  localStorage.removeItem('user_data');
              }
          }
      } catch (e) { localStorage.removeItem('user_data'); }
  }, []);

  const handleLogout = () => {
      localStorage.removeItem('user_data');
      setUser(null);
      setView('landing');
      window.location.reload();
  };

  if (view === 'dashboard' && user) {
      if (user.role === 'admin' || user.email === 'admin') return <AdminPanel onLogout={handleLogout} />;
      return <PublisherPanel onLogout={handleLogout} />;
  }

  if (view === 'login' || view === 'register') {
      return <AuthPage mode={view} onBack={() => setView('landing')} onAuthSuccess={(u) => { setUser(u); setView('dashboard'); }} />;
  }

  return <LandingPage onLoginClick={() => setView('login')} onRegisterClick={() => setView('register')} />;
}

// --- 5. ROOT COMPONENT (ROUTING ENABLED) ---
export default function App() {
  return (
    <BrowserRouter>
        <Routes>
            {/* Main Website Route */}
            <Route path="/" element={<MainApp />} />
           
            {/* 🔥 NEW ROUTES FOR LINKS */}
            <Route path="/campaign/:id" element={<UserLanding />} />
            <Route path="/refer/:id" element={<ReferLanding />} />
        </Routes>
    </BrowserRouter>
  );
} 