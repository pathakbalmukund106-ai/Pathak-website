import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
// import fetch from 'node-fetch'; // Uncomment if using older Node version

const app = express();

app.use(express.json());
app.use(cors());

// 🔥 DB CONNECTION
const DB_URI = 'mongodb://127.0.0.1:27017/bharat_cpa';
const PORT = 5000;

mongoose.connect(DB_URI)
    .then(() => console.log("✅ MASTER SERVER ONLINE (With Reports Fix)"))
    .catch(err => console.log("❌ DB CONNECTION FAILED:", err));

// ==========================================
// 1. DATABASE MODELS
// ==========================================

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'publisher' },
    balance: { type: Number, default: 0 },
    status: { type: String, default: 'pending' },
    isVip: { type: Boolean, default: false },
    websiteId: String,
    registrationIp: String,
    trafficSource: { type: String, default: 'Not Provided' },
    promotionMethod: { type: String, default: 'Not Provided' },
    upi: { type: String, default: '' },
    publisherPostback: { type: String, default: '' },
    joinedDate: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const offerSchema = new mongoose.Schema({
    name: String, category: String, description: String, steps: { type: String, default: '' },
    thumbnail: String, originalLink: String, revenue: { type: Number, default: 0 },
    payout: { type: Number, default: 0 }, status: { type: String, default: 'active' },
    cap: { type: Number, default: 0 }, leadsToday: { type: Number, default: 0 },
    privacy: { type: String, default: 'public' }, paymentTerms: { type: String, default: 'Net-30' },
    goals: [{ eventId: String, name: String, payout: Number }]
});
const Offer = mongoose.model('Offer', offerSchema);

const campaignSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
    status: { type: String, default: 'active' },
    clicks: { type: Number, default: 0 },
    goalPostbacks: [{ eventId: String, url: String }],
    payoutSettings: [{ eventName: String, eventId: String, maxPay: Number, userPay: Number, referPay: Number }],
    customInstructions: { type: String, default: '' },
    promoLink: { type: String, default: '' },
    promoType: { type: String, default: 'telegram' },
    extraData: { type: mongoose.Schema.Types.Mixed, default: {} }
});
const Campaign = mongoose.model('Campaign', campaignSchema);

const clickSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    ip: String, sub1: String, sub2: String,
    status: { type: String, default: 'clicked' },
    event: { type: String, default: '-' },
    revenue: Number,
    createdAt: { type: Date, default: Date.now }
});
const Click = mongoose.model('Click', clickSchema);

const leadSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    offerName: String, amount: Number, status: { type: String, default: 'Approved' },
    type: String, endUserWorkerId: String, referrerId: String,
    payoutToUser: { type: Number, default: 0 }, payoutToReferrer: { type: Number, default: 0 },
    userPaymentStatus: { type: String, default: 'Unpaid' }, date: { type: Date, default: Date.now }
});
const Lead = mongoose.model('Lead', leadSchema);

const transactionSchema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, type: String, amount: Number, reason: String, date: { type: Date, default: Date.now } });
const Transaction = mongoose.model('Transaction', transactionSchema);

const payoutSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String, amount: Number, method: String,
    status: { type: String, default: 'pending' },
    rejectReason: { type: String, default: '' },
    date: { type: Date, default: Date.now }
});
const Payout = mongoose.model('Payout', payoutSchema);

const ticketSchema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, subject: String, message: String, reply: { type: String, default: '' }, status: { type: String, default: 'open' }, date: { type: Date, default: Date.now } });
const Ticket = mongoose.model('Ticket', ticketSchema);

const offerRequestSchema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' }, status: { type: String, default: 'pending' }, date: { type: Date, default: Date.now } });
const OfferRequest = mongoose.model('OfferRequest', offerRequestSchema);

const settingsSchema = new mongoose.Schema({
    news: { type: String, default: 'Welcome to our Network!' },
    isMaintenance: { type: Boolean, default: false }
});
const Settings = mongoose.model('Settings', settingsSchema);

// ==========================================
// 2. MIDDLEWARE
// ==========================================

const checkMaintenance = async (req, res, next) => {
    if (req.path.includes('/admin') || req.path.includes('/login') || req.path.includes('/register')) {
        return next();
    }
    const s = await Settings.findOne();
    if (s?.isMaintenance) {
        return res.status(503).json({ success: false, maintenance: true, message: "🚧 Server Under Maintenance. We will be back soon!" });
    }
    next();
};
app.use(checkMaintenance);

// ==========================================
// 3. ADMIN ROUTES (REPORTS FIXED HERE)
// ==========================================

app.get('/api/admin/dashboard', async (req, res) => {
    try {
        const [users, leads, payouts, offers, tickets, requests, settings] = await Promise.all([
            User.find().sort({ joinedDate: -1 }), Lead.find().sort({ date: -1 }), Payout.find().sort({ date: -1 }),
            Offer.find(), Ticket.find().populate('userId', 'name email').sort({ date: -1 }),
            OfferRequest.find({ status: 'pending' }).populate('userId', 'name').populate('offerId', 'name'), Settings.findOne()
        ]);
        res.json({ users, leads, payouts, offers, tickets, news: settings?.news || "", maintenance: settings?.isMaintenance || false, pendingReqCount: requests.length });
    } catch (e) { res.json({ success: false }); }
});

app.post('/api/users/update', async (req, res) => {
    try {
        const { id, status, isVip } = req.body;
        const update = {};
        if(status) update.status = status;
        if(isVip!==undefined) update.isVip = isVip;
        await User.findByIdAndUpdate(id, update);
        res.json({ success: true });
    } catch (e) { res.json({ success: false }); }
});

app.post('/api/users/delete', async (req, res) => { await User.findByIdAndDelete(req.body.id); res.json({ success: true }); });

app.post('/api/admin/wallet', async (req, res) => {
    try {
        const { userId, amount, type } = req.body;
        const user = await User.findById(userId);
        const amt = Number(amount);
        if (type === 'credit') {
            user.balance += amt;
            await new Transaction({ userId, type: 'Credit', amount: amt, reason: 'Admin Bonus' }).save();
        } else {
            user.balance -= amt;
            await new Transaction({ userId, type: 'Debit', amount: amt, reason: 'Admin Deduction' }).save();
        }
        await user.save();
        res.json({ success: true, newBalance: user.balance });
    } catch (e) { res.json({ success: false }); }
});

app.post('/api/offers/add', async (req, res) => { await new Offer(req.body).save(); res.json({ success: true }); });
app.post('/api/offers/edit', async (req, res) => { try { const { _id, id, ...data } = req.body; await Offer.findByIdAndUpdate(_id || id, data, { new: true }); res.json({ success: true }); } catch (e) { res.json({ success: false }); } });
app.post('/api/offers/delete', async (req, res) => { await Offer.findByIdAndDelete(req.body.id); res.json({ success: true }); });

app.post('/api/payouts/action', async (req, res) => {
    try {
        const { id, status, reason, refund } = req.body;
        const payout = await Payout.findById(id);
       
        if (status === 'rejected' && payout.status !== 'rejected') {
            if (refund === true) {
                const user = await User.findById(payout.userId);
                user.balance += payout.amount;
                await user.save();
                await new Transaction({ userId: user._id, type: 'Credit', amount: payout.amount, reason: 'Withdrawal Refund' }).save();
            }
        }
       
        payout.status = status;
        if(reason) payout.rejectReason = reason;
        await payout.save();
        res.json({ success: true });
    } catch (e) { res.json({ success: false }); }
});

app.get('/api/admin/approvals', async (req, res) => { const r = await OfferRequest.find({ status: 'pending' }).populate('userId', 'name websiteId').populate('offerId', 'name'); res.json({ success: true, requests: r }); });
app.post('/api/admin/approvals/action', async (req, res) => { await OfferRequest.findByIdAndUpdate(req.body.requestId, { status: req.body.action }); res.json({ success: true }); });

// 🔥🔥 FIXED: REPORTS API (NOW SENDS EMAIL & WEBSITE ID) 🔥🔥
app.get('/api/admin/reports', async (req, res) => {
    try {
        const clicks = await Click.find()
            .sort({ createdAt: -1 })
            .limit(500)
            .populate('userId', 'name email websiteId') // 🔥 FIX ADDED HERE
            .populate('offerId', 'name');
        res.json({ success: true, clicks });
    } catch(e) { res.json({ success: false }); }
});

app.get('/api/admin/tickets', async (req, res) => { const t = await Ticket.find().populate('userId', 'name email').sort({ date: -1 }); res.json({ success: true, tickets: t }); });
app.post('/api/admin/tickets/reply', async (req, res) => { await Ticket.findByIdAndUpdate(req.body.id, { reply: req.body.reply, status: 'closed' }); res.json({ success: true }); });
app.post('/api/admin/maintenance', async (req, res) => { await Settings.updateOne({}, { isMaintenance: req.body.status }, { upsert: true }); res.json({ success: true }); });
app.post('/api/admin/news', async (req, res) => { await Settings.updateOne({}, { news: req.body.news }, { upsert: true }); res.json({ success: true }); });
app.post('/api/admin/reset-data', async (req, res) => { await Promise.all([Lead.deleteMany({}), Click.deleteMany({}), Transaction.deleteMany({}), Payout.deleteMany({}), Ticket.deleteMany({}), OfferRequest.deleteMany({})]); await User.updateMany({}, { balance: 0 }); await Offer.updateMany({}, { leadsToday: 0 }); res.json({ success: true }); });

// ==========================================
// 4. PUBLISHER APIs
// ==========================================

app.post('/api/register', async (req, res) => {
    const { name, email, password, trafficSource, promotionMethod } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (await User.findOne({ registrationIp: ip })) return res.json({ success: false, message: "Fraud Alert: Multiple Accounts" });
    if (await User.findOne({ email })) return res.json({ success: false, message: "Email Exists" });
    await new User({ name, email, password, trafficSource, promotionMethod, websiteId: `WEB-${Math.floor(1000 + Math.random() * 9000)}`, registrationIp: ip, status: 'pending' }).save();
    res.json({ success: true, message: "Account created! Waiting for Admin Approval." });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin' && password === 'admin') return res.json({ success: true, user: { _id: 'admin', role: 'admin' } });
    const user = await User.findOne({ email, password });
    if (!user) return res.json({ success: false, message: "Invalid Credentials" });
    if (user.status === 'banned') return res.json({ success: false, message: "Account Banned" });
    if (user.status === 'pending') return res.json({ success: false, message: "Account Under Review" });
    res.json({ success: true, user });
});

app.get('/api/pub/dashboard/:id', async (req, res) => {
    try {
        const u = await User.findById(req.params.id);
        if (!u) return res.json({ success: false });
        if (u.status === 'banned') return res.json({ success: false, banned: true });

        const approvedReqs = await OfferRequest.find({ userId: u._id, status: 'approved' });
        const approvedIds = approvedReqs.map(r => r.offerId.toString());
        const allOffers = await Offer.find({ status: 'active' });
        const offers = allOffers.map(o => ({
            ...o._doc,
            accessStatus: o.privacy === 'public' ? 'unlocked' : (o.privacy === 'vip' && u.isVip ? 'unlocked' : (approvedIds.includes(o._id.toString()) ? 'unlocked' : 'request_needed'))
        }));
        const leads = await Lead.find({ userId: u._id }).sort({ date: -1 });
        const payouts = await Payout.find({ userId: u._id }).sort({ date: -1 });
        const trans = await Transaction.find({ userId: u._id }).sort({ date: -1 });
        const s = await Settings.findOne();
        const today = new Date(); today.setHours(0,0,0,0);
        const filterInc = (d) => leads.filter(x => new Date(x.date) >= d).reduce((a, b) => a + (b.amount || 0), 0);
        const filterClk = async (d) => await Click.countDocuments({ userId: u._id, createdAt: { $gte: d } });

        res.json({ success: true, user: u, offers, leads, payouts, transactions: trans, news: s?.news, stats: { clicks: { today: await filterClk(today) }, leads: { today: leads.filter(x => new Date(x.date) >= today).length }, income: { today: filterInc(today) } } });
    } catch (e) { res.json({ success: false }); }
});

app.get('/api/pub/reports/:id', async (req, res) => {
    try { const clicks = await Click.find({ userId: req.params.id }).populate('offerId', 'name category payout').sort({ createdAt: -1 }).limit(300); res.json({ success: true, reports: clicks }); } catch (e) { res.json({ success: false }); }
});

app.post('/api/get-link', async (req, res) => {
    const { userId, offerId } = req.body;
    let camp = await Campaign.findOne({ userId, offerId, 'extraData.userTitle': { $exists: false } });
    if (!camp) {
        const offer = await Offer.findById(offerId);
        if (!offer) return res.json({ success: false });
        const defaults = [{ eventName: 'Install', eventId: 'base', maxPay: offer.payout, userPay: 0, referPay: 0 }];
        if(offer.goals) offer.goals.forEach(g => defaults.push({ eventName: g.name, eventId: g.eventId, maxPay: g.payout, userPay: 0, referPay: 0 }));
        camp = await new Campaign({ userId, offerId, payoutSettings: defaults }).save();
    }
    res.json({ success: true, linkId: camp._id, campaign: camp });
});

app.post('/api/campaigns/save-advanced', async (req, res) => {
    try { const { id, ...data } = req.body; if (id) await Campaign.findByIdAndUpdate(id, data); else await new Campaign(data).save(); res.json({ success: true }); } catch (e) { res.json({ success: false }); }
});

app.get('/api/campaigns/user/:uid', async (req, res) => { const c = await Campaign.find({ userId: req.params.uid }).populate('offerId', 'name'); res.json({ success: true, campaigns: c }); });
app.post('/api/campaigns/delete', async (req, res) => { await Campaign.findByIdAndDelete(req.body.id); res.json({ success: true }); });
app.post('/api/tickets/create', async (req, res) => { await new Ticket(req.body).save(); res.json({ success: true }); });
app.get('/api/tickets/user/:id', async (req, res) => { const t = await Ticket.find({ userId: req.params.id }).sort({ date: -1 }); res.json({ success: true, tickets: t }); });

app.post('/api/payouts/request', async (req, res) => {
    try {
        const { userId, amount, method } = req.body;
        const u = await User.findById(userId);
        if (u.balance >= amount) {
            u.balance -= amount;
            await u.save();
            await new Payout({ userId, userName: u.name, amount, method, status: 'pending' }).save();
            await new Transaction({ userId, type: 'Debit', amount, reason: 'Withdrawal Request' }).save();
            res.json({ success: true });
        } else { res.json({ success: false, message: "Insufficient Balance" }); }
    } catch(e) { res.json({ success: false }); }
});

app.post('/api/offers/request', async (req, res) => { await new OfferRequest(req.body).save(); res.json({ success: true }); });
app.post('/api/pub/mark-paid', async (req, res) => { await Lead.findByIdAndUpdate(req.body.leadId, { userPaymentStatus: 'Paid' }); res.json({ success: true }); });
app.post('/api/profile/update', async (req, res) => { await User.findByIdAndUpdate(req.body.userId, req.body); res.json({ success: true }); });
app.get('/api/landing/:id', async (req, res) => { const c = await Campaign.findById(req.params.id).populate('offerId'); res.json({ success: !!c, campaign: c }); });

app.post('/api/check-status', async (req, res) => {
    try {
        const { clickId } = req.body;
        const click = await Click.findById(clickId);
        if (!click) return res.json({ status: 'not_found' });
        if (click.status === 'converted') return res.json({ status: 'success', event: click.event, amount: click.revenue });
        else return res.json({ status: 'pending' });
    } catch (e) { res.json({ status: 'error' }); }
});

// ==========================================
// 5. TRACKING ENGINE
// ==========================================

app.get('/click/:id', async (req, res) => {
    try {
        const camp = await Campaign.findById(req.params.id);
        const s = await Settings.findOne();
        if (s?.isMaintenance) return res.send("<h1>🚧 Link Under Maintenance</h1>");
        if (!camp || camp.status !== 'active') return res.send("<h1>🚫 Link Paused / Inactive</h1>");
        const offer = await Offer.findById(camp.offerId);
        if (offer.cap > 0 && offer.leadsToday >= offer.cap) return res.send("<h1>⚠️ Daily Cap Reached</h1>");
        const click = await new Click({ userId: camp.userId, offerId: camp.offerId, campaignId: camp._id, ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress, sub1: req.query.sub1 || '', sub2: req.query.sub2 || '', revenue: offer.revenue }).save();
        res.redirect(offer.originalLink.replace('{click_id}', click._id));
    } catch (e) { res.send("Error"); }
});

app.get('/api/postback', async (req, res) => {
    const { click_id, event_id } = req.query;
    const clk = await Click.findById(click_id);
    if (clk && clk.status === 'clicked') {
        const offer = await Offer.findById(clk.offerId);
        const user = await User.findById(clk.userId);
        const camp = await Campaign.findById(clk.campaignId);
        const eventIdToSearch = event_id || 'base';
        const pSetting = camp.payoutSettings.find(s => s.eventId === eventIdToSearch);
        let pay = offer.payout;
        let p1_pay = pSetting ? pSetting.userPay : 0;
        let p2_pay = pSetting ? pSetting.referPay : 0;
        let evt = 'Install';
        if (event_id) { const g = offer.goals.find(x => x.eventId === event_id); if (g) { pay = g.payout; evt = g.name; } }
        user.balance += pay; await user.save();
        offer.leadsToday += 1; await offer.save();
        clk.status = 'converted'; clk.event = evt; await clk.save();
        await new Transaction({ userId: user._id, type: 'Credit', amount: pay, reason: `Lead: ${offer.name} (${evt})` }).save();
        await new Lead({ userId: user._id, offerName: offer.name, amount: pay, status: 'Approved', type: clk.sub2 ? 'P2_Refer' : (clk.sub1 ? 'P1_Task' : 'Direct'), endUserWorkerId: clk.sub1 || '', referrerId: clk.sub2 || '', payoutToUser: p1_pay, payoutToReferrer: p2_pay }).save();
        let pbUrl = user.publisherPostback;
        const campPb = camp.goalPostbacks?.find(g => g.eventId === (event_id || 'base'));
        if (campPb?.url) pbUrl = campPb.url;
        if (pbUrl) {
            const finalUrl = pbUrl.replace('{click_id}', click_id).replace('{payout}', pay).replace('{sub1}', clk.sub1||'').replace('{sub2}', clk.sub2||'');
            // fetch(finalUrl).catch(()=>{});
        }
        res.send("SUCCESS");
    } else { res.send("DUPLICATE OR INVALID"); }
});

app.listen(PORT, () => console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`)); 
