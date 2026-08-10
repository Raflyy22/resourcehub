let currentUser = JSON.parse(localStorage.getItem('frh_current_user')) || null;
let adminCreds = JSON.parse(localStorage.getItem('frh_admin_creds')) || { user: 'superadmin', pass: 'securepass99', pin: '8888' };
let adminFailedAttempts = parseInt(localStorage.getItem('frh_admin_fails')) || 0;
let adminLockUntil = parseInt(localStorage.getItem('frh_admin_lock')) || 0;

let resources = JSON.parse(localStorage.getItem('frh_resources')) || [
    {
        id: 1,
        name: "Sketchware Pro Mod",
        category: "Aplikasi",
        version: "v6.3",
        linkAd: "https://safelink-sample.com/file1",
        linkNoAd: "https://drive.google.com/file1-clean",
        description: "Aplikasi Android builder visual dengan dukungan modifikasi penuh.",
        fileSize: "15.4 MB",
        screenshot: "",
        verified: true,
        likes: 12,
        views: 145,
        likedBy: [],
        savedBy: [],
        ratings: { 5: 4 },
        ratedUsers: {},
        comments: [{ user: "Budi", text: "Mantap aplikasinya work 100%!" }]
    }
];

let announcements = JSON.parse(localStorage.getItem('frh_announcements')) || [
    { id: 1, title: "Selamat Datang di FileHub Ultimate Suite v10!", content: "Fitur daily reward, quest admin, kelola poin, dan rating 1x aktif.", date: "11 Agustus 2026" }
];

let communityRequests = JSON.parse(localStorage.getItem('frh_community_requests')) || [];
let liveChatConversations = JSON.parse(localStorage.getItem('frh_livechat_conversations')) || {};
let activeChatUser = "";

let redeemRewards = JSON.parse(localStorage.getItem('frh_redeem_rewards')) || [
    { id: 1, name: "Akses VIP Tanpa Iklan (1 Bulan)", cost: 50, type: "vip" },
    { id: 2, name: "Saldo E-Wallet Rp 25.000", cost: 100, type: "ewallet" }
];

// Quest Poin Admin
let adminQuests = JSON.parse(localStorage.getItem('frh_admin_quests')) || [
    { id: 1, title: "Bagikan website ke grup sosial media", points: 50 },
    { id: 2, title: "Unduh minimal 3 file berbeda", points: 30 }
];
let userCompletedQuests = JSON.parse(localStorage.getItem('frh_user_completed_quests')) || {}; // username: [questId]

let userPoints = JSON.parse(localStorage.getItem('frh_user_points')) || {};
let userVipSubscriptions = JSON.parse(localStorage.getItem('frh_user_vip_subs')) || {};
let userCommentWeeklyData = JSON.parse(localStorage.getItem('frh_user_comment_weekly')) || {}; // username: { weekTimestamp, count }
let userDailyClaimData = JSON.parse(localStorage.getItem('frh_user_daily_claim')) || {}; // username: lastClaimDateStr

let notifications = JSON.parse(localStorage.getItem('frh_notifications')) || [
    { id: 1, text: "Selamat datang di platform FileHub Ultimate Suite v10!", type: 'info', read: false, time: "Baru saja" }
];

let currentFilter = 'All';
let activeResourceId = null;
let adminSessionTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    checkAdminLockState();
    renderNotifications();
    
    const userInp = document.getElementById('uni-user');
    const passInp = document.getElementById('uni-pass');
    [userInp, passInp].forEach(el => {
        if (el) el.addEventListener('input', checkUnifiedAdminTrigger);
    });

    if (currentUser && currentUser.role === 'admin') {
        resetAdminSessionTimer();
    }
});

function addNotification(text, type = 'info') {
    notifications.unshift({ id: Date.now(), text, type, read: false, time: "Baru saja" });
    localStorage.setItem('frh_notifications', JSON.stringify(notifications));
    renderNotifications();
}

function renderNotifications() {
    const badgeNav = document.getElementById('notif-badge-nav');
    const fullList = document.getElementById('notifications-full-list');
    
    let unreadCount = notifications.filter(n => !n.read).length;
    if (badgeNav) {
        if (unreadCount > 0) {
            badgeNav.textContent = unreadCount;
            badgeNav.classList.remove('hidden');
        } else {
            badgeNav.classList.add('hidden');
        }
    }

    if (fullList) {
        fullList.innerHTML = '';
        if (notifications.length === 0) {
            fullList.innerHTML = `<p class="text-xs text-slate-500 text-center py-4">Tidak ada notifikasi.</p>`;
            return;
        }
        notifications.forEach(n => {
            fullList.innerHTML += `
                <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1 ${n.read ? 'opacity-60' : ''}">
                    <p class="text-slate-300">${n.text}</p>
                    <span class="text-[9px] text-slate-500">Baru saja</span>
                </div>
            `;
        });
    }
}

function clearNotifications() {
    notifications.forEach(n => n.read = true);
    localStorage.setItem('frh_notifications', JSON.stringify(notifications));
    renderNotifications();
}

function addPoints(username, amount) {
    if (!userPoints[username]) userPoints[username] = 0;
    userPoints[username] += amount;
    localStorage.setItem('frh_user_points', JSON.stringify(userPoints));
}

function formatFileSizeInput(el) {
    let val = el.value.trim();
    if (!val) return;
    if (!val.toLowerCase().includes('mb') && !val.toLowerCase().includes('kb')) {
        let num = parseFloat(val);
        if (!isNaN(num)) el.value = num + " MB";
    }
}

function switchAuthTab(tab) {
    if (tab === 'login') {
        document.getElementById('form-login-unified').classList.remove('hidden');
        document.getElementById('form-reg-unified').classList.add('hidden');
        document.getElementById('tab-login').className = "flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all text-cyan-400 bg-slate-800 shadow-sm cursor-pointer";
        document.getElementById('tab-reg').className = "flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all text-slate-400 hover:text-slate-200 cursor-pointer";
    } else {
        document.getElementById('form-login-unified').classList.add('hidden');
        document.getElementById('form-reg-unified').classList.remove('hidden');
        document.getElementById('tab-reg').className = "flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all text-cyan-400 bg-slate-800 shadow-sm cursor-pointer";
        document.getElementById('tab-login').className = "flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all text-slate-400 hover:text-slate-200 cursor-pointer";
    }
}

function checkUnifiedAdminTrigger() {
    const uVal = document.getElementById('uni-user').value.trim();
    const pVal = document.getElementById('uni-pass').value;
    const pinContainer = document.getElementById('container-admin-pin');
    if (uVal === adminCreds.user && pVal === adminCreds.pass) {
        pinContainer.classList.remove('hidden');
    } else {
        pinContainer.classList.add('hidden');
    }
}

function handleUnifiedLogin(e) {
    e.preventDefault();
    const uVal = document.getElementById('uni-user').value.trim();
    const pVal = document.getElementById('uni-pass').value;
    const pinVal = document.getElementById('uni-pin').value;

    if (uVal === adminCreds.user && pVal === adminCreds.pass) {
        const now = Date.now();
        if (now < adminLockUntil) return;
        if (pinVal === adminCreds.pin) {
            adminFailedAttempts = 0;
            localStorage.setItem('frh_admin_fails', adminFailedAttempts);
            currentUser = { username: 'Super Administrator', role: 'admin' };
            resetAdminSessionTimer();
        } else {
            adminFailedAttempts++;
            localStorage.setItem('frh_admin_fails', adminFailedAttempts);
            if (adminFailedAttempts >= 3) {
                adminLockUntil = Date.now() + 30000;
                localStorage.setItem('frh_admin_lock', adminLockUntil);
            }
            alert(`PIN Super Admin Salah! Percobaan gagal: ${adminFailedAttempts}/3`);
            checkAdminLockState();
            return;
        }
    } else {
        let users = JSON.parse(localStorage.getItem('frh_users')) || [];
        const validUser = users.find(u => u.username === uVal && u.password === pVal);
        if (validUser && validUser.banned) {
            alert('Akun Anda telah diblokir.');
            return;
        }
        if (!validUser && uVal !== 'user') {
            alert('Username atau Password salah!');
            return;
        }
        currentUser = { username: uVal, role: 'user' };
    }
    localStorage.setItem('frh_current_user', JSON.stringify(currentUser));
    checkAuthState();
}

function resetAdminSessionTimer() {
    if (adminSessionTimer) clearTimeout(adminSessionTimer);
    adminSessionTimer = setTimeout(() => {
        alert('Sesi Super Admin telah berakhir.');
        logout();
    }, 15 * 60 * 1000);
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    if (users.some(u => u.username === username)) {
        alert('Username sudah terdaftar!');
        return;
    }
    users.push({ username, password, banned: false });
    localStorage.setItem('frh_users', JSON.stringify(users));
    alert('Registrasi berhasil! Silakan masuk.');
    switchAuthTab('login');
}

function checkAdminLockState() {
    const now = Date.now();
    const warningEl = document.getElementById('admin-lock-warning');
    const submitBtn = document.getElementById('uni-submit-btn');
    if (now < adminLockUntil) {
        const remainingSec = Math.ceil((adminLockUntil - now) / 1000);
        if (warningEl) {
            warningEl.textContent = `Akses Admin terkunci. Coba lagi dalam ${remainingSec} detik.`;
            warningEl.classList.remove('hidden');
        }
        if (submitBtn) submitBtn.disabled = true;
        setTimeout(checkAdminLockState, 1000);
    } else {
        if (warningEl) warningEl.classList.add('hidden');
        if (submitBtn) submitBtn.disabled = false;
    }
}

function logout() {
    localStorage.removeItem('frh_current_user');
    currentUser = null;
    if (adminSessionTimer) clearTimeout(adminSessionTimer);
    checkAuthState();
}

function checkAuthState() {
    const authModal = document.getElementById('auth-modal');
    const mainApp = document.getElementById('main-app');
    if (!currentUser) {
        authModal.classList.remove('hidden');
        mainApp.classList.add('hidden');
    } else {
        authModal.classList.add('hidden');
        mainApp.classList.remove('hidden');
        document.getElementById('user-display-name').textContent = currentUser.username;
        document.getElementById('user-role-badge').textContent = currentUser.role === 'admin' ? 'Super Admin' : getUserBadge(currentUser.username);

        if (currentUser.role === 'admin') {
            document.getElementById('admin-panel').classList.remove('hidden');
            document.getElementById('user-panel').classList.add('hidden');
            document.getElementById('profile-panel').classList.add('hidden');
            document.getElementById('faq-panel').classList.add('hidden');
            document.getElementById('leaderboard-panel').classList.add('hidden');
            document.getElementById('requests-panel').classList.add('hidden');
            document.getElementById('livechat-panel').classList.add('hidden');
            document.getElementById('notifications-panel').classList.add('hidden');
            renderAdminDashboard();
        } else {
            document.getElementById('admin-panel').classList.add('hidden');
            document.getElementById('user-panel').classList.remove('hidden');
            renderResources();
        }
    }
}

function getUserBadge(username) {
    let pts = userPoints[username] || 0;
    if (pts >= 100) return 'Elite Contributor 🏆';
    if (pts >= 50) return 'Active Contributor 🌟';
    return 'Member Baru 🌱';
}

function switchMainView(view) {
    ['user-panel', 'profile-panel', 'faq-panel', 'leaderboard-panel', 'requests-panel', 'livechat-panel', 'notifications-panel'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    // Update navigasi bawah kategori
    ['home', 'profile', 'notifications'].forEach(m => {
        const btn = document.getElementById(`nav-menu-${m === 'home' ? 'home' : m === 'profile' ? 'profile' : 'notif'}`);
        if (btn) {
            btn.className = m === view ? "px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 transition-all cursor-pointer" : "px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-all cursor-pointer";
        }
    });

    if (view === 'home') {
        document.getElementById('user-panel').classList.remove('hidden');
        renderResources();
    } else if (view === 'profile') {
        document.getElementById('profile-panel').classList.remove('hidden');
        renderProfilePage();
    } else if (view === 'notifications') {
        document.getElementById('notifications-panel').classList.remove('hidden');
        renderNotifications();
    } else if (view === 'faq') {
        document.getElementById('faq-panel').classList.remove('hidden');
    } else if (view === 'leaderboard') {
        document.getElementById('leaderboard-panel').classList.remove('hidden');
        renderLeaderboardPage();
    } else if (view === 'requests') {
        document.getElementById('requests-panel').classList.remove('hidden');
        renderCommunityRequests();
    } else if (view === 'livechat') {
        document.getElementById('livechat-panel').classList.remove('hidden');
        renderUserLiveChatMessages();
    }
}

function openRequestModal() { document.getElementById('request-modal').classList.remove('hidden'); }
function closeRequestModal() { document.getElementById('request-modal').classList.add('hidden'); }

function handlePostRequest(e) {
    e.preventDefault();
    const title = document.getElementById('req-title').value.trim();
    const desc = document.getElementById('req-desc').value.trim();
    communityRequests.push({ id: Date.now(), title, desc, user: currentUser.username, status: 'Pending' });
    localStorage.setItem('frh_community_requests', JSON.stringify(communityRequests));
    closeRequestModal();
    e.target.reset();
    renderCommunityRequests();
    alert('Request file berhasil diajukan!');
}

function renderCommunityRequests() {
    const list = document.getElementById('user-requests-list');
    if (!list) return;
    list.innerHTML = '';
    communityRequests.forEach(req => {
        list.innerHTML += `
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                    <span class="font-bold text-white text-sm block">${req.title}</span>
                    <p class="text-slate-400 mt-0.5">${req.desc}</p>
                </div>
                <span class="text-[10px] text-cyan-400">${req.status}</span>
            </div>
        `;
    });
}

function renderLeaderboardPage() {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    list.innerHTML = '';
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    let ranking = users.map(u => ({ username: u.username, points: userPoints[u.username] || 0 }));
    ranking.push({ username: 'superadmin', points: userPoints['superadmin'] || 150 });
    ranking.sort((a, b) => b.points - a.points);

    ranking.forEach((r, idx) => {
        list.innerHTML += `
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div class="flex items-center gap-3">
                    <span class="font-bold text-amber-400 w-10">#${idx + 1}</span>
                    <span class="font-bold text-white">${r.username}</span>
                </div>
                <div class="text-cyan-400 font-bold">${r.points} Pts</div>
            </div>
        `;
    });
}

function switchAdminTab(type) {
    ['upload', 'manage', 'users', 'quests', 'livechat', 'rewards', 'requests', 'analytics', 'backup', 'settings'].forEach(t => {
        const sec = document.getElementById(`admin-${t}-section`);
        const btn = document.getElementById(`btn-tab-${t}`);
        if(sec) sec.classList.add('hidden');
        if(btn) btn.className = "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer";
    });
    const targetSec = document.getElementById(`admin-${type}-section`);
    const targetBtn = document.getElementById(`btn-tab-${type}`);
    if(targetSec) targetSec.classList.remove('hidden');
    if(targetBtn) targetBtn.className = "px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer";
    
    if (type === 'manage') renderAdminManageList();
    if (type === 'users') renderAdminUsersList();
    if (type === 'quests') renderAdminQuestsList();
    if (type === 'livechat') renderAdminLiveChatUsers();
    if (type === 'rewards') renderAdminRewardsList();
}

// 5. Kelola Poin User di Dashboard Admin
function renderAdminUsersList() {
    const list = document.getElementById('admin-users-list');
    if (!list) return;
    list.innerHTML = '';
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    users.forEach((u, idx) => {
        let pts = userPoints[u.username] || 0;
        let isVip = userVipSubscriptions[u.username] || false;
        list.innerHTML += `
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
                <div>
                    <span class="font-bold text-white text-sm block">${u.username}</span>
                    <span class="text-[10px] text-amber-400 font-bold">Poin: ${pts} Pts | VIP: ${isVip ? 'Aktif' : 'Non-VIP'}</span>
                </div>
                <div class="flex items-center gap-2">
                    <input type="number" id="admin-pts-${u.username}" placeholder="Jumlah Pts" class="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs">
                    <button onclick="adjustUserPoints('${u.username}', 'add')" class="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded font-bold">+ Poin</button>
                    <button onclick="adjustUserPoints('${u.username}', 'sub')" class="px-2 py-1 bg-rose-500/20 text-rose-400 rounded font-bold">- Poin</button>
                    <button onclick="toggleVipSubscription('${u.username}')" class="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded">${isVip ? 'Cabut VIP' : 'Beri VIP'}</button>
                </div>
            </div>
        `;
    });
}

function adjustUserPoints(username, action) {
    const input = document.getElementById(`admin-pts-${username}`);
    const val = parseInt(input.value) || 0;
    if (!userPoints[username]) userPoints[username] = 0;
    if (action === 'add') userPoints[username] += val;
    else userPoints[username] = Math.max(0, userPoints[username] - val);
    localStorage.setItem('frh_user_points', JSON.stringify(userPoints));
    renderAdminUsersList();
    alert(`Poin user @${username} berhasil diperbarui.`);
}

function toggleVipSubscription(username) {
    userVipSubscriptions[username] = !userVipSubscriptions[username];
    localStorage.setItem('frh_user_vip_subs', JSON.stringify(userVipSubscriptions));
    renderAdminUsersList();
}

// 4. Quest Poin Admin
function renderAdminQuestsList() {
    const list = document.getElementById('admin-quests-list');
    if (!list) return;
    list.innerHTML = '';
    adminQuests.forEach((q, idx) => {
        list.innerHTML += `
            <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                    <span class="font-bold text-white">${q.title}</span>
                    <span class="text-amber-400 block">+${q.points} Pts</span>
                </div>
                <button onclick="deleteAdminQuest(${idx})" class="px-3 py-1 bg-rose-500/20 text-rose-400 font-bold rounded">Hapus</button>
            </div>
        `;
    });
}

function handleSaveQuest(e) {
    e.preventDefault();
    const title = document.getElementById('quest-title').value.trim();
    const points = parseInt(document.getElementById('quest-points').value);
    adminQuests.push({ id: Date.now(), title, points });
    localStorage.setItem('frh_admin_quests', JSON.stringify(adminQuests));
    e.target.reset();
    renderAdminQuestsList();
    alert('Quest baru berhasil ditambahkan!');
}

function deleteAdminQuest(idx) {
    adminQuests.splice(idx, 1);
    localStorage.setItem('frh_admin_quests', JSON.stringify(adminQuests));
    renderAdminQuestsList();
}

// Live Chat Admin
function renderAdminLiveChatUsers() {
    const list = document.getElementById('admin-chat-user-list');
    if (!list) return;
    list.innerHTML = '';
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    users.forEach(u => {
        list.innerHTML += `
            <div onclick="selectActiveChatUser('${u.username}')" class="p-2.5 rounded-xl cursor-pointer text-xs font-semibold ${activeChatUser === u.username ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-300'}">
                <span>${u.username}</span>
            </div>
        `;
    });
    renderAdminChatMessages();
}

function selectActiveChatUser(username) {
    activeChatUser = username;
    renderAdminLiveChatUsers();
}

function renderAdminChatMessages() {
    const box = document.getElementById('admin-chat-messages');
    if (!box || !activeChatUser) return;
    box.innerHTML = '';
    let msgs = liveChatConversations[activeChatUser] || [];
    msgs.forEach(m => {
        box.innerHTML += `
            <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span class="font-bold text-cyan-400">${m.sender}</span>
                <p class="text-slate-200">${m.text}</p>
                ${m.img ? `<img src="${m.img}" class="max-h-32 rounded-lg mt-1">` : ''}
            </div>
        `;
    });
}

function handleAdminSendChat(e) {
    e.preventDefault();
    if (!activeChatUser) return;
    const input = document.getElementById('admin-chat-input');
    const text = input.value.trim();
    if (!text) return;
    if (!liveChatConversations[activeChatUser]) liveChatConversations[activeChatUser] = [];
    liveChatConversations[activeChatUser].push({ sender: 'superadmin', text, time: new Date().toLocaleTimeString('id-ID') });
    localStorage.setItem('frh_livechat_conversations', JSON.stringify(liveChatConversations));
    input.value = '';
    renderAdminChatMessages();
}

function handleAdminUploadImage(e) {
    const file = e.target.files[0];
    if (!file || !activeChatUser) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        if (!liveChatConversations[activeChatUser]) liveChatConversations[activeChatUser] = [];
        liveChatConversations[activeChatUser].push({ sender: 'superadmin', text: '[Foto]', img: event.target.result, time: new Date().toLocaleTimeString('id-ID') });
        localStorage.setItem('frh_livechat_conversations', JSON.stringify(liveChatConversations));
        renderAdminChatMessages();
    };
    reader.readAsDataURL(file);
}

function renderUserLiveChatMessages() {
    const box = document.getElementById('user-livechat-messages');
    if (!box || !currentUser) return;
    box.innerHTML = '';
    let msgs = liveChatConversations[currentUser.username] || [];
    msgs.forEach(m => {
        box.innerHTML += `
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span class="font-bold text-cyan-400">${m.sender}</span>
                <p class="text-slate-200">${m.text}</p>
                ${m.img ? `<img src="${m.img}" class="max-h-32 rounded-lg mt-1">` : ''}
            </div>
        `;
    });
}

function handleUserSendChat(e) {
    e.preventDefault();
    const input = document.getElementById('user-chat-input');
    const text = input.value.trim();
    if (!text || !currentUser) return;
    if (!liveChatConversations[currentUser.username]) liveChatConversations[currentUser.username] = [];
    liveChatConversations[currentUser.username].push({ sender: currentUser.username, text, time: new Date().toLocaleTimeString('id-ID') });
    localStorage.setItem('frh_livechat_conversations', JSON.stringify(liveChatConversations));
    input.value = '';
    renderUserLiveChatMessages();
}

function handleUserUploadImage(e) {
    const file = e.target.files[0];
    if (!file || !currentUser) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        if (!liveChatConversations[currentUser.username]) liveChatConversations[currentUser.username] = [];
        liveChatConversations[currentUser.username].push({ sender: currentUser.username, text: '[Foto]', img: event.target.result, time: new Date().toLocaleTimeString('id-ID') });
        localStorage.setItem('frh_livechat_conversations', JSON.stringify(liveChatConversations));
        renderUserLiveChatMessages();
    };
    reader.readAsDataURL(file);
}

// Kustom Reward Redeem
function renderAdminRewardsList() {
    const list = document.getElementById('admin-rewards-list');
    if (!list) return;
    list.innerHTML = '';
    redeemRewards.forEach((rew, idx) => {
        list.innerHTML += `
            <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span class="font-bold text-white">${rew.name} (${rew.cost} Pts)</span>
                <button onclick="deleteReward(${idx})" class="px-3 py-1 bg-rose-500/20 text-rose-400 font-bold rounded">Hapus</button>
            </div>
        `;
    });
}

function handleSaveReward(e) {
    e.preventDefault();
    const name = document.getElementById('rew-name').value.trim();
    const cost = parseInt(document.getElementById('rew-cost').value);
    redeemRewards.push({ id: Date.now(), name, cost, type: 'custom' });
    localStorage.setItem('frh_redeem_rewards', JSON.stringify(redeemRewards));
    e.target.reset();
    renderAdminRewardsList();
}

function deleteReward(idx) {
    redeemRewards.splice(idx, 1);
    localStorage.setItem('frh_redeem_rewards', JSON.stringify(redeemRewards));
    renderAdminRewardsList();
}

function renderUserRedeemRewardsList() {
    const list = document.getElementById('user-redeem-rewards-list');
    if (!list) return;
    list.innerHTML = '';
    let myPts = userPoints[currentUser.username] || 0;
    redeemRewards.forEach(rew => {
        list.innerHTML += `
            <div class="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between text-xs space-y-3">
                <div>
                    <span class="font-bold text-white text-sm block">${rew.name}</span>
                    <span class="text-amber-400 font-bold mt-1 inline-block">${rew.cost} Poin</span>
                </div>
                <button onclick="redeemRewardItem(${rew.id})" class="w-full py-2.5 ${myPts >= rew.cost ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500 cursor-not-allowed'} rounded-xl">Tukar</button>
            </div>
        `;
    });
}

function redeemRewardItem(id) {
    let rew = redeemRewards.find(r => r.id === id);
    let myPts = userPoints[currentUser.username] || 0;
    if (myPts < rew.cost) {
        alert('Poin tidak mencukupi.');
        return;
    }
    userPoints[currentUser.username] -= rew.cost;
    localStorage.setItem('frh_user_points', JSON.stringify(userPoints));
    if (rew.type === 'vip') {
        userVipSubscriptions[currentUser.username] = true;
        localStorage.setItem('frh_user_vip_subs', JSON.stringify(userVipSubscriptions));
    }
    alert(`Berhasil menukar ${rew.name}!`);
    renderProfilePage();
}

function handleSaveResource(e) {
    e.preventDefault();
    const name = document.getElementById('up-name').value;
    const category = document.getElementById('up-category').value;
    const version = document.getElementById('up-version').value.trim();
    const linkAd = document.getElementById('up-link-ad').value.trim();
    const linkNoAd = document.getElementById('up-link-noad').value.trim();
    const description = document.getElementById('up-desc').value;
    const fileSize = document.getElementById('up-link-size').value;
    const verified = document.getElementById('up-verified').checked;

    resources.unshift({
        id: Date.now(), name, category, version, linkAd, linkNoAd, description, fileSize, verified,
        likes: 0, views: 0, likedBy: [], savedBy: [], ratings: {}, ratedUsers: {}, comments: []
    });
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    e.target.reset();
    alert('Resource berhasil dipublikasikan!');
}

function renderAdminManageList() {
    const list = document.getElementById('admin-manage-list');
    if (!list) return;
    list.innerHTML = '';
    resources.forEach(res => {
        list.innerHTML += `
            <div class="bg-slate-950 border border-slate-800 p-4 rounded-xl flex justify-between text-xs">
                <span>${res.name}</span>
                <button onclick="deleteResource(${res.id})" class="text-rose-400 font-bold">Hapus</button>
            </div>
        `;
    });
}

function deleteResource(id) {
    resources = resources.filter(r => r.id !== id);
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    renderAdminManageList();
}

function filterCategory(cat) {
    currentFilter = cat;
    ['All', 'File', 'Aplikasi', 'Saved'].forEach(c => {
        const btn = document.getElementById(`cat-btn-${c}`);
        if(btn) btn.className = c === cat ? "px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 transition-all cursor-pointer shadow-md" : "px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer";
    });
    renderResources();
}

function filterSaved() { filterCategory('Saved'); }

function renderResources() {
    const grid = document.getElementById('resource-grid');
    if (!grid) return;
    const searchKeyword = document.getElementById('search-input').value.toLowerCase();
    grid.innerHTML = '';

    let filtered = resources.filter(res => {
        let matchCat = true;
        if (currentFilter === 'File') matchCat = res.category === 'File';
        if (currentFilter === 'Aplikasi') matchCat = res.category === 'Aplikasi';
        if (currentFilter === 'Saved') matchCat = res.savedBy && res.savedBy.includes(currentUser.username);
        let matchSearch = res.name.toLowerCase().includes(searchKeyword);
        return matchCat && matchSearch;
    });

    filtered.forEach(res => {
        let avg = calculateAverageRating(res);
        grid.innerHTML += `
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
                <div>
                    <h3 onclick="openDetail(${res.id})" class="font-bold text-base text-white hover:text-cyan-400 cursor-pointer">${res.name}</h3>
                    <p class="text-xs text-slate-300 mt-2 line-clamp-2">${res.description}</p>
                </div>
                <div class="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <span class="text-amber-400 font-bold"><i class="fa-solid fa-star"></i> ${avg}</span>
                    <button onclick="openDetail(${res.id})" class="px-3 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg cursor-pointer">Detail</button>
                </div>
            </div>
        `;
    });
}

function calculateAverageRating(res) {
    if (!res.ratings || Object.keys(res.ratings).length === 0) return '0.0';
    let totalScore = 0, totalVotes = 0;
    for (let star in res.ratings) {
        totalScore += star * res.ratings[star];
        totalVotes += res.ratings[star];
    }
    return (totalScore / totalVotes).toFixed(1);
}

function openDetail(id) {
    activeResourceId = id;
    const res = resources.find(r => r.id === id);
    if (!res) return;
    document.getElementById('detail-modal').classList.remove('hidden');
    document.getElementById('modal-title').textContent = res.name;
    document.getElementById('modal-version-badge').textContent = res.version || 'v1.0';
    document.getElementById('modal-badge').textContent = res.category;
    document.getElementById('modal-desc').textContent = res.description;
    document.getElementById('modal-avg-rating').innerHTML = `<i class="fa-solid fa-star"></i> ${calculateAverageRating(res)}`;
    
    document.getElementById('modal-download-ad-btn').href = res.linkAd;
    let isVip = userVipSubscriptions[currentUser.username] || false;
    document.getElementById('modal-download-noad-btn').href = isVip || currentUser.role === 'admin' ? res.linkNoAd : "#";

    renderComments(res);
}

// 1. Perbaiki Rating Supaya 1x Saja Setiap Postingan untuk User
function rateResource(star) {
    if (!activeResourceId) return;
    let res = resources.find(r => r.id === activeResourceId);
    if (!res.ratings) res.ratings = {};
    if (!res.ratedUsers) res.ratedUsers = {};

    if (res.ratedUsers[currentUser.username]) {
        alert('Anda sudah memberikan rating untuk postingan ini sebelumnya! Rating hanya dapat diberikan 1x.');
        return;
    }

    res.ratedUsers[currentUser.username] = star;
    res.ratings[star] = (res.ratings[star] || 0) + 1;
    addPoints(currentUser.username, 10);
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    alert(`Rating ${star} bintang berhasil disimpan (+10 Poin)!`);
    openDetail(activeResourceId);
}

function closeModal() {
    document.getElementById('detail-modal').classList.add('hidden');
    activeResourceId = null;
}

// 2. Mendapatkan Poin dengan Komentar Hanya 3x dalam Seminggu
function handlePostComment(e) {
    e.preventDefault();
    if (!activeResourceId) return;
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (!text) return;

    let res = resources.find(r => r.id === activeResourceId);
    if (!res.comments) res.comments = [];
    res.comments.push({ user: currentUser.username, text });

    let now = Date.now();
    let oneWeek = 7 * 24 * 60 * 60 * 1000;
    if (!userCommentWeeklyData[currentUser.username]) {
        userCommentWeeklyData[currentUser.username] = { timestamp: now, count: 0 };
    }
    let data = userCommentWeeklyData[currentUser.username];
    if (now - data.timestamp > oneWeek) {
        data.timestamp = now;
        data.count = 0;
    }

    if (data.count < 3) {
        data.count++;
        addPoints(currentUser.username, 5);
        alert('Komentar terkirim (+5 Poin)! Kuota mingguan komentar berpoin tersisa: ' + (3 - data.count));
    } else {
        alert('Komentar terkirim. Kuota poin mingguan Anda dari komentar (3x) telah habis minggu ini.');
    }

    localStorage.setItem('frh_user_comment_weekly', JSON.stringify(userCommentWeeklyData));
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    input.value = '';
    renderComments(res);
}

function renderComments(res) {
    const list = document.getElementById('comment-list');
    document.getElementById('comment-count').textContent = res.comments ? res.comments.length : 0;
    list.innerHTML = '';
    if (!res.comments || res.comments.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500">Belum ada komentar.</p>`;
        return;
    }
    res.comments.forEach(c => {
        list.innerHTML += `<div class="bg-slate-950 p-3 rounded-xl text-xs space-y-1"><span class="font-bold text-cyan-400">${c.user}</span><p class="text-slate-300">${c.text}</p></div>`;
    });
}

// 3. Daily Reward Harian Reset Jam 00.00, Random 1-500 dengan Rate Probabilitas Kesusahan
function claimDailyReward() {
    let todayStr = new Date().toDateString();
    if (userDailyClaimData[currentUser.username] === todayStr) {
        alert('Anda sudah mengklaim Daily Reward hari ini! Silakan kembali besok setelah pukul 00.00 WIB.');
        return;
    }

    // Rate probabilitas: 1-50 (50%), 51-200 (30%), 201-400 (15%), 401-500 (5%)
    let rand = Math.random() * 100;
    let rewardPts = 0;
    if (rand < 50) rewardPts = Math.floor(Math.random() * 50) + 1;
    else if (rand < 80) rewardPts = Math.floor(Math.random() * 150) + 51;
    else if (rand < 95) rewardPts = Math.floor(Math.random() * 200) + 201;
    else rewardPts = Math.floor(Math.random() * 100) + 401;

    userDailyClaimData[currentUser.username] = todayStr;
    localStorage.setItem('frh_user_daily_claim', JSON.stringify(userDailyClaimData));
    addPoints(currentUser.username, rewardPts);
    alert(`Selamat! Anda berhasil mengklaim Daily Reward hari ini sebesar +${rewardPts} Poin!`);
    renderProfilePage();
}

// Render Profile & Quests
function renderProfilePage() {
    document.getElementById('profile-username').textContent = currentUser.username;
    document.getElementById('profile-badge-label').textContent = getUserBadge(currentUser.username);
    document.getElementById('profile-points-label').textContent = `Poin Reward Kontributor: ${userPoints[currentUser.username] || 0} Pts`;
    
    let isVip = userVipSubscriptions[currentUser.username] || false;
    document.getElementById('profile-vip-status').innerHTML = isVip ? `<span class="px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-lg">VIP Tanpa Iklan Aktif</span>` : `<span class="text-slate-400">Status: Member Free</span>`;

    renderUserQuestsList();
    renderUserRedeemRewardsList();
}

function renderUserQuestsList() {
    const list = document.getElementById('user-quests-list');
    if (!list) return;
    list.innerHTML = '';
    if (!userCompletedQuests[currentUser.username]) userCompletedQuests[currentUser.username] = [];
    
    adminQuests.forEach(q => {
        let isDone = userCompletedQuests[currentUser.username].includes(q.id);
        list.innerHTML += `
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                    <span class="font-bold text-white block">${q.title}</span>
                    <span class="text-amber-400">+${q.points} Pts</span>
                </div>
                <button onclick="completeUserQuest(${q.id}, ${q.points})" class="px-4 py-2 ${isDone ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-cyan-500 text-slate-950 font-bold cursor-pointer'} rounded-xl">${isDone ? 'Selesai' : 'Klaim Quest'}</button>
            </div>
        `;
    });
}

function completeUserQuest(id, pts) {
    if (!userCompletedQuests[currentUser.username]) userCompletedQuests[currentUser.username] = [];
    if (userCompletedQuests[currentUser.username].includes(id)) {
        alert('Quest ini sudah Anda selesaikan sebelumnya.');
        return;
    }
    userCompletedQuests[currentUser.username].push(id);
    localStorage.setItem('frh_user_completed_quests', JSON.stringify(userCompletedQuests));
    addPoints(currentUser.username, pts);
    alert(`Quest berhasil diselesaikan! +${pts} Pts ditambahkan.`);
    renderProfilePage();
}

function togglePasswordForm() {
    document.getElementById('profile-password-box').classList.toggle('hidden');
}

function handleChangeUserPassword(e) {
    e.preventDefault();
    const newPass = document.getElementById('new-user-pass').value;
    let users = JSON.parse(localStorage.getItem('frh_users')) || [];
    let u = users.find(x => x.username === currentUser.username);
    if (u) {
        u.password = newPass;
        localStorage.setItem('frh_users', JSON.stringify(users));
        alert('Password berhasil diubah!');
        document.getElementById('new-user-pass').value = '';
        togglePasswordForm();
    }
}
