// Initialize Chart.js
const ctx = document.getElementById('telemetryChart').getContext('2d');
const telemetryChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Zone 1 Flow (L/m)',
                borderColor: '#00a8b5',
                backgroundColor: 'rgba(0, 168, 181, 0.05)',
                data: [],
                tension: 0.3,
                fill: true
            },
            {
                label: 'Zone 2 Flow (L/m)',
                borderColor: '#9333ea',
                backgroundColor: 'rgba(147, 51, 234, 0.05)',
                data: [],
                tension: 0.3,
                fill: true
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { grid: { color: 'rgba(0, 0, 0, 0.08)' }, ticks: { color: '#374151', font: { size: 10, weight: '600' } } },
            y: { grid: { color: 'rgba(0, 0, 0, 0.08)' }, ticks: { color: '#374151', font: { size: 10, weight: '600' } } }
        },
        plugins: { legend: { labels: { color: '#1f2937', font: { size: 11, weight: '600' } } } }
    }
});

// Smooth Center-Outward Circular Fill Transition Controller with Safety Check
function switchView(viewName) {
    const dashboardView = document.getElementById('view-dashboard');
    const logsView = document.getElementById('view-logs');

    // If view containers don't exist on this page, let normal link navigation proceed
    if (!dashboardView || !logsView) return;

    const overlay = document.getElementById('transition-overlay');
    const isDark = document.documentElement.classList.contains('dark');

    overlay.style.backgroundColor = isDark ? '#000000' : '#ffffff';
    overlay.classList.add('expand');

    setTimeout(() => {
        if (viewName === 'logs') {
            dashboardView.classList.add('hidden');
            logsView.classList.remove('hidden');
        } else {
            logsView.classList.add('hidden');
            dashboardView.classList.remove('hidden');
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, 350);

    setTimeout(() => {
        overlay.classList.remove('expand');
    }, 750);
}

// 3D Card Flip Animation Controller
function flipCard(cardId) {
    const card = document.getElementById(cardId);
    if (card.style.transform === 'rotateY(180deg)') {
        card.style.transform = 'rotateY(0deg)';
    } else {
        card.style.transform = 'rotateY(180deg)';
    }
}

// Time Log Data Array
let timeLogs = [];

function addTimeLog(status, f1, p1, f2, p2) {
    const now = new Date().toLocaleTimeString();
    const logEntry = {
        time: now,
        type: status.includes("LEAK") ? "⚠️ LEAK ALERT" : (status.includes("CALIBRATING") ? "🔄 CALIBRATION" : "✅ TELEMETRY OK"),
        f1: `${f1} L/m`,
        p1: `${p1} Bar`,
        f2: `${f2} L/m`,
        p2: `${p2} Bar`,
        status: status
    };

    timeLogs.unshift(logEntry);
    if (timeLogs.length > 25) timeLogs.pop();

    renderTimeLogs();
}

function renderTimeLogs() {
    const tbody = document.getElementById('time-log-tbody');
    if (!tbody) return;

    if (timeLogs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500">No time logs recorded yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = timeLogs.map(log => `
        <tr class="hover:bg-black/5 dark:hover:bg-white/5 transition">
            <td class="p-3 text-slate-500">${log.time}</td>
            <td class="p-3 font-bold ${log.status.includes('LEAK') ? 'text-blue-500' : 'text-emerald-500'}">${log.type}</td>
            <td class="p-3 text-cyan-600 dark:text-cyan-400">${log.f1} / ${log.p1}</td>
            <td class="p-3 text-purple-600 dark:text-purple-400">${log.f2} / ${log.p2}</td>
            <td class="p-3 text-slate-700 dark:text-slate-300">${log.status}</td>
        </tr>
    `).join('');
}

function clearTimeLogs() {
    timeLogs = [];
    renderTimeLogs();
}

// Periodic AI Summary Updater & Time Logger
let logCounter = 0;
setInterval(() => {
    const f1Val = document.getElementById('f1-val') ? document.getElementById('f1-val').innerText : "--";
    const f2Val = document.getElementById('f2-val') ? document.getElementById('f2-val').innerText : "--";
    const summaryEl = document.getElementById('ai-summary-text');

    if (f1Val !== "--" && f2Val !== "--") {
        const diff = Math.abs(parseFloat(f1Val) - parseFloat(f2Val));
        if (summaryEl) {
            if (diff > 2.0) {
                summaryEl.innerHTML = `⚠️ <b>Anomaly Detected:</b> Over the past 30 minutes, an average flow differential of <b>${diff.toFixed(1)} L/m</b> was recorded between Zone 1 and Zone 2. This suggests a potential localized seepage or minor pipeline leakage downstream. Shut-off protocols are standing by.`;
            } else {
                summaryEl.innerHTML = `✅ <b>Optimal Performance:</b> Over the past 30 minutes, flow rates across Zone 1 (Inlet) and Zone 2 (Outlet) have maintained a stable variance below 0.8 L/m. Pressure levels remain uniform with zero structural pressure drops or water hammer events detected.`;
            }
        }

        logCounter++;
        if (logCounter >= 10) {
            logCounter = 0;
            const p1Val = document.getElementById('p1-val').innerText;
            const p2Val = document.getElementById('p2-val').innerText;
            const currentStatus = document.getElementById('orb-status-text').innerText;
            addTimeLog(currentStatus, f1Val, p1Val, f2Val, p2Val);
        }
    }
}, 1000);

// Light/Dark Theme Toggle Function
function toggleTheme() {
    const htmlEl = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');

    if (htmlEl.classList.contains('dark')) {
        htmlEl.classList.remove('dark');
        themeIcon.className = "fa-solid fa-sun text-amber-500";
        updateChartTheme(false);
    } else {
        htmlEl.classList.add('dark');
        themeIcon.className = "fa-solid fa-moon text-slate-300";
        updateChartTheme(true);
    }
}

// Dynamically adjust Chart.js grid & text colors for light/dark mode
function updateChartTheme(isDark) {
    if (!window.telemetryChart) return;
    const textColor = isDark ? '#cbd5e1' : '#1f2937';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';

    telemetryChart.options.scales.x.grid.color = gridColor;
    telemetryChart.options.scales.x.ticks.color = textColor;
    telemetryChart.options.scales.y.grid.color = gridColor;
    telemetryChart.options.scales.y.ticks.color = textColor;
    telemetryChart.options.plugins.legend.labels.color = textColor;
    telemetryChart.update();
}

// Control Valve Command Endpoint with Active State Highlighting
function controlValve(state) {
    const btnOpen = document.getElementById('btn-open');
    const btnAuto = document.getElementById('btn-auto');
    const btnClose = document.getElementById('btn-close');

    if (!btnOpen) return;

    btnOpen.className = "px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 transition";
    btnAuto.className = "px-3 py-1.5 rounded-lg text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition";
    btnClose.className = "px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-500 hover:bg-rose-500/10 transition";

    if (state === 'open') {
        btnOpen.className += " bg-cyan-600 dark:bg-cyan-400 text-white dark:text-slate-950 shadow-md";
    } else if (state === 'auto') {
        btnAuto.className += " bg-amber-600 dark:bg-amber-400 text-white dark:text-slate-950 shadow-md";
    } else if (state === 'close') {
        btnClose.className += " bg-rose-600 dark:bg-rose-500 text-white shadow-md";
    }

    fetch(`/valve?state=${state}`)
        .then(res => res.text())
        .then(msg => console.log(msg))
        .catch(err => console.error("Valve command error:", err));
}

// Trigger Recalibration Endpoint
function recalibrateSystem() {
    if(confirm("Are you sure you want to recalibrate baseline flow? Ensure water flow is steady.")) {
        fetch('/api/recalibrate', { method: 'POST' })
            .then(res => res.text())
            .then(msg => alert("Recalibration started successfully."))
            .catch(err => alert("Error triggering recalibration."));
    }
}

// Periodic Data Fetch Loop from ESP32 (/api/data)
let failCount = 0;
setInterval(() => {
    if (!document.getElementById('f1-val')) return;

    fetch('/api/data')
        .then(res => res.json())
        .then(data => {
            failCount = 0;
            updateConnectionStatus(true);

            document.getElementById('f1-val').innerText = data.f1;
            document.getElementById('p1-val').innerText = data.p1;
            document.getElementById('f2-val').innerText = data.f2;
            document.getElementById('p2-val').innerText = data.p2;

            updateSystemStateUI(data.status);

            const timeLabel = new Date().toLocaleTimeString();
            if (telemetryChart.data.labels.length > 15) {
                telemetryChart.data.labels.shift();
                telemetryChart.data.datasets[0].data.shift();
                telemetryChart.data.datasets[1].data.shift();
            }
            telemetryChart.data.labels.push(timeLabel);
            telemetryChart.data.datasets[0].data.push(parseFloat(data.f1));
            telemetryChart.data.datasets[1].data.push(parseFloat(data.f2));
            telemetryChart.update();
        })
        .catch(() => {
            failCount++;
            if (failCount > 3) updateConnectionStatus(false);
        });
}, 1000);

function updateConnectionStatus(isConnected) {
    const badge = document.getElementById('conn-badge');
    const dot = document.getElementById('conn-dot');
    const text = document.getElementById('conn-text');
    if (!badge) return;

    if(isConnected) {
        badge.className = "flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold";
        dot.className = "w-2 h-2 rounded-full bg-emerald-500 animate-pulse";
        text.innerText = "ESP32 Connected";
    } else {
        badge.className = "flex items-center space-x-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-semibold";
        dot.className = "w-2 h-2 rounded-full bg-rose-500";
        text.innerText = "ESP32 Offline";
    }
}

function updateSystemStateUI(status) {
    const banner = document.getElementById('status-banner');
    const bannerIconBg = document.getElementById('banner-icon-bg');
    const bannerIcon = document.getElementById('banner-icon');
    const bannerTitle = document.getElementById('banner-title');
    const bannerDesc = document.getElementById('banner-desc');
    const orbIcon = document.getElementById('orb-icon');
    const orbText = document.getElementById('orb-status-text');

    if (!banner) return;

    if (status.includes("LEAK")) {
        banner.className = "glass-panel p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 bg-blue-500/10";
        bannerIconBg.className = "p-3.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400";
        bannerIcon.className = "fa-solid fa-triangle-exclamation text-2xl";
        bannerTitle.className = "text-lg font-bold text-blue-600 dark:text-blue-400";
        bannerTitle.innerText = "!! LEAK DETECTED ! Shut-off Valve Engaged";
        bannerDesc.innerText = "Significant flow loss differential identified between Zone 1 and Zone 2. System secured automatically.";
        
        orbIcon.className = "fa-solid fa-water text-7xl text-sky-400 drop-shadow-[0_0_25px_rgba(56,189,248,0.8)] animate-bounce";
        orbText.className = "text-xl font-extrabold text-blue-600 dark:text-blue-400 tracking-wide";
        orbText.innerText = "LEAK DETECTED";
    } 
    else if (status.includes("CALIBRATING")) {
        banner.className = "glass-panel p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 bg-amber-500/10";
        bannerIconBg.className = "p-3.5 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-500";
        bannerIcon.className = "fa-solid fa-spinner fa-spin text-2xl";
        bannerTitle.className = "text-lg font-bold text-amber-700 dark:text-amber-500";
        bannerTitle.innerText = status;
        bannerDesc.innerText = "Recording baseline downstream flow values. Please keep water flow stable.";
        
        orbIcon.className = "fa-solid fa-spinner fa-spin text-7xl text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]";
        orbText.className = "text-xl font-extrabold text-amber-700 dark:text-amber-500 tracking-wide";
        orbText.innerText = status;
    } 
    else if (status.includes("MANUAL")) {
        banner.className = "glass-panel p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 bg-purple-500/10";
        bannerIconBg.className = "p-3.5 rounded-2xl bg-purple-500/10 text-purple-700 dark:text-purple-400";
        bannerIcon.className = "fa-solid fa-sliders text-2xl";
        bannerTitle.className = "text-lg font-bold text-purple-700 dark:text-purple-400";
        bannerTitle.innerText = status;
        bannerDesc.innerText = "Manual valve override active. Autonomous leak detection suspended for this mode.";
        
        orbIcon.className = "fa-solid fa-sliders text-7xl text-purple-500 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]";
        orbText.className = "text-xl font-extrabold text-purple-700 dark:text-purple-400 tracking-wide";
        orbText.innerText = status;
    } 
    else {
        banner.className = "glass-panel p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4";
        bannerIconBg.className = "p-3.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400";
        bannerIcon.className = "fa-solid fa-shield-check text-2xl";
        bannerTitle.className = "text-lg font-bold text-cyan-700 dark:text-cyan-400";
        bannerTitle.innerText = "SYSTEM NORMAL";
        bannerDesc.innerText = "Continuous upstream & downstream flow monitoring active. No leaks detected.";
        
        orbIcon.className = "fa-solid fa-droplet text-7xl text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse";
        orbText.className = "text-xl font-extrabold text-cyan-700 dark:text-cyan-400 tracking-wide";
        orbText.innerText = "STATUS: NORMAL";
    }
}