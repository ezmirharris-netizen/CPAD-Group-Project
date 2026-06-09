/* =========================================
   PAGE NAVIGATION DESIGN PATTERNS
========================================= */

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.add("hidden");
    });
    
    const targetPage = document.getElementById(pageId);
    if(targetPage) targetPage.classList.remove("hidden");

    document.querySelectorAll(".sidebar button").forEach(btn => {
        btn.classList.remove("active");
        const clickAttr = btn.getAttribute("onclick");
        if(clickAttr && clickAttr.includes(pageId)) {
            btn.classList.add("active");
        }
    });
}

/* =========================================
   GLOBAL STATE MOCK STORAGE PIPELINES
========================================= */

const tutors = JSON.parse(localStorage.getItem("globalTutors")) || [
    {
        id: 1,
        name: "John Tan",
        faculty: "Computer Science",
        rating: 4.9,
        skill: "Vue.js",
        price: 25,
        bio: "Senior Frontend Engineer with 4+ years of industrial experience. Specializes in single-page applications, advanced component configurations, and state management via Pinia/Vuex.",
        isPremium: true,
        isVerified: true,
        reviews: [
            { tutee: "Ahmad Zain", rating: 5.0, comment: "Excellent explanation of state management patterns! Helped me clear my project blockers immediately." }
        ]
    },
    {
        id: 2,
        name: "Sarah Lim",
        faculty: "Engineering",
        rating: 4.8,
        skill: "Calculus",
        price: 20,
        bio: "Honors Engineering student. Excellent track record of tutoring engineering core principles, multi-variable calculus, limits, derivatives, and preparation drills for board exams.",
        isPremium: false,
        isVerified: true,
        reviews: [
            { tutee: "Darren Ng", rating: 5.0, comment: "Calculus used to terrify me, but Sarah breaks derivatives down into basic elements so well!" }
        ]
    }
];

let bookings = JSON.parse(localStorage.getItem("bookings")) || [
    { id: 101, tutor: "Sarah Lim", skill: "Calculus", status: "Accepted", date: "15 June 2026", timeSlot: "10:00 AM", tuteeName: "Alex Wong", baselinePrice: 20 },
    { id: 102, tutor: "John Tan", skill: "Vue.js Setup", status: "Requested", date: "22 June 2026", timeSlot: "03:00 PM", tuteeName: "Alex Wong", baselinePrice: 25 }
];

let chatChannels = JSON.parse(localStorage.getItem("chatChannels")) || {
    tutee: {
        1: [
            { sender: "Tutor", text: "Hey there! Ready for our next Vue.js development session?" },
            { sender: "Tutee", text: "Yes! I finished configuring the router file we discussed." }
        ]
    },
    tutor: {
        991: [
            { sender: "Student", text: "Hello Coach! Can you please review my functional engineering homework before tomorrow?" },
            { sender: "Tutor", text: "Sure thing, make sure you check your derivation matrix logic." }
        ]
    }
};

let activeChatId = 1;
let currentMessagePerspective = "tutee"; 
let currentBookingFilter = "tutee"; 

let walletBalance = JSON.parse(localStorage.getItem("walletBalance")) || 185;

let transactions = JSON.parse(localStorage.getItem("transactions")) || [
    { id: 1, type: "income", amount: 180, desc: "Tutoring payout received (UI Design Help) - 10% Platform Commission Deducted", date: "02 June 2026" },
    { id: 2, type: "expense", amount: 25, desc: "Paid John Tan for Lesson #3 (Vue.js)", date: "04 June 2026" }
];

let upcomingPayments = JSON.parse(localStorage.getItem("upcomingPayments")) || [
    { id: 501, amount: 20, desc: "Calculus Session with Sarah Lim", date: "15 June 2026" }
];

const calendarSessions = [
    { date: "15 June 2026", title: "Advanced Calculus Limits", tutor: "Sarah Lim", time: "10:00 AM - 12:00 PM", status: "Accepted" },
    { date: "22 June 2026", title: "Vue.js Router Setup Config", tutor: "John Tan", time: "03:00 PM - 05:00 PM", status: "Requested" }
];

/* =========================================
   AUTHENTICATION CREDENTIAL FLOW REGISTRY
========================================= */
let currentUser = JSON.parse(localStorage.getItem("sessionUser")) || null;
let isLoginMode = true;

function switchAuthTab(mode) {
    isLoginMode = (mode === 'login');
    document.getElementById("tabLogin").classList.toggle("active", isLoginMode);
    document.getElementById("tabRegister").classList.toggle("active", !isLoginMode);
    
    document.getElementById("authName").disabled = isLoginMode;
    document.getElementById("authFaculty").disabled = isLoginMode;
    document.getElementById("authYear").disabled = isLoginMode;
    document.getElementById("roleGroup").style.display = isLoginMode ? "none" : "block";
    
    document.getElementById("authSubmitBtn").textContent = isLoginMode ? "Sign In" : "Create Account";
}

function handleAuthSubmit(event) {
    event.preventDefault();
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    
    if(!password || password.length < 4) {
        alert("Please specify a valid security password (minimum 4 characters).");
        return;
    }

    if (isLoginMode) {
        if (email.toLowerCase() === 'admin@skillswap.com') {
            currentUser = { name: "System Admin", email: email, role: "Admin", faculty: "Operations", year: "Staff", skills: [], isPremium: false, isVerified: true };
        } else {
            const matchTutor = tutors.find(t => t.name.toLowerCase() === email.split('@')[0].replace('.',' ').toLowerCase());
            if (matchTutor) {
                currentUser = { name: matchTutor.name, email: email, role: "Tutor", faculty: matchTutor.faculty, year: "Year 3", skills: [matchTutor.skill], isPremium: matchTutor.isPremium, isVerified: matchTutor.isVerified };
            } else {
                currentUser = { name: email.split('@')[0], email: email, role: "Tutee", faculty: "Engineering", year: "Year 2", skills: [], isPremium: false, isVerified: false };
            }
        }
    } else {
        const name = document.getElementById("authName").value.trim();
        const faculty = document.getElementById("authFaculty").value.trim() || "General Academic";
        const year = document.getElementById("authYear").value.trim() || "Year 1";
        const role = document.getElementById("authRole").value;
        
        currentUser = { name: name, email: email, role: role, faculty: faculty, year: year, skills: [], isPremium: false, isVerified: false };
        
        if(role === "Tutor") {
            currentUser.skills = ["General Mentoring"];
            tutors.push({
                id: Date.now(),
                name: name,
                faculty: faculty,
                rating: 5.0,
                skill: "General Mentoring",
                price: 20,
                bio: "Registered expert student tutor eager to share specialized faculty insights.",
                isPremium: false,
                isVerified: false,
                reviews: []
            });
            localStorage.setItem("globalTutors", JSON.stringify(tutors));
        }
    }
    
    localStorage.setItem("sessionUser", JSON.stringify(currentUser));
    initAppSystem();
}

function handleLogout() {
    localStorage.removeItem("sessionUser");
    currentUser = null;
    document.getElementById("mainApp").classList.add("hidden");
    document.getElementById("authPage").classList.remove("hidden");
    document.getElementById("authForm").reset();
}

function initAppSystem() {
    if(!currentUser) {
        document.getElementById("authPage").classList.remove("hidden");
        document.getElementById("mainApp").classList.add("hidden");
        return;
    }
    
    document.getElementById("authPage").classList.add("hidden");
    document.getElementById("mainApp").classList.remove("hidden");
    
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    document.getElementById("sidebarAvatar").textContent = initials;
    document.getElementById("sidebarUserName").textContent = currentUser.name;
    document.getElementById("sidebarUserRole").textContent = currentUser.role;
    
    currentBookingFilter = "tutee";
    currentMessagePerspective = "tutee";

    buildRoleNavigation();
    renderEnrichedDashboard();
    renderTutors();
    renderBookingFilters();
    renderBookings();
    renderPerspectiveMessagesLayout();
    renderWalletDashboard();
    renderCalendar();
    renderAdminStats();
}

function buildRoleNavigation() {
    const nav = document.getElementById("appNavigation");
    if(!nav) return;
    
    if(currentUser.role === "Admin") {
        nav.innerHTML = `
            <button class="active" onclick="showPage('admin')"><i class="fa-solid fa-shield-halved"></i> Admin Control</button>
            <button onclick="showPage('dashboard')"><i class="fa-solid fa-chart-pie"></i> View Global Stats</button>
        `;
        showPage('admin');
    } else {
        nav.innerHTML = `
            <button class="active" onclick="showPage('dashboard')"><i class="fa-solid fa-chart-pie"></i> Dashboard</button>
            <button onclick="showPage('marketplace')"><i class="fa-solid fa-store"></i> Marketplace</button>
            <button onclick="showPage('booking')"><i class="fa-solid fa-calendar-check"></i> Booking</button>
            <button onclick="showPage('messages')"><i class="fa-solid fa-comment-dots"></i> Messages</button>
            <button onclick="showPage('wallet')"><i class="fa-solid fa-wallet"></i> Wallet</button>
            <button onclick="showPage('calendar')"><i class="fa-solid fa-calendar-days"></i> Calendar</button>
        `;
        showPage('dashboard');
    }
}

function renderEnrichedDashboard() {
    if(!currentUser) return;
    document.getElementById("dashStatWallet").textContent = `RM ${walletBalance}`;
    document.getElementById("dashStatBookings").textContent = bookings.length;
    
    const alertsFeed = document.getElementById("dashboardAlertsFeed");
    if(!alertsFeed) return;
    alertsFeed.innerHTML = "";
    
    let alertItems = [
        { icon: '<i class="fa-solid fa-circle-info" style="color:var(--primary)"></i>', title: "System Operational", details: "All secure peer booking slots are online." },
        { icon: '<i class="fa-solid fa-clock-rotate-left" style="color:var(--warning)"></i>', title: "5-Hour Lock Mechanism", details: "Booking cancellations must be submitted at least 5 hours prior to session launch." }
    ];
    
    if (currentUser.role === "Tutor") {
        alertItems.unshift({ icon: '<i class="fa-solid fa-user-check" style="color:var(--success)"></i>', title: "Tutor View Mode Active", details: "You are visible inside the Marketplace index." });
    }
    
    alertItems.forEach(item => {
        alertsFeed.innerHTML += `
            <div class="feed-item">
                <div class="feed-info">
                    <span>${item.icon} ${item.title}</span>
                    <d>${item.details}</d>
                </div>
            </div>
        `;
    });

    const activeCount = bookings.filter(b => b.status === "Accepted").length;
    document.getElementById("dashboardProgressionText").textContent = `You have ${activeCount} active peer knowledge transfer slots scheduled this month.`;
}

/* =========================================
   NEW SIDEBAR POPUP MODAL WORKING ENVIRONMENT
========================================= */
function openUserProfileModal() {
    if(!currentUser || currentUser.role === "Admin") return;
    
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    document.getElementById("profilePopupAvatar").textContent = initials;
    document.getElementById("profilePopupName").textContent = currentUser.name;
    document.getElementById("profilePopupBadge").textContent = `${currentUser.role} Account`;
    document.getElementById("profilePopupFaculty").textContent = currentUser.faculty;
    document.getElementById("profilePopupYear").textContent = currentUser.year;
    
    // Add monetization indicators
    const badgeContainer = document.getElementById("profilePopupBadgesContainer");
    badgeContainer.innerHTML = "";
    if (currentUser.isPremium) badgeContainer.innerHTML += `<span class="badge badge-success" style="font-size:0.65rem; background:#DB2777;"><i class="fa-solid fa-gem"></i> PREMIUM</span>`;
    if (currentUser.isVerified) badgeContainer.innerHTML += `<span class="badge badge-success" style="font-size:0.65rem; background:#059669;"><i class="fa-solid fa-circle-check"></i> VERIFIED</span>`;

    const skillsContainer = document.getElementById("profilePopupSkillsContainer");
    skillsContainer.innerHTML = "";
    
    if(currentUser.skills && currentUser.skills.length > 0) {
        currentUser.skills.forEach(skill => {
            skillsContainer.innerHTML += `<span class="badge badge-primary">${skill}</span>`;
        });
    } else {
        skillsContainer.innerHTML = `<span style="color: var(--text-muted); font-style: italic; font-size: 0.85rem;">No active instruction tags set.</span>`;
    }

    const upgradeWrapper = document.getElementById("profilePopupUpgradeWrapper");
    if(currentUser.role === "Tutor") {
        upgradeWrapper.innerHTML = `
            <div style="background: var(--bg-main); padding: 12px; border-radius: var(--radius-md); display:flex; flex-direction:column; gap:10px;">
                <p style="font-size:0.8rem; font-weight:700; color:var(--text-main); margin:0; text-transform:uppercase; letter-spacing:0.02em;">Tutor Revenue Options</p>
                <div style="display:flex; gap:10px;">
                    <button onclick="togglePremiumProfile()" class="btn-outline" style="flex:1; font-size:0.75rem; padding:8px; display:inline-flex; align-items:center; justify-content:center; gap:4px; border-color:#DB2777; color:#DB2777;">
                        <i class="fa-solid fa-gem"></i> ${currentUser.isPremium ? 'Premium Active' : 'Go Premium Profile'}
                    </button>
                    <button onclick="purchaseVerificationBadge()" class="btn-outline" style="flex:1; font-size:0.75rem; padding:8px; display:inline-flex; align-items:center; justify-content:center; gap:4px; border-color:#059669; color:#059669;">
                        <i class="fa-solid fa-shield"></i> ${currentUser.isVerified ? 'Verified Active' : 'Buy Badge (RM50/yr)'}
                    </button>
                </div>
            </div>
        `;
    } else {
        upgradeWrapper.innerHTML = `
            <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:10px;">Activate your Tutor configuration profile to begin monetizing your skills across faculty members.</p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <input type="text" id="popupUpgradeSkill" placeholder="Specialist Subject (e.g., Python Basics)" style="padding:10px; font-size:0.85rem; border:1px solid var(--border); border-radius:var(--radius-sm);">
                <input type="text" id="popupUpgradePrice" placeholder="Instruction Rate (RM/hr) e.g., 30" style="padding:10px; font-size:0.85rem; border:1px solid var(--border); border-radius:var(--radius-sm);">
                <button onclick="processModalTutorUpgrade()" style="padding:10px; font-size:0.9rem;">Submit Expert Application</button>
            </div>
        `;
    }
    
    document.getElementById("userProfileModal").classList.remove("hidden");
}

function closeUserProfileModal() {
    document.getElementById("userProfileModal").classList.add("hidden");
}

function handleProfileModalBackdrop(event) {
    if(event.target.id === "userProfileModal") closeUserProfileModal();
}

function processModalTutorUpgrade() {
    const skill = document.getElementById("popupUpgradeSkill").value.trim();
    const price = parseInt(document.getElementById("popupUpgradePrice").value.trim());
    
    if(!skill || !price) {
        alert("Please list a valid target subject title and numerical hourly rate.");
        return;
    }
    
    currentUser.role = "Tutor";
    if(!currentUser.skills) currentUser.skills = [];
    currentUser.skills.push(skill);
    
    localStorage.setItem("sessionUser", JSON.stringify(currentUser));
    
    tutors.push({
        id: Date.now(),
        name: currentUser.name,
        faculty: currentUser.faculty,
        rating: 5.0,
        skill: skill,
        price: price,
        bio: `Specialized tutoring in ${skill} across the ${currentUser.faculty} department structure.`,
        isPremium: false,
        isVerified: false,
        reviews: []
    });
    localStorage.setItem("globalTutors", JSON.stringify(tutors));
    
    alert("Profile role configuration expanded! Double instruction capabilities enabled.");
    closeUserProfileModal();
    initAppSystem();
}

function togglePremiumProfile() {
    currentUser.isPremium = !currentUser.isPremium;
    localStorage.setItem("sessionUser", JSON.stringify(currentUser));
    
    // Sync back to standard array records
    const tIndex = tutors.findIndex(t => t.name === currentUser.name);
    if(tIndex !== -1) {
        tutors[tIndex].isPremium = currentUser.isPremium;
        localStorage.setItem("globalTutors", JSON.stringify(tutors));
    }
    alert(currentUser.isPremium ? "Premium Visibility Activated! Your profile ranks higher in search parameters." : "Premium Visibility deactivated.");
    openUserProfileModal();
    renderTutors();
}

function purchaseVerificationBadge() {
    if (currentUser.isVerified) {
        alert("Your verified institutional profile remains active for this annual period.");
        return;
    }
    if (walletBalance < 50) {
        alert("Insufficient account metrics balance to fund the annual RM50 verification fee.");
        return;
    }
    walletBalance -= 50;
    currentUser.isVerified = true;
    localStorage.setItem("walletBalance", JSON.stringify(walletBalance));
    localStorage.setItem("sessionUser", JSON.stringify(currentUser));
    
    const tIndex = tutors.findIndex(t => t.name === currentUser.name);
    if(tIndex !== -1) {
        tutors[tIndex].isVerified = true;
        localStorage.setItem("globalTutors", JSON.stringify(tutors));
    }
    
    transactions.unshift({
        id: Date.now(),
        type: "expense",
        amount: 50,
        desc: "Annual Platform Identity Verification Badge Renewal Fee",
        date: "10 June 2026"
    });
    localStorage.setItem("transactions", JSON.stringify(transactions));
    
    alert("Identity confirmation verified! Verification checkmark enabled on your profile cards.");
    openUserProfileModal();
    renderTutors();
    renderWalletDashboard();
}

/* =========================================
   MARKETPLACE SEARCH CORES
========================================= */
function renderTutors(list = tutors) {
    const container = document.getElementById("tutorGrid");
    if(!container) return;
    container.innerHTML = "";
    
    // Sort logic to prioritize Premium profile tiers dynamically
    const sortedList = [...list].sort((a,b) => (b.isPremium ? 1 : 0) - (a.isPremium ? 1 : 0));

    sortedList.forEach(tutor => {
        const initials = tutor.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
        
        let badgesHtml = "";
        if (tutor.isPremium) badgesHtml += `<i class="fa-solid fa-gem" style="color:#DB2777; font-size:0.85rem;" title="Premium Profile Tier"></i> `;
        if (tutor.isVerified) badgesHtml += `<i class="fa-solid fa-circle-check" style="color:#059669; font-size:0.85rem;" title="Verified Academic Identity"></i>`;

        container.innerHTML += `
        <div class="tutor-card" style="${tutor.isPremium ? 'border: 1px solid #F472B6; background: #FFF5F7;' : ''}">
            <div class="avatar">${initials}</div>
            <div style="display:flex; align-items:center; justify-content:center; gap:5px; margin-top:10px;">
                <h3 style="margin:0;">${tutor.name}</h3>
                <div>${badgesHtml}</div>
            </div>
            <p class="faculty">${tutor.faculty}</p>
            <p class="rating"><i class="fa-solid fa-star"></i> ${tutor.rating}</p>
            <p class="badge badge-primary">${tutor.skill}</p>
            <h4 class="price">RM${tutor.price}/hr</h4>
            <button onclick="viewProfileInline(${tutor.id})">View Profile</button>
        </div>
        `;
    });
}

function searchTutor() {
    const keyword = document.getElementById("searchInput").value.toLowerCase();
    const filtered = tutors.filter(tutor =>
        tutor.skill.toLowerCase().includes(keyword) || tutor.name.toLowerCase().includes(keyword)
    );
    renderTutors(filtered);
}

function viewProfileInline(id) {
    const tutor = tutors.find(t => t.id === id);
    if(!tutor) return;

    const initials = tutor.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    document.getElementById("modalProfileAvatar").textContent = initials;
    document.getElementById("modalProfileName").textContent = tutor.name;
    document.getElementById("modalProfileFaculty").textContent = tutor.faculty;
    document.getElementById("modalProfileSkill").textContent = tutor.skill;
    document.getElementById("modalProfilePrice").textContent = `RM ${tutor.price} / hour`;
    document.getElementById("modalProfileBio").textContent = tutor.bio;

    const badgeContainer = document.getElementById("modalProfileBadgesContainer");
    badgeContainer.innerHTML = "";
    if (tutor.isPremium) badgeContainer.innerHTML += `<span class="badge" style="background:#DB2777; color:white; font-size:0.6rem; padding:2px 5px;"><i class="fa-solid fa-gem"></i> PREMIUM</span>`;
    if (tutor.isVerified) badgeContainer.innerHTML += `<span class="badge" style="background:#059669; color:white; font-size:0.6rem; padding:2px 5px;"><i class="fa-solid fa-circle-check"></i> VERIFIED</span>`;

    // Reset parameters inputs defaults matching baseline context timestamps
    document.getElementById("bookingTargetDate").value = "2026-06-15";
    document.getElementById("bookingTargetTime").value = "14:00";

    const reviewsFeed = document.getElementById("modalProfileReviews");
    reviewsFeed.innerHTML = "";
    
    if (tutor.reviews && tutor.reviews.length > 0) {
        tutor.reviews.forEach(rev => {
            reviewsFeed.innerHTML += `
            <div class="review-item">
                <div class="review-meta">
                    <span><i class="fa-regular fa-user"></i> ${rev.tutee}</span>
                    <span class="review-stars"><i class="fa-solid fa-star"></i> ${rev.rating.toFixed(1)}</span>
                </div>
                <p class="review-comment">"${rev.comment}"</p>
            </div>
            `;
        });
    } else {
        reviewsFeed.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No student comments left yet.</p>`;
    }

    localStorage.setItem("selectedTutor", JSON.stringify(tutor));
    document.getElementById("tutorProfileModal").classList.remove("hidden");
}

function closeProfileModal() {
    document.getElementById("tutorProfileModal").classList.add("hidden");
}

function handleBackdropClick(event) {
    if (event.target.id === "tutorProfileModal") closeProfileModal();
}

function createBookingFromModal() {
    const chosenDate = document.getElementById("bookingTargetDate").value;
    const chosenTime = document.getElementById("bookingTargetTime").value;
    
    if(!chosenDate || !chosenTime) {
        alert("Please explicitly define a targeted instruction session date and timeline framework.");
        return;
    }
    
    closeProfileModal();
    createBooking(chosenDate, chosenTime);
}

/* =========================================
   BOOKINGS INFRASTRUCTURE WITH ROLE FILTER CHIPS
========================================= */
function renderBookingFilters() {
    const filterContainer = document.getElementById("bookingFilterContainer");
    if(!filterContainer) return;
    
    if(currentUser && currentUser.role === "Tutor") {
        filterContainer.innerHTML = `
            <button id="btnFilterTutee" class="btn-outline ${currentBookingFilter === 'tutee' ? 'active' : ''}" onclick="setBookingFilter('tutee')" style="font-size:0.85rem; padding:6px 14px;">My Tutee Lessons (Learning)</button>
            <button id="btnFilterTutor" class="btn-outline ${currentBookingFilter === 'tutor' ? 'active' : ''}" onclick="setBookingFilter('tutor')" style="font-size:0.85rem; padding:6px 14px;">My Tutor Schedule (Teaching)</button>
        `;
    } else {
        filterContainer.innerHTML = `<span class="badge badge-primary"><i class="fa-solid fa-graduation-cap"></i> Student Enrollment Stream</span>`;
    }
}

function setBookingFilter(filterMode) {
    currentBookingFilter = filterMode;
    renderBookingFilters();
    renderBookings();
}

function createBooking(rawDate, rawTime) {
    const tutor = JSON.parse(localStorage.getItem("selectedTutor"));
    if(!tutor) return;

    // Convert date layout safely into standard string notations
    const dateParts = rawDate.split("-");
    const year = dateParts[0];
    const monthIndex = parseInt(dateParts[1]) - 1;
    const day = dateParts[2];
    const mNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const formattedDateStr = `${day} ${mNames[monthIndex]} ${year}`;

    // Convert time layout structures into readable 12-hour AM/PM parameters
    let hours = parseInt(rawTime.split(":")[0]);
    const minutes = rawTime.split(":")[1];
    const suffix = hours >= 12 ? "PM" : "AM";
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    const formattedTimeStr = `${hours}:${minutes} ${suffix}`;

    const booking = {
        id: Date.now(),
        tutor: tutor.name,
        skill: tutor.skill,
        status: "Requested",
        date: formattedDateStr,
        timeSlot: formattedTimeStr,
        tuteeName: currentUser ? currentUser.name : "Alex Wong",
        baselinePrice: tutor.price
    };

    bookings.unshift(booking);
    localStorage.setItem("bookings", JSON.stringify(bookings));
    
    // Dynamically insert metadata into interactive scheduler timeline configuration tracking arrays
    calendarSessions.push({
        date: formattedDateStr,
        title: `${tutor.skill} (Custom Meet)`,
        tutor: tutor.name,
        time: `${formattedTimeStr} onwards`,
        status: "Requested"
    });

    renderBookings();
    renderCalendar();
    renderEnrichedDashboard();
    
    alert(`Custom lesson transmitted to ${tutor.name} for ${formattedDateStr} at ${formattedTimeStr}.`);
    showPage("booking");
}

function renderBookings() {
    const container = document.getElementById("bookingList");
    if(!container) return;
    container.innerHTML = "";

    let targetList = bookings;
    if(currentUser && currentUser.role === "Tutor") {
        if(currentBookingFilter === "tutor") {
            targetList = bookings.filter(b => b.tutor === currentUser.name);
        } else {
            targetList = bookings.filter(b => b.tutor !== currentUser.name);
        }
    }

    if(targetList.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted); font-style:italic; padding:15px 0;">No active class bookings located inside this stream block.</p>`;
        return;
    }

    targetList.forEach(booking => {
        let statusClass = "";
        let badgeStyle = "badge-warning";
        
        if (booking.status === "Accepted" || booking.status === "Confirmed") {
            statusClass = "accepted";
            badgeStyle = "badge-primary";
        } else if (booking.status === "Completed") {
            statusClass = "completed";
            badgeStyle = "badge-success";
        } else if (booking.status === "Cancelled") {
            statusClass = "completed";
            badgeStyle = "badge-warning";
        }

        let actionsHtml = "";
        
        if (currentUser && currentUser.role === "Tutor" && currentBookingFilter === "tutor") {
            if (booking.status === 'Requested') {
                actionsHtml = `<button class="btn-outline" onclick="updateBookingStatus(${booking.id}, 'Accepted')">Accept</button>`;
            } else if (booking.status === 'Accepted') {
                actionsHtml = `<button onclick="processSessionPayoutCompletion(${booking.id})">Complete & Claim</button>`;
            }
        } else {
            if (booking.status !== "Completed" && booking.status !== "Cancelled") {
                actionsHtml = `<button class="btn-outline" style="color: var(--danger); border-color: var(--danger);" onclick="triggerTuteeCancellation(${booking.id}, '${booking.date}', '${booking.timeSlot}')">Cancel Booking</button>`;
            }
        }

        const partyLabel = (currentBookingFilter === "tutor" && currentUser.role === "Tutor") ? `Student: ${booking.tuteeName}` : `Tutor: ${booking.tutor}`;
        
        // Render 10% commission pricing visibility warning indicator labels explicitly
        const netIncomeString = (currentBookingFilter === "tutor" && currentUser.role === "Tutor") ? ` (Earns: RM ${(booking.baselinePrice * 0.9).toFixed(2)} net)` : "";

        container.innerHTML += `
        <div class="card booking-item ${statusClass}">
            <div class="booking-info">
                <h3>${partyLabel}${netIncomeString}</h3>
                <p><i class="fa-solid fa-book-open-reader"></i> ${booking.skill} &nbsp;|&nbsp; <i class="fa-regular fa-clock"></i> ${booking.date} (${booking.timeSlot})</p>
            </div>
            <div class="booking-actions">
                <span class="badge ${badgeStyle}">${booking.status}</span>
                ${actionsHtml}
            </div>
        </div>
        `;
    });
}

function updateBookingStatus(id, status){
    bookings = bookings.map(b => {
        if(b.id === id) b.status = status;
        return b;
    });
    localStorage.setItem("bookings", JSON.stringify(bookings));
    renderBookings();
    renderEnrichedDashboard();
}

/* =========================================
   AUTOMATED REVENUE COMMISSION SETTLE ROUTINE
========================================= */
function processSessionPayoutCompletion(id) {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    const price = booking.baselinePrice || 20;
    const processingFeeCommission = price * 0.10; // 10% Platform Deduction
    const finalTutorNetEarnings = price - processingFeeCommission;

    walletBalance += finalTutorNetEarnings;
    localStorage.setItem("walletBalance", JSON.stringify(walletBalance));

    // Update status to completed state elements
    bookings = bookings.map(b => {
        if(b.id === id) b.status = "Completed";
        return b;
    });
    localStorage.setItem("bookings", JSON.stringify(bookings));

    transactions.unshift({
        id: Date.now(),
        type: "income",
        amount: finalTutorNetEarnings,
        desc: `Payout Claimed: ${booking.skill} with ${booking.tuteeName} (-10% Platform Cut: RM ${processingFeeCommission.toFixed(2)})`,
        date: "10 June 2026"
    });
    localStorage.setItem("transactions", JSON.stringify(transactions));

    alert(`Session confirmed! RM ${finalTutorNetEarnings.toFixed(2)} has transferred to your dashboard balance (10% platform commission retained).`);
    renderBookings();
    renderWalletDashboard();
    renderEnrichedDashboard();
}

function triggerTuteeCancellation(id, dateStr, timeSlotStr) {
    try {
        const baselineNow = new Date(2026, 5, 10, 0, 24); 
        
        const dateParts = dateStr.split(" ");
        const targetDay = parseInt(dateParts[0]);
        const targetYear = parseInt(dateParts[2]);
        const mNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const targetMonthIndex = mNames.indexOf(dateParts[1]);
        
        let targetHour = parseInt(timeSlotStr.split(":")[0]);
        const targetMinutes = parseInt(timeSlotStr.split(":")[1].split(" ")[0]);
        const markerAmPm = timeSlotStr.split(" ")[1];
        
        if (markerAmPm === "PM" && targetHour < 12) targetHour += 12;
        if (markerAmPm === "AM" && targetHour === 12) targetHour = 0;
        
        const finalSessionDateStruct = new Date(targetYear, targetMonthIndex, targetDay, targetHour, targetMinutes);
        const dynamicDeltaHours = (finalSessionDateStruct - baselineNow) / (1000 * 60 * 60);
        
        if (dynamicDeltaHours < 5) {
            alert(`Cancellation Halted! Session begins in ${dynamicDeltaHours.toFixed(1)} hours. Strict system threshold blocks removals within 5 hours.`);
            return;
        }
        
        if(confirm("Confirm removal of this active scheduled class?")) {
            updateBookingStatus(id, "Cancelled");
        }
    } catch (err) {
        if(confirm("Cancel class booking entry?")) {
            updateBookingStatus(id, "Cancelled");
        }
    }
}

/* =========================================
   MESSAGES WITH STRATIFIED PERSPECTIVE TRACK FILTER
========================================= */
function renderPerspectiveMessagesLayout() {
    const selectorBox = document.getElementById("messagePerspectiveWrapper");
    if(!selectorBox) return;
    
    if(currentUser && currentUser.role === "Tutor") {
        selectorBox.style.display = "flex";
        document.getElementById("perspectiveTutee").classList.toggle("active", currentMessagePerspective === "tutee");
        document.getElementById("perspectiveTutor").classList.toggle("active", currentMessagePerspective === "tutor");
    } else {
        selectorBox.style.display = "none";
        currentMessagePerspective = "tutee";
    }
    
    document.getElementById("chatSidebarContextTitle").textContent = currentMessagePerspective === "tutor" ? "Student Chats" : "Tutor Contacts";
    loadPerspectiveConversations();
}

function setMessagePerspective(mode) {
    currentMessagePerspective = mode;
    renderPerspectiveMessagesLayout();
    
    const activeStreamObject = chatChannels[currentMessagePerspective] || {};
    const primaryId = Object.keys(activeStreamObject)[0];
    switchActiveChat(primaryId ? parseInt(primaryId) : null);
}

function loadPerspectiveConversations() {
    const container = document.getElementById("conversationList");
    if(!container) return;
    container.innerHTML = "";

    const operationalObject = chatChannels[currentMessagePerspective] || {};
    const channelIds = Object.keys(operationalObject);

    if(channelIds.length === 0) {
        container.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted); text-align:center; padding-top:15px;">No active discussions.</p>`;
        return;
    }

    channelIds.forEach(cid => {
        const numId = parseInt(cid);
        const activeClass = numId === activeChatId ? "active" : "";
        const lines = operationalObject[numId] || [];
        const finalSnippet = lines.length > 0 ? lines[lines.length - 1].text : "Empty thread.";
        
        let partnerName = "SkillSwap Peer";
        if(currentMessagePerspective === "tutee") {
            const tutorMatch = tutors.find(t => t.id === numId);
            if(tutorMatch) partnerName = tutorMatch.name;
        } else {
            partnerName = "Incoming Student Inquiry";
        }

        container.innerHTML += `
        <div class="conversation-item ${activeClass}" onclick="switchActiveChat(${numId})">
            <div class="conversation-avatar">${partnerName.substring(0,2).toUpperCase()}</div>
            <div class="conversation-details">
                <h4>${partnerName}</h4>
                <p>${finalSnippet}</p>
            </div>
        </div>
        `;
    });
}

function switchActiveChat(id) {
    activeChatId = id;
    loadPerspectiveConversations();
    renderLiveChatBubbles();
}

function renderLiveChatBubbles() {
    const container = document.getElementById("chatMessages");
    const partnerLabel = document.getElementById("activeChatPartner");
    if(!container) return;
    container.innerHTML = "";

    if(!activeChatId) {
        if(partnerLabel) partnerLabel.textContent = "Select a channel context to review";
        container.innerHTML = `<p style="text-align:center; padding-top:20px; color:var(--text-muted)">No conversational line focus currently active.</p>`;
        return;
    }

    if(partnerLabel) {
        if(currentMessagePerspective === "tutee") {
            const tObj = tutors.find(t => t.id === activeChatId);
            partnerLabel.textContent = tObj ? `Learning Thread: ${tObj.name} (${tObj.skill})` : "Tutor Chat Channel";
        } else {
            partnerLabel.textContent = `Instructional Feedback Track Room #${activeChatId}`;
        }
    }

    const currentPerspectiveBlock = chatChannels[currentMessagePerspective] || {};
    const targetMessagesArray = currentPerspectiveBlock[activeChatId] || [];

    targetMessagesArray.forEach(msg => {
        let isOutgoing = false;
        if(currentMessagePerspective === "tutee" && msg.sender === "Tutee") isOutgoing = true;
        if(currentMessagePerspective === "tutor" && msg.sender === "Tutor") isOutgoing = true;
        
        const alignmentClass = isOutgoing ? "tutee" : "tutor";
        const visualSignature = isOutgoing ? "You" : msg.sender;

        container.innerHTML += `
        <div class="message ${alignmentClass}">
            <strong>${visualSignature}</strong>
            <p>${msg.text}</p>
        </div>
        `;
    });
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById("messageInput");
    if(!input || !activeChatId) return;

    const bodyText = input.value.trim();
    if(bodyText === "") return;

    if(!chatChannels[currentMessagePerspective]) {
        chatChannels[currentMessagePerspective] = {};
    }
    if(!chatChannels[currentMessagePerspective][activeChatId]) {
        chatChannels[currentMessagePerspective][activeChatId] = [];
    }

    const signatureSenderTag = currentMessagePerspective === "tutee" ? "Tutee" : "Tutor";
    chatChannels[currentMessagePerspective][activeChatId].push({ sender: signatureSenderTag, text: bodyText });
    
    localStorage.setItem("chatChannels", JSON.stringify(chatChannels));
    input.value = "";
    
    loadPerspectiveConversations();
    renderLiveChatBubbles();
}

/* =========================================
   WALLET ACCOUNT STATEMENT REDESIGN
========================================= */
function renderWalletDashboard() {
    const balanceElement = document.getElementById("walletBalance");
    if(balanceElement) balanceElement.textContent = `RM ${walletBalance}`;
    
    const escrowEl = document.getElementById("walletPendingEscrow");
    const structuresHoursEl = document.getElementById("walletLifetimeHours");
    
    // Accumulate metrics dynamically based on bookings dataset parameters
    const pendingSessionsCount = bookings.filter(b => b.status === "Accepted" || b.status === "Requested").length;
    if(escrowEl) escrowEl.textContent = `RM ${(pendingSessionsCount * 22.50).toFixed(2)}`; 
    if(structuresHoursEl) structuresHoursEl.textContent = `${(bookings.filter(b => b.status === "Completed").length * 2.0).toFixed(1)} hrs`;

    renderTransactions();
    renderUpcomingPayments();
}

function renderTransactions() {
    const container = document.getElementById("transactionList");
    if(!container) return;
    container.innerHTML = "";

    transactions.forEach(tx => {
        const isIncome = tx.type === "income";
        const prefix = isIncome ? "+" : "-";
        const txClass = isIncome ? "income" : "expense";
        const icon = isIncome ? '<i class="fa-solid fa-arrow-trend-up"></i>' : '<i class="fa-solid fa-arrow-trend-down"></i>';

        container.innerHTML += `
        <div class="feed-item">
            <div class="feed-info">
                <span>${icon} ${tx.desc}</span>
                <d>${tx.date}</d>
            </div>
            <div class="feed-amount ${txClass}">${prefix} RM${tx.amount}</div>
        </div>
        `;
    });
}

/* =========================================
   UPCOMING RUNTIME CHARGES MATRIX
========================================= */
function renderUpcomingPayments() {
    const container = document.getElementById("upcomingPaymentsList");
    if(!container) return;
    container.innerHTML = "";

    const activeUnpaidBookings = bookings.filter(b => b.status === "Accepted" || b.status === "Requested");
    
    if(activeUnpaidBookings.length === 0) {
        container.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted); padding:10px 0; font-style:italic;">No upcoming system session liabilities due.</p>`;
        return;
    }

    activeUnpaidBookings.forEach(p => {
        container.innerHTML += `
        <div class="feed-item">
            <div class="feed-info">
                <span><i class="fa-regular fa-bell"></i> Meet Session with ${p.tutor}</span>
                <d>Schedule: ${p.date} (${p.timeSlot})</d>
            </div>
            <div class="feed-amount due">RM${p.baselinePrice}</div>
        </div>
        `;
    });
}

/* =========================================
   INTERACTIVE CALENDAR CORNER
========================================= */
let currentCalDate = new Date(2026, 5, 1); 
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function renderCalendar() {
    const grid = document.getElementById("calendarDaysGrid");
    const label = document.getElementById("calendarMonthYear");
    if(!grid || !label) return;

    grid.innerHTML = "";
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();

    label.textContent = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for(let i = 0; i < firstDayIndex; i++) {
        grid.innerHTML += `<div class="day-cell empty"></div>`;
    }

    for(let day = 1; day <= totalDays; day++) {
        const formattedDay = day < 10 ? `0${day}` : day;
        const dateComparisonString = `${formattedDay} ${monthNames[month]} ${year}`;
        
        const hasSession = calendarSessions.some(s => s.date === dateComparisonString);
        const sessionClass = hasSession ? "has-session" : "";

        grid.innerHTML += `
            <div class="day-cell ${sessionClass}" id="cal-day-${day}" onclick="selectCalendarDate(${day}, ${month}, ${year})">
                ${day}
            </div>
        `;
    }
}

function selectCalendarDate(day, month, year) {
    document.querySelectorAll(".day-cell").forEach(cell => cell.classList.remove("selected"));
    const targetCell = document.getElementById(`cal-day-${day}`);
    if(targetCell) targetCell.classList.add("selected");

    const formattedDay = day < 10 ? `0${day}` : day;
    const dateComparisonString = `${formattedDay} ${monthNames[month]} ${year}`;
    const dailySessions = calendarSessions.filter(s => s.date === dateComparisonString);
    const panel = document.getElementById("calendarDetailsPanel");
    if(!panel) return;

    if(dailySessions.length === 0) {
        panel.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-calendar-xmark"></i>
                <h3>No Classes Today</h3>
                <p>No tutoring tasks registered on ${day} ${monthNames[month]} ${year}.</p>
            </div>
        `;
    } else {
        let panelHtml = `
            <div class="details-date-header">${monthNames[month]} ${day}, ${year}</div>
            <h3>Scheduled Sessions</h3>
            <div style="overflow-y: auto; flex: 1;">
        `;
        dailySessions.forEach(session => {
            panelHtml += `
                <div class="session-detail-card">
                    <h4><i class="fa-solid fa-graduation-cap"></i> ${session.title}</h4>
                    <p><i class="fa-regular fa-user"></i> <strong>Tutor:</strong> ${session.tutor}</p>
                    <p><i class="fa-regular fa-clock"></i> <strong>Time:</strong> ${session.time}</p>
                    <span class="badge badge-primary">${session.status}</span>
                </div>
            `;
        });
        panelHtml += `</div>`;
        panel.innerHTML = panelHtml;
    }
}

function prevMonth() {
    currentCalDate.setMonth(currentCalDate.getMonth() - 1);
    renderCalendar();
    clearDetailsPanel();
}

function nextMonth() {
    currentCalDate.setMonth(currentCalDate.getMonth() + 1);
    renderCalendar();
    clearDetailsPanel();
}

function clearDetailsPanel() {
    const panel = document.getElementById("calendarDetailsPanel");
    if(panel) {
        panel.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-calendar-day"></i>
                <h3>No Date Selected</h3>
                <p>Click on highlighted dates to view scheduled class times.</p>
            </div>
        `;
    }
}

/* =========================================
   ADMIN REGISTRATION SYSTEM METRICS
========================================= */
function renderAdminStats(){
    const users = document.getElementById("totalUsers");
    const tutorsCount = document.getElementById("totalTutors");
    const bookingsCount = document.getElementById("totalBookings");

    if(users) users.textContent = "384 Registered Stud.";
    if(tutorsCount) tutorsCount.textContent = tutors.length;
    if(bookingsCount) bookingsCount.textContent = bookings.length;
}

/* =========================================
   DOM EVENT INITIALIZATION INTERRUPTS
========================================= */
document.addEventListener("DOMContentLoaded", () => {
    initAppSystem();
    
    const msgInput = document.getElementById("messageInput");
    if(msgInput) {
        msgInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});
