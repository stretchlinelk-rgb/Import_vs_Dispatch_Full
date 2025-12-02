// ============================================
// Full script.js - updated to ensure Merge YD into CP does NOT change global totals.
// Includes global field visibility toggles and the full app logic.
// ============================================

// ============================================
// STATE & DEFAULT DATA (plantData with defaults)
// ============================================

let editingMonthKey = null;
let mergeYD = false; // when true YD is merged into CP (3-plant view)

// Global field visibility (GRN is always enabled)
let fieldEnabled = {
    import: true,
    dispatched: true,
    export: true,
    wasteCusde: true,
    wasteAct: true
};

// Load persisted field visibility if present
try {
    const savedFields = localStorage.getItem('fieldEnabled');
    if (savedFields) {
        const parsed = JSON.parse(savedFields);
        fieldEnabled = { ...fieldEnabled, ...parsed };
    }
} catch (e) {
    console.warn('Could not parse saved fieldEnabled:', e);
}

// Load persisted mergeYD if present
try {
    const savedMerge = localStorage.getItem('mergeYD');
    if (savedMerge !== null) mergeYD = savedMerge === 'true';
} catch (e) {
    console.warn('Could not read mergeYD from storage', e);
}

// Default plant data (EP1 / EP2 / CP / YD)
// NOTE: these are the datasets you provided (kept as defaults)
let plantData = {
    ep1: [
        { year: 2025, month: 1, grn: 121569.00, import: 254551.00, dispatched: 152250.90, export: 30846.05, wasteCusde: 14922.00, wasteAct: 28872.00, enabled: true },
        { year: 2025, month: 2, grn: 206773.00, import: 75466.00, dispatched: 120943.92, export: 40975.49, wasteCusde: 3000.00, wasteAct: 15690.00, enabled: true },
        { year: 2025, month: 3, grn: 120411.00, import: 189414.00, dispatched: 125022.07, export: 34058.45, wasteCusde: 2000.00, wasteAct: 10555.00, enabled: true },
        { year: 2025, month: 4, grn: 418.00, import: 41568.00, dispatched: 60448.51, export: 14419.75, wasteCusde: 50012.00, wasteAct: 79002.00, enabled: true },
        { year: 2025, month: 5, grn: 47055.00, import: 62906.00, dispatched: 6416.41, export: 1442.75, wasteCusde: 5098.00, wasteAct: 13683.00, enabled: true },
        { year: 2025, month: 6, grn: 94988.00, import: 220417.00, dispatched: 38575.41, export: 10362.03, wasteCusde: 1000.00, wasteAct: 4495.00, enabled: true },
        { year: 2025, month: 7, grn: 134794.00, import: 125291.00, dispatched: 73710.73, export: 9144.11, wasteCusde: 2000.00, wasteAct: 9145.00, enabled: true },
        { year: 2025, month: 8, grn: 92888.00, import: 43349.00, dispatched: 63793.41, export: 2818.64, wasteCusde: 3400.00, wasteAct: 7436.40, enabled: true },
        { year: 2025, month: 9, grn: 48300.00, import: 66893.00, dispatched: 42656.74, export: 5475.57, wasteCusde: 4291.00, wasteAct: 8401.00, enabled: true },
        { year: 2025, month: 10, grn: 74094.00, import: 121133.00, dispatched: 47292.42, export: 5407.41, wasteCusde: 3242.00, wasteAct: 10922.00, enabled: true },
        { year: 2025, month: 11, grn: 73706.00, import: 57957.00, dispatched: 43067.60, export: 2938.69, wasteCusde: 24202.00, wasteAct: 23302.00, enabled: true }
    ],

    ep2: [
        { year: 2025, month: 1, grn: 91619.48, import: 76796.06, dispatched: 16042.00, export: 0, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 2, grn: 82846.73, import: 77049.22, dispatched: 18990.00, export: 0, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 3, grn: 43681.93, import: 43432.28, dispatched: 27515.00, export: 782.00, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 4, grn: 39681.76, import: 28954.49, dispatched: 32160.00, export: 1460.00, wasteCusde: 2434.00, wasteAct: 2434.00, enabled: true },
        { year: 2025, month: 5, grn: 48114.42, import: 26072.38, dispatched: 69084.00, export: 3879.00, wasteCusde: 2809.00, wasteAct: 2809.00, enabled: true },
        { year: 2025, month: 6, grn: 40897.96, import: 42178.74, dispatched: 66597.00, export: 3916.00, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 7, grn: 72096.58, import: 61611.41, dispatched: 72932.00, export: 2814.00, wasteCusde: 3144.00, wasteAct: 3144.00, enabled: true },
        { year: 2025, month: 8, grn: 54636.33, import: 25085.40, dispatched: 70231.00, export: 552.00, wasteCusde: 1032.00, wasteAct: 1032.00, enabled: true },
        { year: 2025, month: 9, grn: 15185.31, import: 8668.21, dispatched: 38328.00, export: 362.48, wasteCusde: 1922.00, wasteAct: 1922.00, enabled: true },
        { year: 2025, month: 10, grn: 16662.46, import: 16626.82, dispatched: 29479.00, export: 256.80, wasteCusde: 2070.00, wasteAct: 2070.00, enabled: true },
        { year: 2025, month: 11, grn: 14105.13, import: 20394.52, dispatched: 24890.00, export: 289.33, wasteCusde: 2000.00, wasteAct: 2000.00, enabled: true }
    ],

    cp: [
        { year: 2025, month: 1, grn: 177357.03, import: 37050.78, dispatched: 177150.43, export: 50207.87, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 2, grn: 166864.50, import: 116221.55, dispatched: 130927.75, export: 32835.43, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 3, grn: 220358.32, import: 166603.27, dispatched: 153959.20, export: 48081.86, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 4, grn: 203763.87, import: 85003.12, dispatched: 140858.01, export: 43630.59, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 5, grn: 150905.18, import: 110357.25, dispatched: 140309.06, export: 54870.28, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 6, grn: 218180.65, import: 130959.46, dispatched: 148222.05, export: 49297.82, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 7, grn: 232082.79, import: 113190.45, dispatched: 155597.44, export: 47203.73, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 8, grn: 206104.46, import: 80219.28, dispatched: 150759.27, export: 49626.61, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 9, grn: 163326.20, import: 110875.75, dispatched: 177139.62, export: 47949.38, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 10, grn: 263777.21, import: 134758.65, dispatched: 146906.81, export: 81810.72, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 11, grn: 171184.87, import: 152341.37, dispatched: 100191.28, export: 65184.37, wasteCusde: 0, wasteAct: 0, enabled: true }
    ],

    yd: [
        { year: 2025, month: 1, grn: 22573.88, import: 0, dispatched: 20016.18, export: 0, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 2, grn: 33508.11, import: 36.10, dispatched: 28913.02, export: 0, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 3, grn: 35301.65, import: 0, dispatched: 36165.21, export: 0, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 4, grn: 45523.92, import: 32826.80, dispatched: 19973.10, export: 60, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 5, grn: 47172.92, import: 16759.30, dispatched: 16490.41, export: 0, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 6, grn: 22389.60, import: 24860.10, dispatched: 28693.34, export: 0, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 7, grn: 40055.09, import: 1877.90, dispatched: 21248.87, export: 210.90, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 8, grn: 18617.91, import: 177.39, dispatched: 18207.84, export: 160.10, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 9, grn: 31217.19, import: 13330.60, dispatched: 15155.35, export: 135.00, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 10, grn: 15750.51, import: 880.00, dispatched: 16129.67, export: 45.00, wasteCusde: 0, wasteAct: 0, enabled: true },
        { year: 2025, month: 11, grn: 14950.39, import: 0, dispatched: 14824.44, export: 188.00, wasteCusde: 0, wasteAct: 0, enabled: true }
    ]
};

// Chart references container
let charts = {};
let currentPlantView = 'all';

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initPlantToggles();
    initBreakdownTabs();
    initModal();
    initSettingsButtons();
    initMergeToggle();
    initFieldVisibilityControls();

    renderDashboard();
    renderSettingsTables();
});

// ============================================
// NAVIGATION & UI INITIALIZERS
// ============================================

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetPage = this.dataset.page;
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            const target = document.getElementById(targetPage + 'Page');
            if (target) target.classList.add('active');
            navMenu.classList.remove('active');
            if (targetPage === 'dashboard') renderDashboard();
        });
    });

    if (navToggle) navToggle.addEventListener('click', () => {
        const navMenu = document.getElementById('navMenu');
        if (navMenu) navMenu.classList.toggle('active');
    });
}

function initBreakdownTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPlantView = this.dataset.plant;
            renderBreakdownTable();
        });
    });
}

function initPlantToggles() {
    const toggles = {
        ep1: document.getElementById('toggleEP1'),
        ep2: document.getElementById('toggleEP2'),
        cp: document.getElementById('toggleCP'),
        yd: document.getElementById('toggleYD')
    };
    Object.entries(toggles).forEach(([plant, toggle]) => {
        if (!toggle) return;
        toggle.addEventListener('change', function () {
            const enabled = this.checked;
            plantData[plant].forEach(r => r.enabled = enabled);
            renderDashboard();
            renderSettingsTables();
        });
    });
}

function initMergeToggle() {
    const checkbox = document.getElementById('mergeYDCheckboxSettings') || document.getElementById('mergeYDCheckbox');
    const ydTabBtn = document.getElementById('ydTabBtn');
    const ydPieCard = document.getElementById('ydPieCard');

    if (!checkbox) {
        applyMergeVisibility();
        return;
    }
    checkbox.checked = mergeYD;
    checkbox.addEventListener('change', function () {
        mergeYD = this.checked;
        localStorage.setItem('mergeYD', String(mergeYD));
        applyMergeVisibility();
        renderDashboard();
    });

    function applyMergeVisibility() {
        if (mergeYD) {
            if (ydTabBtn) ydTabBtn.style.display = 'none';
            if (ydPieCard) ydPieCard.style.display = 'none';
            if (currentPlantView === 'yd') {
                currentPlantView = 'cp';
                const cpBtn = document.querySelector('.tab-btn[data-plant="cp"]');
                if (cpBtn) {
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    cpBtn.classList.add('active');
                }
            }
        } else {
            if (ydTabBtn) ydTabBtn.style.display = '';
            if (ydPieCard) ydPieCard.style.display = '';
        }
    }
    applyMergeVisibility();
}

function initFieldVisibilityControls() {
    const controls = {
        import: document.getElementById('fieldImport'),
        dispatched: document.getElementById('fieldDispatched'),
        export: document.getElementById('fieldExport'),
        wasteCusde: document.getElementById('fieldWasteCusde'),
        wasteAct: document.getElementById('fieldWasteAct')
    };
    Object.entries(controls).forEach(([field, el]) => {
        if (!el) return;
        el.checked = !!fieldEnabled[field];
        el.addEventListener('change', function () {
            fieldEnabled[field] = this.checked;
            localStorage.setItem('fieldEnabled', JSON.stringify(fieldEnabled));
            renderDashboard();
            renderSettingsTables();
        });
    });
}

// ============================================
// CALCULATION HELPERS (respect fieldEnabled)
// ============================================

function calculateMetrics(data) {
    const grn = data.grn || 0;
    const importVal = fieldEnabled.import ? (data.import || 0) : 0;
    const dispatchedVal = fieldEnabled.dispatched ? (data.dispatched || 0) : 0;
    const exportVal = fieldEnabled.export ? (data.export || 0) : 0;
    const wasteCusde = fieldEnabled.wasteCusde ? (data.wasteCusde || 0) : 0;
    const wasteAct = fieldEnabled.wasteAct ? (data.wasteAct || 0) : 0;

    const processed = dispatchedVal + exportVal + wasteCusde; // per spec
    const balance = grn - processed;
    const utilization = grn > 0 ? (processed / grn * 100) : 0;

    return {
        grn,
        import: importVal,
        dispatched: dispatchedVal,
        export: exportVal,
        wasteCusde,
        wasteAct,
        processed,
        balance,
        utilization
    };
}

function aggregatePlantData(plant) {
    const data = plantData[plant].filter(e => e.enabled);
    const acc = data.reduce((a, e) => {
        const m = calculateMetrics(e);
        a.grn += m.grn;
        a.import += m.import;
        a.dispatched += m.dispatched;
        a.export += m.export;
        a.wasteCusde += m.wasteCusde;
        a.wasteAct += m.wasteAct;
        a.processed += m.processed;
        a.balance += m.balance;
        return a;
    }, { grn:0, import:0, dispatched:0, export:0, wasteCusde:0, wasteAct:0, processed:0, balance:0 });

    // When merging, include YD contributions into CP only for CP aggregation
    if (mergeYD && plant === 'cp') {
        const ydTotal = plantData.yd.filter(e => e.enabled).reduce((a, e) => {
            const m = calculateMetrics(e);
            a.grn += m.grn; a.import += m.import; a.dispatched += m.dispatched;
            a.export += m.export; a.wasteCusde += m.wasteCusde; a.wasteAct += m.wasteAct;
            a.processed += m.processed; a.balance += m.balance;
            return a;
        }, { grn:0, import:0, dispatched:0, export:0, wasteCusde:0, wasteAct:0, processed:0, balance:0 });
        acc.grn += ydTotal.grn;
        acc.import += ydTotal.import;
        acc.dispatched += ydTotal.dispatched;
        acc.export += ydTotal.export;
        acc.wasteCusde += ydTotal.wasteCusde;
        acc.wasteAct += ydTotal.wasteAct;
        acc.processed += ydTotal.processed;
        acc.balance += ydTotal.balance;
    }

    return acc;
}

function getAllPlantsTotal() {
    // Always include all plants months in the union when computing totals.
    // Aggregation per plant already respects mergeYD for CP.
    const ep1Total = aggregatePlantData('ep1');
    const ep2Total = aggregatePlantData('ep2');
    const cpTotal = aggregatePlantData('cp');
    const ydTotal = mergeYD ? { grn:0, import:0, dispatched:0, export:0, wasteCusde:0, wasteAct:0, processed:0, balance:0 } : aggregatePlantData('yd');

    return {
        grn: ep1Total.grn + ep2Total.grn + cpTotal.grn + ydTotal.grn,
        import: ep1Total.import + ep2Total.import + cpTotal.import + ydTotal.import,
        dispatched: ep1Total.dispatched + ep2Total.dispatched + cpTotal.dispatched + ydTotal.dispatched,
        export: ep1Total.export + ep2Total.export + cpTotal.export + ydTotal.export,
        wasteCusde: ep1Total.wasteCusde + ep2Total.wasteCusde + cpTotal.wasteCusde + ydTotal.wasteCusde,
        wasteAct: ep1Total.wasteAct + ep2Total.wasteAct + cpTotal.wasteAct + ydTotal.wasteAct,
        processed: ep1Total.processed + ep2Total.processed + cpTotal.processed + ydTotal.processed,
        balance: ep1Total.balance + ep2Total.balance + cpTotal.balance + ydTotal.balance
    };
}

// ============================================
// RENDERING - main dashboard
// ============================================

function renderDashboard() {
    renderKPICards();
    renderBreakdownTable();
    renderPlantCards();
    renderCharts();
    renderFlowAnalysis();
    renderInsights();
}

function renderKPICards() {
    const totals = getAllPlantsTotal();
    const utilization = totals.grn > 0 ? (totals.processed / totals.grn * 100) : 0;
    document.getElementById('totalGRN').textContent = formatNumber(totals.grn);
    document.getElementById('totalProcessed').textContent = formatNumber(totals.processed);
    document.getElementById('totalBalance').textContent = formatNumber(totals.balance);
    document.getElementById('overallUtilization').textContent = utilization.toFixed(1) + '%';
}

// Build thead dynamically depending on enabled fields
function buildBreakdownThead() {
    const cols = [];
    cols.push({ key: 'month', label: 'Month' });
    cols.push({ key: 'grn', label: 'GRN (ROW YARN)' });
    if (fieldEnabled.import) cols.push({ key: 'import', label: 'Import (Sachintha)' });
    if (fieldEnabled.dispatched) cols.push({ key: 'dispatched', label: 'Local (Dispatched)' });
    if (fieldEnabled.export) cols.push({ key: 'export', label: 'Export' });

    const wasteCols = [];
    if (fieldEnabled.wasteCusde) wasteCols.push({ key: 'wasteCusde', label: 'CUSDE' });
    if (fieldEnabled.wasteAct) wasteCols.push({ key: 'wasteAct', label: 'ACT' });

    const head1 = [];
    cols.forEach(c => head1.push(`<th>${c.label}</th>`));
    if (wasteCols.length > 0) head1.push(`<th colspan="${wasteCols.length}">WASTE</th>`);
    head1.push(`<th>GAP STOCK</th>`);
    head1.push(`<th>PERCENTAGE %</th>`);

    const head2 = [];
    cols.forEach(_ => head2.push(`<th></th>`));
    if (wasteCols.length > 0) {
        wasteCols.forEach(w => head2.push(`<th>${w.label}</th>`));
    }
    head2.push(`<th></th>`);
    head2.push(`<th></th>`);

    return `<tr>${head1.join('')}</tr><tr class="sub-header">${head2.join('')}</tr>`;
}

// IMPORTANT: getSortedMonthKeysFromData must include YD months always so totals never drop YD-only months
function getSortedMonthKeysFromData() {
    const allMonths = new Set();
    ['ep1','ep2','cp','yd'].forEach(plant => {
        plantData[plant].filter(e => e.enabled).forEach(entry => {
            allMonths.add(`${entry.year}-${entry.month}`);
        });
    });
    const sorted = Array.from(allMonths)
        .map(k => k.split('-').map(Number))
        .sort((a,b) => a[0] - b[0] || a[1] - b[1])
        .map(arr => `${arr[0]}-${arr[1]}`);
    return sorted;
}

function renderBreakdownTable() {
    const thead = document.getElementById('breakdownThead');
    const tbody = document.getElementById('breakdownBody');
    const tfoot = document.getElementById('breakdownFooter');
    if (!thead || !tbody || !tfoot) return;
    thead.innerHTML = buildBreakdownThead();
    tbody.innerHTML = '';
    tfoot.innerHTML = '';

    let tableData = [];
    let totals = { grn:0, import:0, dispatched:0, export:0, wasteCusde:0, wasteAct:0, processed:0, balance:0 };

    // For "all" view use the full month list including YD months (so totals don't lose YD-only months)
    if (currentPlantView === 'all') {
        const sortedMonths = getSortedMonthKeysFromData();
        sortedMonths.forEach(monthKey => {
            const [year, month] = monthKey.split('-').map(Number);
            // accumulate monthTotal across ep1, ep2, cp, (and yd if not merging, otherwise yd contributes to cp)
            let monthTotal = { grn:0, import:0, dispatched:0, export:0, wasteCusde:0, wasteAct:0 };

            // ep1, ep2 always contribute directly if their entry exists for the month
            ['ep1','ep2','cp'].forEach(plant => {
                const entry = plantData[plant].find(e => e.year === year && e.month === month && e.enabled);
                if (entry) {
                    monthTotal.grn += entry.grn || 0;
                    monthTotal.import += entry.import || 0;
                    monthTotal.dispatched += entry.dispatched || 0;
                    monthTotal.export += entry.export || 0;
                    monthTotal.wasteCusde += entry.wasteCusde || 0;
                    monthTotal.wasteAct += entry.wasteAct || 0;
                }
            });

            // YD contribution:
            const ydEntry = plantData.yd.find(e => e.year === year && e.month === month && e.enabled);
            if (mergeYD) {
                // add YD into CP (we already added cp above, so just add yd totals)
                if (ydEntry) {
                    monthTotal.grn += ydEntry.grn || 0;
                    monthTotal.import += ydEntry.import || 0;
                    monthTotal.dispatched += ydEntry.dispatched || 0;
                    monthTotal.export += ydEntry.export || 0;
                    monthTotal.wasteCusde += ydEntry.wasteCusde || 0;
                    monthTotal.wasteAct += ydEntry.wasteAct || 0;
                }
            } else {
                // if not merging, YD also contributes separately to the month total
                if (ydEntry) {
                    monthTotal.grn += ydEntry.grn || 0;
                    monthTotal.import += ydEntry.import || 0;
                    monthTotal.dispatched += ydEntry.dispatched || 0;
                    monthTotal.export += ydEntry.export || 0;
                    monthTotal.wasteCusde += ydEntry.wasteCusde || 0;
                    monthTotal.wasteAct += ydEntry.wasteAct || 0;
                }
            }

            const metrics = calculateMetrics(monthTotal);
            tableData.push({ year, month, ...metrics });

            totals.grn += metrics.grn;
            totals.import += metrics.import;
            totals.dispatched += metrics.dispatched;
            totals.export += metrics.export;
            totals.wasteCusde += metrics.wasteCusde;
            totals.wasteAct += metrics.wasteAct;
            totals.processed += metrics.processed;
            totals.balance += metrics.balance;
        });
    } else {
        // single plant view
        const plantKey = currentPlantView;
        if (mergeYD && plantKey === 'cp') {
            // combine cp + yd months
            const months = new Set();
            plantData.cp.filter(e => e.enabled).forEach(e => months.add(`${e.year}-${e.month}`));
            plantData.yd.filter(e => e.enabled).forEach(e => months.add(`${e.year}-${e.month}`));
            const sorted = Array.from(months).map(k => k.split('-').map(Number)).sort((a,b) => a[0]-b[0] || a[1]-b[1]).map(ar=>`${ar[0]}-${ar[1]}`);
            sorted.forEach(k => {
                const [year, month] = k.split('-').map(Number);
                const cpEntry = plantData.cp.find(e => e.year === year && e.month === month && e.enabled);
                const ydEntry = plantData.yd.find(e => e.year === year && e.month === month && e.enabled);
                const combined = {
                    grn: (cpEntry?cpEntry.grn:0) + (ydEntry?ydEntry.grn:0),
                    import: (cpEntry?cpEntry.import:0) + (ydEntry?ydEntry.import:0),
                    dispatched: (cpEntry?cpEntry.dispatched:0) + (ydEntry?ydEntry.dispatched:0),
                    export: (cpEntry?cpEntry.export:0) + (ydEntry?ydEntry.export:0),
                    wasteCusde: (cpEntry?cpEntry.wasteCusde:0) + (ydEntry?ydEntry.wasteCusde:0),
                    wasteAct: (cpEntry?cpEntry.wasteAct:0) + (ydEntry?ydEntry.wasteAct:0)
                };
                const metrics = calculateMetrics(combined);
                tableData.push({ year, month, ...metrics });
                totals.grn += metrics.grn;
                totals.import += metrics.import;
                totals.dispatched += metrics.dispatched;
                totals.export += metrics.export;
                totals.wasteCusde += metrics.wasteCusde;
                totals.wasteAct += metrics.wasteAct;
                totals.processed += metrics.processed;
                totals.balance += metrics.balance;
            });
        } else {
            // normal single plant (ep1, ep2, cp without merge, or yd)
            const data = plantData[plantKey].filter(e => e.enabled);
            const sortedData = data.slice().sort((a,b) => a.year - b.year || a.month - b.month);
            sortedData.forEach(entry => {
                const metrics = calculateMetrics(entry);
                tableData.push({ year: entry.year, month: entry.month, ...metrics });
                totals.grn += metrics.grn;
                totals.import += metrics.import;
                totals.dispatched += metrics.dispatched;
                totals.export += metrics.export;
                totals.wasteCusde += metrics.wasteCusde;
                totals.wasteAct += metrics.wasteAct;
                totals.processed += metrics.processed;
                totals.balance += metrics.balance;
            });
        }
    }

    // Render rows
    tbody.innerHTML = '';
    tableData.forEach(data => {
        const row = document.createElement('tr');
        const balanceClass = data.balance >= 0 ? 'balance-positive' : 'balance-negative';
        const utilClass = data.utilization < 70 ? 'util-low' : data.utilization < 90 ? 'util-medium' : 'util-high';

        const cells = [];
        cells.push(`<td>${getMonthName(data.month)} ${data.year}</td>`);
        cells.push(`<td>${formatNumber(data.grn)}</td>`);
        if (fieldEnabled.import) cells.push(`<td>${formatNumber(data.import)}</td>`);
        if (fieldEnabled.dispatched) cells.push(`<td>${formatNumber(data.dispatched)}</td>`);
        if (fieldEnabled.export) cells.push(`<td>${formatNumber(data.export)}</td>`);
        if (fieldEnabled.wasteCusde) cells.push(`<td>${formatNumber(data.wasteCusde)}</td>`);
        if (fieldEnabled.wasteAct) cells.push(`<td>${formatNumber(data.wasteAct)}</td>`);
        cells.push(`<td class="${balanceClass}">${formatNumber(data.balance)}</td>`);
        cells.push(`<td class="${utilClass}">${data.utilization.toFixed(1)}%</td>`);

        row.innerHTML = cells.join('');
        tbody.appendChild(row);
    });

    // Footer totals
    const footCells = [];
    footCells.push(`<td><strong>TOTAL</strong></td>`);
    footCells.push(`<td>${formatNumber(totals.grn)}</td>`);
    if (fieldEnabled.import) footCells.push(`<td>${formatNumber(totals.import)}</td>`);
    if (fieldEnabled.dispatched) footCells.push(`<td>${formatNumber(totals.dispatched)}</td>`);
    if (fieldEnabled.export) footCells.push(`<td>${formatNumber(totals.export)}</td>`);
    if (fieldEnabled.wasteCusde) footCells.push(`<td>${formatNumber(totals.wasteCusde)}</td>`);
    if (fieldEnabled.wasteAct) footCells.push(`<td>${formatNumber(totals.wasteAct)}</td>`);
    const footerBalanceClass = totals.balance >= 0 ? 'balance-positive' : 'balance-negative';
    const totalUtil = totals.grn > 0 ? (totals.processed / totals.grn * 100) : 0;
    const footerUtilClass = totalUtil < 70 ? 'util-low' : totalUtil < 90 ? 'util-medium' : 'util-high';
    footCells.push(`<td class="${footerBalanceClass}">${formatNumber(totals.balance)}</td>`);
    footCells.push(`<td class="${footerUtilClass}">${totalUtil.toFixed(1)}%</td>`);

    tfoot.innerHTML = `<tr class="total-row">${footCells.join('')}</tr>`;
}

// ============================================
// Plant cards - hide disabled metrics
// ============================================

function renderPlantCards() {
    const container = document.getElementById('plantCardsGrid');
    container.innerHTML = '';

    const plants = [
        { id: 'ep1', name: 'EP 1', icon: '🏭', color: 'ep1' },
        { id: 'ep2', name: 'EP 2', icon: '🏭', color: 'ep2' },
        { id: 'cp',  name: 'CP',   icon: '🏢', color: 'cp' }
    ];
    if (!mergeYD) plants.push({ id: 'yd', name: 'YD', icon: '🏬', color: 'yd' });

    plants.forEach(p => {
        const totals = aggregatePlantData(p.id);
        const utilization = totals.grn > 0 ? (totals.processed / totals.grn * 100) : 0;
        const metricsHtml = [];
        metricsHtml.push(`<div class="plant-metric"><span class="plant-metric-label">Total GRN</span><span class="plant-metric-value">${formatNumber(totals.grn)}</span></div>`);
        if (fieldEnabled.dispatched) metricsHtml.push(`<div class="plant-metric"><span class="plant-metric-label">Local</span><span class="plant-metric-value">${formatNumber(totals.dispatched)}</span></div>`);
        if (fieldEnabled.export) metricsHtml.push(`<div class="plant-metric"><span class="plant-metric-label">Export</span><span class="plant-metric-value">${formatNumber(totals.export)}</span></div>`);
        if (fieldEnabled.wasteCusde) metricsHtml.push(`<div class="plant-metric"><span class="plant-metric-label">Waste (CUSDE)</span><span class="plant-metric-value">${formatNumber(totals.wasteCusde)}</span></div>`);
        metricsHtml.push(`<div class="plant-metric"><span class="plant-metric-label">GAP STOCK</span><span class="plant-metric-value ${totals.balance >= 0 ? 'balance-positive' : 'balance-negative'}">${formatNumber(totals.balance)}</span></div>`);
        metricsHtml.push(`<div class="plant-metric"><span class="plant-metric-label">Utilization</span><span class="plant-metric-value">${utilization.toFixed(1)}%</span></div>`);

        const card = document.createElement('div');
        card.className = `plant-card ${p.color}`;
        card.innerHTML = `
            <div class="plant-card-header">
                <div class="plant-card-icon">${p.icon}</div>
                <div class="plant-card-title">${p.name}</div>
            </div>
            <div class="plant-card-metrics">
                ${metricsHtml.join('')}
            </div>
        `;
        container.appendChild(card);
    });
}

// ============================================
// Charts - respect merge and field visibility
// ============================================

function renderCharts() {
    renderPlantPerformanceChart();
    renderMonthlyTrendsChart();
    renderUtilizationChart();
    renderPieCharts();
}

function renderPlantPerformanceChart() {
    const ctx = document.getElementById('plantPerformanceChart');
    if (!ctx) return;
    if (charts.plantPerformance) charts.plantPerformance.destroy();

    const ep1 = aggregatePlantData('ep1');
    const ep2 = aggregatePlantData('ep2');
    const cp = aggregatePlantData('cp');
    const yd = mergeYD ? null : aggregatePlantData('yd');

    const labels = mergeYD ? ['EP 1','EP 2','CP'] : ['EP 1','EP 2','CP','YD'];
    const datasets = [];

    // GRN always
    datasets.push({ label: 'GRN', data: mergeYD ? [ep1.grn, ep2.grn, cp.grn] : [ep1.grn, ep2.grn, cp.grn, yd.grn], backgroundColor: 'rgba(59,130,246,0.8)' });

    if (fieldEnabled.dispatched) datasets.push({ label:'Local', data: mergeYD ? [ep1.dispatched, ep2.dispatched, cp.dispatched] : [ep1.dispatched, ep2.dispatched, cp.dispatched, yd.dispatched], backgroundColor:'rgba(16,185,129,0.8)' });
    if (fieldEnabled.export) datasets.push({ label:'Export', data: mergeYD ? [ep1.export, ep2.export, cp.export] : [ep1.export, ep2.export, cp.export, yd.export], backgroundColor:'rgba(249,115,22,0.8)' });
    if (fieldEnabled.wasteCusde) datasets.push({ label:'Waste (CUSDE)', data: mergeYD ? [ep1.wasteCusde, ep2.wasteCusde, cp.wasteCusde] : [ep1.wasteCusde, ep2.wasteCusde, cp.wasteCusde, yd.wasteCusde], backgroundColor:'rgba(239,68,68,0.8)' });

    charts.plantPerformance = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: { responsive:true, maintainAspectRatio:true, plugins:{ legend:{ position:'top' } }, scales:{ y:{ beginAtZero:true, ticks:{ callback: v => formatNumber(v) } } } }
    });
}

function renderMonthlyTrendsChart() {
    const ctx = document.getElementById('monthlyTrendsChart');
    if (!ctx) return;
    if (charts.monthlyTrends) charts.monthlyTrends.destroy();

    const monthKeys = getSortedMonthKeysFromData();
    const labels = monthKeys.map(k => {
        const [y,m] = k.split('-').map(Number); return `${getMonthName(m)} ${y}`;
    });

    function buildSeries(plantId, key) {
        const map = {};
        plantData[plantId].filter(e => e.enabled).forEach(e => map[`${e.year}-${e.month}`] = e[key] || 0);
        if (mergeYD && plantId === 'cp') {
            plantData.yd.filter(e => e.enabled).forEach(e => {
                const kk = `${e.year}-${e.month}`; map[kk] = (map[kk] || 0) + (e[key] || 0);
            });
        }
        return monthKeys.map(k => map[k] !== undefined ? map[k] : 0);
    }

    const datasets = [
        { label:'EP 1', data: buildSeries('ep1','grn'), borderColor:'rgba(59,130,246,1)', backgroundColor:'rgba(59,130,246,0.1)', tension:0.4 },
        { label:'EP 2', data: buildSeries('ep2','grn'), borderColor:'rgba(16,185,129,1)', backgroundColor:'rgba(16,185,129,0.1)', tension:0.4 },
        { label:'CP',  data: buildSeries('cp','grn'),  borderColor:'rgba(249,115,22,1)', backgroundColor:'rgba(249,115,22,0.1)', tension:0.4 }
    ];
    if (!mergeYD) datasets.push({ label:'YD', data: buildSeries('yd','grn'), borderColor:'rgba(139,92,246,1)', backgroundColor:'rgba(139,92,246,0.1)', tension:0.4 });

    charts.monthlyTrends = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: { responsive:true, maintainAspectRatio:true, plugins:{ legend:{ position:'top' } }, scales:{ y:{ beginAtZero:true, ticks:{ callback: v => formatNumber(v) } } } }
    });
}

function renderUtilizationChart() {
    const ctx = document.getElementById('utilizationChart');
    if (!ctx) return;
    if (charts.utilization) charts.utilization.destroy();

    const monthKeys = getSortedMonthKeysFromData();
    const labels = monthKeys.map(k => {
        const [y,m] = k.split('-').map(Number); return `${getMonthName(m)} ${y}`;
    });

    function buildUtilSeries(plantId) {
        if (mergeYD && plantId === 'cp') {
            const combinedMap = {};
            const months = new Set([...monthKeys, ...plantData.yd.filter(e=>e.enabled).map(e=>`${e.year}-${e.month}`)]);
            months.forEach(k => {
                const [yy,mm] = k.split('-').map(Number);
                const cpEntry = plantData.cp.find(e=>e.year===yy&&e.month===mm&&e.enabled);
                const ydEntry = plantData.yd.find(e=>e.year===yy&&e.month===mm&&e.enabled);
                const combined = {
                    grn: (cpEntry?cpEntry.grn:0) + (ydEntry?ydEntry.grn:0),
                    dispatched: fieldEnabled.dispatched ? ((cpEntry?cpEntry.dispatched:0) + (ydEntry?ydEntry.dispatched:0)) : 0,
                    export: fieldEnabled.export ? ((cpEntry?cpEntry.export:0) + (ydEntry?ydEntry.export:0)) : 0,
                    wasteCusde: fieldEnabled.wasteCusde ? ((cpEntry?cpEntry.wasteCusde:0) + (ydEntry?ydEntry.wasteCusde:0)) : 0
                };
                combinedMap[k] = calculateMetrics(combined).utilization;
            });
            return monthKeys.map(k => combinedMap[k] !== undefined ? combinedMap[k] : 0);
        }
        const map = {};
        plantData[plantId].filter(e => e.enabled).forEach(e => map[`${e.year}-${e.month}`] = calculateMetrics(e).utilization);
        return monthKeys.map(k => map[k] !== undefined ? map[k] : 0);
    }

    const datasets = [
        { label:'EP 1', data: buildUtilSeries('ep1'), backgroundColor:'rgba(59,130,246,0.8)' },
        { label:'EP 2', data: buildUtilSeries('ep2'), backgroundColor:'rgba(16,185,129,0.8)' },
        { label:'CP',  data: buildUtilSeries('cp'),  backgroundColor:'rgba(249,115,22,0.8)' }
    ];
    if (!mergeYD) datasets.push({ label:'YD', data: buildUtilSeries('yd'), backgroundColor:'rgba(139,92,246,0.8)' });

    charts.utilization = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: { responsive:true, maintainAspectRatio:true, plugins:{ legend:{ position:'top' } }, scales:{ y:{ beginAtZero:true, max:100, ticks:{ callback: v => v + '%' } } } }
    });
}

function renderPieCharts() {
    const plantList = [
        { id:'ep1', canvasId:'ep1PieChart' },
        { id:'ep2', canvasId:'ep2PieChart' },
        { id:'cp',  canvasId:'cpPieChart' }
    ];

    plantList.forEach(p => {
        const ctx = document.getElementById(p.canvasId);
        if (!ctx) return;
        if (charts[p.id+'Pie']) charts[p.id+'Pie'].destroy();
        const totals = aggregatePlantData(p.id);
        const labels = [], data = [], colors = [];
        if (fieldEnabled.dispatched) { labels.push('Local'); data.push(totals.dispatched); colors.push('#3b82f6'); }
        if (fieldEnabled.export) { labels.push('Export'); data.push(totals.export); colors.push('#10b981'); }
        if (fieldEnabled.wasteCusde) { labels.push('Waste (CUSDE)'); data.push(totals.wasteCusde); colors.push('#ef4444'); }
        if (labels.length === 0) { labels.push('No visible fields'); data.push(1); colors.push('#cbd5e1'); }
        charts[p.id+'Pie'] = new Chart(ctx, { type:'pie', data:{ labels, datasets:[{ data, backgroundColor: colors }] }, options:{ responsive:true, maintainAspectRatio:true, plugins:{ legend:{ position:'bottom' } } } });
    });

    const ydCtx = document.getElementById('ydPieChart');
    if (ydCtx) {
        if (charts.ydPie) charts.ydPie.destroy();
        if (!mergeYD) {
            const totals = aggregatePlantData('yd');
            const labels = [], data = [], colors = [];
            if (fieldEnabled.dispatched) { labels.push('Local'); data.push(totals.dispatched); colors.push('#8b5cf6'); }
            if (fieldEnabled.export) { labels.push('Export'); data.push(totals.export); colors.push('#3b82f6'); }
            if (fieldEnabled.wasteCusde) { labels.push('Waste (CUSDE)'); data.push(totals.wasteCusde); colors.push('#ef4444'); }
            if (labels.length === 0) { labels.push('No visible fields'); data.push(1); colors.push('#cbd5e1'); }
            charts.ydPie = new Chart(ydCtx, { type:'pie', data:{ labels, datasets:[{ data, backgroundColor:colors }] }, options:{ responsive:true, maintainAspectRatio:true, plugins:{ legend:{ position:'bottom' } } } });
            const ydCard = document.getElementById('ydPieCard'); if (ydCard) ydCard.style.display = '';
        } else {
            const ydCard = document.getElementById('ydPieCard'); if (ydCard) ydCard.style.display = 'none';
        }
    }
}

// ============================================
// FLOW ANALYSIS & INSIGHTS
// ============================================

function renderFlowAnalysis() {
    const container = document.getElementById('flowAnalysis');
    if (!container) return;
    const totals = getAllPlantsTotal();
    const parts = [];
    parts.push(`<div class="flow-item"><div class="flow-label">Total Raw Material (GRN)</div><div class="flow-arrow">→</div><div class="flow-value">${formatNumber(totals.grn)}</div></div>`);
    if (fieldEnabled.import) parts.push(`<div class="flow-item"><div class="flow-label">Import (Display Only)</div><div class="flow-arrow">+</div><div class="flow-value">${formatNumber(totals.import)}</div></div>`);
    const breakdownParts = [];
    if (fieldEnabled.dispatched) breakdownParts.push(`Local: ${formatNumber(totals.dispatched)}`);
    if (fieldEnabled.export) breakdownParts.push(`Export: ${formatNumber(totals.export)}`);
    if (fieldEnabled.wasteCusde) breakdownParts.push(`Waste (CUSDE): ${formatNumber(totals.wasteCusde)}`);
    parts.push(`<div class="flow-item"><div class="flow-label">Total Processing</div><div class="flow-arrow">→</div><div class="flow-value">${formatNumber(totals.processed)}</div><div class="flow-breakdown">(${breakdownParts.join(' + ') || 'No visible processing fields'})</div></div>`);
    parts.push(`<div class="flow-item"><div class="flow-label">Final Balance</div><div class="flow-arrow">→</div><div class="flow-value ${totals.balance >= 0 ? 'balance-positive' : 'balance-negative'}">${formatNumber(totals.balance)}</div></div>`);
    container.innerHTML = parts.join('');
}

function renderInsights() {
    const container = document.getElementById('insightsContainer');
    if (!container) return;
    const insights = generateInsights();
    container.innerHTML = insights.map(i => `<div class="insight-item"><div class="insight-type">${i.type}</div><div class="insight-text">${i.text}</div></div>`).join('');
}

function generateInsights() {
    const insights = [];
    const totals = getAllPlantsTotal();
    const ep1 = aggregatePlantData('ep1');
    const ep2 = aggregatePlantData('ep2');
    const cp = aggregatePlantData('cp');

    const overallUtil = totals.grn > 0 ? (totals.processed / totals.grn * 100) : 0;
    if (overallUtil < 70) insights.push({ type:'⚠️ LOW UTILIZATION', text:`Overall utilization is ${overallUtil.toFixed(1)}% which is below 70%.` });
    else if (overallUtil > 90) insights.push({ type:'✅ EXCELLENT PERFORMANCE', text:`Overall utilization is ${overallUtil.toFixed(1)}%.` });

    if (totals.balance < 0) insights.push({ type:'⚠️ NEGATIVE BALANCE', text:`Total balance is negative (${formatNumber(totals.balance)}).` });
    else if (totals.balance > totals.grn * 0.2) insights.push({ type:'📊 HIGH INVENTORY', text:`Balance is ${formatNumber(totals.balance)} which is over 20% of GRN.` });

    const plantUtils = [
        { name:'EP 1', util: ep1.grn > 0 ? (ep1.processed/ep1.grn*100):0 },
        { name:'EP 2', util: ep2.grn > 0 ? (ep2.processed/ep2.grn*100):0 },
        { name:'CP', util: cp.grn > 0 ? (cp.processed/cp.grn*100):0 }
    ];
    const best = plantUtils.reduce((a,b) => a.util > b.util ? a : b);
    const worst = plantUtils.reduce((a,b) => a.util < b.util ? a : b);
    insights.push({ type:'🏆 TOP PERFORMER', text:`${best.name} has highest utilization at ${best.util.toFixed(1)}%.` });
    if (worst.util < 70 && Math.abs(best.util - worst.util) > 15) insights.push({ type:'⚠️ ATTENTION NEEDED', text:`${worst.name} has the lowest utilization at ${worst.util.toFixed(1)}%.` });

    const totalWastePercent = totals.grn > 0 ? (totals.wasteCusde / totals.grn * 100) : 0;
    if (totalWastePercent > 5) insights.push({ type:'♻️ WASTE ALERT', text:`Waste is ${totalWastePercent.toFixed(1)}% of GRN (${formatNumber(totals.wasteCusde)}).` });

    const exportPercent = totals.grn > 0 ? (totals.export / totals.grn * 100) : 0;
    insights.push({ type:'🌍 EXPORT PERFORMANCE', text:`Export accounts for ${exportPercent.toFixed(1)}% of GRN (${formatNumber(totals.export)}).` });

    return insights;
}

// ============================================
// SETTINGS TABLES & MODAL (add/edit/delete)
// ============================================

function renderSettingsTables() {
    renderPlantSettingsTable('ep1','ep1TableBody');
    renderPlantSettingsTable('ep2','ep2TableBody');
    renderPlantSettingsTable('cp','cpTableBody');
    renderPlantSettingsTable('yd','ydTableBody');

    const mergeEl = document.getElementById('mergeYDCheckboxSettings');
    if (mergeEl) mergeEl.checked = mergeYD;

    const ctrlMap = {
        import: document.getElementById('fieldImport'),
        dispatched: document.getElementById('fieldDispatched'),
        export: document.getElementById('fieldExport'),
        wasteCusde: document.getElementById('fieldWasteCusde'),
        wasteAct: document.getElementById('fieldWasteAct')
    };
    Object.entries(ctrlMap).forEach(([k,el]) => { if (el) el.checked = !!fieldEnabled[k]; });
}

function renderPlantSettingsTable(plantId, tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = '';
    plantData[plantId].forEach((entry, idx) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.year}</td>
            <td>${getMonthName(entry.month)}</td>
            <td>${formatNumber(entry.grn)}</td>
            <td>${formatNumber(entry.import)}</td>
            <td>${formatNumber(entry.dispatched)}</td>
            <td>${formatNumber(entry.export)}</td>
            <td>${formatNumber(entry.wasteCusde)}</td>
            <td>${formatNumber(entry.wasteAct)}</td>
            <td>
                <label class="toggle-label" style="margin:0;">
                    <input type="checkbox" ${entry.enabled ? 'checked' : ''} onchange="toggleMonthData('${plantId}', ${idx}, this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </td>
            <td>
                <button class="btn btn-edit" onclick="editMonthData('${plantId}', ${idx})">Edit</button>
                <button class="btn btn-danger" onclick="deleteMonthData('${plantId}', ${idx})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function toggleMonthData(plantId, index, enabled) {
    plantData[plantId][index].enabled = enabled;
    renderDashboard();
}

function editMonthData(plantId, index) {
    editingMonthKey = `${plantId}-${index}`;
    const entry = plantData[plantId][index];
    document.getElementById('modalTitle').textContent = 'Edit Month Data';
    document.getElementById('inputYear').value = entry.year;
    document.getElementById('inputMonth').value = entry.month;

    // populate inputs if exist
    const prefixes = ['EP1','EP2','CP','YD'];
    prefixes.forEach(prefix => {
        const plantKey = prefix.toLowerCase();
        const sameEntry = plantData[plantKey].find(e => e.year === entry.year && e.month === entry.month);
        const elGrn = document.getElementById(`input${prefix}GRN`); if (elGrn) elGrn.value = sameEntry ? sameEntry.grn : 0;
        const elImport = document.getElementById(`input${prefix}Import`); if (elImport) elImport.value = sameEntry ? sameEntry.import : 0;
        const elDisp = document.getElementById(`input${prefix}Dispatched`); if (elDisp) elDisp.value = sameEntry ? sameEntry.dispatched : 0;
        const elExp = document.getElementById(`input${prefix}Export`); if (elExp) elExp.value = sameEntry ? sameEntry.export : 0;
        const elWC = document.getElementById(`input${prefix}WasteCusde`); if (elWC) elWC.value = sameEntry ? sameEntry.wasteCusde : 0;
        const elWA = document.getElementById(`input${prefix}WasteAct`); if (elWA) elWA.value = sameEntry ? sameEntry.wasteAct : 0;
    });

    openModal();
}

function deleteMonthData(plantId, index) {
    if (confirm('Are you sure you want to delete this month data?')) {
        plantData[plantId].splice(index, 1);
        renderDashboard();
        renderSettingsTables();
    }
}

// ============================================
// MODAL MANAGEMENT (add/edit form)
// ============================================

function initModal() {
    const modal = document.getElementById('dataModal');
    const closeBtn = document.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('dataForm');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    if (form) form.addEventListener('submit', handleFormSubmit);
}

function openModal() { const m = document.getElementById('dataModal'); if (m) m.classList.add('active'); }
function closeModal() { const m = document.getElementById('dataModal'); if (m) m.classList.remove('active'); editingMonthKey = null; clearFormInputs(); }

function clearFormInputs() {
    ['EP1','EP2','CP','YD'].forEach(prefix => {
        const elGrn = document.getElementById(`input${prefix}GRN`); if (elGrn) elGrn.value = 0;
        const elImport = document.getElementById(`input${prefix}Import`); if (elImport) elImport.value = 0;
        const elDisp = document.getElementById(`input${prefix}Dispatched`); if (elDisp) elDisp.value = 0;
        const elExp = document.getElementById(`input${prefix}Export`); if (elExp) elExp.value = 0;
        const elWC = document.getElementById(`input${prefix}WasteCusde`); if (elWC) elWC.value = 0;
        const elWA = document.getElementById(`input${prefix}WasteAct`); if (elWA) elWA.value = 0;
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    const year = parseInt(document.getElementById('inputYear').value);
    const month = parseInt(document.getElementById('inputMonth').value);
    const plants = ['ep1','ep2','cp','yd'];

    if (editingMonthKey) {
        const [plantId, idxStr] = editingMonthKey.split('-');
        const index = parseInt(idxStr);
        plants.forEach(plant => {
            const prefix = plant.toUpperCase();
            const newData = {
                year,
                month,
                grn: parseFloat((document.getElementById(`input${prefix}GRN`) || { value:0 }).value) || 0,
                import: parseFloat((document.getElementById(`input${prefix}Import`) || { value:0 }).value) || 0,
                dispatched: parseFloat((document.getElementById(`input${prefix}Dispatched`) || { value:0 }).value) || 0,
                export: parseFloat((document.getElementById(`input${prefix}Export`) || { value:0 }).value) || 0,
                wasteCusde: parseFloat((document.getElementById(`input${prefix}WasteCusde`) || { value:0 }).value) || 0,
                wasteAct: parseFloat((document.getElementById(`input${prefix}WasteAct`) || { value:0 }).value) || 0,
                enabled: true
            };
            const existingIndex = plantData[plant].findIndex(r => r.year === year && r.month === month);
            if (plant === plantId) {
                if (existingIndex === -1 || existingIndex === index) plantData[plant][index] = newData;
                else { plantData[plant][existingIndex] = newData; plantData[plant].splice(index,1); }
            } else {
                if (existingIndex !== -1) plantData[plant][existingIndex] = newData;
                else plantData[plant].push(newData);
            }
            plantData[plant].sort((a,b) => a.year - b.year || a.month - b.month);
        });
    } else {
        const conflict = plants.find(plant => plantData[plant].some(r => r.year === year && r.month === month));
        if (conflict) { alert(`Data for ${getMonthName(month)} ${year} already exists in ${conflict.toUpperCase()}. Please edit existing.`); return; }
        plants.forEach(plant => {
            const prefix = plant.toUpperCase();
            const newData = {
                year,
                month,
                grn: parseFloat((document.getElementById(`input${prefix}GRN`) || { value:0 }).value) || 0,
                import: parseFloat((document.getElementById(`input${prefix}Import`) || { value:0 }).value) || 0,
                dispatched: parseFloat((document.getElementById(`input${prefix}Dispatched`) || { value:0 }).value) || 0,
                export: parseFloat((document.getElementById(`input${prefix}Export`) || { value:0 }).value) || 0,
                wasteCusde: parseFloat((document.getElementById(`input${prefix}WasteCusde`) || { value:0 }).value) || 0,
                wasteAct: parseFloat((document.getElementById(`input${prefix}WasteAct`) || { value:0 }).value) || 0,
                enabled: true
            };
            plantData[plant].push(newData);
            plantData[plant].sort((a,b) => a.year - b.year || a.month - b.month);
        });
    }

    closeModal();
    renderDashboard();
    renderSettingsTables();
}

// ============================================
// SETTINGS BUTTONS
// ============================================

function initSettingsButtons() {
    const addBtn = document.getElementById('addDataBtn');
    const resetBtn = document.getElementById('resetDataBtn');
    if (addBtn) addBtn.addEventListener('click', () => {
        editingMonthKey = null;
        document.getElementById('modalTitle').textContent = 'Add New Month Data';
        clearFormInputs();
        const now = new Date();
        document.getElementById('inputYear').value = now.getFullYear();
        document.getElementById('inputMonth').value = now.getMonth() + 1;
        openModal();
    });
    if (resetBtn) resetBtn.addEventListener('click', () => {
        if (confirm('Reset all data to defaults? This will reload the page.')) {
            localStorage.removeItem('fieldEnabled');
            localStorage.removeItem('mergeYD');
            location.reload();
        }
    });
}

// ============================================
// UTILITIES
// ============================================

function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
}
function getMonthName(monthNum) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[monthNum-1] || '';
}