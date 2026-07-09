// =========================================================
// EduTrack Pro — Dashboard
// Fetches /students from the existing Express + MongoDB
// backend and renders the UI. Visual identity matches the
// login page (script.js) — mouse glow, gradient theme —
// plus new signature motion added here.
// =========================================================

const API = "https://student-management-system-ht84.onrender.com/students";
const RING_CIRC = 213.6; // 2 * PI * 34

let students = [];
let editingId = null;

const CHART_COLORS = ["#00c6ff", "#6a11cb", "#00e0a4", "#ffb020", "#ff5c7a", "#9d7bff", "#00b8a9", "#ff8fc7"];

// ---------------------------------------------------------
// Boot
// ---------------------------------------------------------
window.onload = () => {
    startClock();
    initSettings();
    startTyping();
    initMouseGlow();
    initParticles();
    initTiltCards();
    attachRippleToGradientButtons();
    loadStudents();
    wireGlobalEvents();
};

// ---------------------------------------------------------
// Clock
// ---------------------------------------------------------
function startClock(){
    const el = document.getElementById("liveClock");
    if(!el) return;
    const tick = () => {
        const now = new Date();
        el.textContent = now.toLocaleDateString(undefined,{ weekday:'long', month:'long', day:'numeric' })
            + "  •  " + now.toLocaleTimeString();
    };
    tick();
    setInterval(tick, 1000);
}

// ---------------------------------------------------------
// Typing greeting (same effect family as the login hero text)
// ---------------------------------------------------------
function startTyping(){
    const hour = new Date().getHours();
    const name = localStorage.getItem("edutrack_adminName") || "Admin";
    const greeting = hour < 12 ? `Good Morning, ${name}` : hour < 18 ? `Good Afternoon, ${name}` : `Good Evening, ${name}`;
    const el = document.getElementById("greetingText");
    let i = 0;
    (function type(){
        if(i <= greeting.length){
            el.textContent = greeting.slice(0, i);
            i++;
            setTimeout(type, 55);
        }
    })();
}

// ---------------------------------------------------------
// Mouse glow (mirrors login page behaviour)
// ---------------------------------------------------------
function initMouseGlow(){
    const glow = document.getElementById("mouseGlow");
    if(!glow) return;
    document.addEventListener("mousemove", (e) => {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
    });
}

// ---------------------------------------------------------
// Floating particle field — new signature ambience
// ---------------------------------------------------------
function initParticles(){
    const field = document.getElementById("particleField");
    if(!field) return;
    const count = window.innerWidth < 700 ? 14 : 28;

    for(let i = 0; i < count; i++){
        const p = document.createElement("div");
        p.className = "particle";
        const size = 2 + Math.random() * 4;
        p.style.width = size + "px";
        p.style.height = size + "px";
        p.style.left = Math.random() * 100 + "vw";
        p.style.setProperty("--drift", (Math.random() * 80 - 40) + "px");
        const duration = 10 + Math.random() * 14;
        p.style.animationDuration = duration + "s";
        p.style.animationDelay = (Math.random() * duration) + "s";
        field.appendChild(p);
    }
}

// ---------------------------------------------------------
// Tilt / spotlight cards — new signature interaction
// ---------------------------------------------------------
function initTiltCards(){
    document.querySelectorAll(".tilt-card").forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateX = ((y / rect.height) - 0.5) * -10;
            const rotateY = ((x / rect.width) - 0.5) * 10;
            card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            card.style.setProperty("--mx", x + "px");
            card.style.setProperty("--my", y + "px");
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(700px) rotateX(0) rotateY(0) translateY(0)";
        });
    });
}

// ---------------------------------------------------------
// Ripple click effect on gradient buttons — new signature detail
// ---------------------------------------------------------
function attachRippleToGradientButtons(){
    document.querySelectorAll(".btn-gradient").forEach(btn => {
        btn.addEventListener("click", (e) => spawnRipple(btn, e));
    });
}

function spawnRipple(el, e){
    if(!e || typeof e.clientX !== "number") return;
    const rect = el.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
    ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

// ---------------------------------------------------------
// Global UI events
// ---------------------------------------------------------
function wireGlobalEvents(){
    document.getElementById("menuToggle")?.addEventListener("click", () => {
        document.getElementById("sidebar").classList.toggle("show");
    });

    document.querySelectorAll(".nav-list li").forEach(li => {
        li.addEventListener("click", () => handleNav(li));
    });

    let searchTimer;
    document.getElementById("globalSearch").addEventListener("input", function(){
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => applyFilters(), 150);
    });

    document.getElementById("cityFilter").addEventListener("change", applyFilters);
    document.getElementById("courseFilter").addEventListener("change", applyFilters);
    document.getElementById("feeFilter").addEventListener("change", applyFilters);

    ["studentModal","viewModal","confirmModal"].forEach(id => {
        document.getElementById(id).addEventListener("click", (e) => {
            if(e.target.id === id) closeAllModals();
        });
    });

    document.addEventListener("keydown", (e) => {
        if(e.key === "Escape") closeAllModals();
    });

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => renderAnalytics(students), 200);
    });
}

function handleNav(li){
    document.querySelectorAll(".nav-list li").forEach(n => n.classList.remove("active"));
    const target = li.dataset.nav;

    if(target === "logout"){
        localStorage.removeItem("token");
        toast("Signed out — see you soon.", "info", "fa-solid fa-door-open");
        setTimeout(() => window.location.href = "index.html", 700);
        return;
    }

    li.classList.add("active");

    if(target === "dashboard"){
        window.scrollTo({ top:0, behavior:"smooth" });
    } else if(target === "students"){
        document.getElementById("studentsPanel").scrollIntoView({ behavior:"smooth" });
    } else if(target === "analytics"){
        document.getElementById("analyticsPanel").scrollIntoView({ behavior:"smooth" });
    } else if(target === "reports"){
        document.getElementById("reportsPanel").scrollIntoView({ behavior:"smooth" });
    } else if(target === "settings"){
        document.getElementById("settingsPanel").scrollIntoView({ behavior:"smooth" });
    } else {
        toast("This section is coming in the next update.", "info", "fa-solid fa-clock");
    }
}

// ---------------------------------------------------------
// Load + Render
// ---------------------------------------------------------
async function loadStudents(){
    try{
        const res = await fetch(API);
        if(!res.ok) throw new Error("Request failed: " + res.status);
        students = await res.json();
        if(!Array.isArray(students)) students = [];
        populateFilterOptions();
        applyFilters();
    } catch(err){
        console.log(err);
        renderEmpty("The server couldn't be reached. Check that the backend (node index.js) is running on port 5000.");
        toast("Couldn't load students from the server.", "error", "fa-solid fa-plug-circle-xmark");
    }
}

function populateFilterOptions(){
    const cities = [...new Set(students.map(s => s.city).filter(Boolean))].sort();
    const courses = [...new Set(students.map(s => s.course).filter(Boolean))].sort();
    fillSelect("cityFilter", cities, "All Cities");
    fillSelect("courseFilter", courses, "All Courses");
}

function fillSelect(id, values, allLabel){
    const sel = document.getElementById(id);
    const current = sel.value;
    sel.innerHTML = `<option value="">${allLabel}</option>` +
        values.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("");
    if(values.includes(current)) sel.value = current;
}

function applyFilters(){
    const keyword = document.getElementById("globalSearch").value.trim().toLowerCase();
    const city = document.getElementById("cityFilter").value;
    const course = document.getElementById("courseFilter").value;
    const feeStatus = document.getElementById("feeFilter").value;

    let list = students.filter(s => {
        const matchesKeyword = !keyword ||
            (s.name||"").toLowerCase().includes(keyword) ||
            (s.city||"").toLowerCase().includes(keyword) ||
            (s.course||"").toLowerCase().includes(keyword) ||
            (s.email||"").toLowerCase().includes(keyword);

        const matchesCity = !city || s.city === city;
        const matchesCourse = !course || s.course === course;
        const matchesFee = !feeStatus || feeStatusOf(s) === feeStatus;

        return matchesKeyword && matchesCity && matchesCourse && matchesFee;
    });

    renderTable(list);
    updateStats(students);
    renderAnalytics(students);
}

// ---------------------------------------------------------
// Table rendering
// ---------------------------------------------------------
function renderTable(list){
    const body = document.getElementById("studentTable");
    document.getElementById("rowCount").textContent =
        `${list.length} record${list.length === 1 ? "" : "s"}`;

    if(list.length === 0){
        renderEmpty("No students match this search yet.");
        return;
    }

    body.innerHTML = list.map((s, i) => {
        const initials = getInitials(s.name);
        const attendance = Number(s.attendance) || 0;
        const ringColor = attendance >= 75 ? "good" : attendance >= 40 ? "warn" : "risk";
        const fee = feeStatusOf(s);
        const feeTotal = s.fees?.total ?? 0;
        const feePaid = s.fees?.paid ?? 0;

        return `
        <tr style="animation-delay:${Math.min(i * 0.04, 0.4)}s">
            <td>
                <div class="student-cell">
                    <div class="initials">${initials}</div>
                    <div>
                        <span class="student-name">${escapeHtml(s.name || "Unnamed")}</span>
                        <span class="student-email">${escapeHtml(s.email || "no email on file")}</span>
                    </div>
                </div>
            </td>
            <td>${escapeHtml(s.city || "—")}</td>
            <td>${escapeHtml(s.course || "—")}</td>
            <td>
                <div class="attendance-cell">
                    <div class="ring-wrap ring-mini">
                        <svg viewBox="0 0 80 80">
                            <circle class="ring-track" cx="40" cy="40" r="34"></circle>
                            <circle class="ring-progress ${ringColor}" cx="40" cy="40" r="34"
                                stroke-dasharray="${RING_CIRC}"
                                stroke-dashoffset="${RING_CIRC - (RING_CIRC * attendance / 100)}"></circle>
                        </svg>
                    </div>
                    <span>${attendance}%</span>
                </div>
            </td>
            <td>
                <span class="pill ${fee}">${fee}</span>
                <span class="fee-amount">₹${feePaid} / ₹${feeTotal}</span>
            </td>
            <td>
                <div class="row-actions">
                    <button class="icon-action view" title="View" onclick="viewStudent('${s._id}')"><i class="fa-solid fa-eye"></i></button>
                    <button class="icon-action edit" title="Edit" onclick="openEditModal('${s._id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon-action del" title="Delete" onclick="askDelete('${s._id}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
    }).join("");
}

function renderEmpty(message){
    document.getElementById("studentTable").innerHTML = `
        <tr><td colspan="6">
            <div class="empty-state">
                <i class="fa-solid fa-inbox"></i>
                <h3>Nothing here yet</h3>
                <p>${escapeHtml(message)}</p>
            </div>
        </td></tr>`;
    document.getElementById("rowCount").textContent = "0 records";
}

// ---------------------------------------------------------
// Stats
// ---------------------------------------------------------
function updateStats(list){
    countUp("totalStudents", list.length);

    const cities = new Set(list.map(s => s.city).filter(Boolean));
    const courses = new Set(list.map(s => s.course).filter(Boolean));
    countUp("totalCities", cities.size);
    countUp("totalCourses", courses.size);

    let paid = 0, pending = 0, attendanceSum = 0;
    list.forEach(s => {
        const total = Number(s.fees?.total) || 0;
        const p = Number(s.fees?.paid) || 0;
        paid += p;
        pending += Math.max(total - p, 0);
        attendanceSum += Number(s.attendance) || 0;
    });

    document.getElementById("pendingFees").textContent = "₹" + pending.toLocaleString("en-IN");
    document.getElementById("paidFeesNote").textContent = "₹" + paid.toLocaleString("en-IN") + " collected so far";

    const avgAttendance = list.length ? Math.round(attendanceSum / list.length) : 0;
    document.getElementById("avgRingLabel").textContent = avgAttendance + "%";
    const ring = document.getElementById("avgRing");
    ring.setAttribute("stroke-dasharray", RING_CIRC);
    ring.setAttribute("stroke-dashoffset", RING_CIRC - (RING_CIRC * avgAttendance / 100));
    ring.classList.remove("good","warn","risk");
    ring.classList.add(avgAttendance >= 75 ? "good" : avgAttendance >= 40 ? "warn" : "risk");
}

function countUp(id, target){
    const el = document.getElementById(id);
    const start = Number(el.textContent.replace(/[^\d]/g,"")) || 0;
    const duration = 500;
    const startTime = performance.now();

    function step(now){
        const progress = Math.min((now - startTime) / duration, 1);
        const value = Math.round(start + (target - start) * progress);
        el.textContent = value;
        if(progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// ---------------------------------------------------------
// Analytics charts — drawn with plain Canvas 2D, no external
// library, so nothing can fail to load over the network.
// ---------------------------------------------------------
function renderAnalytics(list){
    renderCityChart(list);
    renderCourseChart(list);
    renderAttendanceChart(list);
    renderFeeChart(list);
    renderGenderChart(list);
    renderAdmissionsChart(list);
}

function countBy(list, key){
    const map = {};
    list.forEach(s => {
        const v = s[key] || "Unspecified";
        map[v] = (map[v] || 0) + 1;
    });
    return map;
}

// Sizes a canvas to match its wrapper at the device's pixel
// ratio (crisp on retina) and returns a ready-to-draw context.
function prepCanvas(canvasId){
    const canvas = document.getElementById(canvasId);
    if(!canvas) return null;
    const wrap = canvas.parentElement;
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.max(rect.width, 10) * dpr;
    canvas.height = Math.max(rect.height, 10) * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    return { ctx, w: rect.width, h: rect.height };
}

function drawNoData(ctx, w, h){
    ctx.fillStyle = "rgba(255,255,255,.4)";
    ctx.font = "12.5px Arial";
    ctx.textAlign = "center";
    ctx.fillText("No data yet", w / 2, h / 2);
}

function renderLegend(elId, labels, data, colors){
    const el = document.getElementById(elId);
    if(!el) return;
    el.innerHTML = labels.map((l, i) =>
        `<span><span class="dot" style="background:${colors[i % colors.length]}"></span>${escapeHtml(l)} (${data[i]})</span>`
    ).join("");
}

// ---- Doughnut (City / Fees / Gender) ----
function drawDoughnut(canvasId, legendId, labels, data, colors){
    const p = prepCanvas(canvasId);
    if(!p) return;
    const { ctx, w, h } = p;
    const total = data.reduce((a,b) => a+b, 0);

    if(total === 0){ drawNoData(ctx, w, h); if(legendId) renderLegend(legendId, [], [], []); return; }

    const cx = w/2, cy = h/2;
    const outerR = Math.min(w,h)/2 - 6;
    const innerR = outerR * 0.6;
    let start = -Math.PI/2;

    labels.forEach((label, i) => {
        const slice = (data[i] / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + innerR*Math.cos(start), cy + innerR*Math.sin(start));
        ctx.arc(cx, cy, outerR, start, start + slice, false);
        ctx.arc(cx, cy, innerR, start + slice, start, true);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        start += slice;
    });

    ctx.fillStyle = "#fff";
    ctx.font = "bold 15px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(total, cx, cy);

    if(legendId) renderLegend(legendId, labels, data, colors);
}

// ---- Vertical bar (Course) ----
function drawBarChart(canvasId, labels, data, colors){
    const p = prepCanvas(canvasId);
    if(!p) return;
    const { ctx, w, h } = p;
    if(labels.length === 0){ drawNoData(ctx, w, h); return; }

    const padTop = 18, padBottom = 30, padSide = 10;
    const max = Math.max(...data, 1);
    const chartH = h - padTop - padBottom;
    const barSlot = (w - padSide*2) / labels.length;
    const barW = Math.min(barSlot * 0.55, 46);

    labels.forEach((label, i) => {
        const val = data[i];
        const barH = (val / max) * chartH;
        const x = padSide + i*barSlot + (barSlot - barW)/2;
        const y = padTop + (chartH - barH);

        ctx.fillStyle = colors ? colors[i % colors.length] : "#00c6ff";
        roundRectTop(ctx, x, y, barW, barH, 6);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 11px Arial";
        ctx.textAlign = "center";
        ctx.fillText(val, x + barW/2, y - 6);

        ctx.fillStyle = "rgba(255,255,255,.6)";
        ctx.font = "10px Arial";
        const label2 = label.length > 10 ? label.slice(0,9) + "…" : label;
        ctx.fillText(label2, x + barW/2, h - padBottom + 16);
    });
}

function roundRectTop(ctx, x, y, w, h, r){
    if(h <= 0) h = 0;
    r = Math.min(r, w/2, h/2 || 1);
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
}

// ---- Horizontal bar (Attendance buckets) ----
function drawHBarChart(canvasId, labels, data, colors){
    const p = prepCanvas(canvasId);
    if(!p) return;
    const { ctx, w, h } = p;
    if(labels.length === 0){ drawNoData(ctx, w, h); return; }

    const max = Math.max(...data, 1);
    const rowH = h / labels.length;
    const labelW = 108;
    const trackW = w - labelW - 34;

    labels.forEach((label, i) => {
        const val = data[i];
        const barW = (val / max) * trackW;
        const y = i*rowH + rowH*0.28;
        const barH = rowH*0.44;

        ctx.fillStyle = "rgba(255,255,255,.65)";
        ctx.font = "10.5px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(label, 0, y + barH/2);

        ctx.fillStyle = colors[i % colors.length];
        roundRectRight(ctx, labelW, y, Math.max(barW,3), barH, 6);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 11px Arial";
        ctx.fillText(val, labelW + Math.max(barW,3) + 8, y + barH/2);
    });
}

function roundRectRight(ctx, x, y, w, h, r){
    r = Math.min(r, w/2, h/2 || 1);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x, y + h);
    ctx.closePath();
}

// ---- Line chart (Monthly Admissions) ----
function drawLineChart(canvasId, labels, data){
    const p = prepCanvas(canvasId);
    if(!p) return;
    const { ctx, w, h } = p;
    if(labels.length === 0){ drawNoData(ctx, w, h); return; }

    const padTop = 26, padBottom = 26, padSide = 30;
    const max = Math.max(...data, 1);
    const chartW = w - padSide*2;
    const chartH = h - padTop - padBottom;

    // Single month of data: center it instead of squashing to the left edge
    const stepX = labels.length > 1 ? chartW / (labels.length - 1) : 0;
    const startX = labels.length > 1 ? padSide : w/2;

    const points = data.map((val, i) => ({
        x: startX + i*stepX,
        y: padTop + chartH - (val/max)*chartH
    }));

    if(points.length > 1){
        // Filled area under the line
        ctx.beginPath();
        ctx.moveTo(points[0].x, padTop + chartH);
        points.forEach(pt => ctx.lineTo(pt.x, pt.y));
        ctx.lineTo(points[points.length-1].x, padTop + chartH);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
        grad.addColorStop(0, "rgba(0,198,255,.35)");
        grad.addColorStop(1, "rgba(0,198,255,0)");
        ctx.fillStyle = grad;
        ctx.fill();

        // Line
        ctx.beginPath();
        points.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
        ctx.strokeStyle = "#00c6ff";
        ctx.lineWidth = 2.5;
        ctx.stroke();
    }

    // Points, value labels and month labels
    points.forEach((pt, i) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, points.length === 1 ? 6 : 4, 0, Math.PI*2);
        ctx.fillStyle = "#6a11cb";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#00c6ff";
        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(data[i], pt.x, Math.max(pt.y - 14, 14));

        ctx.fillStyle = "rgba(255,255,255,.6)";
        ctx.font = "10.5px Arial";
        ctx.fillText(labels[i], pt.x, h - padBottom + 16);
    });
}

function renderAdmissionsSummary(labels, data){
    const el = document.getElementById("admissionsLegend");
    if(!el) return;
    const total = data.reduce((a,b) => a+b, 0);
    if(total === 0){ el.innerHTML = ""; return; }
    const peakIndex = data.indexOf(Math.max(...data));
    el.innerHTML = `<span><span class="dot" style="background:#00c6ff"></span>Total admissions: ${total}</span>` +
        `<span><span class="dot" style="background:#6a11cb"></span>Busiest month: ${escapeHtml(labels[peakIndex])} (${data[peakIndex]})</span>`;
}

// ---- Individual chart builders ----
function renderCityChart(list){
    const map = countBy(list, "city");
    drawDoughnut("cityChart", "cityLegend", Object.keys(map), Object.values(map), CHART_COLORS);
}

function renderCourseChart(list){
    const map = countBy(list, "course");
    drawBarChart("courseChart", Object.keys(map), Object.values(map), CHART_COLORS);
}

function renderAttendanceChart(list){
    const buckets = { "Excellent 90-100%": 0, "Good 75-89%": 0, "Average 40-74%": 0, "Low <40%": 0 };
    list.forEach(s => {
        const a = Number(s.attendance) || 0;
        if(a >= 90) buckets["Excellent 90-100%"]++;
        else if(a >= 75) buckets["Good 75-89%"]++;
        else if(a >= 40) buckets["Average 40-74%"]++;
        else buckets["Low <40%"]++;
    });
    drawHBarChart("attendanceChart", Object.keys(buckets), Object.values(buckets), ["#00e0a4","#00c6ff","#ffb020","#ff5c7a"]);
}

function renderFeeChart(list){
    const buckets = { paid: 0, partial: 0, pending: 0 };
    list.forEach(s => { buckets[feeStatusOf(s)]++; });
    drawDoughnut("feeChart", "feeLegend", ["Paid","Partial","Pending"], Object.values(buckets), ["#00e0a4","#ffb020","#ff5c7a"]);
}

function renderGenderChart(list){
    const map = countBy(list, "gender");
    drawDoughnut("genderChart", "genderLegend", Object.keys(map), Object.values(map), CHART_COLORS);
}

// MongoDB ObjectIds embed their creation timestamp in the first 4 bytes,
// so "Monthly Admissions" works without needing an extra admissionDate
// field on the backend.
function monthFromObjectId(id){
    if(!id || id.length < 8) return null;
    const seconds = parseInt(id.substring(0, 8), 16);
    return new Date(seconds * 1000);
}

function renderAdmissionsChart(list){
    const counts = {};
    list.forEach(s => {
        const d = monthFromObjectId(s._id);
        if(!d) return;
        const key = d.toLocaleString(undefined, { month: "short", year: "2-digit" });
        counts[key] = (counts[key] || 0) + 1;
    });

    const sortedKeys = Object.keys(counts).sort((a, b) => {
        const da = new Date("1 " + a.replace("'", " 20"));
        const db = new Date("1 " + b.replace("'", " 20"));
        return da - db;
    });

    drawLineChart("admissionsChart", sortedKeys, sortedKeys.map(k => counts[k]));
    renderAdmissionsSummary(sortedKeys, sortedKeys.map(k => counts[k]));
}

// ---------------------------------------------------------
// Reports — CSV (Excel) export + browser print-to-PDF.
// Both are dependency-free so they can never fail to load.
// ---------------------------------------------------------
function csvEscape(val){
    const s = String(val ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCSV(filename, headers, rows){
    const lines = [headers.join(",")].concat(
        rows.map(row => row.map(csvEscape).join(","))
    );
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast(`${filename} downloaded.`, "success", "fa-solid fa-file-csv");
}

function printReport(title, headers, rows){
    if(rows.length === 0){
        toast("There's nothing to report yet — add some students first.", "info", "fa-solid fa-circle-info");
        return;
    }
    document.getElementById("printTitle").textContent = title;
    document.getElementById("printMeta").textContent =
        `EduTrack Pro  •  Generated ${new Date().toLocaleString()}  •  ${rows.length} record${rows.length === 1 ? "" : "s"}`;
    document.getElementById("printTableHead").innerHTML =
        "<tr>" + headers.map(h => `<th>${escapeHtml(h)}</th>`).join("") + "</tr>";
    document.getElementById("printTableBody").innerHTML =
        rows.map(row => "<tr>" + row.map(c => `<td>${escapeHtml(c)}</td>`).join("") + "</tr>").join("");

    window.print();
}

function exportStudentReportCSV(e){
    const headers = ["Name","Age","Gender","Phone","Email","City","Course","Attendance %","Fees Paid","Fees Total","Fee Status","Remarks"];
    const rows = students.map(s => [
        s.name, s.age, s.gender, s.phone, s.email, s.city, s.course,
        s.attendance ?? 0, s.fees?.paid ?? 0, s.fees?.total ?? 0, feeStatusOf(s), s.remarks
    ]);
    downloadCSV("student_report.csv", headers, rows);
}

function printStudentReport(e){
    const headers = ["Name","City","Course","Attendance %","Fees","Status"];
    const rows = students.map(s => [
        s.name, s.city, s.course, (s.attendance ?? 0) + "%",
        `₹${s.fees?.paid ?? 0} / ₹${s.fees?.total ?? 0}`, feeStatusOf(s)
    ]);
    printReport("Student Report", headers, rows);
}

function exportAttendanceReportCSV(e){
    const headers = ["Name","City","Course","Attendance %","Standing"];
    const rows = students.map(s => {
        const a = Number(s.attendance) || 0;
        const standing = a >= 90 ? "Excellent" : a >= 75 ? "Good" : a >= 40 ? "Average" : "Low";
        return [s.name, s.city, s.course, a, standing];
    });
    downloadCSV("attendance_report.csv", headers, rows);
}

function printAttendanceReport(e){
    const headers = ["Name","City","Course","Attendance %","Standing"];
    const rows = students.map(s => {
        const a = Number(s.attendance) || 0;
        const standing = a >= 90 ? "Excellent" : a >= 75 ? "Good" : a >= 40 ? "Average" : "Low";
        return [s.name, s.city, s.course, a + "%", standing];
    });
    printReport("Attendance Report", headers, rows);
}

function exportFeesReportCSV(e){
    const headers = ["Name","Course","Total Fees","Paid","Pending","Status"];
    const rows = students.map(s => {
        const total = Number(s.fees?.total) || 0;
        const paid = Number(s.fees?.paid) || 0;
        return [s.name, s.course, total, paid, Math.max(total - paid, 0), feeStatusOf(s)];
    });
    downloadCSV("fees_report.csv", headers, rows);
}

function printFeesReport(e){
    const headers = ["Name","Course","Total Fees","Paid","Pending","Status"];
    const rows = students.map(s => {
        const total = Number(s.fees?.total) || 0;
        const paid = Number(s.fees?.paid) || 0;
        return [s.name, s.course, `₹${total}`, `₹${paid}`, `₹${Math.max(total - paid, 0)}`, feeStatusOf(s)];
    });
    printReport("Fees Report", headers, rows);
}

// ---------------------------------------------------------
// Settings — profile, preferences and data management.
// Preferences persist in localStorage; nothing here needs
// a backend endpoint that doesn't already exist.
// ---------------------------------------------------------
function initSettings(){
    const name = localStorage.getItem("edutrack_adminName") || "";
    const email = localStorage.getItem("edutrack_adminEmail") || "";
    document.getElementById("settingName").value = name;
    document.getElementById("settingEmail").value = email;
    updateAvatarInitials(name);

    const reduceMotion = localStorage.getItem("edutrack_reduceMotion") === "1";
    document.getElementById("toggleMotion").checked = reduceMotion;
    document.documentElement.classList.toggle("force-reduced-motion", reduceMotion);

    const notifOff = localStorage.getItem("edutrack_notifOff") === "1";
    document.getElementById("toggleNotif").checked = !notifOff;
    applyNotifDot(!notifOff);
}

function updateAvatarInitials(name){
    const avatar = document.querySelector(".avatar-btn");
    if(avatar) avatar.textContent = name ? getInitials(name).slice(0,2) : "A";
}

function saveAdminProfile(e){
    const name = document.getElementById("settingName").value.trim();
    const email = document.getElementById("settingEmail").value.trim();

    localStorage.setItem("edutrack_adminName", name);
    localStorage.setItem("edutrack_adminEmail", email);

    updateAvatarInitials(name);
    startTyping(); // replay the typing effect with the new name

    toast("Profile saved.", "success", "fa-solid fa-check");
}

function toggleReduceMotion(checked){
    localStorage.setItem("edutrack_reduceMotion", checked ? "1" : "0");
    document.documentElement.classList.toggle("force-reduced-motion", checked);
    toast(checked ? "Animations reduced." : "Animations enabled.", "info", "fa-solid fa-wand-magic-sparkles");
}

function applyNotifDot(show){
    const dot = document.querySelector(".icon-btn .dot");
    if(dot) dot.style.display = show ? "block" : "none";
}

function toggleNotifDot(checked){
    localStorage.setItem("edutrack_notifOff", checked ? "0" : "1");
    applyNotifDot(checked);
}

function downloadBackup(e){
    if(students.length === 0){
        toast("There's nothing to back up yet.", "info", "fa-solid fa-circle-info");
        return;
    }
    const blob = new Blob([JSON.stringify(students, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `edutrack_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Backup downloaded.", "success", "fa-solid fa-database");
}

function askDeleteAll(){
    if(students.length === 0){
        toast("The register is already empty.", "info", "fa-solid fa-circle-info");
        return;
    }
    openConfirm(
        `This will permanently delete <strong>all ${students.length} students</strong> from the register. This can't be undone.`,
        deleteAllStudents
    );
}

async function deleteAllStudents(){
    try{
        await Promise.all(students.map(s => fetch(`${API}/${s._id}`, { method: "DELETE" })));
        toast("All students deleted.", "success", "fa-solid fa-trash-can");
        closeConfirmModal();
        loadStudents();
    } catch(err){
        console.log(err);
        toast("Something went wrong while clearing the register.", "error", "fa-solid fa-triangle-exclamation");
    }
}

// ---------------------------------------------------------
// Modal: Add / Edit
// ---------------------------------------------------------
function openAddModal(e){
    editingId = null;
    document.getElementById("modalTitle").textContent = "Add Student";
    document.getElementById("saveBtnLabel").textContent = "Add Student";
    document.getElementById("studentForm").reset();
    document.getElementById("attendance").value = 0;
    syncAttendanceHint();
    showBackdrop("studentModal");
}

function openEditModal(id){
    const s = students.find(x => x._id === id);
    if(!s) return;
    editingId = id;

    document.getElementById("modalTitle").textContent = "Edit Student";
    document.getElementById("saveBtnLabel").textContent = "Save Changes";

    document.getElementById("name").value = s.name || "";
    document.getElementById("age").value = s.age || "";
    document.getElementById("gender").value = s.gender || "";
    document.getElementById("phone").value = s.phone || "";
    document.getElementById("email").value = s.email || "";
    document.getElementById("course").value = s.course || "";
    document.getElementById("city").value = s.city || "";
    document.getElementById("attendance").value = s.attendance || 0;
    document.getElementById("feesTotal").value = s.fees?.total || "";
    document.getElementById("feesPaid").value = s.fees?.paid || "";
    document.getElementById("remarks").value = s.remarks || "";

    syncAttendanceHint();
    showBackdrop("studentModal");
}

function syncAttendanceHint(){
    document.getElementById("attendanceHint").textContent =
        "— " + document.getElementById("attendance").value + "%";
}

async function saveStudent(e){
    const name = document.getElementById("name").value.trim();
    if(!name){
        toast("A student needs a name before it can be saved.", "error", "fa-solid fa-circle-exclamation");
        return;
    }

    const payload = {
        name,
        age: Number(document.getElementById("age").value) || 0,
        gender: document.getElementById("gender").value,
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        course: document.getElementById("course").value.trim(),
        city: document.getElementById("city").value.trim(),
        attendance: Number(document.getElementById("attendance").value) || 0,
        fees: {
            total: Number(document.getElementById("feesTotal").value) || 0,
            paid: Number(document.getElementById("feesPaid").value) || 0
        },
        remarks: document.getElementById("remarks").value.trim()
    };

    const saveBtn = document.getElementById("saveBtn");
    saveBtn.classList.add("stamping");
    saveBtn.disabled = true;

    try{
        const url = editingId ? `${API}/${editingId}` : API;
        const method = editingId ? "PUT" : "POST";

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if(!res.ok) throw new Error("Save failed: " + res.status);

        toast(editingId ? "Record updated." : "Student added successfully.", "success", "fa-solid fa-check");
        closeModal();
        loadStudents();
    } catch(err){
        console.log(err);
        toast("Couldn't save this record. Please try again.", "error", "fa-solid fa-triangle-exclamation");
    } finally {
        setTimeout(() => { saveBtn.classList.remove("stamping"); saveBtn.disabled = false; }, 450);
    }
}

function closeModal(){
    hideBackdrop("studentModal");
    editingId = null;
}

// ---------------------------------------------------------
// Modal: View
// ---------------------------------------------------------
function viewStudent(id){
    const s = students.find(x => x._id === id);
    if(!s) return;

    document.getElementById("viewInitials").textContent = getInitials(s.name);
    document.getElementById("viewName").textContent = s.name || "Unnamed Student";
    document.getElementById("viewCourse").textContent = s.course || "No course on file";
    document.getElementById("viewAge").textContent = s.age || "—";
    document.getElementById("viewGender").textContent = s.gender || "—";
    document.getElementById("viewPhone").textContent = s.phone || "—";
    document.getElementById("viewEmail").textContent = s.email || "—";
    document.getElementById("viewCity").textContent = s.city || "—";

    const total = s.fees?.total ?? 0;
    const paid = s.fees?.paid ?? 0;
    document.getElementById("viewFees").textContent = `₹${paid} / ₹${total}`;
    document.getElementById("viewRemarks").textContent = s.remarks || "No remarks on file.";

    const attendance = Number(s.attendance) || 0;
    setRing("viewAttRing", "viewAttLabel", attendance);

    const feePct = total > 0 ? Math.round((paid/total)*100) : 0;
    setRing("viewFeeRing", "viewFeeLabel", feePct);

    window.__viewingId = id;
    showBackdrop("viewModal");
}

function editFromView(e){
    const id = window.__viewingId;
    closeViewModal();
    if(id) openEditModal(id);
}

function setRing(ringId, labelId, pct){
    const ring = document.getElementById(ringId);
    ring.setAttribute("stroke-dasharray", RING_CIRC);
    ring.setAttribute("stroke-dashoffset", RING_CIRC - (RING_CIRC * Math.min(pct,100) / 100));
    ring.classList.remove("good","warn","risk");
    ring.classList.add(pct >= 75 ? "good" : pct >= 40 ? "warn" : "risk");
    document.getElementById(labelId).textContent = pct + "%";
}

function closeViewModal(){ hideBackdrop("viewModal"); }

// ---------------------------------------------------------
// Delete
// ---------------------------------------------------------
let confirmAction = null;

function openConfirm(message, actionFn){
    document.getElementById("confirmMessage").innerHTML = message;
    confirmAction = actionFn;
    showBackdrop("confirmModal");
}

function runConfirmedAction(){
    if(confirmAction) confirmAction();
}

function askDelete(id){
    const s = students.find(x => x._id === id);
    openConfirm(
        `This will permanently delete <strong>${escapeHtml(s ? s.name : "this student")}</strong> from the list. This can't be undone.`,
        () => deleteOneStudent(id)
    );
}

function closeConfirmModal(){
    hideBackdrop("confirmModal");
    confirmAction = null;
}

async function deleteOneStudent(id){
    try{
        const res = await fetch(`${API}/${id}`, { method: "DELETE" });
        if(!res.ok) throw new Error("Delete failed: " + res.status);
        toast("Record removed.", "success", "fa-solid fa-trash-can");
        closeConfirmModal();
        loadStudents();
    } catch(err){
        console.log(err);
        toast("Couldn't delete this record.", "error", "fa-solid fa-triangle-exclamation");
    }
}

// ---------------------------------------------------------
// Modal helpers
// ---------------------------------------------------------
function showBackdrop(id){ document.getElementById(id).style.display = "flex"; }
function hideBackdrop(id){ document.getElementById(id).style.display = "none"; }
function closeAllModals(){
    ["studentModal","viewModal","confirmModal"].forEach(hideBackdrop);
    editingId = null;
    confirmAction = null;
}

// ---------------------------------------------------------
// Utilities
// ---------------------------------------------------------
function feeStatusOf(s){
    const total = Number(s.fees?.total) || 0;
    const paid = Number(s.fees?.paid) || 0;
    if(total === 0) return "pending";
    if(paid >= total) return "paid";
    if(paid > 0) return "partial";
    return "pending";
}

function getInitials(name){
    if(!name) return "??";
    return name.trim().split(/\s+/).slice(0,2).map(w => w[0]?.toUpperCase()).join("");
}

function escapeHtml(str){
    return String(str ?? "").replace(/[&<>"']/g, m => ({
        "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    }[m]));
}

// ---------------------------------------------------------
// Toasts
// ---------------------------------------------------------
function toast(message, type = "success", icon = "fa-solid fa-check"){
    const stack = document.getElementById("toastStack");
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="${icon}"></i><span>${escapeHtml(message)}</span>`;
    stack.appendChild(el);
    setTimeout(() => el.remove(), 3600);
}
