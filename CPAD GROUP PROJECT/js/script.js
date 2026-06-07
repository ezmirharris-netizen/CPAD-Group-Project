/* =========================================
   PAGE NAVIGATION
========================================= */

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.add("hidden");
    });
    
    document.getElementById(pageId).classList.remove("hidden");

    document.querySelectorAll(".sidebar button").forEach(btn => {
        btn.classList.remove("active");
        if(btn.getAttribute("onclick").includes(pageId)) {
            btn.classList.add("active");
        }
    });
}


/* =========================================
   MOCK DATA STORE
========================================= */

const tutors = [
    {
        id: 1,
        name: "John Tan",
        faculty: "Computer Science",
        rating: 4.9,
        skill: "Vue.js",
        price: 25,
        bio: "Senior Frontend Engineer with 4+ years of industrial experience. Specializes in single-page applications, advanced component configurations, and state management via Pinia/Vuex.",
        reviews: [
            { tutee: "Ahmad Zain", rating: 5.0, comment: "Excellent explanation of state management patterns! Helped me clear my project blockers immediately." },
            { tutee: "Chloe Low", rating: 4.8, comment: "Very patient. He helped me map out complex Vue Routing parameters clearly." }
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
        reviews: [
            { tutee: "Darren Ng", rating: 5.0, comment: "Calculus used to terrify me, but Sarah breaks derivatives down into basic elements so well!" },
            { tutee: "Farah Idris", rating: 4.6, comment: "Super structured session. The mock review sheets she prepared were top tier." }
        ]
    },
    {
        id: 3,
        name: "Amir Hakim",
        faculty: "Software Engineering",
        rating: 5.0,
        skill: "Java",
        price: 30,
        bio: "Enterprise Developer focused on systemic architecture. Teaches object-oriented design patterns, complex multi-threaded software construction, data structures, and algorithms.",
        reviews: [
            { tutee: "Kevin Voon", rating: 5.0, comment: "Unbelievable depth of knowledge. His explanation of memory management leaks changed my approach entirely." },
            { tutee: "Siti Aminah", rating: 5.0, comment: "Highly responsive tutor. Understood exactly where my syntax logic was failing." }
        ]
    }
];

let bookings = JSON.parse(localStorage.getItem("bookings")) || [
    { id: 101, tutor: "Sarah Lim", skill: "Calculus", status: "Accepted", date: "08 June 2026" },
    { id: 102, tutor: "Amir Hakim", skill: "Java OOP", status: "Completed", date: "03 June 2026" },
    { id: 103, tutor: "John Tan", skill: "Vue.js Setup", status: "Requested", date: "12 June 2026" }
];

let chatChannels = JSON.parse(localStorage.getItem("chatChannels")) || {
    1: [
        { sender: "Tutor", text: "Hey there! Ready for our next Vue.js development session?" },
        { sender: "Tutee", text: "Yes! I finished configuring the router file we discussed." }
    ],
    2: [
        { sender: "Tutor", text: "Don't forget to practice the integration worksheet before Tuesday." }
    ],
    3: [
        { sender: "Tutee", text: "Hi Amir, can you explain garbage collection mechanisms tomorrow?" },
        { sender: "Tutor", text: "Absolutely. Let's trace memory leaks together during the live share." }
    ]
};
let activeChatTutorId = 1;

let walletBalance = JSON.parse(localStorage.getItem("walletBalance")) || 185;

let transactions = JSON.parse(localStorage.getItem("transactions")) || [
    { id: 1, type: "income", amount: 200, desc: "Tutoring payout received (UI Design Help)", date: "02 June 2026" },
    { id: 2, type: "expense", amount: 25, desc: "Paid John Tan for Lesson #3 (Vue.js)", date: "04 June 2026" },
    { id: 3, type: "income", amount: 50, desc: "Refund issued for cancelled session", date: "05 June 2026" },
    { id: 4, type: "expense", amount: 40, desc: "Paid Amir Hakim for Lesson #1 (Java)", date: "06 June 2026" }
];

let upcomingPayments = JSON.parse(localStorage.getItem("upcomingPayments")) || [
    { id: 501, amount: 20, desc: "Calculus Session with Sarah Lim", date: "08 June 2026" },
    { id: 502, amount: 25, desc: "Vue.js Revision with John Tan", date: "12 June 2026" }
];

/* Rich Itemized Mock Calendars Database Array */
const calendarSessions = [
    { date: "08 June 2026", title: "Advanced Calculus Limits", tutor: "Sarah Lim", time: "10:00 AM - 12:00 PM", status: "Accepted" },
    { date: "12 June 2026", title: "Vue.js Router Setup Config", tutor: "John Tan", time: "03:00 PM - 05:00 PM", status: "Requested" },
    { date: "20 June 2026", title: "Vue.js Single Page Optimization", tutor: "John Tan", time: "01:00 PM - 03:00 PM", status: "Confirmed" },
    { date: "25 June 2026", title: "Java Architecture Inheritances", tutor: "Amir Hakim", time: "04:30 PM - 06:30 PM", status: "Confirmed" }
];


/* =========================================
   MARKETPLACE & PROFILE INTEGRATION
========================================= */

function renderTutors(list = tutors) {
    const container = document.getElementById("tutorGrid");
    if(!container) return;
    container.innerHTML = "";
    
    list.forEach(tutor => {
        const initials = tutor.name.split(' ').map(n => n[0]).join('');
        container.innerHTML += `
        <div class="tutor-card">
            <div class="avatar">${initials}</div>
            <h3>${tutor.name}</h3>
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

    const initials = tutor.name.split(' ').map(n => n[0]).join('');
    document.getElementById("modalProfileAvatar").textContent = initials;
    document.getElementById("modalProfileName").textContent = tutor.name;
    document.getElementById("modalProfileFaculty").textContent = tutor.faculty;
    document.getElementById("modalProfileSkill").textContent = tutor.skill;
    document.getElementById("modalProfilePrice").textContent = `RM ${tutor.price} / hour`;
    document.getElementById("modalProfileBio").textContent = tutor.bio;

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
        reviewsFeed.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">No feedback left for this profile yet.</p>`;
    }

    localStorage.setItem("selectedTutor", JSON.stringify(tutor));
    document.getElementById("tutorProfileModal").classList.remove("hidden");
}

function closeProfileModal() {
    document.getElementById("tutorProfileModal").classList.add("hidden");
}

function handleBackdropClick(event) {
    if (event.target.id === "tutorProfileModal") {
        closeProfileModal();
    }
}

function createBookingFromModal() {
    closeProfileModal();
    createBooking();
}


/* =========================================
   BOOKINGS MANAGEMENT
========================================= */

function createBooking() {
    const tutor = JSON.parse(localStorage.getItem("selectedTutor"));
    if(!tutor) {
        alert("Please browse and select a tutor from the Marketplace first.");
        return;
    }

    const booking = {
        id: Date.now(),
        tutor: tutor.name,
        skill: tutor.skill,
        status: "Requested",
        date: new Date().toLocaleDateString('en-GB')
    };

    bookings.unshift(booking);
    localStorage.setItem("bookings", JSON.stringify(bookings));
    renderBookings();
    
    alert(`Booking application sent to ${tutor.name}!`);
    showPage("booking");
}

function renderBookings() {
    const container = document.getElementById("bookingList");
    if(!container) return;
    container.innerHTML = "";

    bookings.forEach(booking => {
        let statusClass = "";
        let badgeStyle = "badge-warning";
        
        if (booking.status === "Accepted" || booking.status === "Confirmed") {
            statusClass = "accepted";
            badgeStyle = "badge-primary";
        } else if (booking.status === "Completed") {
            statusClass = "completed";
            badgeStyle = "badge-success";
        }

        container.innerHTML += `
        <div class="card booking-item ${statusClass}">
            <div class="booking-info">
                <h3>${booking.tutor}</h3>
                <p><i class="fa-solid fa-book-open-reader"></i> ${booking.skill} &nbsp;|&nbsp; <i class="fa-regular fa-clock"></i> ${booking.date}</p>
            </div>
            <div class="booking-actions">
                <span class="badge ${badgeStyle}">${booking.status}</span>
                ${booking.status === 'Requested' ? `<button class="btn-outline" onclick="updateBookingStatus(${booking.id}, 'Accepted')">Accept</button>` : ''}
                ${booking.status === 'Accepted' ? `<button onclick="updateBookingStatus(${booking.id}, 'Completed')">Complete Session</button>` : ''}
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
}


/* =========================================
   MULTI-CHANNEL MESSAGES
========================================= */

function renderConversations() {
    const container = document.getElementById("conversationList");
    if(!container) return;
    container.innerHTML = "";

    tutors.forEach(tutor => {
        const initials = tutor.name.split(' ').map(n => n[0]).join('');
        const activeClass = tutor.id === activeChatTutorId ? "active" : "";
        const channelMsgs = chatChannels[tutor.id] || [];
        const lastMsg = channelMsgs.length > 0 ? channelMsgs[channelMsgs.length - 1].text : "No messages yet...";

        container.innerHTML += `
        <div class="conversation-item ${activeClass}" onclick="switchActiveChat(${tutor.id})">
            <div class="conversation-avatar">${initials}</div>
            <div class="conversation-details">
                <h4>${tutor.name}</h4>
                <p>${lastMsg}</p>
            </div>
        </div>
        `;
    });
}

function switchActiveChat(tutorId) {
    activeChatTutorId = tutorId;
    const targetTutor = tutors.find(t => t.id === tutorId);
    document.getElementById("activeChatPartner").textContent = `Chatting with: ${targetTutor.name} (${targetTutor.skill})`;
    
    renderConversations();
    renderMessages();
}

function renderMessages() {
    const container = document.getElementById("chatMessages");
    if(!container) return;
    container.innerHTML = "";

    const activeMsgs = chatChannels[activeChatTutorId] || [];
    
    if(activeMsgs.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding-top:20px; color:var(--text-muted)">Start a new connection thread with this tutor.</p>`;
        return;
    }

    activeMsgs.forEach(msg => {
        const senderType = msg.sender.toLowerCase() === "tutee" ? "tutee" : "tutor";
        const displayName = msg.sender.toLowerCase() === "tutee" ? "You (Tutee)" : msg.sender;
        
        container.innerHTML += `
        <div class="message ${senderType}">
            <strong>${displayName}</strong>
            <p>${msg.text}</p>
        </div>
        `;
    });
    
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById("messageInput");
    if(!input) return;

    const text = input.value.trim();
    if(text === "") return;

    if(!chatChannels[activeChatTutorId]) {
        chatChannels[activeChatTutorId] = [];
    }

    chatChannels[activeChatTutorId].push({ sender: "Tutee", text: text });
    localStorage.setItem("chatChannels", JSON.stringify(chatChannels));
    input.value = "";
    
    renderConversations();
    renderMessages();
}


/* =========================================
   WALLET ACCOUNT MANAGEMENT
========================================= */

function renderWalletDashboard() {
    const balanceElement = document.getElementById("walletBalance");
    if(balanceElement) balanceElement.textContent = `RM ${walletBalance}`;

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

function renderUpcomingPayments() {
    const container = document.getElementById("upcomingPaymentsList");
    if(!container) return;
    container.innerHTML = "";

    upcomingPayments.forEach(p => {
        container.innerHTML += `
        <div class="feed-item">
            <div class="feed-info">
                <span><i class="fa-regular fa-bell"></i> ${p.desc}</span>
                <d>Due Date: ${p.date}</d>
            </div>
            <div class="feed-amount due">RM${p.amount}</div>
        </div>
        `;
    });
}


/* =========================================
   INTERACTIVE SCHEDULE CALENDAR ENGINE
========================================= */

let currentCalDate = new Date(2026, 5, 1); // June 2026 Baseline
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function renderCalendar() {
    const grid = document.getElementById("calendarDaysGrid");
    const label = document.getElementById("calendarMonthYear");
    if(!grid || !label) return;

    grid.innerHTML = "";
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();

    label.textContent = `${monthNames[month]} ${year}`;

    // Compute gaps up to the start weekday
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for(let i = 0; i < firstDayIndex; i++) {
        grid.innerHTML += `<div class="day-cell empty"></div>`;
    }

    // Populate day intervals
    for(let day = 1; day <= totalDays; day++) {
        const formattedDay = day < 10 ? `0${day}` : day;
        const formattedMonth = (month + 1) < 10 ? `0${month + 1}` : (month + 1);
        
        // Match string formatting schema: "DD Month YYYY"
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
    // Clear selected flags across cells
    document.querySelectorAll(".day-cell").forEach(cell => cell.classList.remove("selected"));
    
    const targetCell = document.getElementById(`cal-day-${day}`);
    if(targetCell) targetCell.classList.add("selected");

    const formattedDay = day < 10 ? `0${day}` : day;
    const dateComparisonString = `${formattedDay} ${monthNames[month]} ${year}`;
    
    // Filter matching session items
    const dailySessions = calendarSessions.filter(s => s.date === dateComparisonString);
    const panel = document.getElementById("calendarDetailsPanel");
    if(!panel) return;

    if(dailySessions.length === 0) {
        panel.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-calendar-xmark"></i>
                <h3>No Classes Today</h3>
                <p>There are no tutoring classes or scheduled sessions for ${day} ${monthNames[month]} ${year}.</p>
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
                <p>Click on any highlighted calendar cell to inspect tuition class timings and tutor details.</p>
            </div>
        `;
    }
}


/* =========================================
   ADMIN STATS DISPLAY
========================================= */

function renderAdminStats(){
    const users = document.getElementById("totalUsers");
    const tutorsCount = document.getElementById("totalTutors");
    const bookingsCount = document.getElementById("totalBookings");

    if(users) users.textContent = 250;
    if(tutorsCount) tutorsCount.textContent = tutors.length;
    if(bookingsCount) bookingsCount.textContent = bookings.length;
}


/* =========================================
   INITIALIZATION TRIGGER
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    renderTutors();
    renderBookings();
    switchActiveChat(1);
    renderWalletDashboard();
    renderCalendar();
    renderAdminStats();
    
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