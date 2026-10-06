/**
 * ค่ายวิศวะเหลาดินสอ ครั้งที่ 21 • Staff Screening & Evaluation App
 * Enhanced with 3-Level Department-Specific Tier List Feature
 */

let appData = null;
let allApplicants = [];
let filteredApplicants = [];
let compareIds = [];
let currentModalApplicant = null;
let currentModalTab = 'general';
let chartInstances = {};

// Tier List State (Persisted per department)
// Format: { [departmentName]: { [applicantId]: { tier: 1|2|3, note: '...', updatedAt: '...' } } }
let departmentTiers = {};
let currentTierDepartment = 'ฝ่ายพี่บ้าน';
let tierChoiceFilter = 'all'; // 'all', '1', '2'

// Filter State
const filters = {
  department: 'all',
  choice: 'all', // 'all', '1', '2'
  year: 'all', // 'all', '68', '69'
  gender: 'all', // 'all', 'ชาย', 'หญิง'
  major: 'all',
  search: '',
  hideExcluded: true
};

// Department Theme Color Palette (Pastel & Modern Accent Colors)
const DEPT_COLORS = {
  'ฝ่ายพี่บ้าน': {
    name: 'พี่บ้าน',
    pill: 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100',
    activePill: 'bg-amber-600 text-white shadow-xs',
    badge: 'bg-amber-50 text-amber-800 border border-amber-200',
    countBadge: 'bg-amber-100 text-amber-800',
    activeCountBadge: 'bg-amber-700 text-white',
    avatar: 'bg-gradient-to-tr from-amber-600 to-amber-500',
    hex: '#f59e0b'
  },
  'ฝ่ายกิจกรรม': {
    name: 'กิจกรรม',
    pill: 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100',
    activePill: 'bg-emerald-600 text-white shadow-xs',
    badge: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    countBadge: 'bg-emerald-100 text-emerald-800',
    activeCountBadge: 'bg-emerald-700 text-white',
    avatar: 'bg-gradient-to-tr from-emerald-600 to-teal-500',
    hex: '#10b981'
  },
  'ฝ่ายสถานที่': {
    name: 'สถานที่',
    pill: 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100',
    activePill: 'bg-blue-600 text-white shadow-xs',
    badge: 'bg-blue-50 text-blue-800 border border-blue-200',
    countBadge: 'bg-blue-100 text-blue-800',
    activeCountBadge: 'bg-blue-700 text-white',
    avatar: 'bg-gradient-to-tr from-blue-600 to-indigo-500',
    hex: '#3b82f6'
  },
  'ฝ่ายสวัสดิการ': {
    name: 'สวัสดิการ',
    pill: 'bg-orange-50 text-orange-900 border-orange-200 hover:bg-orange-100',
    activePill: 'bg-orange-600 text-white shadow-xs',
    badge: 'bg-orange-50 text-orange-800 border border-orange-200',
    countBadge: 'bg-orange-100 text-orange-800',
    activeCountBadge: 'bg-orange-700 text-white',
    avatar: 'bg-gradient-to-tr from-orange-600 to-amber-500',
    hex: '#f97316'
  },
  'ฝ่ายพยาบาล': {
    name: 'พยาบาล',
    pill: 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100',
    activePill: 'bg-rose-600 text-white shadow-xs',
    badge: 'bg-rose-50 text-rose-800 border border-rose-200',
    countBadge: 'bg-rose-100 text-rose-800',
    activeCountBadge: 'bg-rose-700 text-white',
    avatar: 'bg-gradient-to-tr from-rose-600 to-pink-500',
    hex: '#f43f5e'
  },
  'ฝ่ายทะเบียน': {
    name: 'ทะเบียน',
    pill: 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100',
    activePill: 'bg-indigo-600 text-white shadow-xs',
    badge: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
    countBadge: 'bg-indigo-100 text-indigo-800',
    activeCountBadge: 'bg-indigo-700 text-white',
    avatar: 'bg-gradient-to-tr from-indigo-600 to-purple-500',
    hex: '#6366f1'
  },
  'ฝ่ายสปอนเซอร์': {
    name: 'สปอนเซอร์',
    pill: 'bg-teal-50 text-teal-900 border-teal-200 hover:bg-teal-100',
    activePill: 'bg-teal-600 text-white shadow-xs',
    badge: 'bg-teal-50 text-teal-800 border border-teal-200',
    countBadge: 'bg-teal-100 text-teal-800',
    activeCountBadge: 'bg-teal-700 text-white',
    avatar: 'bg-gradient-to-tr from-teal-600 to-cyan-500',
    hex: '#14b8a6'
  },
  'ฝ่ายศิลป์': {
    name: 'ศิลป์',
    pill: 'bg-fuchsia-50 text-fuchsia-900 border-fuchsia-200 hover:bg-fuchsia-100',
    activePill: 'bg-fuchsia-600 text-white shadow-xs',
    badge: 'bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200',
    countBadge: 'bg-fuchsia-100 text-fuchsia-800',
    activeCountBadge: 'bg-fuchsia-700 text-white',
    avatar: 'bg-gradient-to-tr from-fuchsia-600 to-pink-500',
    hex: '#d946ef'
  },
  'ฝ่ายประชาสัมพันธ์': {
    name: 'ประชาฯ',
    pill: 'bg-violet-50 text-violet-900 border-violet-200 hover:bg-violet-100',
    activePill: 'bg-violet-600 text-white shadow-xs',
    badge: 'bg-violet-50 text-violet-800 border border-violet-200',
    countBadge: 'bg-violet-100 text-violet-800',
    activeCountBadge: 'bg-violet-700 text-white',
    avatar: 'bg-gradient-to-tr from-violet-600 to-purple-500',
    hex: '#8b5cf6'
  },
  'ฝ่ายรันสคริป์': {
    name: 'รันสคริป์',
    pill: 'bg-yellow-50 text-yellow-900 border-yellow-200 hover:bg-yellow-100',
    activePill: 'bg-yellow-600 text-white shadow-xs',
    badge: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    countBadge: 'bg-yellow-100 text-yellow-800',
    activeCountBadge: 'bg-yellow-700 text-white',
    avatar: 'bg-gradient-to-tr from-yellow-600 to-amber-500',
    hex: '#eab308'
  },
  'ฝ่ายโสตทัศนศึกษา': {
    name: 'โสตฯ',
    pill: 'bg-cyan-50 text-cyan-900 border-cyan-200 hover:bg-cyan-100',
    activePill: 'bg-cyan-600 text-white shadow-xs',
    badge: 'bg-cyan-50 text-cyan-800 border border-cyan-200',
    countBadge: 'bg-cyan-100 text-cyan-800',
    activeCountBadge: 'bg-cyan-700 text-white',
    avatar: 'bg-gradient-to-tr from-cyan-600 to-blue-500',
    hex: '#06b6d4'
  }
};

function getDeptStyle(dept) {
  return DEPT_COLORS[dept] || {
    name: dept || '-',
    pill: 'bg-zinc-50 text-zinc-800 border-zinc-200 hover:bg-zinc-100',
    activePill: 'bg-zinc-900 text-white shadow-xs',
    badge: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
    countBadge: 'bg-zinc-200 text-zinc-700',
    activeCountBadge: 'bg-zinc-800 text-white',
    avatar: 'bg-gradient-to-tr from-zinc-700 to-zinc-900',
    hex: '#64748b'
  };
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  await loadTiersData();
  setupUI();
  setupTierUI();
  applyFilters();
  lucide.createIcons();
});

// Load Data from Window Global or API
async function loadData() {
  if (window.INITIAL_DATA) {
    appData = window.INITIAL_DATA;
    allApplicants = appData.applicants || [];
    console.log('Loaded preloaded data:', allApplicants.length, 'applicants');
  } else {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        appData = await res.json();
        allApplicants = appData.applicants || [];
      } else {
        const fallback = await fetch('data.json');
        appData = await fallback.json();
        allApplicants = appData.applicants || [];
      }
    } catch (e) {
      console.error('Failed to load data via fetch:', e);
      if (window.INITIAL_DATA) {
        appData = window.INITIAL_DATA;
        allApplicants = appData.applicants || [];
      }
    }
  }

  // Populate Majors Dropdown
  const majorSelect = document.getElementById('filter-major');
  if (majorSelect && appData) {
    const majors = new Set(allApplicants.map(a => a.major).filter(Boolean));
    const sortedMajors = Array.from(majors).sort();
    sortedMajors.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      majorSelect.appendChild(opt);
    });
  }

  // Populate Quick Compare Select
  updateQuickCompareDropdown();

  // Update Top KPIs
  updateTopKPIs();
}

// ==========================================
// TIER LIST PERSISTENCE & DATA MANAGEMENT (CROSS-DEVICE CLOUD SYNC)
// ====================================================================
const CLOUD_TIERS_URL = 'https://extendsclass.com/api/json-storage/bin/cdbfeab';
let cloudSaveTimer = null;

function mergeTiers(base, incoming) {
  if (!incoming || typeof incoming !== 'object') return base || {};
  if (!base || typeof base !== 'object') return incoming || {};
  const merged = { ...base };

  for (const dept in incoming) {
    if (!merged[dept]) {
      merged[dept] = { ...incoming[dept] };
    } else {
      merged[dept] = { ...merged[dept] };
      for (const appId in incoming[dept]) {
        const baseEntry = merged[dept][appId];
        const incEntry = incoming[dept][appId];
        if (!baseEntry) {
          merged[dept][appId] = incEntry;
        } else {
          const baseTime = baseEntry.updatedAt ? new Date(baseEntry.updatedAt).getTime() : 0;
          const incTime = incEntry.updatedAt ? new Date(incEntry.updatedAt).getTime() : 0;
          if (incTime >= baseTime) {
            merged[dept][appId] = incEntry;
          }
        }
      }
    }
  }
  return merged;
}

async function loadTiersData() {
  // 1. Try local storage first (instant rendering)
  try {
    const local = localStorage.getItem('camp_staff_tiers');
    if (local) {
      departmentTiers = JSON.parse(local);
    }
  } catch (e) {
    departmentTiers = {};
  }

  // 2. Fetch from /api/tiers (handled by Vercel Serverless api/tiers.js or Localhost server.py)
  await syncFromCloud(false);
}

async function syncFromCloud(showFeedback = true) {
  const statusEl = document.getElementById('tier-save-status');
  if (showFeedback && statusEl) {
    statusEl.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i><span>กำลังดึงข้อมูล Cloud...</span>`;
    statusEl.className = 'text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200 flex items-center space-x-1 font-medium';
    lucide.createIcons();
  }

  try {
    const res = await fetch('/api/tiers?t=' + Date.now(), {
      headers: { 'Cache-Control': 'no-cache, no-store' }
    });
    if (res.ok) {
      const cloudData = await res.json();
      if (cloudData && typeof cloudData === 'object' && Object.keys(cloudData).length > 0) {
        departmentTiers = mergeTiers(departmentTiers, cloudData);
        localStorage.setItem('camp_staff_tiers', JSON.stringify(departmentTiers));
        updateTierNavBadge();
        renderTierListBoard();
        renderCandidateCards();

        if (statusEl) {
          statusEl.innerHTML = `<i data-lucide="cloud" class="w-3.5 h-3.5"></i><span>ซิงค์ Cloud เรียบร้อย</span>`;
          statusEl.className = 'text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 flex items-center space-x-1 font-medium';
          lucide.createIcons();
        }

        if (showFeedback) {
          alert('ซิงค์และอัปเดตข้อมูลการจัด Tier จาก Cloud สำเร็จ!');
        }
        return true;
      }
    }
  } catch (e) {
    console.warn('Unable to sync from cloud API:', e);
    if (showFeedback) {
      alert('ไม่สามารถเชื่อมต่อ Cloud ได้ในขณะนี้ ข้อมูลปัจจุบันถูกบันทึกไว้ในเครื่องเรียบร้อยแล้ว');
    }
  }

  if (statusEl) {
    statusEl.innerHTML = `<i data-lucide="cloud" class="w-3.5 h-3.5"></i><span>ซิงค์ Cloud เรียบร้อย</span>`;
    statusEl.className = 'text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 flex items-center space-x-1 font-medium';
    lucide.createIcons();
  }
  return false;
}

async function saveTiersData(customPayload = null) {
  // 1. Save to LocalStorage immediately
  try {
    localStorage.setItem('camp_staff_tiers', JSON.stringify(departmentTiers));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }

  const statusEl = document.getElementById('tier-save-status');
  if (statusEl) {
    statusEl.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i><span>กำลังบันทึก Cloud...</span>`;
    statusEl.className = 'text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200 flex items-center space-x-1 font-medium';
    lucide.createIcons();
  }

  // 2. Debounce save to Cloud via /api/tiers
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(async () => {
    try {
      const payload = customPayload || departmentTiers;
      const res = await fetch('/api/tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        if (result && result.tiers && typeof result.tiers === 'object') {
          departmentTiers = mergeTiers(departmentTiers, result.tiers);
          localStorage.setItem('camp_staff_tiers', JSON.stringify(departmentTiers));
        }

        if (statusEl) {
          statusEl.innerHTML = `<i data-lucide="cloud" class="w-3.5 h-3.5"></i><span>ซิงค์ Cloud เรียบร้อย</span>`;
          statusEl.className = 'text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 flex items-center space-x-1 font-medium';
          lucide.createIcons();
        }
      } else {
        throw new Error('API returned status ' + res.status);
      }
    } catch (e) {
      console.warn('Cloud save error, fallback to local:', e);
      if (statusEl) {
        statusEl.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i><span>บันทึกในเครื่องแล้ว</span>`;
        statusEl.className = 'text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 flex items-center space-x-1 font-medium';
        lucide.createIcons();
      }
    }
  }, 400);

  // Update badge counters
  updateTierNavBadge();
}

// Auto-sync when tab becomes visible or focused
window.addEventListener('focus', () => {
  syncFromCloud(false);
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    syncFromCloud(false);
  }
});

// Periodic background sync every 20 seconds
setInterval(() => {
  if (document.visibilityState === 'visible') {
    syncFromCloud(false);
  }
}, 20000);

function updateTierNavBadge() {
  const badgeEl = document.getElementById('tab-tier-badge');
  if (!badgeEl) return;
  let totalRanked = 0;
  Object.values(departmentTiers).forEach(deptMap => {
    Object.values(deptMap).forEach(entry => {
      if (entry && entry.tier && entry.tier > 0) totalRanked++;
    });
  });
  if (totalRanked > 0) {
    badgeEl.textContent = totalRanked;
    badgeEl.classList.remove('hidden');
  } else {
    badgeEl.classList.add('hidden');
  }
}

function getApplicantTier(dept, applicantId) {
  if (!departmentTiers[dept]) return 0;
  const entry = departmentTiers[dept][applicantId];
  return entry ? (entry.tier || 0) : 0;
}

function getApplicantNote(dept, applicantId) {
  if (!departmentTiers[dept]) return '';
  const entry = departmentTiers[dept][applicantId];
  return entry ? (entry.note || '') : '';
}

function setApplicantTier(dept, applicantId, tier, note = null) {
  if (!dept || !applicantId) return;
  if (!departmentTiers[dept]) {
    departmentTiers[dept] = {};
  }

  const existingNote = departmentTiers[dept][applicantId]?.note || '';
  const finalNote = note !== null ? note : existingNote;

  if (tier === 0 && !finalNote) {
    delete departmentTiers[dept][applicantId];
  } else {
    departmentTiers[dept][applicantId] = {
      tier: tier,
      note: finalNote,
      updatedAt: new Date().toISOString()
    };
  }

  saveTiersData();
  renderTierListBoard();
  renderCandidateCards(); // Update any tier badges in candidates view
}

function resetDeptTiers() {
  if (!confirm(`คุณต้องการล้างการจัด Tier ทั้งหมดของ "${currentTierDepartment}" หรือไม่?`)) {
    return;
  }
  if (departmentTiers[currentTierDepartment]) {
    delete departmentTiers[currentTierDepartment];
    saveTiersData({ action: 'reset', dept: currentTierDepartment });
    renderTierListBoard();
    renderCandidateCards();
    alert(`ล้างการจัด Tier ของ ${currentTierDepartment} เรียบร้อยแล้ว`);
  }
}

function copyTierSummary() {
  const dept = currentTierDepartment;
  const candidatesInDept = allApplicants.filter(a => {
    return a.choice1.dept === dept || a.choice2.dept === dept;
  });

  const t1 = [];
  const t2 = [];
  const t3 = [];
  const unranked = [];

  candidatesInDept.forEach(a => {
    const t = getApplicantTier(dept, a.id);
    const note = getApplicantNote(dept, a.id);
    const pref = a.choice1.dept === dept ? 'อันดับ 1' : 'อันดับ 2';
    const noteStr = note ? ` [โน้ต: ${note}]` : '';
    const item = `• ${a.name} (${a.nickname}) [รหัส ${a.year}] (${pref})${noteStr}`;

    if (t === 1) t1.push(item);
    else if (t === 2) t2.push(item);
    else if (t === 3) t3.push(item);
    else unranked.push(item);
  });

  let text = `🏆 สรุปการจัด Tier ผู้สมัคร - ${dept}\n`;
  text += `ค่ายวิศวะเหลาดินสอ ครั้งที่ 21\n`;
  text += `=====================================\n\n`;

  text += `🟢 TIER 1 : ตัวจริง / ผ่านเกณฑ์ดีเยี่ยม (${t1.length} คน)\n`;
  text += (t1.length > 0 ? t1.join('\n') : '  (ยังไม่มี)') + '\n\n';

  text += `🟡 TIER 2 : ตัวสำรอง / รอพิจารณา (${t2.length} คน)\n`;
  text += (t2.length > 0 ? t2.join('\n') : '  (ยังไม่มี)') + '\n\n';

  text += `🔴 TIER 3 : สำรองลำดับท้าย / ไม่ผ่านเกณฑ์ (${t3.length} คน)\n`;
  text += (t3.length > 0 ? t3.join('\n') : '  (ยังไม่มี)') + '\n\n';

  text += `⚪ ยังไม่ได้จัดระดับ (${unranked.length} คน)\n`;
  text += (unranked.length > 0 ? unranked.join('\n') : '  (ไม่มี)') + '\n';

  navigator.clipboard.writeText(text).then(() => {
    alert(`คัดลอกสรุปผลการจัด Tier ของ "${dept}" ลงคลิปบอร์ดแล้ว! สามารถนำไปวางใน LINE หรือ Docs ได้ทันที`);
  }).catch(() => {
    prompt('คัดลอกข้อความด้านล่างนี้ได้เลย:', text);
  });
}

// Export All Tier Rankings as JSON File
function exportTiersJson() {
  const jsonStr = JSON.stringify(departmentTiers, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `camp_staff_tiers_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import Tier Rankings from JSON File
function importTiersJson(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported && typeof imported === 'object') {
        departmentTiers = { ...departmentTiers, ...imported };
        saveTiersData();
        renderTierListBoard();
        renderCandidateCards();
        alert('นำเข้าและผสานข้อมูลการจัด Tier สำเร็จแล้ว!');
      } else {
        alert('รูปแบบไฟล์ JSON ไม่ถูกต้อง');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์: ' + err.message);
    }
    event.target.value = '';
  };
  reader.readAsText(file);
}

// Setup Department Selector Pills in Tier List
function setupTierUI() {
  const container = document.getElementById('tier-dept-pills');
  if (!container || !appData) return;

  container.innerHTML = '';
  appData.departments.forEach(dept => {
    const btn = document.createElement('button');
    const isSelected = currentTierDepartment === dept;
    const style = getDeptStyle(dept);

    // Count applicants who applied for this department
    const count = allApplicants.filter(a => a.choice1.dept === dept || a.choice2.dept === dept).length;

    btn.className = `px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center space-x-1.5 border ${
      isSelected
        ? `${style.activePill} border-transparent shadow-xs scale-102`
        : `${style.pill} shadow-2xs`
    }`;
    btn.innerHTML = `<span>${style.name}</span><span class="text-[11px] px-1.5 py-0.2 rounded-full font-mono font-medium ${isSelected ? style.activeCountBadge : style.countBadge}">${count}</span>`;
    btn.onclick = () => {
      currentTierDepartment = dept;
      const label = document.getElementById('tier-current-dept-label');
      if (label) {
        label.textContent = dept;
        label.style.backgroundColor = style.hex + '15';
        label.style.color = style.hex;
      }
      setupTierUI();
      renderTierListBoard();
    };
    container.appendChild(btn);
  });

  const label = document.getElementById('tier-current-dept-label');
  if (label) {
    label.textContent = currentTierDepartment;
  }
}

function setTierChoiceFilter(choice) {
  tierChoiceFilter = choice;
  ['all', '1', '2'].forEach(c => {
    const btn = document.getElementById(`tier-filter-choice-${c}`);
    if (btn) {
      btn.className = c === choice
        ? 'px-2.5 py-1 rounded-md font-medium bg-white text-zinc-900 shadow-2xs'
        : 'px-2.5 py-1 rounded-md font-medium text-zinc-600 hover:text-zinc-900';
    }
  });
  renderTierListBoard();
}

// Render the 3-Tier Board for currentTierDepartment
function renderTierListBoard() {
  const dept = currentTierDepartment;
  const hideExcluded = document.getElementById('tier-hide-excluded')?.checked ?? true;

  // Filter applicants who applied for this department
  const applicantsInDept = allApplicants.filter(applicant => {
    if (hideExcluded && applicant.isExcluded) return false;
    const isC1 = applicant.choice1.dept === dept;
    const isC2 = applicant.choice2.dept === dept;

    if (tierChoiceFilter === '1' && !isC1) return false;
    if (tierChoiceFilter === '2' && !isC2) return false;
    if (tierChoiceFilter === 'all' && !isC1 && !isC2) return false;

    return true;
  });

  // Update total count
  const totalCountEl = document.getElementById('tier-dept-total-count');
  if (totalCountEl) totalCountEl.textContent = applicantsInDept.length;

  // Partition into Tiers
  const tiers = { 1: [], 2: [], 3: [], 0: [] };
  applicantsInDept.forEach(applicant => {
    const t = getApplicantTier(dept, applicant.id);
    if (t === 1) tiers[1].push(applicant);
    else if (t === 2) tiers[2].push(applicant);
    else if (t === 3) tiers[3].push(applicant);
    else tiers[0].push(applicant);
  });

  // Update Tier Counters
  [1, 2, 3, 0].forEach(t => {
    const countEl = document.getElementById(`tier-count-${t}`);
    if (countEl) countEl.textContent = `${tiers[t].length} คน`;
    renderTierCards(`tier-container-${t}`, tiers[t], t, dept);
  });

  lucide.createIcons();
}

function renderTierCards(containerId, applicants, tierLevel, dept) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  if (applicants.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-6 text-center text-xs text-zinc-400 italic">
        (ไม่มีรายชื่อในกลุ่มนี้ ลากการ์ดมาวางที่นี่เพื่อจัดอันดับ)
      </div>
    `;
    return;
  }

  applicants.forEach(applicant => {
    const card = document.createElement('div');
    const initial = applicant.nickname ? applicant.nickname.charAt(0) : applicant.name.charAt(0);
    const isChoice1 = applicant.choice1.dept === dept;
    const currentNote = getApplicantNote(dept, applicant.id);

    // Border and accent based on tier level
    let tierAccentClass = 'border-zinc-200 hover:border-zinc-300';
    if (tierLevel === 1) tierAccentClass = 'border-emerald-300 hover:border-emerald-400 shadow-2xs';
    else if (tierLevel === 2) tierAccentClass = 'border-amber-300 hover:border-amber-400 shadow-2xs';
    else if (tierLevel === 3) tierAccentClass = 'border-rose-300 hover:border-rose-400 shadow-2xs';

    card.className = `bg-white border ${tierAccentClass} rounded-xl p-3 shadow-2xs hover:shadow-sm transition-all duration-150 flex flex-col justify-between space-y-2 cursor-grab active:cursor-grabbing`;
    card.draggable = true;
    card.ondragstart = (e) => {
      e.dataTransfer.setData('text/plain', applicant.id.toString());
      e.dataTransfer.setData('sourceDept', dept);
    };

    // Priority pill
    const priorityBadge = isChoice1
      ? '<span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300">⭐ อันดับ 1</span>'
      : '<span class="text-[10px] px-2 py-0.5 rounded-full font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">อันดับ 2</span>';

    // Year badge
    const yearBadge = applicant.year === '69'
      ? '<span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">69 (ปี 1)</span>'
      : '<span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">68 (ปี 2)</span>';

    // Gender badge
    const genderBadge = applicant.gender === 'ชาย'
      ? '<span class="text-[10px] px-1.5 py-0.2 rounded bg-sky-50 text-sky-800 border border-sky-200">ชาย</span>'
      : '<span class="text-[10px] px-1.5 py-0.2 rounded bg-pink-50 text-pink-800 border border-pink-200">หญิง</span>';

    card.innerHTML = `
      <div class="space-y-1.5">
        <!-- Top row: Avatar & Identity -->
        <div class="flex items-start justify-between gap-1.5">
          <div class="flex items-center space-x-2 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-zinc-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              ${initial}
            </div>
            <div class="min-w-0">
              <h4 class="text-xs font-bold text-zinc-900 truncate hover:text-indigo-600 cursor-pointer" onclick="openDetailModal(${applicant.id})">
                ${applicant.name}
              </h4>
              <div class="flex items-center space-x-1 text-[11px] text-zinc-500">
                <span class="font-medium text-zinc-700">"${applicant.nickname || '-'}"</span>
                <span>•</span>
                <span class="truncate max-w-[100px] text-zinc-500">${applicant.major}</span>
              </div>
            </div>
          </div>
          <div class="shrink-0 flex flex-col items-end gap-1">
            ${priorityBadge}
          </div>
        </div>

        <!-- Badges row -->
        <div class="flex items-center space-x-1 pt-0.5">
          ${yearBadge}
          ${genderBadge}
          <span class="text-[10px] font-mono text-zinc-400 truncate max-w-[80px]">${applicant.studentId}</span>
        </div>

        <!-- Inline Note / Comment input for this department -->
        <div class="pt-1">
          <input type="text" value="${escapeHtml(currentNote)}" placeholder="บันทึกโน้ต/คะแนน..." onchange="updateCardNote('${dept}', ${applicant.id}, this.value)" class="w-full text-[11px] bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-200 focus:border-zinc-400 rounded-lg px-2.5 py-1 focus:outline-none transition-colors">
        </div>
      </div>

      <!-- Action buttons: 1-Click Tier Move & View Details -->
      <div class="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
        <!-- Tier Move Pills -->
        <div class="inline-flex rounded-lg bg-zinc-100 p-0.5 border border-zinc-200 text-[10px] font-bold">
          <button onclick="setApplicantTier('${dept}', ${applicant.id}, 1)" class="px-2 py-0.5 rounded ${tierLevel === 1 ? 'bg-emerald-600 text-white' : 'text-zinc-600 hover:text-emerald-700'}" title="ย้ายไป Tier 1">T1</button>
          <button onclick="setApplicantTier('${dept}', ${applicant.id}, 2)" class="px-2 py-0.5 rounded ${tierLevel === 2 ? 'bg-amber-600 text-white' : 'text-zinc-600 hover:text-amber-700'}" title="ย้ายไป Tier 2">T2</button>
          <button onclick="setApplicantTier('${dept}', ${applicant.id}, 3)" class="px-2 py-0.5 rounded ${tierLevel === 3 ? 'bg-rose-600 text-white' : 'text-zinc-600 hover:text-rose-700'}" title="ย้ายไป Tier 3">T3</button>
          ${tierLevel !== 0 ? `<button onclick="setApplicantTier('${dept}', ${applicant.id}, 0)" class="px-1.5 py-0.5 rounded text-zinc-400 hover:text-zinc-800" title="ปลดออกจาก Tier">✕</button>` : ''}
        </div>

        <!-- Detail link -->
        <button onclick="openDetailModal(${applicant.id})" class="text-[11px] text-zinc-500 hover:text-zinc-900 font-medium px-2 py-1 rounded hover:bg-zinc-100 transition-colors">
          ดูคำตอบ
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

function updateCardNote(dept, applicantId, noteText) {
  const currentTier = getApplicantTier(dept, applicantId);
  setApplicantTier(dept, applicantId, currentTier, noteText);
}

// HTML5 Drag & Drop handlers
function allowDrop(e) {
  e.preventDefault();
}

function dropToTier(e, targetTier) {
  e.preventDefault();
  const applicantIdStr = e.dataTransfer.getData('text/plain');
  if (!applicantIdStr) return;
  const applicantId = parseInt(applicantIdStr, 10);
  setApplicantTier(currentTierDepartment, applicantId, targetTier);
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Update Top KPIs
function updateTopKPIs() {
  if (!appData) return;
  const eligible = allApplicants.filter(a => !a.isExcluded);
  const excluded = allApplicants.filter(a => a.isExcluded);
  
  const elTotal = document.getElementById('kpi-total-raw');
  const elEligible = document.getElementById('kpi-total-eligible');
  const elExcluded = document.getElementById('kpi-total-excluded');
  const elYearRatio = document.getElementById('kpi-year-ratio');
  const elGenderRatio = document.getElementById('kpi-gender-ratio');
  
  if (elTotal) elTotal.textContent = allApplicants.length;
  if (elEligible) elEligible.textContent = eligible.length;
  if (elExcluded) elExcluded.textContent = excluded.length;
  
  const count68 = eligible.filter(a => a.year === '68').length;
  const count69 = eligible.filter(a => a.year === '69').length;
  if (elYearRatio) elYearRatio.textContent = `${count68} : ${count69}`;

  const countM = eligible.filter(a => a.gender === 'ชาย').length;
  const countF = eligible.filter(a => a.gender === 'หญิง').length;
  if (elGenderRatio) elGenderRatio.textContent = `${countM} : ${countF}`;
}

// Setup Department Pills for Candidates View
function setupUI() {
  const container = document.getElementById('dept-pills-container');
  if (!container || !appData) return;

  container.innerHTML = '';

  // "ทั้งหมด" Pill
  const isAllSelected = filters.department === 'all';
  const allBtn = document.createElement('button');
  allBtn.className = `px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center space-x-1.5 border ${
    isAllSelected
      ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300'
  }`;
  const eligibleCount = allApplicants.filter(a => !a.isExcluded).length;
  allBtn.innerHTML = `<span>ทั้งหมด</span><span class="text-[11px] px-1.5 py-0.2 rounded-full font-mono font-medium ${isAllSelected ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-800'}">${eligibleCount}</span>`;
  allBtn.onclick = () => selectDepartment('all');
  container.appendChild(allBtn);

  // Department Pills with Distinctive Colors
  appData.departments.forEach(dept => {
    const btn = document.createElement('button');
    const isSelected = filters.department === dept;
    const style = getDeptStyle(dept);

    btn.className = `px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center space-x-1.5 border ${
      isSelected
        ? `${style.activePill} border-transparent`
        : `${style.pill} shadow-2xs`
    }`;
    
    // Count eligible applicants interested in this dept
    const count = allApplicants.filter(a => {
      if (filters.hideExcluded && a.isExcluded) return false;
      return a.choice1.dept === dept || a.choice2.dept === dept;
    }).length;

    btn.innerHTML = `<span>${style.name}</span><span class="text-[11px] px-1.5 py-0.2 rounded-full font-mono font-medium ${isSelected ? style.activeCountBadge : style.countBadge}">${count}</span>`;
    btn.onclick = () => selectDepartment(dept);
    container.appendChild(btn);
  });
}

function selectDepartment(dept) {
  filters.department = dept;
  const label = document.getElementById('filter-dept-label');
  if (label) {
    label.textContent = dept === 'all' ? 'ทั้งหมด' : dept;
  }
  setupUI();
  applyFilters();
}

// Reset All Filters
function resetAllFilters() {
  filters.department = 'all';
  filters.choice = 'all';
  filters.year = 'all';
  filters.gender = 'all';
  filters.major = 'all';
  filters.search = '';
  filters.hideExcluded = true;

  document.getElementById('filter-search').value = '';
  document.getElementById('filter-choice').value = 'all';
  document.getElementById('filter-year').value = 'all';
  document.getElementById('filter-gender').value = 'all';
  document.getElementById('filter-major').value = 'all';
  document.getElementById('filter-hide-excluded').checked = true;

  setupUI();
  applyFilters();
}

// Apply Filters to applicants
function applyFilters() {
  const searchInput = document.getElementById('filter-search').value.toLowerCase().trim();
  const choiceSelect = document.getElementById('filter-choice').value;
  const yearSelect = document.getElementById('filter-year').value;
  const genderSelect = document.getElementById('filter-gender').value;
  const majorSelect = document.getElementById('filter-major').value;
  const hideExcluded = document.getElementById('filter-hide-excluded').checked;

  filters.search = searchInput;
  filters.choice = choiceSelect;
  filters.year = yearSelect;
  filters.gender = genderSelect;
  filters.major = majorSelect;
  filters.hideExcluded = hideExcluded;

  filteredApplicants = allApplicants.filter(applicant => {
    // 1. Exclusion filter
    if (filters.hideExcluded && applicant.isExcluded) {
      return false;
    }

    // 2. Department filter
    if (filters.department !== 'all') {
      const matchC1 = applicant.choice1.dept === filters.department;
      const matchC2 = applicant.choice2.dept === filters.department;

      if (filters.choice === '1' && !matchC1) return false;
      if (filters.choice === '2' && !matchC2) return false;
      if (filters.choice === 'all' && !matchC1 && !matchC2) return false;
    } else {
      if (filters.choice === '1' && !applicant.choice1.dept) return false;
      if (filters.choice === '2' && (!applicant.choice2.dept || applicant.choice2.dept === 'ไม่ได้เลือกอันดับ 2')) return false;
    }

    // 3. Year filter (68 vs 69)
    if (filters.year !== 'all') {
      if (applicant.year !== filters.year) return false;
    } else {
      if (filters.hideExcluded && applicant.year === '67') return false;
    }

    // 4. Gender filter
    if (filters.gender !== 'all') {
      if (applicant.gender !== filters.gender) return false;
    }

    // 5. Major filter
    if (filters.major !== 'all') {
      if (applicant.major !== filters.major) return false;
    }

    // 6. Search query
    if (filters.search) {
      const searchTerms = filters.search.split(' ').filter(Boolean);
      const targetStr = `${applicant.name} ${applicant.nickname} ${applicant.studentId} ${applicant.major} ${applicant.choice1.dept} ${applicant.choice2.dept} ${applicant.gender} ${applicant.phone} ${applicant.generalQuestions.map(q => q.answer).join(' ')}`.toLowerCase();
      
      const allTermsMatch = searchTerms.every(term => targetStr.includes(term));
      if (!allTermsMatch) return false;
    }

    return true;
  });

  // Update counters
  const resultCountEl = document.getElementById('filter-result-count');
  const tabCandidateCount = document.getElementById('tab-candidate-count');
  if (resultCountEl) resultCountEl.textContent = filteredApplicants.length;
  if (tabCandidateCount) tabCandidateCount.textContent = filteredApplicants.length;

  renderCandidateCards();
  lucide.createIcons();
}

// Render Candidate Cards Grid with Tier Integration
function renderCandidateCards() {
  const container = document.getElementById('candidates-container');
  const emptyEl = document.getElementById('candidates-empty');
  if (!container) return;

  if (filteredApplicants.length === 0) {
    container.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  container.innerHTML = '';

  const isSpecificDeptFiltered = filters.department !== 'all';
  const activeDept = filters.department;

  filteredApplicants.forEach(applicant => {
    const card = document.createElement('div');
    const isCompared = compareIds.includes(applicant.id);
    const initial = applicant.nickname ? applicant.nickname.charAt(0) : applicant.name.charAt(0);

    const c1Style = getDeptStyle(applicant.choice1.dept);
    const c2Style = getDeptStyle(applicant.choice2.dept);

    // Current tier for active department (if specific dept is chosen)
    const currentTier = isSpecificDeptFiltered ? getApplicantTier(activeDept, applicant.id) : 0;
    let tierPill = '';
    if (isSpecificDeptFiltered && currentTier > 0) {
      if (currentTier === 1) tierPill = '<span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">🟢 Tier 1</span>';
      else if (currentTier === 2) tierPill = '<span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">🟡 Tier 2</span>';
      else if (currentTier === 3) tierPill = '<span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 border border-rose-300">🔴 Tier 3</span>';
    }

    // Year badge style
    const yearBadge = applicant.year === '69'
      ? '<span class="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">ปี 1 (69)</span>'
      : (applicant.year === '68' 
          ? '<span class="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">ปี 2 (68)</span>' 
          : '<span class="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">รหัส ' + applicant.year + '</span>');

    // Gender badge style
    const genderBadge = applicant.gender === 'ชาย'
      ? '<span class="text-[11px] px-2 py-0.5 rounded-md font-medium bg-sky-50 text-sky-800 border border-sky-200">ชาย</span>'
      : (applicant.gender === 'หญิง'
          ? '<span class="text-[11px] px-2 py-0.5 rounded-md font-medium bg-pink-50 text-pink-800 border border-pink-200">หญิง</span>'
          : '<span class="text-[11px] px-2 py-0.5 rounded-md font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">ไม่ระบุ</span>');

    // Intro snippet
    const introQ = applicant.generalQuestions.find(q => q.id === 10);
    const introText = introQ && introQ.answer ? introQ.answer : 'ไม่มีข้อมูลการแนะนำตัว';
    const introSnippet = introText.length > 115 ? introText.substring(0, 115) + '...' : introText;

    card.className = `bg-white border ${isCompared ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md' : 'border-zinc-200/90'} rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-zinc-300 transition-all duration-200 flex flex-col justify-between space-y-3 relative`;

    card.innerHTML = `
      <div class="space-y-3">
        <!-- Top Row: Avatar & Basic Info -->
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl ${c1Style.avatar} text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              ${initial}
            </div>
            <div class="min-w-0">
              <div class="flex items-baseline space-x-1.5 flex-wrap">
                <h3 class="text-sm font-semibold text-zinc-900 hover:text-indigo-600 cursor-pointer transition-colors truncate max-w-[170px]" onclick="openDetailModal(${applicant.id})">
                  ${applicant.name}
                </h3>
                <span class="text-xs text-zinc-500 font-medium">"${applicant.nickname || '-'}"</span>
              </div>
              <div class="flex items-center space-x-1.5 text-xs text-zinc-500 mt-0.5">
                <span class="font-mono text-[11px]">${applicant.studentId}</span>
                <span>•</span>
                <span class="truncate max-w-[130px] text-zinc-600">${applicant.major}</span>
              </div>
            </div>
          </div>

          <!-- Badges: Year & Gender & Tier -->
          <div class="flex flex-col items-end space-y-1 shrink-0">
            <div class="flex items-center space-x-1">
              ${tierPill}
              ${yearBadge}
              ${genderBadge}
            </div>
            ${applicant.isExcluded ? `
              <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200" title="${applicant.exclusionReasons.join(', ')}">
                ตัดสิทธิ์ (${applicant.exclusionReasons[0]})
              </span>
            ` : ''}
          </div>
        </div>

        <!-- Department Choices Pills -->
        <div class="bg-zinc-50/80 border border-zinc-100 rounded-xl p-2.5 text-xs space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-zinc-500 flex items-center space-x-1 text-[11px]">
              <span class="w-2 h-2 rounded-full" style="background-color: ${c1Style.hex}"></span>
              <span>อันดับ 1:</span>
            </span>
            <span class="font-medium ${c1Style.badge} px-2.5 py-0.5 rounded-lg text-[11px] truncate max-w-[190px]">
              ${applicant.choice1.dept || '-'}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-zinc-500 flex items-center space-x-1 text-[11px]">
              <span class="w-2 h-2 rounded-full ${applicant.choice2.dept ? '' : 'bg-zinc-300'}" style="${applicant.choice2.dept ? 'background-color:' + c2Style.hex : ''}"></span>
              <span>อันดับ 2:</span>
            </span>
            <span class="font-medium ${applicant.choice2.dept && applicant.choice2.dept !== 'ไม่ได้เลือกอันดับ 2' ? c2Style.badge : 'bg-zinc-100 text-zinc-500 border border-zinc-200'} px-2.5 py-0.5 rounded-lg text-[11px] truncate max-w-[190px]">
              ${applicant.choice2.dept || 'ไม่ได้เลือก'}
            </span>
          </div>
        </div>

        <!-- Introduction Snippet -->
        <div class="text-xs text-zinc-600 leading-relaxed bg-white rounded-xl p-2.5 border border-zinc-100">
          <span class="text-zinc-400 text-[10px] block font-medium uppercase mb-0.5">แนะนำตัว:</span>
          <p class="italic text-zinc-700 line-clamp-2">"${introSnippet}"</p>
        </div>
      </div>

      <!-- Bottom Action Strip (Includes Quick Tier Selector if a specific dept is chosen) -->
      <div class="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
        ${isSpecificDeptFiltered ? `
          <!-- Quick Tier buttons on card -->
          <div class="inline-flex rounded-lg bg-zinc-100 p-0.5 border border-zinc-200 text-[10px] font-bold">
            <button onclick="setApplicantTier('${activeDept}', ${applicant.id}, 1)" class="px-2 py-0.5 rounded ${currentTier === 1 ? 'bg-emerald-600 text-white' : 'text-zinc-600 hover:text-emerald-700'}" title="Tier 1">T1</button>
            <button onclick="setApplicantTier('${activeDept}', ${applicant.id}, 2)" class="px-2 py-0.5 rounded ${currentTier === 2 ? 'bg-amber-600 text-white' : 'text-zinc-600 hover:text-amber-700'}" title="Tier 2">T2</button>
            <button onclick="setApplicantTier('${activeDept}', ${applicant.id}, 3)" class="px-2 py-0.5 rounded ${currentTier === 3 ? 'bg-rose-600 text-white' : 'text-zinc-600 hover:text-rose-700'}" title="Tier 3">T3</button>
          </div>
        ` : `
          <button onclick="toggleCompare(${applicant.id})" class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            isCompared
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
          }">
            <i data-lucide="${isCompared ? 'check' : 'plus'}" class="w-3.5 h-3.5"></i>
            <span>${isCompared ? 'กำลังเทียบ' : 'เปรียบเทียบ'}</span>
          </button>
        `}

        <button onclick="openDetailModal(${applicant.id})" class="inline-flex items-center space-x-1 text-indigo-700 hover:text-indigo-900 font-medium px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
          <span>ดูคำตอบทั้งหมด</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

// Switch Main Views (Candidates / Tier List / Compare / Stats)
function switchMainView(viewName) {
  const views = {
    candidates: document.getElementById('view-candidates'),
    tierlist: document.getElementById('view-tierlist'),
    compare: document.getElementById('view-compare'),
    stats: document.getElementById('view-stats')
  };

  const navButtons = {
    candidates: document.getElementById('nav-candidates'),
    tierlist: document.getElementById('nav-tierlist'),
    compare: document.getElementById('nav-compare'),
    stats: document.getElementById('nav-stats')
  };

  // Reset all nav buttons
  Object.values(navButtons).forEach(b => {
    if (b) b.className = 'flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-150 text-zinc-600 hover:text-zinc-900';
  });

  // Hide all views
  Object.values(views).forEach(v => {
    if (v) v.classList.add('hidden');
  });

  // Show active view
  if (views[viewName]) {
    views[viewName].classList.remove('hidden');
  }
  if (navButtons[viewName]) {
    navButtons[viewName].className = 'flex items-center space-x-2 px-3.5 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-150 bg-white text-zinc-900 shadow-xs';
  }

  if (viewName === 'tierlist') {
    setupTierUI();
    renderTierListBoard();
  } else if (viewName === 'compare') {
    renderComparisonView();
  } else if (viewName === 'stats') {
    renderStatisticsDashboard();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  lucide.createIcons();
}

// ==========================================
// CANDIDATE DETAIL MODAL & TIER CONTROLS
// ==========================================
function openDetailModal(id) {
  const applicant = allApplicants.find(a => a.id === id);
  if (!applicant) return;

  currentModalApplicant = applicant;
  const modal = document.getElementById('detail-modal');
  const c1Style = getDeptStyle(applicant.choice1.dept);
  const c2Style = getDeptStyle(applicant.choice2.dept);

  // Set Profile Information
  const avatarEl = document.getElementById('modal-avatar');
  avatarEl.className = `w-12 h-12 rounded-xl ${c1Style.avatar} text-white flex items-center justify-center font-bold text-lg shadow-sm`;
  avatarEl.textContent = applicant.nickname ? applicant.nickname.charAt(0) : applicant.name.charAt(0);

  document.getElementById('modal-name').textContent = applicant.name;
  document.getElementById('modal-nick').textContent = applicant.nickname ? `(${applicant.nickname})` : '';
  document.getElementById('modal-sid').textContent = applicant.studentId;
  
  const yBadge = document.getElementById('modal-year-badge');
  yBadge.className = applicant.year === '69' 
    ? 'text-xs px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-800 border border-emerald-200'
    : 'text-xs px-2 py-0.5 rounded font-medium bg-indigo-50 text-indigo-800 border border-indigo-200';
  yBadge.textContent = `รหัส ${applicant.year} (ปี ${applicant.year === '69' ? '1' : '2'})`;

  const gBadge = document.getElementById('modal-gender-badge');
  gBadge.className = applicant.gender === 'ชาย'
    ? 'text-xs px-2 py-0.5 rounded font-medium bg-sky-50 text-sky-800 border border-sky-200'
    : 'text-xs px-2 py-0.5 rounded font-medium bg-pink-50 text-pink-800 border border-pink-200';
  gBadge.textContent = `เพศ: ${applicant.gender}`;

  document.getElementById('modal-major').textContent = applicant.major;
  document.getElementById('modal-campus').textContent = applicant.campus || 'ศูนย์รังสิต';
  
  const c1Tag = document.getElementById('modal-c1-tag');
  c1Tag.className = `font-semibold ${c1Style.badge} px-2 py-0.5 rounded-md`;
  c1Tag.textContent = applicant.choice1.dept || '-';

  const c2Tag = document.getElementById('modal-c2-tag');
  c2Tag.className = `font-medium ${applicant.choice2.dept ? c2Style.badge : 'bg-zinc-100 text-zinc-500'} px-2 py-0.5 rounded-md`;
  c2Tag.textContent = applicant.choice2.dept || 'ไม่ได้เลือกอันดับ 2';

  // Status Badge
  const statusBadge = document.getElementById('modal-status-badge');
  if (applicant.isExcluded) {
    statusBadge.classList.remove('hidden');
    statusBadge.textContent = `ถูกตัดสิทธิ์: ${applicant.exclusionReasons.join(', ')}`;
  } else {
    statusBadge.classList.add('hidden');
  }

  // Setup Tier Ranking Department dropdown in Modal
  const tierSelect = document.getElementById('modal-tier-dept-select');
  if (tierSelect) {
    tierSelect.innerHTML = '';
    if (applicant.choice1.dept) {
      const opt1 = document.createElement('option');
      opt1.value = applicant.choice1.dept;
      opt1.textContent = `${applicant.choice1.dept} (อันดับ 1)`;
      tierSelect.appendChild(opt1);
    }
    if (applicant.choice2.dept && applicant.choice2.dept !== 'ไม่ได้เลือกอันดับ 2') {
      const opt2 = document.createElement('option');
      opt2.value = applicant.choice2.dept;
      opt2.textContent = `${applicant.choice2.dept} (อันดับ 2)`;
      tierSelect.appendChild(opt2);
    }
    // Default to currently selected department in app if candidate applied for it, else choice 1
    if (filters.department !== 'all' && (applicant.choice1.dept === filters.department || applicant.choice2.dept === filters.department)) {
      tierSelect.value = filters.department;
    } else {
      tierSelect.value = applicant.choice1.dept;
    }
    updateModalTierControls();
  }

  // Titles for Choice tabs
  document.getElementById('tab-title-c1').textContent = `อันดับ 1: ${c1Style.name}`;
  document.getElementById('modal-dept1-title').textContent = applicant.choice1.dept || '-';

  const c2Title = applicant.choice2.dept && applicant.choice2.dept !== 'ไม่ได้เลือกอันดับ 2'
    ? `อันดับ 2: ${c2Style.name}`
    : 'อันดับ 2 (ไม่ได้เลือก)';
  document.getElementById('tab-title-c2').textContent = c2Title;
  document.getElementById('modal-dept2-title').textContent = applicant.choice2.dept || 'ไม่ได้เลือก';

  // Render General Questions (6 questions)
  renderGeneralQuestionsModal(applicant.generalQuestions);

  // Render Choice 1 Questions
  renderDeptQuestionsModal('modal-c1-questions-list', applicant.choice1.questions, c1Style);

  // Render Choice 2 Questions
  renderDeptQuestionsModal('modal-c2-questions-list', applicant.choice2.questions, c2Style);

  // Contact Information
  document.getElementById('modal-phone').textContent = applicant.phone || 'ไม่ระบุ';
  document.getElementById('modal-contact-extra').textContent = applicant.contact || 'ไม่ระบุ';
  document.getElementById('modal-interview-date').textContent = applicant.interviewPref || 'ไม่ระบุ';
  document.getElementById('modal-timestamp').textContent = applicant.timestamp || '-';

  // Update Navigation Indices
  const currentIndex = filteredApplicants.findIndex(a => a.id === applicant.id);
  document.getElementById('modal-current-index').textContent = currentIndex >= 0 ? currentIndex + 1 : '-';
  document.getElementById('modal-total-index').textContent = filteredApplicants.length;

  // Update Compare Toggle Button in modal
  updateModalCompareButton();

  // Reset to default tab
  switchModalTab('general');

  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  lucide.createIcons();
}

function updateModalTierControls() {
  if (!currentModalApplicant) return;
  const dept = document.getElementById('modal-tier-dept-select')?.value;
  if (!dept) return;

  const currentTier = getApplicantTier(dept, currentModalApplicant.id);
  const currentNote = getApplicantNote(dept, currentModalApplicant.id);

  // Update Tier button active styles
  [1, 2, 3, 0].forEach(t => {
    const btn = document.getElementById(`modal-btn-tier-${t}`);
    if (btn) {
      if (t === 1) {
        btn.className = currentTier === 1
          ? 'px-2.5 py-1 rounded-lg font-bold text-xs bg-emerald-600 text-white shadow-xs'
          : 'px-2.5 py-1 rounded-lg font-semibold text-xs border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white transition-all';
      } else if (t === 2) {
        btn.className = currentTier === 2
          ? 'px-2.5 py-1 rounded-lg font-bold text-xs bg-amber-600 text-white shadow-xs'
          : 'px-2.5 py-1 rounded-lg font-semibold text-xs border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white transition-all';
      } else if (t === 3) {
        btn.className = currentTier === 3
          ? 'px-2.5 py-1 rounded-lg font-bold text-xs bg-rose-600 text-white shadow-xs'
          : 'px-2.5 py-1 rounded-lg font-semibold text-xs border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-600 hover:text-white transition-all';
      } else if (t === 0) {
        btn.className = currentTier === 0
          ? 'px-2 py-1 rounded-lg font-medium text-xs bg-zinc-200 text-zinc-900'
          : 'px-2 py-1 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-all text-xs';
      }
    }
  });

  // Update note input
  const noteInput = document.getElementById('modal-tier-note-input');
  if (noteInput) {
    noteInput.value = currentNote;
  }
}

function setApplicantTierFromModal(tier) {
  if (!currentModalApplicant) return;
  const dept = document.getElementById('modal-tier-dept-select')?.value;
  if (!dept) return;

  const noteInput = document.getElementById('modal-tier-note-input');
  const note = noteInput ? noteInput.value.trim() : null;

  setApplicantTier(dept, currentModalApplicant.id, tier, note);
  updateModalTierControls();
}

function saveModalTierNote() {
  if (!currentModalApplicant) return;
  const dept = document.getElementById('modal-tier-dept-select')?.value;
  if (!dept) return;

  const currentTier = getApplicantTier(dept, currentModalApplicant.id);
  const noteInput = document.getElementById('modal-tier-note-input');
  const note = noteInput ? noteInput.value.trim() : '';

  setApplicantTier(dept, currentModalApplicant.id, currentTier, note);
}

function closeDetailModal() {
  const modal = document.getElementById('detail-modal');
  modal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function navigateModal(direction) {
  if (!currentModalApplicant || filteredApplicants.length === 0) return;
  const currentIndex = filteredApplicants.findIndex(a => a.id === currentModalApplicant.id);
  if (currentIndex < 0) return;

  let newIndex = currentIndex + direction;
  if (newIndex < 0) newIndex = filteredApplicants.length - 1;
  if (newIndex >= filteredApplicants.length) newIndex = 0;

  openDetailModal(filteredApplicants[newIndex].id);
}

function switchModalTab(tabName) {
  currentModalTab = tabName;

  const tabs = ['general', 'c1', 'c2', 'contact'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const content = document.getElementById(`modal-tab-content-${t}`);
    if (t === tabName) {
      btn.className = 'py-3 font-semibold text-indigo-600 border-b-2 border-indigo-600 transition-colors flex items-center space-x-1.5';
      content.classList.remove('hidden');
    } else {
      btn.className = 'py-3 font-medium text-zinc-500 hover:text-zinc-900 transition-colors flex items-center space-x-1.5';
      content.classList.add('hidden');
    }
  });

  lucide.createIcons();
}

function renderGeneralQuestionsModal(questions) {
  const container = document.getElementById('modal-general-questions-list');
  container.innerHTML = '';

  questions.forEach((q, idx) => {
    const block = document.createElement('div');
    block.className = 'p-4 rounded-xl border border-indigo-100 bg-white space-y-2 hover:border-indigo-300 transition-all shadow-2xs';
    block.innerHTML = `
      <div class="flex items-start space-x-2">
        <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-mono text-xs font-semibold shrink-0 mt-0.5">
          ${idx + 1}
        </span>
        <h4 class="text-xs sm:text-sm font-semibold text-zinc-900 leading-snug">
          ${q.question}
        </h4>
      </div>
      <div class="pl-7 text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line bg-indigo-50/30 p-3 rounded-lg border border-indigo-50">
        ${q.answer ? q.answer : '<span class="text-zinc-400 italic">ไม่มีคำตอบ</span>'}
      </div>
    `;
    container.appendChild(block);
  });
}

function renderDeptQuestionsModal(containerId, questions, style) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (!questions || questions.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 bg-zinc-50 rounded-xl border border-zinc-200 text-zinc-500 text-xs">
        <i data-lucide="help-circle" class="w-6 h-6 text-zinc-400 mx-auto mb-2"></i>
        ผู้สมัครไม่ได้เลือกฝ่ายนี้ หรือไม่มีชุดคำถามเฉพาะฝ่าย
      </div>
    `;
    return;
  }

  questions.forEach((q, idx) => {
    const block = document.createElement('div');
    block.className = 'p-4 rounded-xl border border-zinc-200/90 bg-white space-y-2 hover:border-zinc-300 transition-all shadow-2xs';
    block.innerHTML = `
      <div class="flex items-start space-x-2">
        <span class="inline-flex items-center justify-center w-5 h-5 rounded-full text-white font-mono text-xs font-semibold shrink-0 mt-0.5" style="background-color: ${style.hex}">
          ${idx + 1}
        </span>
        <h4 class="text-xs sm:text-sm font-semibold text-zinc-900 leading-snug">
          ${q.question}
        </h4>
      </div>
      <div class="pl-7 text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line bg-zinc-50/70 p-3 rounded-lg border border-zinc-100">
        ${q.answer ? q.answer : '<span class="text-zinc-400 italic">ไม่มีคำตอบ</span>'}
      </div>
    `;
    container.appendChild(block);
  });
}

function updateModalCompareButton() {
  const btn = document.getElementById('modal-compare-toggle-btn');
  if (!btn || !currentModalApplicant) return;

  const isCompared = compareIds.includes(currentModalApplicant.id);
  btn.className = isCompared
    ? 'inline-flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium bg-indigo-600 text-white transition-colors'
    : 'inline-flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium border border-zinc-200 hover:bg-zinc-100 text-zinc-700 transition-colors';
  btn.innerHTML = `<i data-lucide="${isCompared ? 'check' : 'plus'}" class="w-3 h-3"></i><span>${isCompared ? 'กำลังเปรียบเทียบ' : 'เปรียบเทียบ'}</span>`;
  lucide.createIcons();
}

function toggleCompareFromModal() {
  if (!currentModalApplicant) return;
  toggleCompare(currentModalApplicant.id);
  updateModalCompareButton();
}

// ==========================================
// COMPARISON LOGIC
// ==========================================
function toggleCompare(id) {
  const index = compareIds.indexOf(id);
  if (index >= 0) {
    compareIds.splice(index, 1);
  } else {
    if (compareIds.length >= 4) {
      alert('สามารถเลือกเปรียบเทียบได้สูงสุด 4 คนพร้อมกัน');
      return;
    }
    compareIds.push(id);
  }

  updateCompareTray();
  renderCandidateCards();
  lucide.createIcons();
}

function quickAddCompare(idStr) {
  if (!idStr) return;
  const id = parseInt(idStr, 10);
  if (!compareIds.includes(id)) {
    if (compareIds.length >= 4) {
      alert('สามารถเลือกเปรียบเทียบได้สูงสุด 4 คนพร้อมกัน');
      return;
    }
    compareIds.push(id);
    updateCompareTray();
    renderComparisonView();
  }
}

function clearComparison() {
  compareIds = [];
  updateCompareTray();
  renderCandidateCards();
  renderComparisonView();
  lucide.createIcons();
}

function updateCompareTray() {
  const tray = document.getElementById('floating-compare-tray');
  const countEl = document.getElementById('tray-count');
  const avatarContainer = document.getElementById('tray-avatars');
  const badgeEl = document.getElementById('tab-compare-badge');

  if (compareIds.length > 0) {
    tray.classList.remove('hidden');
    countEl.textContent = compareIds.length;
    badgeEl.textContent = compareIds.length;
    badgeEl.classList.remove('hidden');

    avatarContainer.innerHTML = '';
    compareIds.forEach(id => {
      const a = allApplicants.find(x => x.id === id);
      if (a) {
        const cStyle = getDeptStyle(a.choice1.dept);
        const dot = document.createElement('div');
        dot.className = `w-6 h-6 rounded-full ${cStyle.avatar} border-2 border-zinc-900 text-white flex items-center justify-center text-[10px] font-bold`;
        dot.textContent = a.nickname ? a.nickname.charAt(0) : a.name.charAt(0);
        dot.title = `${a.name} (${a.nickname})`;
        avatarContainer.appendChild(dot);
      }
    });
  } else {
    tray.classList.add('hidden');
    badgeEl.classList.add('hidden');
  }

  updateQuickCompareDropdown();
}

function updateQuickCompareDropdown() {
  const select = document.getElementById('quick-compare-select');
  if (!select) return;

  select.innerHTML = '<option value="">-- เลือกผู้สมัครเพิ่มเพื่อเปรียบเทียบ --</option>';
  allApplicants.forEach(a => {
    if (!a.isExcluded || !filters.hideExcluded) {
      const opt = document.createElement('option');
      opt.value = a.id;
      opt.textContent = `${a.name} (${a.nickname}) [รหัส ${a.year}] - ${a.choice1.dept}`;
      select.appendChild(opt);
    }
  });
}

function renderComparisonView() {
  const container = document.getElementById('compare-matrix-container');
  const emptyEl = document.getElementById('compare-empty');
  if (!container) return;

  if (compareIds.length === 0) {
    container.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  container.innerHTML = '';

  const candidates = compareIds.map(id => allApplicants.find(a => a.id === id)).filter(Boolean);
  const colCount = candidates.length;

  let gridColsClass = 'grid-cols-1 md:grid-cols-2';
  if (colCount === 3) gridColsClass = 'grid-cols-1 md:grid-cols-3';
  if (colCount === 4) gridColsClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

  const headerGrid = document.createElement('div');
  headerGrid.className = `grid ${gridColsClass} gap-4`;

  candidates.forEach(c => {
    const c1Style = getDeptStyle(c.choice1.dept);
    const c2Style = getDeptStyle(c.choice2.dept);

    const col = document.createElement('div');
    col.className = 'bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs relative flex flex-col justify-between space-y-3';
    col.innerHTML = `
      <div class="space-y-2">
        <button onclick="toggleCompare(${c.id})" class="absolute top-3 right-3 text-zinc-400 hover:text-rose-600 transition-colors" title="ลบออกจากการเปรียบเทียบ">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>

        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl ${c1Style.avatar} text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            ${c.nickname ? c.nickname.charAt(0) : c.name.charAt(0)}
          </div>
          <div class="pr-6">
            <h3 class="text-sm font-bold text-zinc-900 leading-tight">${c.name}</h3>
            <span class="text-xs text-zinc-500 font-medium">"${c.nickname}"</span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
          <span class="font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">รหัส ${c.year}</span>
          <span class="px-2 py-0.5 rounded ${c.gender === 'ชาย' ? 'bg-sky-50 text-sky-800 border border-sky-200' : 'bg-pink-50 text-pink-800 border border-pink-200'}">${c.gender}</span>
          <span class="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 truncate max-w-[150px]">${c.major}</span>
        </div>

        <div class="pt-2 border-t border-zinc-100 text-xs space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-zinc-500 text-[11px]">อันดับ 1:</span>
            <span class="font-semibold ${c1Style.badge} px-2 py-0.5 rounded-md text-[11px]">${c.choice1.dept}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-zinc-500 text-[11px]">อันดับ 2:</span>
            <span class="font-medium ${c.choice2.dept ? c2Style.badge : 'text-zinc-500'} px-2 py-0.5 rounded-md text-[11px]">${c.choice2.dept}</span>
          </div>
        </div>
      </div>

      <div class="pt-2 border-t border-zinc-100">
        <button onclick="openDetailModal(${c.id})" class="w-full text-center text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1.5 rounded-lg transition-colors font-medium">
          ดูข้อมูลฉบับเต็ม
        </button>
      </div>
    `;
    headerGrid.appendChild(col);
  });
  container.appendChild(headerGrid);

  // SECTION: GENERAL QUESTIONS COMPARISON
  const generalSection = document.createElement('div');
  generalSection.className = 'mt-8 space-y-6';
  generalSection.innerHTML = `
    <div class="border-b border-indigo-200 pb-2">
      <h3 class="text-sm font-bold text-indigo-900 uppercase tracking-wide flex items-center space-x-2">
        <span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
        <span>เปรียบเทียบคำถามทั่วไป (ข้อต่อข้อ)</span>
      </h3>
      <p class="text-xs text-zinc-500 mt-0.5">เทียบคำตอบคำถามส่วนกลาง 6 ข้อข้างกัน</p>
    </div>
  `;

  // Compare 6 General Questions
  const generalQCount = candidates[0].generalQuestions.length;
  for (let qIdx = 0; qIdx < generalQCount; qIdx++) {
    const qTitle = candidates[0].generalQuestions[qIdx].question;
    const qCard = document.createElement('div');
    qCard.className = 'bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3';
    
    let answersColsHtml = '';
    candidates.forEach(c => {
      const ans = c.generalQuestions[qIdx]?.answer || '<span class="text-zinc-400 italic">ไม่มีคำตอบ</span>';
      answersColsHtml += `
        <div class="space-y-1.5">
          <div class="text-[11px] font-semibold text-zinc-600 flex items-center space-x-1">
            <span>${c.name} (${c.nickname})</span>
          </div>
          <div class="text-xs text-zinc-800 leading-relaxed bg-indigo-50/20 p-3 rounded-xl border border-indigo-100/60 h-full whitespace-pre-line">
            ${ans}
          </div>
        </div>
      `;
    });

    qCard.innerHTML = `
      <div class="flex items-start space-x-2 pb-2 border-b border-zinc-100">
        <span class="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs flex items-center justify-center shrink-0 font-bold">
          ${qIdx + 1}
        </span>
        <h4 class="text-xs sm:text-sm font-semibold text-zinc-900">${qTitle}</h4>
      </div>
      <div class="grid ${gridColsClass} gap-4 pt-1">
        ${answersColsHtml}
      </div>
    `;
    generalSection.appendChild(qCard);
  }
  container.appendChild(generalSection);

  // SECTION: DEPARTMENT QUESTIONS COMPARISON
  const deptSection = document.createElement('div');
  deptSection.className = 'mt-10 space-y-6';
  deptSection.innerHTML = `
    <div class="border-b border-emerald-200 pb-2">
      <h3 class="text-sm font-bold text-emerald-900 uppercase tracking-wide flex items-center space-x-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
        <span>เปรียบเทียบคำถามเฉพาะฝ่าย (Department Questions)</span>
      </h3>
      <p class="text-xs text-zinc-500 mt-0.5">เทียบคำตอบเฉพาะด้านของฝ่ายอันดับ 1 และอันดับ 2</p>
    </div>
  `;

  // Check if all candidates share the same Choice 1 department
  const sharedDept = candidates.every(c => c.choice1.dept === candidates[0].choice1.dept) ? candidates[0].choice1.dept : null;

  if (sharedDept) {
    const dStyle = getDeptStyle(sharedDept);
    const deptQCount = candidates[0].choice1.questions.length;
    for (let qIdx = 0; qIdx < deptQCount; qIdx++) {
      const qTitle = candidates[0].choice1.questions[qIdx].question;
      const qCard = document.createElement('div');
      qCard.className = 'bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3';
      
      let answersColsHtml = '';
      candidates.forEach(c => {
        const ans = c.choice1.questions[qIdx]?.answer || '<span class="text-zinc-400 italic">ไม่มีคำตอบ</span>';
        answersColsHtml += `
          <div class="space-y-1.5">
            <div class="text-[11px] font-semibold text-zinc-600 flex items-center space-x-1">
              <span>${c.name} (${c.nickname})</span>
            </div>
            <div class="text-xs text-zinc-800 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-100 h-full whitespace-pre-line">
              ${ans}
            </div>
          </div>
        `;
      });

      qCard.innerHTML = `
        <div class="flex items-start space-x-2 pb-2 border-b border-zinc-100">
          <span class="px-2 py-0.5 rounded text-white text-[11px] font-medium shrink-0" style="background-color: ${dStyle.hex}">
            ${sharedDept} ข้อที่ ${qIdx + 1}
          </span>
          <h4 class="text-xs sm:text-sm font-semibold text-zinc-900">${qTitle}</h4>
        </div>
        <div class="grid ${gridColsClass} gap-4 pt-1">
          ${answersColsHtml}
        </div>
      `;
      deptSection.appendChild(qCard);
    }
  } else {
    const qCard = document.createElement('div');
    qCard.className = 'bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs';
    
    let answersColsHtml = '';
    candidates.forEach(c => {
      const cStyle = getDeptStyle(c.choice1.dept);
      let qListHtml = '';
      c.choice1.questions.forEach((q, idx) => {
        qListHtml += `
          <div class="space-y-1 pb-3 border-b border-zinc-100 last:border-0">
            <span class="text-[11px] font-semibold text-zinc-700 block">ข้อ ${idx + 1}: ${q.question}</span>
            <div class="text-xs text-zinc-800 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 whitespace-pre-line">
              ${q.answer || '<span class="text-zinc-400 italic">ไม่มีคำตอบ</span>'}
            </div>
          </div>
        `;
      });

      answersColsHtml += `
        <div class="space-y-3">
          <div class="pb-2 border-b border-zinc-200">
            <span class="font-bold text-xs text-zinc-900">${c.name} (${c.nickname})</span>
            <span class="inline-block text-[11px] ${cStyle.badge} px-2 py-0.5 rounded-md font-medium mt-1">สมัครฝ่าย: ${c.choice1.dept} (อันดับ 1)</span>
          </div>
          <div class="space-y-3">
            ${qListHtml || '<p class="text-xs text-zinc-400 italic">ไม่มีคำถาม</p>'}
          </div>
        </div>
      `;
    });

    qCard.innerHTML = `
      <div class="grid ${gridColsClass} gap-6">
        ${answersColsHtml}
      </div>
    `;
    deptSection.appendChild(qCard);
  }

  container.appendChild(deptSection);
  lucide.createIcons();
}

// ==========================================
// STATISTICS & CHARTS DASHBOARD (Vibrant Colors)
// ==========================================
function renderStatisticsDashboard() {
  if (!appData) return;
  const eligible = allApplicants.filter(a => !a.isExcluded);

  // 1. Department Breakdown Bar Chart
  const ctxDept = document.getElementById('chart-departments')?.getContext('2d');
  if (ctxDept) {
    if (chartInstances.dept) chartInstances.dept.destroy();

    const depts = appData.departments;
    const labels = depts.map(d => getDeptStyle(d).name);
    const c1Data = depts.map(d => appData.stats.eligible.deptChoice1[d] || 0);
    const c2Data = depts.map(d => appData.stats.eligible.deptChoice2[d] || 0);
    const colors = depts.map(d => getDeptStyle(d).hex);

    chartInstances.dept = new Chart(ctxDept, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'อันดับ 1',
            data: c1Data,
            backgroundColor: colors,
            borderRadius: 6
          },
          {
            label: 'อันดับ 2',
            data: c2Data,
            backgroundColor: '#cbd5e1',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { family: 'Prompt', size: 11 } }
          }
        },
        scales: {
          x: { ticks: { font: { family: 'Prompt', size: 11 } }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { stepSize: 5, font: { family: 'Inter', size: 11 } }, grid: { color: '#f1f5f9' } }
        }
      }
    });
  }

  // 2. Year Distribution Donut Chart (Emerald & Indigo)
  const ctxYears = document.getElementById('chart-years')?.getContext('2d');
  if (ctxYears) {
    if (chartInstances.years) chartInstances.years.destroy();

    const y68 = appData.stats.eligible.yearDist['68'] || 0;
    const y69 = appData.stats.eligible.yearDist['69'] || 0;

    chartInstances.years = new Chart(ctxYears, {
      type: 'doughnut',
      data: {
        labels: ['รหัส 69 (ปี 1)', 'รหัส 68 (ปี 2)'],
        datasets: [{
          data: [y69, y68],
          backgroundColor: ['#10b981', '#6366f1'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: 'Prompt', size: 11 } } }
        },
        cutout: '72%'
      }
    });

    const elStat69 = document.getElementById('stat-year-69');
    const elStat68 = document.getElementById('stat-year-68');
    if (elStat69) elStat69.textContent = `${y69} คน (${((y69 / eligible.length) * 100).toFixed(1)}%)`;
    if (elStat68) elStat68.textContent = `${y68} คน (${((y68 / eligible.length) * 100).toFixed(1)}%)`;
  }

  // 3. Gender Distribution Donut Chart (Sky & Rose)
  const ctxGender = document.getElementById('chart-gender')?.getContext('2d');
  if (ctxGender) {
    if (chartInstances.gender) chartInstances.gender.destroy();

    const gM = appData.stats.eligible.genderDist['ชาย'] || 0;
    const gF = appData.stats.eligible.genderDist['หญิง'] || 0;

    chartInstances.gender = new Chart(ctxGender, {
      type: 'doughnut',
      data: {
        labels: ['ชาย', 'หญิง'],
        datasets: [{
          data: [gM, gF],
          backgroundColor: ['#0284c7', '#ec4899'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: 'Prompt', size: 11 } } }
        },
        cutout: '70%'
      }
    });

    const elStatM = document.getElementById('stat-gender-m');
    const elStatF = document.getElementById('stat-gender-f');
    if (elStatM) elStatM.textContent = `${gM} คน (${((gM / eligible.length) * 100).toFixed(1)}%)`;
    if (elStatF) elStatF.textContent = `${gF} คน (${((gF / eligible.length) * 100).toFixed(1)}%)`;
  }

  // 4. Experience Donut Chart
  const ctxExp = document.getElementById('chart-experience')?.getContext('2d');
  if (ctxExp) {
    if (chartInstances.exp) chartInstances.exp.destroy();

    const expOld = appData.stats.eligible.expDist['เคยทำค่าย'] || 0;
    const expNew = appData.stats.eligible.expDist['ไม่เคยทำค่าย'] || 0;

    chartInstances.exp = new Chart(ctxExp, {
      type: 'doughnut',
      data: {
        labels: ['สมัครใหม่', 'เคยทำค่าย'],
        datasets: [{
          data: [expNew, expOld],
          backgroundColor: ['#64748b', '#f59e0b'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: 'Prompt', size: 11 } } }
        },
        cutout: '70%'
      }
    });

    const elExpNew = document.getElementById('stat-exp-new');
    const elExpOld = document.getElementById('stat-exp-old');
    if (elExpNew) elExpNew.textContent = `${expNew} คน (${((expNew / eligible.length) * 100).toFixed(1)}%)`;
    if (elExpOld) elExpOld.textContent = `${expOld} คน (${((expOld / eligible.length) * 100).toFixed(1)}%)`;
  }

  // 5. Interview Date Bar Chart
  const ctxInterview = document.getElementById('chart-interview')?.getContext('2d');
  if (ctxInterview) {
    if (chartInstances.interview) chartInstances.interview.destroy();

    const iDist = appData.stats.eligible.interviewDist;
    const labels = Object.keys(iDist);
    const data = Object.values(iDist);

    chartInstances.interview = new Chart(ctxInterview, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'จำนวนคน',
          data: data,
          backgroundColor: '#8b5cf6',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { ticks: { font: { family: 'Prompt', size: 10 } }, grid: { display: false } },
          y: { beginAtZero: true, ticks: { font: { family: 'Inter', size: 10 } }, grid: { color: '#f1f5f9' } }
        }
      }
    });
  }

  // 6. Majors Horizontal Bar Chart
  const ctxMajors = document.getElementById('chart-majors')?.getContext('2d');
  if (ctxMajors) {
    if (chartInstances.majors) chartInstances.majors.destroy();

    const mDist = appData.stats.eligible.majorDist;
    const sortedMajors = Object.entries(mDist).sort((a, b) => b[1] - a[1]);
    const labels = sortedMajors.map(m => m[0]);
    const data = sortedMajors.map(m => m[1]);

    chartInstances.majors = new Chart(ctxMajors, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'ผู้สมัคร',
          data: data,
          backgroundColor: '#6366f1',
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Inter', size: 11 } } },
          y: { ticks: { font: { family: 'Prompt', size: 11 } }, grid: { display: false } }
        }
      }
    });
  }

  // 7. Department Matrix Table
  renderDepartmentMatrixTable();
}

function renderDepartmentMatrixTable() {
  const tbody = document.getElementById('matrix-table-body');
  if (!tbody || !appData) return;

  tbody.innerHTML = '';
  const eligible = allApplicants.filter(a => !a.isExcluded);

  appData.departments.forEach(dept => {
    const c1 = appData.stats.eligible.deptChoice1[dept] || 0;
    const c2 = appData.stats.eligible.deptChoice2[dept] || 0;
    const total = c1 + c2;
    const dStyle = getDeptStyle(dept);

    const interested = eligible.filter(a => a.choice1.dept === dept || a.choice2.dept === dept);
    const count68 = interested.filter(a => a.year === '68').length;
    const count69 = interested.filter(a => a.year === '69').length;
    const countM = interested.filter(a => a.gender === 'ชาย').length;
    const countF = interested.filter(a => a.gender === 'หญิง').length;

    const row = document.createElement('tr');
    row.className = 'hover:bg-zinc-50 transition-colors';
    row.innerHTML = `
      <td class="py-2.5 px-3 font-medium font-sans text-zinc-900 flex items-center space-x-2">
        <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${dStyle.hex}"></span>
        <span>${dept}</span>
      </td>
      <td class="py-2.5 px-3 text-center font-bold text-zinc-900">${c1}</td>
      <td class="py-2.5 px-3 text-center text-zinc-600">${c2}</td>
      <td class="py-2.5 px-3 text-center font-bold text-indigo-700 bg-indigo-50/50">${total}</td>
      <td class="py-2.5 px-3 text-center text-indigo-600">${count68}</td>
      <td class="py-2.5 px-3 text-center text-emerald-600">${count69}</td>
      <td class="py-2.5 px-3 text-center text-sky-600">${countM}</td>
      <td class="py-2.5 px-3 text-center text-pink-600">${countF}</td>
    `;
    tbody.appendChild(row);
  });
}

// ==========================================
// EXCLUDED APPLICANTS MODAL
// ==========================================
function openExcludedModal() {
  if (!appData) return;
  const container = document.getElementById('excluded-list-container');
  container.innerHTML = '';

  appData.excludedList.forEach(ex => {
    const item = document.createElement('div');
    item.className = 'bg-rose-50/40 border border-rose-200 rounded-xl p-3.5 space-y-2 text-xs';
    item.innerHTML = `
      <div class="flex items-start justify-between">
        <div>
          <h4 class="font-bold text-zinc-900 text-sm">${ex.name} <span class="font-normal text-zinc-500">("${ex.nickname}")</span></h4>
          <span class="font-mono text-zinc-500 text-[11px]">รหัส ${ex.studentId} • ${ex.major}</span>
        </div>
        <div class="flex flex-wrap gap-1">
          ${ex.reasons.map(r => `<span class="bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-medium text-[11px]">${r}</span>`).join('')}
        </div>
      </div>
      <div class="pt-1.5 border-t border-rose-200/60 text-zinc-600 flex items-center justify-between">
        <span>อันดับ 1: <strong class="text-zinc-800">${ex.choice1}</strong></span>
        <span>อันดับ 2: <strong class="text-zinc-600">${ex.choice2}</strong></span>
      </div>
    `;
    container.appendChild(item);
  });

  document.getElementById('excluded-modal').classList.remove('hidden');
  lucide.createIcons();
}

function closeExcludedModal() {
  document.getElementById('excluded-modal').classList.add('hidden');
}

// ==========================================
// RELOAD DATA FROM EXCEL VIA API
// ==========================================
async function reloadExcelData(e) {
  try {
    const btn = e ? e.currentTarget : (window.event ? window.event.currentTarget : null);
    if (btn) btn.classList.add('opacity-50', 'pointer-events-none');
    
    const res = await fetch('/api/reload');
    if (res.ok) {
      const dataRes = await fetch('/api/data');
      appData = await dataRes.json();
      allApplicants = appData.applicants || [];
      updateTopKPIs();
      setupUI();
      setupTierUI();
      applyFilters();
      if (!document.getElementById('view-stats').classList.contains('hidden')) {
        renderStatisticsDashboard();
      }
      alert('ซิงค์ข้อมูลจากไฟล์ Excel เรียบร้อยแล้ว!');
    } else {
      alert('ไม่สามารถซิงค์ข้อมูลผ่าน API ได้ (หากเปิดแบบไฟล์ตรง ให้รันผ่าน server.py)');
    }
    if (btn) btn.classList.remove('opacity-50', 'pointer-events-none');
  } catch (e) {
    alert('ไม่สามารถเชื่อมต่อ API ได้ (หากเปิดแบบไฟล์ ให้รัน python server.py เพื่อใช้งาน API ซิงค์)');
  }
}
