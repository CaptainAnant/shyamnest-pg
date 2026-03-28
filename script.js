// =========================================================
// --- 1. GLOBAL UTILITIES (TOASTS, DARK MODE, CONSTANTS) ---
// =========================================================
const ownerPhone = "919945584185"; 
let appData = { branches: [], rooms: [] }; 
const appContent = document.getElementById('app-content');
const pageTitle = document.getElementById('page-title');

// Custom Toast Notification System
window.showToast = function(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '<i class="fas fa-check-circle" style="color:#10b981;"></i>' : '<i class="fas fa-exclamation-circle" style="color:#ef4444;"></i>';
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Dark Mode Toggle
const themeBtn = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') document.body.classList.add('dark-mode');

themeBtn.onclick = () => {
    document.body.classList.toggle('dark-mode');
    const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
};

// Sidebar Toggle
document.getElementById('sidebar-toggle').onclick = () => { 
    document.getElementById('sidebar').classList.toggle('collapsed'); 
};

// =========================================================
// --- 2. DATA SEEDING & CLOUD SYNC ---
// =========================================================
const allServices = [
    { name: '2x Food & Snacks', icon: 'fa-utensils' }, { name: '24x7 Electricity', icon: 'fa-bolt' },
    { name: 'High Speed Wifi', icon: 'fa-wifi' }, { name: 'Refrigerator', icon: 'fa-snowflake' },
    { name: 'Projector', icon: 'fa-film' }, { name: 'Study Desk', icon: 'fa-chair' },
    { name: 'Wardrobe', icon: 'fa-door-closed' }, { name: 'Water Cooler', icon: 'fa-glass-water' },
    { name: 'Washing Machine', icon: 'fa-hands-wash' }, { name: 'Gym', icon: 'fa-dumbbell' },
    { name: 'Play Area', icon: 'fa-gamepad' }, { name: 'Room Cleaning', icon: 'fa-broom' }
];

function generateRooms(branchId, count, startId) {
    let rooms = [];
    for(let i = 0; i < count; i++) {
        let share = i < 3 ? 1 : (i < 9 ? 2 : 3); 
        let price = share === 1 ? 18000 : (share === 2 ? 12000 : 8000);
        rooms.push({
            id: `r${startId + i}`, 
            branchId: branchId,
            name: share === 1 ? 'Private Suite' : (share === 2 ? 'Twin Sharing' : 'Triple Comfort'),
            sharing: share, status: "Available", price: price,
            desc: `Premium ${share} sharing room with all amenities included.`,
            img: share === 1 ? 'https://images.unsplash.com/photo-1522771753035-484980f8a787?auto=format&fit=crop&w=600&q=80' : 
                 (share === 2 ? 'https://images.unsplash.com/photo-1596276020587-8044fe049813?auto=format&fit=crop&w=600&q=80' : 
                 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80')
        });
    }
    return rooms;
}

const defaultData = {
    branches: [
        { id: 'b1', name: 'Shyam Nest Kea', location: 'Vijyashree Layout, Arekere', mapUrl: 'https://maps.google.com/maps?q=Vijyashree+Layout,+Arekere&t=&z=13&ie=UTF8&iwloc=&output=embed', img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80' },
        { id: 'b2', name: 'Shyam Nest Conure', location: 'Bannerghatta Road, Hulimavu', mapUrl: 'https://maps.google.com/maps?q=Bannerghatta+Road,+Hulimavu&t=&z=13&ie=UTF8&iwloc=&output=embed', img: 'https://images.unsplash.com/photo-1596276020587-8044fe049813?auto=format&fit=crop&w=600&q=80' },
        { id: 'b3', name: 'Shyam Nest Bangalore', location: 'Main Branch, Bangalore', mapUrl: 'https://maps.google.com/maps?q=Bangalore&t=&z=13&ie=UTF8&iwloc=&output=embed', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80' }
    ],
    rooms: [...generateRooms('b1', 11, 101), ...generateRooms('b2', 11, 201), ...generateRooms('b3', 10, 301)]
};

async function bootApp() {
    appContent.innerHTML = `<div style="text-align:center; padding: 4rem;"><i class="fas fa-circle-notch fa-spin" style="font-size: 3rem; color: var(--primary);"></i><h2 style="margin-top:1rem;">Connecting to Shyam Nest...</h2></div>`;
    await new Promise(resolve => setTimeout(resolve, 800)); 

    try {
        if (!window.fbDb) throw new Error("Firebase DB not initialized");

        const branchesSnap = await window.fbGetDocs(window.fbCollection(window.fbDb, "branches"));
        if(branchesSnap.empty) {
            console.log("Seeding Database...");
            for (const b of defaultData.branches) await window.fbSetDoc(window.fbDoc(window.fbDb, "branches", b.id), b);
            for (const r of defaultData.rooms) await window.fbSetDoc(window.fbDoc(window.fbDb, "rooms", r.id), r);
        }

        appData.branches = []; appData.rooms = [];
        const bSnap = await window.fbGetDocs(window.fbCollection(window.fbDb, "branches"));
        bSnap.forEach(doc => appData.branches.push(doc.data()));

        const rSnap = await window.fbGetDocs(window.fbCollection(window.fbDb, "rooms"));
        rSnap.forEach(doc => appData.rooms.push(doc.data()));

        renderHome();
    } catch (e) {
        console.error(e);
        appContent.innerHTML = `<div style="text-align:center; padding: 4rem; color:red;"><h2>Database Connection Error</h2><p>Please check your Firebase configuration keys.</p></div>`;
    }
}

// =========================================================
// --- 3. ROUTING ---
// =========================================================
function navigate(view, param = null) {
    appContent.style.opacity = '0';
    document.querySelectorAll('.sidebar-links a').forEach(a => a.classList.remove('active-link'));
    if(view === 'home') document.getElementById('link-home').classList.add('active-link');
    if(view === 'locations') document.getElementById('link-locations').classList.add('active-link');
    if(view === 'services') document.getElementById('link-services').classList.add('active-link');

    setTimeout(() => {
        appContent.innerHTML = ''; 
        window.scrollTo(0,0);
        switch(view) {
            case 'home': renderHome(); break;
            case 'all-rooms': renderAllRooms(); break;
            case 'branch': renderBranch(param); break;
            case 'room': renderRoomDetails(param); break;
            case 'admin': renderAdmin(); break;
            case 'tenant': renderTenantDashboard(); break; 
            case 'locations': renderLocations(); break;
            case 'services': renderServicesPage(); break;
            case 'about': renderAbout(); break;
        }
        appContent.style.opacity = '1';
    }, 200);
}

// =========================================================
// --- 4. RENDERERS (PUBLIC UI) ---
// =========================================================
function renderHome() {
    pageTitle.innerText = "DASHBOARD";
    let branchesHtml = appData.branches.map(b => `
        <div class="branch-card" onclick="navigate('branch', '${b.id}')" style="cursor:pointer;">
            <img src="${b.img}" class="branch-img">
            <div class="branch-info">
                <h3 style="color:var(--text-main);">${b.name}</h3>
                <p style="color:var(--text-muted); font-size:0.9rem;"><i class="fas fa-map-marker-alt"></i> ${b.location}</p>
                <div style="margin-top:15px; color:var(--primary); font-weight:600;">Explore Rooms <i class="fas fa-arrow-right"></i></div>
            </div>
        </div>
    `).join('');

    appContent.innerHTML = `
        <div class="hero-wrapper" style="border-radius:var(--radius); overflow:hidden; position:relative; height:320px; margin-bottom:2.5rem; display:flex; align-items:center; justify-content:center;">
            <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80" style="position:absolute; width:100%; height:100%; object-fit:cover;">
            <div style="position:absolute; inset:0; background:rgba(17, 24, 39, 0.6);"></div>
            <div style="position:relative; color:white; text-align:center; z-index:2; padding:20px;">
                <h1 style="font-family:'Playfair Display', serif; font-size:3.5rem; margin-bottom:10px;">Welcome to Shyam Nest</h1>
                <p style="font-size:1.2rem; font-weight:300;">More than just a room. It's your launchpad.</p>
            </div>
        </div>
        <h2 style="margin-bottom:1.5rem; font-family:'Playfair Display', serif;">Select a Branch</h2>
        <div class="branch-grid">${branchesHtml}</div>
    `;
}

function renderAllRooms() {
    pageTitle.innerText = "FIND YOUR ROOM";
    appContent.innerHTML = `
        <div class="filter-container">
            <div class="filter-group"><label>Branch</label><select id="f-branch" class="form-select" onchange="applyFilters()"><option value="all">All Locations</option>${appData.branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}</select></div>
            <div class="filter-group"><label>Sharing</label><select id="f-share" class="form-select" onchange="applyFilters()"><option value="all">Any</option><option value="1">Single</option><option value="2">Double</option><option value="3">Triple</option></select></div>
            <div class="filter-group"><label>Status</label><select id="f-status" class="form-select" onchange="applyFilters()"><option value="all">All</option><option value="Available">Available Only</option></select></div>
        </div>
        <div id="rooms-result-container"></div>
    `;
    applyFilters();
}

window.applyFilters = function() {
    const b = document.getElementById('f-branch').value;
    const sh = document.getElementById('f-share').value;
    const st = document.getElementById('f-status').value;
    const filtered = appData.rooms.filter(r => (b === 'all' || r.branchId === b) && (sh === 'all' || r.sharing == sh) && (st === 'all' || r.status === st));
    
    const container = document.getElementById('rooms-result-container');
    if(filtered.length === 0) { container.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-muted);"><h3>No rooms match your criteria.</h3></div>`; return; }
    container.innerHTML = filtered.map(r => generateRoomCard(r)).join('');
}

function generateRoomCard(r) {
    const branch = appData.branches.find(b => b.id === r.branchId) || {name: 'Unknown'};
    const statusClass = r.status === 'Available' ? 'chip-status' : 'chip-status full';
    return `
        <div class="room-card">
            <div class="room-img-wrapper"><img src="${r.img}" class="room-img"></div>
            <div class="room-details">
                <span style="color:var(--text-muted); font-size:0.85rem; margin-bottom:5px; display:block;"><i class="fas fa-map-pin"></i> ${branch.name}</span>
                <div style="display:flex; gap:10px; margin-bottom:10px;">
                    <span class="chip chip-people"><i class="fas fa-user-friends"></i> ${r.sharing} Sharing</span>
                    <span class="chip ${statusClass}">${r.status}</span>
                </div>
                <h2 style="font-family:'Playfair Display', serif; margin-bottom:5px; font-size:1.6rem;">${r.name}</h2>
                <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:15px; line-height:1.5;">${r.desc}</p>
                <h3 style="color:var(--primary); margin-bottom:15px;">Rs. ${r.price.toLocaleString()}/- <span style="font-size:0.85rem; color:var(--text-muted); font-weight:400">per month</span></h3>
                <div style="display:flex; gap:10px; margin-top:auto;">
                    <button class="btn-secondary" onclick="navigate('room', '${r.id}')">Check More</button>
                    <button class="btn-outline" onclick="openBookingModal('${r.id}', 'Enquire')">Enquire</button>
                    <button class="btn-primary" onclick="openBookingModal('${r.id}', 'Book')">Book Room</button>
                </div>
            </div>
        </div>`;
}

function renderBranch(branchId) {
    const branch = appData.branches.find(b => b.id === branchId);
    const rooms = appData.rooms.filter(r => r.branchId === branchId);
    pageTitle.innerText = branch.name.toUpperCase();
    let roomsHtml = rooms.map(r => generateRoomCard(r)).join('');
    appContent.innerHTML = `<button onclick="navigate('home')" style="margin-bottom:1.5rem; background:none; border:none; color:var(--text-muted); cursor:pointer; font-weight:600;"><i class="fas fa-arrow-left"></i> Back to Dashboard</button>${roomsHtml || '<p>No rooms available.</p>'}`;
}

function renderRoomDetails(roomId) {
    const r = appData.rooms.find(rm => rm.id === roomId);
    const branch = appData.branches.find(b => b.id === r.branchId);
    pageTitle.innerText = "ROOM DETAILS";
    appContent.innerHTML = `
        <div style="max-width:900px; margin:0 auto;">
            <button onclick="navigate('all-rooms')" style="margin-bottom:1.5rem; background:none; border:none; color:var(--text-muted); cursor:pointer; font-weight:600;"><i class="fas fa-arrow-left"></i> Back to Rooms</button>
            <img src="${r.img}" style="width:100%; height:450px; object-fit:cover; border-radius:var(--radius); box-shadow:var(--shadow);">
            
            <div style="display:flex; justify-content:space-between; margin-top:2rem; flex-wrap:wrap; gap:1rem;">
                <div>
                    <h1 style="font-family:'Playfair Display', serif; font-size:2.5rem;">${r.name}</h1>
                    <p style="color:var(--text-muted); margin-top:5px;"><i class="fas fa-map-pin"></i> ${branch.name}, ${branch.location}</p>
                    <div style="margin-top:10px;"><span class="chip ${r.status === 'Available' ? 'chip-status' : 'chip-status full'}">${r.status}</span></div>
                </div>
                <div style="text-align:right;">
                    <h2 style="color:var(--primary); font-size:2.2rem;">Rs. ${r.price.toLocaleString()}/-</h2>
                    <p style="color:var(--text-muted); font-size:0.9rem;">inclusive of all bills</p>
                </div>
            </div>

            <div style="margin:2.5rem 0; padding:2rem; background:var(--bg-surface); border-radius:var(--radius); border:1px solid var(--border-color); border-left:4px solid var(--primary);">
                <h3 style="margin-bottom:10px;">About this Room</h3>
                <p style="color:var(--text-muted); line-height:1.7;">${r.desc} Designed to provide the ultimate student living experience. Fully furnished with ergonomic furniture, ample storage, and vibrant lighting to suit both study and relaxation modes.</p>
                <div style="margin-top:20px; display:flex; gap:15px;">
                    <button class="btn-outline" onclick="openBookingModal('${r.id}', 'Enquire')">Enquire Now</button>
                    <button class="btn-primary" onclick="openBookingModal('${r.id}', 'Book')">Book Room</button>
                </div>
            </div>

            <h3 style="margin-bottom:1.5rem;">Premium Amenities Included</h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:1.5rem;">
                ${allServices.map(f => `<div class="service-box" style="text-align:center;"><i class="fas ${f.icon}" style="color:var(--primary); font-size:1.8rem; margin-bottom:10px;"></i><h4 style="font-size:0.95rem;">${f.name}</h4></div>`).join('')}
            </div>
            <div style="margin-top:3rem; padding:2rem; background:rgba(79, 70, 229, 0.05); border-radius:var(--radius); text-align:center;">
                <h3 style="margin-bottom:10px;">Still have questions?</h3>
                <button class="btn-primary" onclick="openGeneralContact()"><i class="fab fa-whatsapp"></i> Chat with Owner</button>
            </div>
        </div>`;
}

// =========================================================
// --- 5. ADMIN PAGES (MODALS & UPDATES) ---
// =========================================================
function renderAdmin() {
    pageTitle.innerText = "ADMIN PANEL";
    appContent.innerHTML = `
        <div style="text-align:center; margin-bottom:3rem;">
            <h2 style="font-family:'Playfair Display', serif; font-size:2.5rem;">Admin Dashboard</h2>
            <p style="color:var(--text-muted);">Manage your PG operations.</p>
        </div>
        <div class="admin-menu-grid">
            <div class="admin-choice-card" onclick="renderAdminViewMode()"><i class="fas fa-boxes" style="font-size:2.5rem; color:var(--primary); margin-bottom:1rem;"></i><h3>Manage Inventory</h3><p style="color:var(--text-muted); font-size:0.9rem;">View, add, update, or delete rooms.</p></div>
            <div class="admin-choice-card" onclick="renderTenantManagement()" style="border-color:var(--primary);"><i class="fas fa-users-cog" style="font-size:2.5rem; color:var(--primary); margin-bottom:1rem;"></i><h3>Manage Tenants</h3><p style="color:var(--text-muted); font-size:0.9rem;">Approve sign-ups and rent payments.</p></div>
        </div>
    `;
}

// Admin Room Inventory
window.renderAdminViewMode = function() {
    pageTitle.innerText = "INVENTORY VIEW";
    const rows = appData.rooms.map(r => {
        const b = appData.branches.find(br => br.id === r.branchId);
        return `
        <tr>
            <td><strong>${r.id}</strong></td>
            <td>${r.name}</td>
            <td>${b ? b.name : 'N/A'}</td>
            <td><span class="chip ${r.status === 'Available' ? 'chip-status' : 'chip-status full'}">${r.status}</span></td>
            <td>Rs. ${r.price.toLocaleString()}</td>
            <td>
                <button class="icon-btn" onclick="openEditRoomModal('${r.id}')" title="Edit"><i class="fas fa-edit" style="color:var(--primary);"></i></button>
                <button class="icon-btn" onclick="deleteRoom('${r.id}')" title="Delete"><i class="fas fa-trash" style="color:#ef4444;"></i></button>
            </td>
        </tr>`;
    }).join('');

    appContent.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:1.5rem; align-items:center;">
            <button onclick="renderAdmin()" class="btn-secondary"><i class="fas fa-arrow-left"></i> Back</button>
            <button onclick="document.getElementById('add-room-modal').style.display='flex'" class="btn-primary"><i class="fas fa-plus"></i> Add Room</button>
        </div>
        <div class="admin-table-container">
            <table class="admin-table">
                <thead><tr><th>ID</th><th>Room Name</th><th>Branch</th><th>Status</th><th>Price</th><th>Actions</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
    document.getElementById('new-room-branch').innerHTML = appData.branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
}

// Add Room Logic
document.getElementById('add-room-form').onsubmit = async function(e) {
    e.preventDefault();
    const id = document.getElementById('new-room-id').value;
    const roomData = {
        id: id,
        branchId: document.getElementById('new-room-branch').value,
        name: document.getElementById('new-room-name').value,
        sharing: parseInt(document.getElementById('new-room-share').value),
        price: parseInt(document.getElementById('new-room-price').value),
        img: document.getElementById('new-room-img').value,
        status: "Available", desc: "Premium room with standard amenities."
    };

    try {
        await window.fbSetDoc(window.fbDoc(window.fbDb, "rooms", id), roomData);
        appData.rooms.push(roomData); 
        showToast(`Room ${id} added successfully!`);
        document.getElementById('add-room-modal').style.display='none';
        this.reset();
        renderAdminViewMode();
    } catch(err) { showToast("Failed to add room.", "error"); }
};

// Delete Room Logic
window.deleteRoom = async function(id) {
    if(confirm(`Are you sure you want to permanently delete Room ${id}?`)) {
        try {
            await window.fbDeleteDoc(window.fbDoc(window.fbDb, "rooms", id));
            appData.rooms = appData.rooms.filter(r => r.id !== id);
            showToast(`Room deleted.`);
            renderAdminViewMode();
        } catch(err) { showToast("Failed to delete room.", "error"); }
    }
}

// Edit Room Logic (We reuse the Add modal conceptually, but inline for speed here using prompt fallback for simplicity, 
// since a full separate edit modal takes much more HTML. We will use prompts strictly for Admin quick-edits, as requested, 
// but wait, you asked to remove prompts. Let's use a dynamic approach to reuse the Add Room Modal).
window.openEditRoomModal = function(id) {
    const r = appData.rooms.find(rm => rm.id === id);
    document.getElementById('new-room-id').value = r.id;
    document.getElementById('new-room-id').readOnly = true; // Can't change ID
    document.getElementById('new-room-branch').value = r.branchId;
    document.getElementById('new-room-name').value = r.name;
    document.getElementById('new-room-share').value = r.sharing;
    document.getElementById('new-room-price').value = r.price;
    document.getElementById('new-room-img').value = r.img;
    
    // Change form submit behavior dynamically
    const form = document.getElementById('add-room-form');
    form.onsubmit = async function(e) {
        e.preventDefault();
        try {
            const updatedData = {
                branchId: document.getElementById('new-room-branch').value,
                name: document.getElementById('new-room-name').value,
                sharing: parseInt(document.getElementById('new-room-share').value),
                price: parseInt(document.getElementById('new-room-price').value),
                img: document.getElementById('new-room-img').value
            };
            await window.fbUpdateDoc(window.fbDoc(window.fbDb, "rooms", id), updatedData);
            Object.assign(r, updatedData); // Update local memory
            showToast("Room updated!");
            document.getElementById('add-room-modal').style.display='none';
            form.onsubmit = window.addRoomOriginalSubmit; // reset
            document.getElementById('new-room-id').readOnly = false;
            form.reset();
            renderAdminViewMode();
        } catch(err) { showToast("Update failed.", "error"); }
    };
    document.getElementById('add-room-modal').style.display='flex';
}
// Save original submit function for Add Room
window.addRoomOriginalSubmit = document.getElementById('add-room-form').onsubmit;

/// Admin Tenant Management
window.renderTenantManagement = async function() {
    pageTitle.innerText = "TENANT MANAGEMENT";
    appContent.innerHTML = `<div style="text-align:center; padding:3rem;"><i class="fas fa-circle-notch fa-spin" style="font-size:2rem; color:var(--primary);"></i><p style="margin-top:10px;">Loading Tenants...</p></div>`;

    try {
        const querySnapshot = await window.fbGetDocs(window.fbCollection(window.fbDb, "users"));
        let rows = '';
        querySnapshot.forEach((doc) => {
            const user = doc.data();
            if (user.role === 'tenant') {
                let actionBtn = ''; 
                let statusBadge = '';

                // NEW: Added Reject/Delete UI
                if(user.status === 'pending') {
                    statusBadge = `<span class="chip" style="background:#e0f2fe; color:#1e40af;">New App</span>`;
                    actionBtn = `
                        <div style="display:flex; gap:8px;">
                            <button class="btn-primary" style="padding: 6px 12px; font-size: 0.8rem; background: #10b981; border:none;" onclick="openApproveModal('${doc.id}')" title="Approve"><i class="fas fa-check"></i></button>
                            <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; background: #ef4444; color: white; border:none;" onclick="deleteTenant('${doc.id}', '${user.name}')" title="Reject"><i class="fas fa-times"></i></button>
                        </div>
                    `;
                } else {
                    if(user.rentStatus === 'due') {
                        statusBadge = `<span class="chip status-due">Due</span>`;
                    } else if (user.rentStatus === 'pending') {
                        statusBadge = `<span class="chip status-pending">UPI Pending</span>`;
                        actionBtn = `<button class="btn-outline" style="padding: 6px 12px; font-size: 0.8rem; margin-right:8px;" onclick="verifyPayment('${doc.id}')">Verify</button>`;
                    } else {
                        statusBadge = `<span class="chip status-paid">Paid</span>`;
                    }
                    
                    // Add Delete Trash Can for Active Tenants
                    actionBtn += `<button class="icon-btn" onclick="deleteTenant('${doc.id}', '${user.name}')" title="Remove Tenant"><i class="fas fa-trash" style="color:#ef4444; font-size:1.1rem;"></i></button>`;
                }

                rows += `<tr>
                    <td><strong>${user.name}</strong><br><small style="color:var(--text-muted);">${user.email}</small></td>
                    <td>${user.roomName || 'Unassigned'}</td>
                    <td>Rs. ${user.rentAmount}</td>
                    <td>${statusBadge}</td>
                    <td style="display:flex; align-items:center;">${actionBtn}</td>
                </tr>`;
            }
        });

        appContent.innerHTML = `<button onclick="renderAdmin()" class="btn-secondary" style="margin-bottom:1.5rem;"><i class="fas fa-arrow-left"></i> Back</button>
            <div class="admin-table-container"><table class="admin-table"><thead><tr><th>Tenant</th><th>Room</th><th>Rent</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows || '<tr><td colspan="5" style="text-align:center;">No tenants found</td></tr>'}</tbody></table></div>`;
    } catch (e) { showToast("Error loading tenants.", "error"); }
}

// NEW: Delete/Reject Tenant Logic
window.deleteTenant = async function(tenantUid, tenantName) {
    if(confirm(`Are you sure you want to remove ${tenantName}? This will delete their profile and permanently block their access.`)) {
        try {
            // Delete the user document from the live database
            await window.fbDeleteDoc(window.fbDoc(window.fbDb, "users", tenantUid));
            showToast(`${tenantName} has been removed.`);
            
            // Refresh the table to show the updated list
            renderTenantManagement(); 
        } catch (e) {
            console.error(e);
            showToast("Failed to remove tenant.", "error");
        }
    }
}

// Custom Modal for Admin Approval
window.openApproveModal = function(uid) {
    document.getElementById('approve-tenant-id').value = uid;
    document.getElementById('assign-room-id').value = '';
    document.getElementById('assign-rent-amt').value = '';
    document.getElementById('approve-modal').style.display = 'flex';
}

window.submitTenantApproval = async function() {
    const uid = document.getElementById('approve-tenant-id').value;
    const room = document.getElementById('assign-room-id').value;
    const rent = document.getElementById('assign-rent-amt').value;

    if(room && rent) {
        try {
            await window.fbUpdateDoc(window.fbDoc(window.fbDb, "users", uid), { status: 'active', roomName: room, rentAmount: parseInt(rent), rentStatus: 'due' });
            showToast("Tenant Approved & Assigned!");
            document.getElementById('approve-modal').style.display = 'none';
            renderTenantManagement();
        } catch(e) { showToast("Failed to approve.", "error"); }
    } else { showToast("Please fill all fields.", "error"); }
}

window.verifyPayment = async function(tenantUid) {
    if(confirm("Confirm that UPI payment is received?")) {
        try {
            await window.fbUpdateDoc(window.fbDoc(window.fbDb, "users", tenantUid), { rentStatus: 'paid' });
            showToast("Payment Verified!");
            renderTenantManagement(); 
        } catch (e) { showToast("Failed to verify payment.", "error"); }
    }
}

// =========================================================
// --- 6. AUTH & TENANT DASHBOARD ---
// =========================================================
let currentUser = null; let userRole = null; let tenantData = null; let authMode = 'login';

window.openAuthModal = function() { document.getElementById('auth-modal').style.display = 'flex'; };

document.getElementById('auth-toggle-link').onclick = function(e) {
    e.preventDefault();
    const nameGroup = document.getElementById('name-group');
    const titleL = document.getElementById('auth-left-title');
    const titleR = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const btn = document.getElementById('auth-submit-btn');

    if (authMode === 'login') {
        authMode = 'signup';
        nameGroup.style.display = 'block'; document.getElementById('auth-name').required = true;
        titleL.innerText = "Join the Nest"; titleR.innerText = "Tenant Sign Up"; subtitle.innerText = "Apply for accommodation.";
        btn.innerText = "Create Account"; this.innerText = "Already have an account? Login";
    } else {
        authMode = 'login';
        nameGroup.style.display = 'none'; document.getElementById('auth-name').required = false;
        titleL.innerText = "Welcome Back"; titleR.innerText = "Secure Login"; subtitle.innerText = "Access your account.";
        btn.innerText = "Login"; this.innerText = "Need an account? Sign Up";
    }
};

const authForm = document.getElementById('auth-form');
if(authForm) {
    authForm.onsubmit = async function(e) {
        e.preventDefault();
        const name = document.getElementById('auth-name').value;
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-password').value;
        const err = document.getElementById('auth-error');

        try {
            if (authMode === 'login') {
                await window.signIn(window.fbAuth, email, pass);
                showToast("Logged in successfully!");
            } else {
                const cred = await window.signUp(window.fbAuth, email, pass);
                await window.fbSetDoc(window.fbDoc(window.fbDb, "users", cred.user.uid), { role: 'tenant', status: 'pending', name: name, email: email, roomName: 'Unassigned', rentAmount: 0, rentStatus: 'due' });
                showToast("Application submitted successfully!");
            }
            err.style.display = 'none'; document.getElementById('auth-modal').style.display = 'none';
        } catch (error) { err.innerText = "Authentication failed. Check credentials."; err.style.display = 'block'; }
    };
}

window.handleLogout = function() { window.signOut(window.fbAuth).then(() => { showToast("Logged out"); navigate('home'); }); };

setTimeout(() => {
    if(window.fbAuth && window.onAuthStateChanged) {
        window.onAuthStateChanged(window.fbAuth, async (user) => {
            const navRight = document.getElementById('nav-right-container');
            let authBtn = document.getElementById('nav-auth-btn');
            
            if(!authBtn) { 
                authBtn = document.createElement('a'); authBtn.id = 'nav-auth-btn'; authBtn.className = 'nav-cta'; authBtn.style.marginLeft = '15px'; authBtn.style.cursor = 'pointer';
                navRight.appendChild(authBtn);
            }

            if (user) {
                currentUser = user;
                try {
                    const userDoc = await window.fbGetDoc(window.fbDoc(window.fbDb, "users", user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        userRole = data.role; tenantData = data; 
                        
                        authBtn.innerText = "Logout"; authBtn.onclick = handleLogout; authBtn.style.background = "#ef4444"; 

                        if(!document.getElementById('nav-dash-link')) {
                            const dashLink = document.createElement('a'); dashLink.id = 'nav-dash-link'; dashLink.href = "#";
                            dashLink.innerHTML = `<i class="fas fa-user-circle"></i> Portal`; dashLink.style.fontWeight = "700"; dashLink.style.color = "var(--primary)"; dashLink.style.marginLeft = "15px";
                            dashLink.onclick = () => { navigate(userRole === 'admin' ? 'admin' : 'tenant'); };
                            navRight.insertBefore(dashLink, authBtn);
                        }
                        navigate(userRole === 'admin' ? 'admin' : 'tenant');
                    }
                } catch(e) { console.error(e); }
            } else {
                currentUser = null; userRole = null; tenantData = null;
                authBtn.innerText = "Login"; authBtn.onclick = openAuthModal; authBtn.style.background = "var(--primary)";
                const dashLink = document.getElementById('nav-dash-link'); if(dashLink) dashLink.remove();
                if(["ADMIN PANEL", "TENANT PORTAL", "TENANT MANAGEMENT", "INVENTORY VIEW", "UPDATE ROOM"].includes(pageTitle.innerText)) { navigate('home'); }
            }
        });
    }
}, 500);

window.renderTenantDashboard = function() {
    pageTitle.innerText = "TENANT PORTAL";

    if(tenantData.status === 'pending') {
        appContent.innerHTML = `<div style="text-align:center; padding: 4rem; background:var(--bg-surface); border-radius:var(--radius); border:1px solid var(--border-color); box-shadow:var(--shadow); max-width:600px; margin:2rem auto;"><i class="fas fa-hourglass-half" style="font-size:3.5rem; color:var(--primary); margin-bottom:1.5rem;"></i><h2 style="font-family:'Playfair Display',serif; margin-bottom:1rem;">Application Under Review</h2><p style="color:var(--text-muted); line-height:1.6; margin-bottom:2rem;">Hello ${tenantData.name}, your application to join Shyam Nest has been received. The Admin is currently reviewing your profile and will assign your room shortly.</p><button class="btn-outline" onclick="openGeneralContact()">Contact Owner via WhatsApp</button></div>`;
        return;
    }
    
    let statusHtml = ''; let actionBtn = '';
    if(tenantData.rentStatus === 'due') {
        statusHtml = `<span class="status-badge status-due">Payment Due</span>`;
        actionBtn = `<button class="btn-primary full-width" style="margin-top:15px;" onclick="document.getElementById('pay-modal').style.display='flex'">Pay via UPI</button>`;
    } else if(tenantData.rentStatus === 'pending') {
        statusHtml = `<span class="status-badge status-pending">Verification Pending</span>`;
        actionBtn = `<button class="btn-secondary full-width" style="margin-top:15px;" disabled>Waiting for Admin</button>`;
    } else {
        statusHtml = `<span class="status-badge status-paid">Paid</span>`;
        actionBtn = `<button class="btn-outline full-width" style="margin-top:15px;" onclick="showToast('Receipt generating...')">Download Receipt</button>`;
    }

    appContent.innerHTML = `
        <div style="margin-bottom: 2.5rem;"><h2 style="font-family:'Playfair Display', serif; font-size:2rem;">Welcome back, ${tenantData.name}!</h2><p style="color:var(--text-muted); font-size:1.1rem; margin-top:5px;"><i class="fas fa-bed"></i> Room: ${tenantData.roomName}</p></div>
        <div class="tenant-grid">
            <div class="tenant-card">
                <h3 style="margin-bottom:1.5rem; border-bottom:1px solid var(--border-color); padding-bottom:10px;"><i class="fas fa-wallet" style="color:var(--primary);"></i> Rent Overview</h3>
                <div style="text-align:center; padding:1rem; background:var(--bg-body); border-radius:10px;">
                    <p style="color:var(--text-muted); font-size:0.9rem;">Current Month Rent</p>
                    <div style="font-size:2.2rem; font-weight:700; color:var(--primary); margin:5px 0;">Rs. ${tenantData.rentAmount.toLocaleString()}</div>
                    ${statusHtml}
                </div>
                ${actionBtn}
            </div>
            <div class="tenant-card">
                <h3 style="margin-bottom:1.5rem; border-bottom:1px solid var(--border-color); padding-bottom:10px;"><i class="fas fa-utensils" style="color:var(--primary);"></i> Today's Menu</h3>
                <ul style="list-style:none;">
                    <li style="padding:12px 0; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between;"><strong>Breakfast (8 AM):</strong> <span style="color:var(--text-muted)">Poha & Tea</span></li>
                    <li style="padding:12px 0; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between;"><strong>Lunch (1 PM):</strong> <span style="color:var(--text-muted)">Rajma Chawal</span></li>
                    <li style="padding:12px 0; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between;"><strong>Snacks (5 PM):</strong> <span style="color:var(--text-muted)">Samosa & Coffee</span></li>
                    <li style="padding:12px 0; display:flex; justify-content:space-between;"><strong>Dinner (8 PM):</strong> <span style="color:var(--text-muted)">Paneer Masala</span></li>
                </ul>
            </div>
            <div class="tenant-card">
                <h3 style="margin-bottom:1.5rem; border-bottom:1px solid var(--border-color); padding-bottom:10px;"><i class="fas fa-concierge-bell" style="color:var(--primary);"></i> Room Actions</h3>
                <button class="btn-outline full-width" style="margin-bottom:12px;" onclick="showToast('WiFi: ShyamNest5G | Pass: Student2026')"><i class="fas fa-wifi"></i> View WiFi Details</button>
                <button class="btn-outline full-width" style="margin-bottom:12px;" onclick="showToast('Cleaning request sent!')"><i class="fas fa-broom"></i> Request Cleaning</button>
                <button class="btn-secondary full-width" style="background:#ef4444; color:white; border:none;" onclick="showToast('Warden notified.')"><i class="fas fa-exclamation-triangle"></i> Raise Complaint</button>
            </div>
        </div>`;
};

// Modal Based Tenant Pay
window.submitUPIPayment = async function() {
    const upiRef = document.getElementById('upi-utr-input').value;
    if(upiRef && upiRef.trim() !== "") {
        try {
            await window.fbUpdateDoc(window.fbDoc(window.fbDb, "users", currentUser.uid), { rentStatus: 'pending', lastUtr: upiRef });
            showToast("Payment submitted for verification!");
            document.getElementById('pay-modal').style.display = 'none';
            tenantData.rentStatus = 'pending'; renderTenantDashboard();
        } catch (e) { showToast("Error submitting payment.", "error"); }
    } else { showToast("UTR is required.", "error"); }
}

// --- STATIC PAGES & MODAL UTILS ---
function renderLocations() {
    pageTitle.innerText = "LOCATIONS";
    appContent.innerHTML = `<div style="max-width:900px; margin:0 auto;">${appData.branches.map(b => `<div style="background:var(--bg-surface); padding:1.5rem; border-radius:var(--radius); margin-bottom:2rem; box-shadow:var(--shadow); border:1px solid var(--border-color);"><h2 style="margin-bottom:10px; font-family:'Playfair Display',serif;">${b.name}</h2><iframe src="${b.mapUrl}" class="map-iframe" style="border-radius:10px;"></iframe></div>`).join('')}</div>`;
}

function renderServicesPage() {
    pageTitle.innerText = "AMENITIES";
    appContent.innerHTML = `
        <div style="text-align:center; margin-bottom:3rem;">
            <h1 style="font-family:'Playfair Display', serif; font-size:2.5rem;">Premium Facilities</h1>
            <p style="color:var(--text-muted);">Everything you need, included in your rent.</p>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:1.5rem;">${allServices.map(s => `<div class="service-box" style="text-align:center; padding:2rem;"><i class="fas ${s.icon}" style="font-size:2.5rem; color:var(--primary); margin-bottom:15px;"></i><h4 style="font-size:1.1rem;">${s.name}</h4></div>`).join('')}</div>
        <div style="margin-top:3rem; padding:1.5rem; background:rgba(245, 158, 11, 0.1); border-left:4px solid #f59e0b; border-radius:8px; color:var(--text-main);"><i class="fas fa-info-circle"></i> <strong>Note:</strong> While we strive to provide all amenities across all branches, availability of specific services may vary.</div>`;
}

function renderAbout() { 
    pageTitle.innerText = "ABOUT US"; 
    appContent.innerHTML = `<div style="max-width:900px; margin:0 auto; text-align:center;"><h1 style="font-family:'Playfair Display', serif; font-size:2.5rem; margin-bottom:1rem;">Our Story</h1><p style="color:var(--text-muted); line-height:1.7; margin-bottom:3rem;">Founded with the vision to provide a safe, luxurious, and engaging community for students away from home. Shyam Nest is more than a PG; it's an ecosystem designed for your success.</p><img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80" style="width:100%; border-radius:var(--radius); box-shadow:var(--shadow);"></div>`; 
}

window.openGeneralContact = function() { window.open(`https://wa.me/${ownerPhone}?text=Hi, I would like to know more about Shyam Nest.`, '_blank'); }

window.openBookingModal = function(roomId, type) {
    selectedRoomIdForBooking = roomId; contactType = type;
    document.getElementById('modal-title').innerText = type === 'Book' ? "Confirm Booking" : "Enquiry Request";
    document.getElementById('booking-modal').style.display = 'flex';
};

document.querySelector('.close-modal').onclick = () => { modal.style.display = 'none'; };

document.getElementById('booking-form').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('user-name').value;
    const phone = document.getElementById('user-phone').value;
    if (selectedRoomIdForBooking) {
        const r = appData.rooms.find(rm => rm.id === selectedRoomIdForBooking);
        const msg = `*${contactType.toUpperCase()} REQUEST*\nRoom: ${r.name} (${r.id})\nName: ${name}\nPhone: ${phone}\nPlease reply soon.`;
        window.open(`https://wa.me/${ownerPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    }
    document.getElementById('booking-modal').style.display = 'none';
};

// START THE APP
bootApp();