let currentUser = JSON.parse(localStorage.getItem('frh_current_user')) || null;
let resources = JSON.parse(localStorage.getItem('frh_resources')) || [
    {
        id: 1,
        name: "Sketchware Pro Mod v6.3",
        category: "Aplikasi",
        subcategory: "Manual",
        description: "Aplikasi Android builder untuk membuat aplikasi secara visual dengan dukungan modifikasi penuh.",
        fileData: "#",
        fileName: "sketchware_pro.apk",
        fileSize: "15.4 MB",
        uploader: "admin",
        likes: 12,
        downloads: 45,
        likedBy: [],
        savedBy: [],
        ratings: { 5: 4, 4: 2 },
        ratedUsers: {},
        comments: [{ user: "Budi", text: "Mantap aplikasinya work 100%!" }]
    },
    {
        id: 2,
        name: "Template UI Kit Dashboard Admin ZIP",
        category: "File",
        subcategory: "Manual",
        description: "Kumpulan aset UI Kit format ZIP berisi file HTML, CSS, dan Tailwind.",
        fileData: "#",
        fileName: "ui_kit.zip",
        fileSize: "4.2 MB",
        uploader: "admin",
        likes: 25,
        downloads: 88,
        likedBy: [],
        savedBy: [],
        ratings: { 5: 10 },
        ratedUsers: {},
        comments: []
    }
];

let announcements = JSON.parse(localStorage.getItem('frh_announcements')) || [
    { id: 1, title: "Selamat Datang di File Resource Hub Pro!", content: "Nikmati fitur rating, unduh file, dan diskusi komentar.", date: "10 Agustus 2026" }
];

let userDownloads = JSON.parse(localStorage.getItem('frh_user_downloads')) || {};
let currentFilter = 'All';
let activeResourceId = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    updateSubCategories();
});

function switchTab(tabId) {
    ['user-login', 'user-reg', 'admin-login'].forEach(id => {
        document.getElementById(`form-${id}`).classList.add('hidden');
        document.getElementById(`tab-${id}`).classList.remove('text-cyan-400', 'bg-slate-800', 'shadow-sm');
        document.getElementById(`tab-${id}`).classList.add('text-slate-400');
    });
    document.getElementById(`form-${tabId}`).classList.remove('hidden');
    const activeTab = document.getElementById(`tab-${tabId}`);
    activeTab.classList.remove('text-slate-400');
    activeTab.classList.add('text-cyan-400', 'bg-slate-800', 'shadow-sm');
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
    users.push({ username, password });
    localStorage.setItem('frh_users', JSON.stringify(users));
    alert('Registrasi berhasil! Silakan login.');
    switchTab('user-login');
}

function handleLogin(e, role) {
    e.preventDefault();
    if (role === 'admin') {
        const user = document.getElementById('admin-user').value;
        const pass = document.getElementById('admin-pass').value;
        const pin = document.getElementById('admin-pin').value;
        if (user === 'admin' && pass === 'admin123' && pin === '9999') {
            currentUser = { username: 'Administrator', role: 'admin' };
        } else {
            alert('Username, Password, atau PIN Admin salah! (Default PIN: 9999)');
            return;
        }
    } else {
        const inputs = e.target.querySelectorAll('input');
        const username = inputs[0].value.trim();
        const password = inputs[1].value;
        let users = JSON.parse(localStorage.getItem('frh_users')) || [];
        const validUser = users.find(u => u.username === username && u.password === password);
        if (!validUser && username !== 'user') {
            alert('Username atau Password salah!');
            return;
        }
        currentUser = { username: username, role: 'user' };
    }
    localStorage.setItem('frh_current_user', JSON.stringify(currentUser));
    checkAuthState();
}

function logout() {
    localStorage.removeItem('frh_current_user');
    currentUser = null;
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
        document.getElementById('user-role-badge').textContent = currentUser.role === 'admin' ? 'Super Admin' : 'Member User';

        if (currentUser.role === 'admin') {
            document.getElementById('admin-panel').classList.remove('hidden');
            document.getElementById('user-panel').classList.add('hidden');
            document.getElementById('profile-panel').classList.add('hidden');
            document.getElementById('nav-profile-btn').classList.add('hidden');
            renderAdminManageList();
        } else {
            document.getElementById('admin-panel').classList.add('hidden');
            document.getElementById('user-panel').classList.remove('hidden');
            document.getElementById('nav-profile-btn').classList.remove('hidden');
            renderAnnouncements();
            renderResources();
        }
    }
}

function switchMainView(view) {
    if (view === 'home') {
        document.getElementById('user-panel').classList.remove('hidden');
        document.getElementById('profile-panel').classList.add('hidden');
        renderResources();
    } else if (view === 'profile') {
        document.getElementById('user-panel').classList.add('hidden');
        document.getElementById('profile-panel').classList.remove('hidden');
        renderProfilePage();
    }
}

function switchAdminTab(type) {
    ['upload', 'announcement', 'manage'].forEach(t => {
        document.getElementById(`admin-${t}-section`).classList.add('hidden');
        document.getElementById(`btn-tab-${t}`).className = "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer";
    });
    document.getElementById(`admin-${type}-section`).classList.remove('hidden');
    document.getElementById(`btn-tab-${type}`).className = "px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer";
    if (type === 'manage') renderAdminManageList();
}

function updateSubCategories() {
    const cat = document.getElementById('up-category').value;
    const subSelect = document.getElementById('up-subcategory');
    subSelect.innerHTML = '';
    let options = cat === 'File' ? ['Manual', 'Dokumentasi', 'Arsip Code', 'Lainnya'] : ['Manual', 'Pengumuman App', 'Tools', 'Utility'];
    options.forEach(opt => {
        let el = document.createElement('option');
        el.value = opt;
        el.textContent = opt;
        subSelect.appendChild(el);
    });
}

function toggleSourceInput() {
    const type = document.getElementById('up-source-type').value;
    if (type === 'upload') {
        document.getElementById('container-file-upload').classList.remove('hidden');
        document.getElementById('container-link-upload').classList.add('hidden');
    } else {
        document.getElementById('container-file-upload').classList.add('hidden');
        document.getElementById('container-link-upload').classList.remove('hidden');
    }
}

function handleSaveResource(e) {
    e.preventDefault();
    const editId = document.getElementById('edit-resource-id').value;
    const name = document.getElementById('up-name').value;
    const category = document.getElementById('up-category').value;
    const subcategory = document.getElementById('up-subcategory').value;
    const description = document.getElementById('up-desc').value;
    const sourceType = document.getElementById('up-source-type').value;

    let fileData = '#';
    let fileName = 'file';
    let fileSize = '1.0 MB';

    if (sourceType === 'upload') {
        const fileInput = document.getElementById('up-file');
        if (fileInput.files[0]) {
            const file = fileInput.files[0];
            fileData = URL.createObjectURL(file);
            fileName = file.name;
            fileSize = (file.size / (1024*1024)).toFixed(2) + ' MB';
        }
    } else {
        fileData = document.getElementById('up-link-url').value;
        fileName = 'External Link';
        fileSize = document.getElementById('up-link-size').value || 'External';
    }

    if (editId) {
        let res = resources.find(r => r.id == editId);
        if (res) {
            res.name = name;
            res.category = category;
            res.subcategory = subcategory;
            res.description = description;
            if(sourceType === 'link' || document.getElementById('up-file').files[0]) {
                res.fileData = fileData;
                res.fileName = fileName;
                res.fileSize = fileSize;
            }
        }
        alert('Resource berhasil diperbarui!');
        resetUploadForm();
    } else {
        const newRes = {
            id: Date.now(),
            name, category, subcategory, description,
            fileData, fileName, fileSize,
            uploader: currentUser.username,
            likes: 0, downloads: 0,
            likedBy: [], savedBy: [],
            ratings: {}, ratedUsers: {},
            comments: []
        };
        resources.unshift(newRes);
        alert('Resource berhasil dipublikasikan!');
        e.target.reset();
    }

    localStorage.setItem('frh_resources', JSON.stringify(resources));
    renderAdminManageList();
}

function editResource(id) {
    const res = resources.find(r => r.id === id);
    if (!res) return;
    switchAdminTab('upload');
    document.getElementById('form-upload-title').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Resource: ${res.name}`;
    document.getElementById('edit-resource-id').value = res.id;
    document.getElementById('up-name').value = res.name;
    document.getElementById('up-category').value = res.category;
    updateSubCategories();
    document.getElementById('up-subcategory').value = res.subcategory;
    document.getElementById('up-desc').value = res.description;
    document.getElementById('btn-submit-resource').textContent = 'Simpan Perubahan';
    document.getElementById('btn-cancel-edit').classList.remove('hidden');
}

function resetUploadForm() {
    document.getElementById('edit-resource-id').value = '';
    document.getElementById('form-upload-title').innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Upload File / Aplikasi Baru`;
    document.getElementById('btn-submit-resource').innerHTML = `<i class="fa-solid fa-upload"></i> Publikasikan Resource`;
    document.getElementById('btn-cancel-edit').classList.add('hidden');
    document.querySelector('form').reset();
}

function deleteResource(id) {
    if (confirm('Apakah Anda yakin ingin menghapus resource ini?')) {
        resources = resources.filter(r => r.id !== id);
        localStorage.setItem('frh_resources', JSON.stringify(resources));
        renderAdminManageList();
    }
}

function renderAdminManageList() {
    const list = document.getElementById('admin-manage-list');
    list.innerHTML = '';
    if (resources.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-500">Belum ada resource.</p>`;
        return;
    }
    resources.forEach(res => {
        list.innerHTML += `
            <div class="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs">
                <div>
                    <span class="font-bold text-white">${res.name}</span>
                    <span class="ml-2 px-2 py-0.5 rounded bg-slate-800 text-cyan-400">${res.category}</span>
                </div>
                <div class="flex gap-2">
                    <button onclick="editResource(${res.id})" class="px-3 py-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 font-bold rounded-lg transition-all cursor-pointer">Edit</button>
                    <button onclick="deleteResource(${res.id})" class="px-3 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-slate-950 font-bold rounded-lg transition-all cursor-pointer">Hapus</button>
                </div>
            </div>
        `;
    });
}

function handlePostAnnouncement(e) {
    e.preventDefault();
    const newAnn = {
        id: Date.now(),
        title: document.getElementById('ann-title').value,
        content: document.getElementById('ann-content').value,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    };
    announcements.unshift(newAnn);
    localStorage.setItem('frh_announcements', JSON.stringify(announcements));
    alert('Pengumuman berhasil disiarkan!');
    e.target.reset();
}

function renderAnnouncements() {
    const container = document.getElementById('announcement-container');
    container.innerHTML = '';
    announcements.forEach(ann => {
        container.innerHTML += `
            <div class="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 p-5 rounded-2xl flex items-start gap-4 shadow-md">
                <div class="p-3 bg-amber-500/20 text-amber-400 rounded-xl text-lg"><i class="fa-solid fa-bullhorn"></i></div>
                <div>
                    <div class="flex items-center gap-3">
                        <h4 class="font-bold text-sm text-amber-300">${ann.title}</h4>
                        <span class="text-[10px] text-slate-500">${ann.date}</span>
                    </div>
                    <p class="text-xs text-slate-300 mt-1">${ann.content}</p>
                </div>
            </div>
        `;
    });
}

function filterCategory(cat) {
    currentFilter = cat;
    ['All', 'File', 'Aplikasi', 'Saved'].forEach(c => {
        const btn = document.getElementById(`cat-btn-${c}`);
        if(btn) {
            btn.className = c === cat 
                ? "px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 transition-all cursor-pointer shadow-md"
                : "px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer";
        }
    });
    renderResources();
}

function filterSaved() { filterCategory('Saved'); }

function renderResources() {
    const grid = document.getElementById('resource-grid');
    const searchKeyword = document.getElementById('search-input').value.toLowerCase();
    const sortBy = document.getElementById('sort-select').value;
    grid.innerHTML = '';

    let filtered = resources.filter(res => {
        let matchCat = true;
        if (currentFilter === 'File') matchCat = res.category === 'File';
        if (currentFilter === 'Aplikasi') matchCat = res.category === 'Aplikasi';
        if (currentFilter === 'Saved') matchCat = res.savedBy && res.savedBy.includes(currentUser.username);
        let matchSearch = res.name.toLowerCase().includes(searchKeyword) || res.description.toLowerCase().includes(searchKeyword);
        return matchCat && matchSearch;
    });

    if (sortBy === 'popular') filtered.sort((a, b) => b.likes - a.likes);
    if (sortBy === 'downloads') filtered.sort((a, b) => b.downloads - a.downloads);

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-16 text-center text-slate-500"><i class="fa-regular fa-folder-open text-4xl mb-3"></i><p class="text-sm">Tidak ada resource yang ditemukan.</p></div>`;
        return;
    }

    filtered.forEach(res => {
        const isLiked = res.likedBy && res.likedBy.includes(currentUser.username);
        const isSaved = res.savedBy && res.savedBy.includes(currentUser.username);
        const iconClass = res.category === 'Aplikasi' ? 'fa-brands fa-android text-emerald-400' : 'fa-solid fa-file-zipper text-cyan-400';
        const avgRating = calculateAverageRating(res);

        grid.innerHTML += `
            <div class="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg group">
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-lg ${iconClass}"></div>
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] text-amber-400 font-bold"><i class="fa-solid fa-star"></i> ${avgRating}</span>
                            <span class="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">${res.category}</span>
                        </div>
                    </div>
                    <h3 onclick="openDetail(${res.id})" class="font-bold text-base text-white group-hover:text-cyan-400 transition-colors cursor-pointer line-clamp-1">${res.name}</h3>
                    <p class="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">${res.description}</p>
                </div>
                
                <div class="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <div class="flex items-center gap-3">
                        <button onclick="toggleLike(${res.id})" class="flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer ${isLiked ? 'text-rose-500' : ''}">
                            <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i> <span>${res.likes || 0}</span>
                        </button>
                        <span class="flex items-center gap-1"><i class="fa-solid fa-download"></i> ${res.downloads || 0}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="toggleSave(${res.id})" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer ${isSaved ? 'text-amber-400' : 'text-slate-300'}" title="Simpan">
                            <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
                        </button>
                        <button onclick="openDetail(${res.id})" class="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-all cursor-pointer">Detail</button>
                    </div>
                </div>
            </div>
        `;
    });
}

function calculateAverageRating(res) {
    if (!res.ratings || Object.keys(res.ratings).length === 0) return '0.0';
    let totalScore = 0;
    let totalVotes = 0;
    for (let star in res.ratings) {
        totalScore += star * res.ratings[star];
        totalVotes += res.ratings[star];
    }
    return (totalScore / totalVotes).toFixed(1);
}

function toggleLike(id) {
    let res = resources.find(r => r.id === id);
    if (!res.likedBy) res.likedBy = [];
    const index = res.likedBy.indexOf(currentUser.username);
    if (index > -1) {
        res.likedBy.splice(index, 1);
        res.likes -= 1;
    } else {
        res.likedBy.push(currentUser.username);
        res.likes += 1;
    }
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    renderResources();
    if(activeResourceId === id) openDetail(id, false);
}

function toggleSave(id) {
    let res = resources.find(r => r.id === id);
    if (!res.savedBy) res.savedBy = [];
    const index = res.savedBy.indexOf(currentUser.username);
    if (index > -1) {
        res.savedBy.splice(index, 1);
    } else {
        res.savedBy.push(currentUser.username);
    }
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    renderResources();
}

function openDetail(id, openModalWindow = true) {
    activeResourceId = id;
    const res = resources.find(r => r.id === id);
    if (!res) return;

    if (openModalWindow) {
        document.getElementById('detail-modal').classList.remove('hidden');
    }

    document.getElementById('modal-title').textContent = res.name;
    document.getElementById('modal-badge').textContent = `${res.category} / ${res.subcategory}`;
    document.getElementById('modal-desc').textContent = res.description;
    document.getElementById('modal-file-size').textContent = res.fileSize || '1.0 MB';
    document.getElementById('modal-avg-rating').innerHTML = `<i class="fa-solid fa-star"></i> ${calculateAverageRating(res)}`;
    
    const downloadBtn = document.getElementById('modal-download-btn');
    downloadBtn.href = res.fileData;
    downloadBtn.download = res.fileName;

    const iconDiv = document.getElementById('modal-file-icon');
    iconDiv.innerHTML = `<i class="${res.category === 'Aplikasi' ? 'fa-brands fa-android text-emerald-400' : 'fa-solid fa-file-zipper text-cyan-400'}"></i>`;

    // Highlight user star rating if exists
    const starBtns = document.querySelectorAll('#star-container button');
    starBtns.forEach((btn, idx) => {
        const starVal = idx + 1;
        if (res.ratedUsers && res.ratedUsers[currentUser.username] >= starVal) {
            btn.className = "text-amber-400 cursor-pointer";
        } else {
            btn.className = "text-slate-600 hover:text-amber-400 cursor-pointer";
        }
    });

    const commentList = document.getElementById('comment-list');
    document.getElementById('comment-count').textContent = res.comments ? res.comments.length : 0;
    commentList.innerHTML = '';
    if (!res.comments || res.comments.length === 0) {
        commentList.innerHTML = `<p class="text-xs text-slate-500 text-center py-4">Belum ada komentar.</p>`;
    } else {
        res.comments.forEach(c => {
            commentList.innerHTML += `<div class="bg-slate-950 border border-slate-800/60 p-3 rounded-xl text-xs space-y-1"><span class="font-bold text-cyan-400">${c.user}</span><p class="text-slate-300">${c.text}</p></div>`;
        });
    }
}

function rateResource(star) {
    if (!activeResourceId) return;
    let res = resources.find(r => r.id === activeResourceId);
    if (!res.ratings) res.ratings = {};
    if (!res.ratedUsers) res.ratedUsers = {};

    let prevRating = res.ratedUsers[currentUser.username];
    if (prevRating) {
        res.ratings[prevRating] -= 1;
    }
    res.ratedUsers[currentUser.username] = star;
    res.ratings[star] = (res.ratings[star] || 0) + 1;

    localStorage.setItem('frh_resources', JSON.stringify(resources));
    alert(`Terima kasih! Anda memberikan rating ${star} bintang.`);
    openDetail(activeResourceId, false);
    renderResources();
}

function recordDownload() {
    if (!activeResourceId) return;
    let res = resources.find(r => r.id === activeResourceId);
    res.downloads = (res.downloads || 0) + 1;
    
    if (!userDownloads[currentUser.username]) userDownloads[currentUser.username] = [];
    if (!userDownloads[currentUser.username].includes(res.name)) {
        userDownloads[currentUser.username].push(res.name);
    }
    localStorage.setItem('frh_user_downloads', JSON.stringify(userDownloads));
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    renderResources();
}

function closeModal() {
    document.getElementById('detail-modal').classList.add('hidden');
    activeResourceId = null;
}

function handlePostComment(e) {
    e.preventDefault();
    if (!activeResourceId) return;
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (!text) return;
    let res = resources.find(r => r.id === activeResourceId);
    if (!res.comments) res.comments = [];
    res.comments.push({ user: currentUser.username, text: text });
    localStorage.setItem('frh_resources', JSON.stringify(resources));
    input.value = '';
    openDetail(activeResourceId, false);
}

function renderProfilePage() {
    document.getElementById('profile-username').textContent = currentUser.username;
    
    const dlList = document.getElementById('profile-download-list');
    dlList.innerHTML = '';
    let myDownloads = userDownloads[currentUser.username] || [];
    if (myDownloads.length === 0) {
        dlList.innerHTML = `<p class="text-xs text-slate-500">Belum ada riwayat download.</p>`;
    } else {
        myDownloads.forEach(name => {
            dlList.innerHTML += `<div class="bg-slate-950 p-3 rounded-xl text-xs text-slate-300 border border-slate-800 flex items-center gap-2"><i class="fa-solid fa-check text-cyan-400"></i> ${name}</div>`;
        });
    }

    const savedList = document.getElementById('profile-saved-list');
    savedList.innerHTML = '';
    let mySaved = resources.filter(r => r.savedBy && r.savedBy.includes(currentUser.username));
    if (mySaved.length === 0) {
        savedList.innerHTML = `<p class="text-xs text-slate-500">Belum ada file disimpan.</p>`;
    } else {
        mySaved.forEach(res => {
            savedList.innerHTML += `<div class="bg-slate-950 p-3 rounded-xl text-xs text-slate-300 border border-slate-800 flex items-center justify-between"><span>${res.name}</span><button onclick="openDetail(${res.id})" class="text-cyan-400 font-bold cursor-pointer">Buka</button></div>`;
        });
    }
}
