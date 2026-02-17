// --- 1. DATA CONFIGURATION ---
const ownerPhone = "919945584185"; 

// Full list of premium services
const allServices = [
    { name: '2x Food & Snacks', icon: 'fa-utensils' },
    { name: '24x7 Electricity', icon: 'fa-bolt' },
    { name: 'High Speed Wifi', icon: 'fa-wifi' },
    { name: 'Refrigerator', icon: 'fa-snowflake' },
    { name: 'Projector', icon: 'fa-film' },
    { name: 'Study Desk', icon: 'fa-chair' },
    { name: 'Wardrobe', icon: 'fa-door-closed' },
    { name: 'Water Cooler', icon: 'fa-glass-water' },
    { name: 'Washing Machine', icon: 'fa-hands-wash' },
    { name: 'Gym', icon: 'fa-dumbbell' },
    { name: 'Play Area (8-ball)', icon: 'fa-gamepad' },
    { name: 'Room Cleaning', icon: 'fa-broom' }
];

// Helper to generate room data
function generateRooms(branchId, count, startId) {
    let rooms = [];
    for(let i = 0; i < count; i++) {
        let share = i < 3 ? 1 : (i < 9 ? 2 : 3); 
        let price = share === 1 ? 18000 : (share === 2 ? 12000 : 8000);
        let status = Math.random() > 0.3 ? 'Available' : 'Full';
        rooms.push({
            id: `r${startId + i}`, // Unique ID
            branchId: branchId,
            name: share === 1 ? 'Private Suite' : (share === 2 ? 'Twin Sharing' : 'Triple Comfort'),
            sharing: share,
            status: status,
            price: price,
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
    rooms: [
        ...generateRooms('b1', 11, 101),
        ...generateRooms('b2', 11, 201),
        ...generateRooms('b3', 10, 301)
    ]
};

const reviews = [
    { name: "Rahul S.", year: "Resident 2023", img: "https://randomuser.me/api/portraits/men/32.jpg", text: "Shyam Nest isn't just a PG, it's a vibe. The gaming area was my escape after exams!" },
    { name: "Priya M.", year: "Resident 2024", img: "https://randomuser.me/api/portraits/women/44.jpg", text: "Safety was my priority, and this place delivered 100%. Plus, the wifi is blazing fast." },
    { name: "Ankit D.", year: "Resident 2022", img: "https://randomuser.me/api/portraits/men/86.jpg", text: "The food services and gym saved me so much time. Highly recommended for students." }
];

let appData = JSON.parse(localStorage.getItem('pg_data')) || defaultData;
const appContent = document.getElementById('app-content');
const pageTitle = document.getElementById('page-title');

// --- 2. ROUTING ---
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
            case 'locations': renderLocations(); break;
            case 'services': renderServicesPage(); break;
            case 'about': renderAbout(); break;
        }
        appContent.style.opacity = '1';
    }, 200);
}

// --- 3. RENDERERS ---

function renderHome() {
    pageTitle.innerText = "DASHBOARD";
    let branchesHtml = appData.branches.map(b => `
        <div class="branch-card" onclick="navigate('branch', '${b.id}')">
            <img src="${b.img}" class="branch-img" alt="${b.name}">
            <div class="branch-info">
                <h3>${b.name}</h3>
                <p style="color:#777; font-size:0.9rem;"><i class="fas fa-map-marker-alt"></i> ${b.location}</p>
                <div style="margin-top:15px; display:flex; gap:10px; align-items:center; color:var(--primary); font-weight:600;">
                    <span>Explore Rooms</span> <i class="fas fa-arrow-right"></i>
                </div>
            </div>
        </div>
    `).join('');

    appContent.innerHTML = `
        <div class="hero-wrapper">
            <div class="hero-bg"></div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1>Welcome to Shyam Nest</h1>
                <p style="font-size:1.2rem; opacity:0.9;">More than just a room. It's your launchpad.</p>
            </div>
        </div>
        <h2 style="margin-bottom:1.5rem; font-family:'Playfair Display', serif;">Select a Branch</h2>
        <div class="branch-grid">${branchesHtml}</div>
    `;
}

function renderAllRooms() {
    pageTitle.innerText = "FIND YOUR ROOM";
    const filterHtml = `
        <div class="filter-container">
            <div class="filter-group"><label>Branch Location</label><select id="filter-branch" class="filter-select" onchange="applyFilters()"><option value="all">All Locations</option>${appData.branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}</select></div>
            <div class="filter-group"><label>Sharing Type</label><select id="filter-share" class="filter-select" onchange="applyFilters()"><option value="all">Any Sharing</option><option value="1">Single (Private)</option><option value="2">Double (Twin)</option><option value="3">Triple (Budget)</option></select></div>
            <div class="filter-group"><label>Availability</label><select id="filter-status" class="filter-select" onchange="applyFilters()"><option value="all">All Status</option><option value="Available">Available Only</option></select></div>
            <div class="filter-group"><label>Max Budget (Rs.)</label><select id="filter-price" class="filter-select" onchange="applyFilters()"><option value="all">Any Price</option><option value="10000">Under 10,000</option><option value="15000">Under 15,000</option><option value="20000">Under 20,000</option></select></div>
        </div>
        <div id="rooms-result-container"></div>
    `;
    appContent.innerHTML = filterHtml;
    applyFilters();
}

window.applyFilters = function() {
    const branch = document.getElementById('filter-branch').value;
    const share = document.getElementById('filter-share').value;
    const status = document.getElementById('filter-status').value;
    const price = document.getElementById('filter-price').value;

    const filtered = appData.rooms.filter(r => {
        return (branch === 'all' || r.branchId === branch) &&
               (share === 'all' || r.sharing == share) &&
               (status === 'all' || r.status === status) &&
               (price === 'all' || r.price <= parseInt(price));
    });

    const container = document.getElementById('rooms-result-container');
    if(filtered.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:2rem; color:#777;"><h3>No rooms match your filters.</h3></div>`;
        return;
    }
    container.innerHTML = filtered.map(r => generateRoomCard(r)).join('');
}

function generateRoomCard(r) {
    const branch = appData.branches.find(b => b.id === r.branchId);
    const statusClass = r.status === 'Available' ? 'chip-status' : 'chip-status full';
    return `
        <div class="room-card">
            <div class="room-img-wrapper">
                <img src="${r.img}" class="room-img" alt="${r.name}">
            </div>
            <div class="room-details">
                <span class="location-tag"><i class="fas fa-map-pin"></i> ${branch.name}</span>
                <div class="info-chips">
                    <span class="chip chip-people"><i class="fas fa-user-friends"></i> ${r.sharing} Sharing</span>
                    <span class="chip ${statusClass}">${r.status}</span>
                </div>
                <h2 class="room-title">${r.name}</h2>
                <p class="description-text">${r.desc}</p>
                <h3 style="color:var(--primary); margin-bottom:15px;">Rs. ${r.price.toLocaleString()}/- <span style="font-size:0.9rem; color:#777; font-weight:400">per month</span></h3>
                <div class="action-buttons">
                    <button class="btn-secondary" onclick="navigate('room', '${r.id}')">Check More</button>
                    <button class="btn-outline" onclick="openBooking('${r.id}', 'Enquire')">Enquire</button>
                    <button class="btn-primary" onclick="openBooking('${r.id}', 'Book')">Book Room</button>
                </div>
            </div>
        </div>`;
}

function renderBranch(branchId) {
    const branch = appData.branches.find(b => b.id === branchId);
    const rooms = appData.rooms.filter(r => r.branchId === branchId);
    pageTitle.innerText = branch.name.toUpperCase();
    let roomsHtml = rooms.map(r => generateRoomCard(r)).join('');
    appContent.innerHTML = `
        <button onclick="navigate('home')" style="margin-bottom:1.5rem; border:none; background:none; cursor:pointer; color:var(--text-light); font-weight:600;"><i class="fas fa-arrow-left"></i> Back</button>
        ${roomsHtml.length ? roomsHtml : '<p>No rooms listed in this branch.</p>'}
    `;
}

function renderRoomDetails(roomId) {
    const r = appData.rooms.find(rm => rm.id === roomId);
    const branch = appData.branches.find(b => b.id === r.branchId);
    pageTitle.innerText = "DETAILS";
    const featuresHtml = allServices.map(f => `<div class="service-box" style="padding:1.5rem 1rem;"><i class="fas ${f.icon}"></i><h4 style="font-size:0.9rem;">${f.name}</h4></div>`).join('');

    appContent.innerHTML = `
        <div style="max-width:900px; margin:0 auto;">
            <button onclick="navigate('all-rooms')" style="margin-bottom:1rem; border:none; background:none; cursor:pointer;"><i class="fas fa-arrow-left"></i> Back to Rooms</button>
            <img src="${r.img}" style="width:100%; height:400px; object-fit:cover; border-radius:20px; box-shadow:var(--shadow);" alt="${r.name}">
            <div style="display:flex; justify-content:space-between; margin-top:2rem; flex-wrap:wrap;">
                <div>
                    <h1 style="font-family:'Playfair Display', serif; font-size:2.5rem;">${r.name}</h1>
                    <p style="color:#666; margin-bottom:10px;"><i class="fas fa-map-pin"></i> ${branch.name}, ${branch.location}</p>
                    <span class="chip ${r.status === 'Available' ? 'chip-status' : 'chip-status full'}">${r.status}</span>
                </div>
                <div><h2 style="color:var(--primary); font-size:2rem;">Rs. ${r.price.toLocaleString()}/-</h2></div>
            </div>
            <div style="margin: 2rem 0; padding:2rem; background:white; border-radius:15px; border-left:5px solid var(--primary);">
                <h3>About this Room</h3>
                <p style="color:#555; margin-top:10px;">${r.desc} Includes all premium facilities.</p>
                <div class="action-buttons" style="margin-top:20px;">
                    <button class="btn-outline" onclick="openBooking('${r.id}', 'Enquire')">Enquire Now</button>
                    <button class="btn-primary" onclick="openBooking('${r.id}', 'Book')">Book Room</button>
                </div>
            </div>
            <h3 style="margin-bottom:1.5rem;">Amenities</h3>
            <div class="services-grid-page" style="grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));">${featuresHtml}</div>
            <p class="disclaimer"><strong>Note:</strong> While we strive to provide all amenities across all branches, availability of specific services may vary.</p>
            <div style="text-align:center; margin-top:4rem;"><p>We know you loved it!</p><button class="btn-secondary" onclick="openGeneralContact()">Contact Us</button></div>
        </div>
    `;
}

// --- 4. NEW ADMIN HIERARCHY ---

// A. Admin Main Menu
function renderAdmin() {
    pageTitle.innerText = "ADMIN PANEL";
    appContent.innerHTML = `
        <div style="text-align:center; margin-bottom:2rem;">
            <h2>Welcome Admin</h2>
            <p style="color:#666;">Select an action to proceed</p>
        </div>
        <div class="admin-menu-grid">
            <div class="admin-choice-card" onclick="renderAdminViewMode()">
                <i class="fas fa-list-alt"></i>
                <h3>View Inventory</h3>
                <p>See a tabular view of all rooms across all branches.</p>
            </div>
            <div class="admin-choice-card" onclick="renderAdminUpdateMode()">
                <i class="fas fa-edit"></i>
                <h3>Update Room</h3>
                <p>Select a branch and room ID to modify pricing or status.</p>
            </div>
        </div>
    `;
}

// B. View Mode (Table)
window.renderAdminViewMode = function() {
    pageTitle.innerText = "INVENTORY VIEW";
    const rows = appData.rooms.map(r => {
        const branchName = appData.branches.find(b => b.id === r.branchId).name;
        return `
        <tr>
            <td><strong>${r.id}</strong></td>
            <td>${r.name}</td>
            <td>${branchName}</td>
            <td><span class="chip ${r.status === 'Available' ? 'chip-status' : 'chip-status full'}" style="font-size:0.7rem;">${r.status}</span></td>
            <td>Rs. ${r.price.toLocaleString()}</td>
        </tr>`;
    }).join('');

    appContent.innerHTML = `
        <button onclick="renderAdmin()" style="margin-bottom:1rem; border:none; background:none; cursor:pointer;"><i class="fas fa-arrow-left"></i> Back to Menu</button>
        <div class="admin-table-container">
            <table class="admin-table">
                <thead><tr><th>Room ID</th><th>Name</th><th>Branch</th><th>Status</th><th>Price</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

// C. Update Mode (Form)
window.renderAdminUpdateMode = function() {
    pageTitle.innerText = "UPDATE ROOM";
    
    // Generate Branch Options
    const branchOptions = appData.branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('');

    appContent.innerHTML = `
        <button onclick="renderAdmin()" style="margin-bottom:1rem; border:none; background:none; cursor:pointer;"><i class="fas fa-arrow-left"></i> Back to Menu</button>
        
        <div class="admin-form-container">
            <h2 style="margin-bottom:1.5rem;">Modify Room Details</h2>
            
            <div class="form-step">
                <label>1. Select Branch</label>
                <select id="admin-branch-select" class="form-select" onchange="loadRoomOptions()">
                    <option value="">-- Choose Branch --</option>
                    ${branchOptions}
                </select>
            </div>

            <div class="form-step">
                <label>2. Select Room ID</label>
                <select id="admin-room-select" class="form-select" onchange="loadRoomData()" disabled>
                    <option value="">-- First Select Branch --</option>
                </select>
            </div>

            <div id="admin-update-form" class="update-fields">
                <div class="form-step">
                    <label>Availability Status</label>
                    <select id="admin-edit-status" class="form-select">
                        <option value="Available">Available</option>
                        <option value="Full">Full</option>
                    </select>
                </div>
                <div class="form-step">
                    <label>Monthly Price (Rs.)</label>
                    <input type="number" id="admin-edit-price" class="form-input">
                </div>
                <button class="btn-primary full-width" onclick="submitRoomUpdate()">Update Room Details</button>
            </div>
        </div>
    `;
}

// Helper: Load Rooms based on selected Branch
window.loadRoomOptions = function() {
    const branchId = document.getElementById('admin-branch-select').value;
    const roomSelect = document.getElementById('admin-room-select');
    const form = document.getElementById('admin-update-form');
    
    form.style.display = 'none'; // Hide form if branch changes
    roomSelect.innerHTML = '<option value="">-- Select Room ID --</option>';

    if(branchId) {
        const rooms = appData.rooms.filter(r => r.branchId === branchId);
        rooms.forEach(r => {
            roomSelect.innerHTML += `<option value="${r.id}">${r.id} - ${r.name}</option>`;
        });
        roomSelect.disabled = false;
    } else {
        roomSelect.disabled = true;
    }
}

// Helper: Populate Form based on selected Room
window.loadRoomData = function() {
    const roomId = document.getElementById('admin-room-select').value;
    const form = document.getElementById('admin-update-form');

    if(roomId) {
        const room = appData.rooms.find(r => r.id === roomId);
        document.getElementById('admin-edit-status').value = room.status;
        document.getElementById('admin-edit-price').value = room.price;
        form.style.display = 'block';
    } else {
        form.style.display = 'none';
    }
}

// Helper: Save Changes
window.submitRoomUpdate = function() {
    const roomId = document.getElementById('admin-room-select').value;
    const newStatus = document.getElementById('admin-edit-status').value;
    const newPrice = document.getElementById('admin-edit-price').value;

    const roomIndex = appData.rooms.findIndex(r => r.id === roomId);
    if(roomIndex > -1) {
        appData.rooms[roomIndex].status = newStatus;
        appData.rooms[roomIndex].price = parseInt(newPrice);
        localStorage.setItem('pg_data', JSON.stringify(appData));
        alert(`Successfully updated Room ${roomId}!`);
        navigate('admin'); // Go back to admin menu
    }
}

// --- ACTION HANDLERS ---
const modal = document.getElementById('booking-modal');
const modalTitle = document.getElementById('modal-title');
let selectedRoomIdForBooking = null;
let contactType = 'Book'; 

window.openGeneralContact = function() {
    window.open(`https://wa.me/${ownerPhone}?text=Hi, I would like to know more about Shyam Nest PG accommodations.`, '_blank');
}

window.openBooking = function(roomId, type) {
    selectedRoomIdForBooking = roomId;
    contactType = type;
    modalTitle.innerText = type === 'Book' ? "Confirm Booking" : "Enquiry Request";
    modal.style.display = 'flex';
};

document.querySelector('.close-modal').onclick = () => { modal.style.display = 'none'; };

document.getElementById('booking-form').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('user-name').value;
    const phone = document.getElementById('user-phone').value;
    const email = document.getElementById('user-email').value;
    
    if (selectedRoomIdForBooking) {
        const r = appData.rooms.find(rm => rm.id === selectedRoomIdForBooking);
        const branch = appData.branches.find(b => b.id === r.branchId);
        
        const msg = `*${contactType.toUpperCase()} REQUEST*\n\nRoom: ${r.name} (ID: ${r.id})\nLocation: ${branch.name}, ${branch.location}\nPrice: Rs.${r.price}\n\n*User Details:*\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\n\nPlease reply soon.`;
        window.open(`https://wa.me/${ownerPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    }
    modal.style.display = 'none';
};

document.getElementById('sidebar-toggle').onclick = () => { document.getElementById('sidebar').classList.toggle('collapsed'); };

function renderLocations() {
    pageTitle.innerText = "LOCATIONS";
    let mapsHtml = appData.branches.map(b => `<div style="background:white; padding:1.5rem; border-radius:20px; box-shadow:var(--shadow); margin-bottom:2rem;"><h2 style="margin-bottom:10px;">${b.name}</h2><iframe src="${b.mapUrl}" class="map-iframe" allowfullscreen="" loading="lazy"></iframe></div>`).join('');
    appContent.innerHTML = `<div style="max-width:900px; margin:0 auto;">${mapsHtml}</div>`;
}

function renderServicesPage() {
    pageTitle.innerText = "AMENITIES";
    appContent.innerHTML = `
        <div class="services-grid-page">${allServices.map(s => `<div class="service-box"><i class="fas ${s.icon}"></i><h4>${s.name}</h4></div>`).join('')}</div>
        <p class="disclaimer" style="margin-top:2rem;"><strong>Note:</strong> While we strive to provide all amenities across all branches, availability of specific services may vary.</p>
    `;
}

function renderAbout() {
    pageTitle.innerText = "ABOUT US";
    appContent.innerHTML = `<div style="max-width:900px; margin:0 auto;"><h1 style="text-align:center; margin-bottom:2rem;">Student Voices</h1><div class="reviews-container">${reviews.map(rev => `<div class="review-card"><img src="${rev.img}" class="review-img"><p class="review-text">"${rev.text}"</p><h5 class="reviewer-name">${rev.name}</h5><span class="reviewer-year">${rev.year}</span></div>`).join('')}</div></div>`;
}

renderHome();