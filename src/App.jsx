import { useState, useEffect, useRef } from "react";

// ─── Sheet Best live connection ───────────────────────────────────────────────
// Your spreadsheet is reachable through one base link; each tab is addressed
// by appending /tabs/<TabName>. We try the expected tab name first, then a
// couple of likely variants, since spreadsheet tab names are easy to mistype.
const SHEET_BASE = "https://api.sheetbest.com/sheets/2e28ff62-6a2f-4119-b090-734ef4548d85";

async function sheetGet(tabCandidates) {
  for (const tab of tabCandidates) {
    try {
      const res = await fetch(`${SHEET_BASE}/tabs/${encodeURIComponent(tab)}`);
      if (res.ok) {
        const data = await res.json();
        return { data, tab };
      }
    } catch (e) { /* try next candidate */ }
  }
  return { data: null, tab: null };
}

async function sheetPost(tab, row) {
  const res = await fetch(`${SHEET_BASE}/tabs/${encodeURIComponent(tab)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([row]),
  });
  return res.ok;
}

async function sheetPatch(tab, idField, idValue, row) {
  const res = await fetch(`${SHEET_BASE}/tabs/${encodeURIComponent(tab)}/${idField}/${encodeURIComponent(idValue)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  });
  return res.ok;
}

async function sheetDelete(tab, idField, idValue) {
  const res = await fetch(`${SHEET_BASE}/tabs/${encodeURIComponent(tab)}/${idField}/${encodeURIComponent(idValue)}`, {
    method: "DELETE",
  });
  return res.ok;
}

// ── Color palette from logo ──────────────────────────────────────────────────
// Gold: #B8962E / #C9A84C   Black: #1A1A1A   White: #FAFAFA
// ─────────────────────────────────────────────────────────────────────────────

const GOLD = "#C9A84C";
const DARK_GOLD = "#B8962E";
const BLACK = "#1A1A1A";
const OFF_WHITE = "#FAF8F3";
const LIGHT_BG = "#F5F2EA";

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

const STAGES = ["Search", "Screen", "Interview", "Offer", "Contract", "Onboarding"];

const STAGE_ICONS = ["🔍", "📋", "🎙️", "📨", "📝", "🚀"];

const initialJobs = [
  { id: uid(), title: "Senior Accountant", dept: "Finance", location: "Accra", type: "Full-Time", posted: "2026-05-15", applicants: 12, status: "Active" },
  { id: uid(), title: "Operations Manager", dept: "Operations", location: "Kumasi", type: "Full-Time", posted: "2026-05-20", applicants: 8, status: "Active" },
  { id: uid(), title: "HR Business Partner", dept: "Human Resources", location: "Accra", type: "Full-Time", posted: "2026-05-22", applicants: 5, status: "Draft" },
  { id: uid(), title: "IT Support Specialist", dept: "Technology", location: "Accra", type: "Contract", posted: "2026-05-28", applicants: 3, status: "Active" },
];

const initialCandidates = [
  { id: uid(), name: "Ama Boateng", role: "Senior Accountant", email: "ama.boateng@email.com", phone: "+233 24 111 2233", stage: "Interview", score: 87, tags: ["CPA", "IFRS", "Excel"], avatar: "AB", jobId: initialJobs[0].id },
  { id: uid(), name: "Kwame Asante", role: "Operations Manager", email: "kwame.asante@email.com", phone: "+233 20 555 6677", stage: "Offer", score: 92, tags: ["Supply Chain", "ISO", "Leadership"], avatar: "KA", jobId: initialJobs[1].id },
  { id: uid(), name: "Efua Mensah", role: "Senior Accountant", email: "efua.mensah@email.com", phone: "+233 27 888 9900", stage: "Screen", score: 74, tags: ["ACCA", "Audit", "SAP"], avatar: "EM", jobId: initialJobs[0].id },
  { id: uid(), name: "Kofi Darko", role: "IT Support Specialist", email: "kofi.darko@email.com", phone: "+233 24 333 4455", stage: "Contract", score: 89, tags: ["CompTIA", "Networking", "Azure"], avatar: "KD", jobId: initialJobs[3].id },
  { id: uid(), name: "Abena Owusu", role: "HR Business Partner", email: "abena.owusu@email.com", phone: "+233 26 777 8899", stage: "Search", score: 81, tags: ["SHRM", "L&D", "HRIS"], avatar: "AO", jobId: initialJobs[2].id },
  { id: uid(), name: "Yaw Adjei", role: "Operations Manager", email: "yaw.adjei@email.com", phone: "+233 20 444 5566", stage: "Onboarding", score: 95, tags: ["PMP", "Lean", "Six Sigma"], avatar: "YA", jobId: initialJobs[1].id },
];

const onboardingTasks = [
  { id: 1, category: "Documents", task: "Submit passport / Ghana card copy", done: false },
  { id: 2, category: "Documents", task: "Tax Identification Number (TIN)", done: false },
  { id: 3, category: "Documents", task: "SSNIT card / number", done: false },
  { id: 4, category: "IT Setup", task: "Company email account created", done: false },
  { id: 5, category: "IT Setup", task: "Access credentials issued", done: false },
  { id: 6, category: "IT Setup", task: "Laptop / equipment assigned", done: false },
  { id: 7, category: "Orientation", task: "Company overview session", done: false },
  { id: 8, category: "Orientation", task: "HR policies review & sign-off", done: false },
  { id: 9, category: "Orientation", task: "Meet the team introduction", done: false },
  { id: 10, category: "Training", task: "Safety & compliance training", done: false },
  { id: 11, category: "Training", task: "Role-specific onboarding plan", done: false },
  { id: 12, category: "Training", task: "30-day check-in scheduled", done: false },
];

// ─── Logo SVG (Galloping Horse) ───────────────────────────────────────────────
const Logo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <path d="M95 25 C88 18,78 20,72 26 L60 40 C55 36,48 34,42 37 L30 45 C22 50,18 60,22 68 L28 80 C30 86,36 90,42 88 L50 85 C54 90,58 96,58 96 L68 92 C65 86,63 80,65 74 L72 68 C78 72,86 72,92 66 L100 52 C106 44,104 32,95 25Z" fill={GOLD}/>
    <path d="M95 25 C91 22,86 21,82 23 L75 28 C79 24,86 22,92 26" stroke={GOLD} strokeWidth="2" fill="none"/>
    <path d="M42 88 L36 98 L44 96 L48 86" fill={GOLD}/>
    <path d="M58 96 L54 106 L62 104 L66 94" fill={GOLD}/>
    <circle cx="90" cy="30" r="3" fill={DARK_GOLD}/>
  </svg>
);

// ─── Styles (inline) ──────────────────────────────────────────────────────────
const S = {
  app: {
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
    background: OFF_WHITE,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    color: BLACK,
  },
  topbar: {
    background: BLACK,
    padding: "0 32px",
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `2px solid ${GOLD}`,
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  brandText: { color: GOLD, fontSize: 20, fontWeight: 700, letterSpacing: "0.04em" },
  brandSub: { color: "#888", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 },
  nav: { display: "flex", gap: 4 },
  navBtn: (active) => ({
    background: active ? GOLD : "transparent",
    color: active ? BLACK : "#ccc",
    border: "none",
    padding: "6px 16px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontFamily: "inherit",
    fontWeight: active ? 700 : 400,
    transition: "all 0.2s",
  }),
  main: { flex: 1, padding: "28px 32px", maxWidth: 1280, margin: "0 auto", width: "100%", boxSizing: "border-box" },
  pageTitle: { fontSize: 32, fontWeight: 700, color: BLACK, marginBottom: 4, letterSpacing: "-0.02em" },
  pageSub: { fontSize: 13, color: "#888", marginBottom: 28, letterSpacing: "0.05em" },
  goldLine: { width: 48, height: 3, background: GOLD, borderRadius: 2, marginBottom: 24 },

  // Cards
  card: {
    background: "#fff",
    border: `1px solid #E8E2D4`,
    borderRadius: 8,
    padding: 20,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },

  // KPI row
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 },
  kpiCard: (accent) => ({
    background: "#fff",
    border: `1px solid #E8E2D4`,
    borderLeft: `4px solid ${accent}`,
    borderRadius: 8,
    padding: "18px 20px",
  }),
  kpiNum: { fontSize: 36, fontWeight: 700, color: BLACK, lineHeight: 1 },
  kpiLabel: { fontSize: 11, color: "#999", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 },

  // Buttons
  btn: (variant = "primary") => ({
    background: variant === "primary" ? GOLD : variant === "danger" ? "#e53e3e" : "#fff",
    color: variant === "primary" ? BLACK : variant === "danger" ? "#fff" : BLACK,
    border: variant === "secondary" ? "1px solid #D4C9A8" : "none",
    padding: "9px 20px",
    borderRadius: 5,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontFamily: "inherit",
    transition: "opacity 0.2s",
  }),
  btnSm: (active) => ({
    background: active ? GOLD : LIGHT_BG,
    color: active ? BLACK : "#666",
    border: "none",
    padding: "5px 12px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
    fontFamily: "inherit",
  }),

  // Stage pill
  stagePill: (stage) => {
    const map = {
      Search: ["#FFF3CD", "#B8860B"],
      Screen: ["#E3F2FD", "#1565C0"],
      Interview: ["#F3E5F5", "#6A1B9A"],
      Offer: ["#E8F5E9", "#2E7D32"],
      Contract: ["#FFF8E1", "#E65100"],
      Onboarding: ["#E0F2F1", "#00695C"],
    };
    const [bg, fg] = map[stage] || ["#eee", "#333"];
    return { background: bg, color: fg, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" };
  },

  // Table
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", borderBottom: "2px solid #E8E2D4", background: LIGHT_BG },
  td: { padding: "12px 14px", borderBottom: "1px solid #EEE9DC", fontSize: 14, verticalAlign: "middle" },

  avatar: (bg) => ({
    width: 36, height: 36, borderRadius: "50%",
    background: bg || GOLD,
    color: BLACK,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 700, flexShrink: 0,
  }),

  // Modal overlay
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
  },
  modal: {
    background: "#fff", borderRadius: 10, width: "min(680px, 95vw)",
    maxHeight: "88vh", overflowY: "auto", padding: 32,
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    border: `2px solid ${GOLD}`,
  },

  // Pipeline
  pipelineRow: { display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8, marginBottom: 24 },
  pipelineCol: { background: "#fff", borderRadius: 8, border: "1px solid #E8E2D4", padding: 12, minHeight: 80 },
  pipelineHeader: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: 8, display: "flex", justifyContent: "space-between" },
  pipelineCard: { background: LIGHT_BG, borderRadius: 6, padding: "8px 10px", marginBottom: 6, borderLeft: `3px solid ${GOLD}`, cursor: "pointer" },

  input: {
    width: "100%", padding: "9px 12px", border: "1px solid #D4C9A8",
    borderRadius: 5, fontSize: 14, fontFamily: "inherit",
    background: "#FDFBF7", boxSizing: "border-box", outline: "none",
    transition: "border 0.2s",
  },
  label: { fontSize: 12, fontWeight: 700, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 4 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },

  // Onboarding task
  taskItem: (done) => ({
    display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
    borderRadius: 6, background: done ? "#F0FFF4" : "#fff",
    border: `1px solid ${done ? "#9AE6B4" : "#E8E2D4"}`,
    marginBottom: 6, cursor: "pointer", transition: "all 0.2s",
  }),
  checkbox: (done) => ({
    width: 20, height: 20, borderRadius: 5,
    background: done ? GOLD : "#fff",
    border: `2px solid ${done ? GOLD : "#D4C9A8"}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: "all 0.2s",
  }),

  score: (s) => ({
    fontWeight: 700, fontSize: 13,
    color: s >= 90 ? "#22863a" : s >= 75 ? DARK_GOLD : "#e53e3e",
  }),

  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: BLACK, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 },
  divider: { border: "none", borderTop: "1px solid #E8E2D4", margin: "20px 0" },
};

// ─── CONTRACT TEMPLATE ────────────────────────────────────────────────────────
const buildContract = (candidate, startDate, salary) => `
EMPLOYMENT CONTRACT

GOLDCard Resources LLC — The Business Support Company
Accra, Ghana

Date: ${new Date().toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" })}

PARTIES
This Employment Contract is entered into between:

Employer: GOLDCard Resources LLC (hereinafter "the Company")
          Registered in Ghana. RC No. GH-XXXX-2018

Employee: ${candidate.name}
          Role: ${candidate.role}

1. COMMENCEMENT & PROBATION
   Employment commences on ${startDate || "[START DATE]"}.
   A probationary period of three (3) months applies.

2. POSITION & DUTIES
   The Employee is appointed as ${candidate.role} in the ${candidate.dept || "relevant"} department.
   Duties as outlined in the attached Job Description.

3. REMUNERATION
   Monthly Gross Salary: GHS ${salary || "[SALARY]"}
   Payment Method: Bank transfer by the 28th of each month.

4. WORKING HOURS
   Standard hours: Monday–Friday, 08:00–17:00 (GMT).
   Overtime compensated per company policy.

5. LEAVE ENTITLEMENT
   Annual Leave: 21 working days per year.
   Sick Leave: As per Ghana Labour Act 651.

6. CONFIDENTIALITY
   The Employee agrees to maintain strict confidentiality of all company
   information, client data, and proprietary knowledge.

7. TERMINATION
   Either party may terminate with one (1) month's written notice during
   probation; three (3) months thereafter.

8. GOVERNING LAW
   This contract is governed by the Labour Act 651 of Ghana.

SIGNATURES

_________________________          _________________________
${candidate.name}                  For GOLDCard Resources LLC
Employee                           Authorised Signatory

Date: _______________              Date: _______________
`;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [modal, setModal] = useState(null); // "addJob" | "addCandidate" | "contract" | "onboard" | "candidateDetail"
  const [contractData, setContractData] = useState({ startDate: "", salary: "" });
  const [onboardTasks, setOnboardTasks] = useState([]);
  const [newJob, setNewJob] = useState({ title: "", dept: "", location: "Accra", type: "Full-Time", status: "Active", descriptionLink: "" });
  const [newCand, setNewCand] = useState({ name: "", role: "", email: "", phone: "", stage: "Search", tags: "" });
  const [filterStage, setFilterStage] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [syncStatus, setSyncStatus] = useState("loading"); // loading | live | offline
  const [jobsTabName, setJobsTabName] = useState("Jobs");
  const [candTabName, setCandTabName] = useState("Candidates");
  const [onboardTabName, setOnboardTabName] = useState("Onboarding");

  // ── Load live data from the Google Sheet on first render ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [jobsRes, candRes, onbRes] = await Promise.all([
        sheetGet(["Jobs"]),
        sheetGet(["Candidates", "Candidate"]),
        sheetGet(["Onboarding"]),
      ]);
      if (cancelled) return;

      if (jobsRes.data) {
        setJobsTabName(jobsRes.tab);
        setJobs(jobsRes.data.map(r => ({ ...r, applicants: Number(r.applicants) || 0 })));
      } else {
        setJobs(initialJobs);
      }

      if (candRes.data) {
        setCandTabName(candRes.tab);
        setCandidates(candRes.data.map(r => ({
          ...r,
          score: Number(r.score) || 0,
          tags: typeof r.tags === "string" ? r.tags.split(",").map(t => t.trim()).filter(Boolean) : (r.tags || []),
        })));
      } else {
        setCandidates(initialCandidates);
      }

      if (onbRes.data && onbRes.data.length > 0) {
        setOnboardTabName(onbRes.tab);
        setOnboardTasks(onbRes.data.map(r => ({
          ...r,
          id: Number(r.id) || r.id,
          done: r.done === true || r.done === "true" || r.done === "TRUE" || r.done === 1,
        })));
      } else {
        setOnboardTasks(onboardingTasks);
      }

      setSyncStatus((jobsRes.data || candRes.data || onbRes.data) ? "live" : "offline");
    })();
    return () => { cancelled = true; };
  }, []);

  const tabs = ["Dashboard", "Job Search", "Pipeline", "Candidates", "Contracts", "Onboarding"];

  // ── Computed ──
  const stageCount = (s) => candidates.filter(c => c.stage === s).length;
  const activeJobs = jobs.filter(j => j.status === "Active").length;
  const totalApps = jobs.reduce((a, j) => a + j.applicants, 0);
  const hireRate = Math.round((candidates.filter(c => c.stage === "Onboarding").length / candidates.length) * 100);

  const filteredCandidates = candidates.filter(c => {
    const matchStage = filterStage === "All" || c.stage === filterStage;
    const matchSearch = c.name.toLowerCase().includes(searchQ.toLowerCase()) || c.role.toLowerCase().includes(searchQ.toLowerCase());
    return matchStage && matchSearch;
  });

  const toggleTask = (id) => {
    setOnboardTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const newDone = !t.done;
      sheetPatch(onboardTabName, "id", id, { done: newDone });
      return { ...t, done: newDone };
    }));
  };
  const completedTasks = onboardTasks.filter(t => t.done).length;
  const onboardProgress = Math.round((completedTasks / onboardTasks.length) * 100);
  const taskCategories = [...new Set(onboardTasks.map(t => t.category))];

  const addJob = async () => {
    if (!newJob.title) return;
    const row = { ...newJob, id: uid(), posted: new Date().toISOString().slice(0, 10), applicants: 0 };
    setJobs(prev => [...prev, row]);
    setNewJob({ title: "", dept: "", location: "Accra", type: "Full-Time", status: "Active", descriptionLink: "" });
    setModal(null);
    await sheetPost(jobsTabName, row);
  };

  const addCandidate = async () => {
    if (!newCand.name) return;
    const row = {
      ...newCand,
      id: uid(),
      avatar: newCand.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
      score: Math.floor(Math.random() * 20 + 75),
      tags: newCand.tags, // keep as comma string for the sheet
    };
    setCandidates(prev => [...prev, { ...row, tags: row.tags.split(",").map(t => t.trim()).filter(Boolean) }]);
    setNewCand({ name: "", role: "", email: "", phone: "", stage: "Search", tags: "" });
    setModal(null);
    await sheetPost(candTabName, row);
  };

  const advanceStage = (cid) => {
    setCandidates(prev => prev.map(c => {
      if (c.id !== cid) return c;
      const idx = STAGES.indexOf(c.stage);
      const newStage = STAGES[Math.min(idx + 1, STAGES.length - 1)];
      sheetPatch(candTabName, "id", c.id, { stage: newStage });
      return { ...c, stage: newStage };
    }));
  };

  const openCandidate = (c) => { setSelectedCandidate(c); setModal("candidateDetail"); };

  // ── Contract text ──
  const contractText = selectedCandidate ? buildContract(selectedCandidate, contractData.startDate, contractData.salary) : "";

  return (
    <div style={S.app}>
      {/* ── Google Font ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Barlow:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .hover-row:hover { background: #FAF7EE !important; }
        .btn-hover:hover { opacity: 0.85; }
        input:focus { border-color: ${GOLD} !important; }
        select:focus { border-color: ${GOLD} !important; outline: none; }
        textarea:focus { border-color: ${GOLD} !important; outline: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #D4C9A8; border-radius: 3px; }
        .pipeline-card:hover { background: #EDE8DC !important; }
      `}</style>

      {/* ── TOPBAR ── */}
      <div style={S.topbar}>
        <div style={S.brand}>
          <Logo size={40} />
          <div>
            <div style={S.brandText}>GOLDCard Resources</div>
            <div style={S.brandSub}>HR Recruitment System · Ghana</div>
          </div>
        </div>
        <div style={S.nav}>
          {tabs.map(t => (
            <button key={t} style={S.navBtn(tab === t)} className="btn-hover" onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#999" }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: syncStatus === "live" ? "#27AE60" : syncStatus === "loading" ? "#E0B341" : "#888",
              display: "inline-block",
            }} />
            {syncStatus === "live" ? "Synced to Sheet" : syncStatus === "loading" ? "Connecting…" : "Offline (local demo data)"}
          </div>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: BLACK }}>HR</div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={S.main}>

        {/* ────────────── DASHBOARD ─────────────────────────────────────── */}
        {tab === "Dashboard" && (
          <div>
            <div style={S.pageTitle}>Recruitment Dashboard</div>
            <div style={S.pageSub}>GOLDCARD RESOURCES LLC — ACCRA, GHANA</div>
            <div style={S.goldLine} />

            {/* KPIs */}
            <div style={S.kpiGrid}>
              {[
                { label: "Active Jobs", val: activeJobs, accent: GOLD },
                { label: "Total Applications", val: totalApps, accent: "#4A90D9" },
                { label: "In Pipeline", val: candidates.length, accent: "#9B59B6" },
                { label: "Hire Rate", val: `${hireRate}%`, accent: "#27AE60" },
              ].map(k => (
                <div key={k.label} style={S.kpiCard(k.accent)}>
                  <div style={S.kpiNum}>{k.val}</div>
                  <div style={S.kpiLabel}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Stage funnel */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>
              <div style={S.card}>
                <div style={S.sectionTitle}>📊 Recruitment Funnel</div>
                {STAGES.map((s, i) => {
                  const cnt = stageCount(s);
                  const pct = Math.round((cnt / candidates.length) * 100);
                  return (
                    <div key={s} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span>{STAGE_ICONS[i]} {s}</span>
                        <span style={{ fontWeight: 700 }}>{cnt} candidates</span>
                      </div>
                      <div style={{ height: 8, background: LIGHT_BG, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: GOLD, borderRadius: 4, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={S.card}>
                <div style={S.sectionTitle}>⚡ Quick Actions</div>
                {[
                  { label: "Post New Job", action: () => { setModal("addJob"); setTab("Job Search"); } },
                  { label: "Add Candidate", action: () => { setModal("addCandidate"); setTab("Candidates"); } },
                  { label: "View Pipeline", action: () => setTab("Pipeline") },
                  { label: "Generate Contract", action: () => setTab("Contracts") },
                  { label: "Onboarding Tracker", action: () => setTab("Onboarding") },
                ].map(q => (
                  <button key={q.label} className="btn-hover" style={{ ...S.btn("secondary"), width: "100%", marginBottom: 8, textAlign: "left" }} onClick={q.action}>
                    → {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent candidates */}
            <div style={S.card}>
              <div style={{ ...S.sectionTitle, marginBottom: 12 }}>🕐 Recent Candidates</div>
              <table style={S.table}>
                <thead>
                  <tr>
                    {["Candidate", "Role", "Stage", "Score"].map(h => <th key={h} style={S.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {candidates.slice(0, 5).map(c => (
                    <tr key={c.id} className="hover-row" style={{ cursor: "pointer" }} onClick={() => openCandidate(c)}>
                      <td style={S.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={S.avatar()}>{c.avatar}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: "#999" }}>{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={S.td}>{c.role}</td>
                      <td style={S.td}><span style={S.stagePill(c.stage)}>{c.stage}</span></td>
                      <td style={S.td}><span style={S.score(c.score)}>{c.score}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ────────────── JOB SEARCH ───────────────────────────────────────── */}
        {tab === "Job Search" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <div style={S.pageTitle}>Job Postings</div>
                <div style={S.pageSub}>MANAGE OPEN POSITIONS & TALENT SEARCH</div>
                <div style={S.goldLine} />
              </div>
              <button style={S.btn()} className="btn-hover" onClick={() => setModal("addJob")}>+ Post New Job</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
              {jobs.map(j => (
                <div key={j.id} style={{ ...S.card, borderTop: `3px solid ${GOLD}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{j.title}</div>
                      <div style={{ fontSize: 13, color: "#888" }}>{j.dept} · {j.location} · {j.type}</div>
                    </div>
                    <span style={{ ...S.stagePill(j.status === "Active" ? "Offer" : "Search"), fontSize: 10 }}>
                      {j.status}
                    </span>
                  </div>
                  <hr style={S.divider} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <span>📅 Posted: {j.posted}</span>
                    <span style={{ fontWeight: 700, color: DARK_GOLD }}>👤 {j.applicants} Applicants</span>
                  </div>
                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <button style={S.btn()} className="btn-hover"
                      onClick={() => { setNewCand(n => ({ ...n, role: j.title })); setModal("addCandidate"); }}>
                      Add Candidate
                    </button>
                    <button style={S.btn("secondary")} className="btn-hover"
                      onClick={() => {
                        const newStatus = j.status === "Active" ? "Paused" : "Active";
                        setJobs(prev => prev.map(jj => jj.id === j.id ? { ...jj, status: newStatus } : jj));
                        sheetPatch(jobsTabName, "id", j.id, { status: newStatus });
                      }}>
                      {j.status === "Active" ? "Pause" : "Activate"}
                    </button>
                    <button style={S.btn("danger")} className="btn-hover"
                      onClick={() => {
                        setJobs(prev => prev.filter(jj => jj.id !== j.id));
                        sheetDelete(jobsTabName, "id", j.id);
                      }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ────────────── PIPELINE ─────────────────────────────────────────── */}
        {tab === "Pipeline" && (
          <div>
            <div style={S.pageTitle}>Recruitment Pipeline</div>
            <div style={S.pageSub}>CANDIDATE JOURNEY — SEARCH TO HIRE</div>
            <div style={S.goldLine} />

            <div style={S.pipelineRow}>
              {STAGES.map((stage, i) => {
                const stageCands = candidates.filter(c => c.stage === stage);
                return (
                  <div key={stage} style={S.pipelineCol}>
                    <div style={S.pipelineHeader}>
                      <span>{STAGE_ICONS[i]} {stage}</span>
                      <span style={{ background: GOLD, color: BLACK, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>
                        {stageCands.length}
                      </span>
                    </div>
                    {stageCands.map(c => (
                      <div key={c.id} className="pipeline-card" style={S.pipelineCard} onClick={() => openCandidate(c)}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{c.role}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={S.score(c.score)}>{c.score}%</span>
                          {STAGES.indexOf(stage) < STAGES.length - 1 && (
                            <button style={{ ...S.btnSm(false), fontSize: 10 }} className="btn-hover"
                              onClick={(e) => { e.stopPropagation(); advanceStage(c.id); }}>
                              Advance →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Summary bar */}
            <div style={{ ...S.card, display: "flex", gap: 0, padding: 0, overflow: "hidden" }}>
              {STAGES.map((s, i) => {
                const cnt = stageCount(s);
                return (
                  <div key={s} style={{ flex: 1, padding: "14px 12px", borderRight: i < STAGES.length - 1 ? "1px solid #E8E2D4" : "none", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{cnt}</div>
                    <div style={{ fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ────────────── CANDIDATES ───────────────────────────────────────── */}
        {tab === "Candidates" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <div style={S.pageTitle}>Candidates</div>
                <div style={S.pageSub}>ALL APPLICANTS IN THE SYSTEM</div>
                <div style={S.goldLine} />
              </div>
              <button style={S.btn()} className="btn-hover" onClick={() => setModal("addCandidate")}>+ Add Candidate</button>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <input style={{ ...S.input, width: 240 }} placeholder="🔍 Search name or role…" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
              <div style={{ display: "flex", gap: 6 }}>
                {["All", ...STAGES].map(s => (
                  <button key={s} style={S.btnSm(filterStage === s)} className="btn-hover" onClick={() => setFilterStage(s)}>{s}</button>
                ))}
              </div>
            </div>

            <div style={S.card}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {["Candidate", "Role", "Contact", "Tags", "Stage", "Score", "Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map(c => (
                    <tr key={c.id} className="hover-row">
                      <td style={S.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={S.avatar()}>{c.avatar}</div>
                          <div style={{ fontWeight: 600 }}>{c.name}</div>
                        </div>
                      </td>
                      <td style={S.td}>{c.role}</td>
                      <td style={S.td}>
                        <div style={{ fontSize: 12 }}>{c.email}</div>
                        <div style={{ fontSize: 11, color: "#999" }}>{c.phone}</div>
                      </td>
                      <td style={S.td}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {(c.tags || []).map(t => (
                            <span key={t} style={{ background: LIGHT_BG, border: "1px solid #D4C9A8", borderRadius: 3, padding: "1px 7px", fontSize: 10 }}>{t}</span>
                          ))}
                        </div>
                      </td>
                      <td style={S.td}><span style={S.stagePill(c.stage)}>{c.stage}</span></td>
                      <td style={S.td}><span style={S.score(c.score)}>{c.score}%</span></td>
                      <td style={S.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={S.btnSm(false)} className="btn-hover" onClick={() => openCandidate(c)}>View</button>
                          <button style={S.btnSm(false)} className="btn-hover" onClick={() => advanceStage(c.id)}>→</button>
                          <button style={{ ...S.btnSm(false), background: "#FFF0F0", color: "#c53030" }} className="btn-hover"
                            onClick={() => {
                              setCandidates(prev => prev.filter(x => x.id !== c.id));
                              sheetDelete(candTabName, "id", c.id);
                            }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCandidates.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#999" }}>No candidates found.</div>}
            </div>
          </div>
        )}

        {/* ────────────── CONTRACTS ────────────────────────────────────────── */}
        {tab === "Contracts" && (
          <div>
            <div style={S.pageTitle}>Employment Contracts</div>
            <div style={S.pageSub}>GENERATE & MANAGE OFFER LETTERS AND CONTRACTS</div>
            <div style={S.goldLine} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Generate panel */}
              <div style={S.card}>
                <div style={S.sectionTitle}>📝 Generate Contract</div>
                <div style={{ marginBottom: 14 }}>
                  <label style={S.label}>Select Candidate</label>
                  <select style={{ ...S.input }} onChange={e => setSelectedCandidate(candidates.find(c => c.id === e.target.value) || null)}>
                    <option value="">— Choose candidate —</option>
                    {candidates.filter(c => ["Offer", "Contract"].includes(c.stage)).map(c => (
                      <option key={c.id} value={c.id}>{c.name} — {c.role}</option>
                    ))}
                  </select>
                </div>
                <div style={S.formGrid}>
                  <div>
                    <label style={S.label}>Start Date</label>
                    <input style={S.input} type="date" value={contractData.startDate}
                      onChange={e => setContractData(d => ({ ...d, startDate: e.target.value }))} />
                  </div>
                  <div>
                    <label style={S.label}>Monthly Salary (GHS)</label>
                    <input style={S.input} placeholder="e.g. 8,500" value={contractData.salary}
                      onChange={e => setContractData(d => ({ ...d, salary: e.target.value }))} />
                  </div>
                </div>
                <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                  <button style={S.btn()} className="btn-hover"
                    onClick={() => { if (selectedCandidate) setModal("contract"); }}>
                    Preview Contract
                  </button>
                </div>

                {/* Candidates ready for contract */}
                <hr style={S.divider} />
                <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Candidates at Offer / Contract stage:</div>
                {candidates.filter(c => ["Offer", "Contract"].includes(c.stage)).map(c => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F0EBE0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={S.avatar()}>{c.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: "#999" }}>{c.role}</div>
                      </div>
                    </div>
                    <span style={S.stagePill(c.stage)}>{c.stage}</span>
                  </div>
                ))}
              </div>

              {/* Contract tracker */}
              <div style={S.card}>
                <div style={S.sectionTitle}>📬 Contract Status Tracker</div>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {["Candidate", "Role", "Stage", "Action"].map(h => <th key={h} style={S.th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map(c => (
                      <tr key={c.id} className="hover-row">
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ ...S.avatar(), width: 28, height: 28, fontSize: 11 }}>{c.avatar}</div>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                          </div>
                        </td>
                        <td style={{ ...S.td, fontSize: 12 }}>{c.role}</td>
                        <td style={S.td}><span style={S.stagePill(c.stage)}>{c.stage}</span></td>
                        <td style={S.td}>
                          {["Offer", "Contract"].includes(c.stage) && (
                            <button style={S.btnSm(false)} className="btn-hover"
                              onClick={() => { setSelectedCandidate(c); setModal("contract"); }}>
                              Generate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ────────────── ONBOARDING ───────────────────────────────────────── */}
        {tab === "Onboarding" && (
          <div>
            <div style={S.pageTitle}>Employee Onboarding</div>
            <div style={S.pageSub}>STRUCTURED ONBOARDING CHECKLIST FOR NEW HIRES</div>
            <div style={S.goldLine} />

            {/* Progress bar */}
            <div style={{ ...S.card, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontWeight: 700 }}>Overall Onboarding Progress</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: onboardProgress >= 80 ? "#27AE60" : DARK_GOLD }}>{onboardProgress}%</div>
              </div>
              <div style={{ height: 12, background: LIGHT_BG, borderRadius: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${onboardProgress}%`, background: onboardProgress >= 80 ? "#27AE60" : GOLD, borderRadius: 6, transition: "width 0.5s ease" }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>{completedTasks} of {onboardTasks.length} tasks completed</div>
            </div>

            {/* New hire summary */}
            <div style={{ ...S.card, marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ ...S.avatar(), width: 54, height: 54, fontSize: 18, background: GOLD }}>YA</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>Yaw Adjei</div>
                <div style={{ fontSize: 13, color: "#888" }}>Operations Manager · Start Date: 2026-06-10</div>
                <span style={S.stagePill("Onboarding")}>Active Onboarding</span>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button style={S.btn()} className="btn-hover"
                  onClick={() => setOnboardTasks(prev => prev.map(t => ({ ...t, done: true })))}>
                  Mark All Complete
                </button>
                <button style={S.btn("secondary")} className="btn-hover"
                  onClick={() => setOnboardTasks(onboardingTasks)}>
                  Reset
                </button>
              </div>
            </div>

            {/* Tasks by category */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {taskCategories.map(cat => {
                const catTasks = onboardTasks.filter(t => t.category === cat);
                const catDone = catTasks.filter(t => t.done).length;
                return (
                  <div key={cat} style={S.card}>
                    <div style={{ ...S.sectionTitle, marginBottom: 12 }}>
                      {cat === "Documents" ? "📂" : cat === "IT Setup" ? "💻" : cat === "Orientation" ? "🏢" : "📚"} {cat}
                      <span style={{ marginLeft: "auto", fontSize: 12, color: "#888" }}>{catDone}/{catTasks.length}</span>
                    </div>
                    <div style={{ height: 4, background: LIGHT_BG, borderRadius: 2, marginBottom: 12 }}>
                      <div style={{ height: "100%", width: `${(catDone / catTasks.length) * 100}%`, background: GOLD, borderRadius: 2 }} />
                    </div>
                    {catTasks.map(t => (
                      <div key={t.id} style={S.taskItem(t.done)} onClick={() => toggleTask(t.id)}>
                        <div style={S.checkbox(t.done)}>
                          {t.done && <span style={{ fontSize: 11, fontWeight: 700, color: BLACK }}>✓</span>}
                        </div>
                        <span style={{ fontSize: 13, textDecoration: t.done ? "line-through" : "none", color: t.done ? "#888" : BLACK }}>
                          {t.task}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Onboarding candidates */}
            <div style={{ ...S.card, marginTop: 20 }}>
              <div style={S.sectionTitle}>🚀 All Onboarding Candidates</div>
              <table style={S.table}>
                <thead>
                  <tr>
                    {["Employee", "Role", "Stage", "Score"].map(h => <th key={h} style={S.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {candidates.filter(c => c.stage === "Onboarding").map(c => (
                    <tr key={c.id} className="hover-row">
                      <td style={S.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={S.avatar()}>{c.avatar}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: "#999" }}>{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={S.td}>{c.role}</td>
                      <td style={S.td}><span style={S.stagePill("Onboarding")}>Onboarding</span></td>
                      <td style={S.td}><span style={S.score(c.score)}>{c.score}%</span></td>
                    </tr>
                  ))}
                  {candidates.filter(c => c.stage === "Onboarding").length === 0 && (
                    <tr><td colSpan={4} style={{ ...S.td, textAlign: "center", color: "#999" }}>No employees in onboarding.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════ MODALS ══════════════════════════════════════════════════ */}

      {/* ── Add Job ── */}
      {modal === "addJob" && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Post New Job</div>
            <div style={S.goldLine} />
            <div style={S.formGrid}>
              {[
                { key: "title", label: "Job Title", placeholder: "e.g. Senior Accountant" },
                { key: "dept", label: "Department", placeholder: "e.g. Finance" },
                { key: "location", label: "Location", placeholder: "e.g. Accra" },
              ].map(f => (
                <div key={f.key}>
                  <label style={S.label}>{f.label}</label>
                  <input style={S.input} placeholder={f.placeholder} value={newJob[f.key]}
                    onChange={e => setNewJob(n => ({ ...n, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label style={S.label}>Type</label>
                <select style={S.input} value={newJob.type} onChange={e => setNewJob(n => ({ ...n, type: e.target.value }))}>
                  {["Full-Time", "Part-Time", "Contract", "Internship"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={S.label}>Job Description Link (PDF/Word, optional)</label>
                <input style={S.input} placeholder="Paste a Google Drive or Dropbox link" value={newJob.descriptionLink || ""}
                  onChange={e => setNewJob(n => ({ ...n, descriptionLink: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <button style={S.btn()} className="btn-hover" onClick={addJob}>Post Job</button>
              <button style={S.btn("secondary")} className="btn-hover" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Candidate ── */}
      {modal === "addCandidate" && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Add New Candidate</div>
            <div style={S.goldLine} />
            <div style={S.formGrid}>
              {[
                { key: "name", label: "Full Name", placeholder: "e.g. Ama Boateng" },
                { key: "role", label: "Applied Role", placeholder: "e.g. Senior Accountant" },
                { key: "email", label: "Email", placeholder: "ama@email.com" },
                { key: "phone", label: "Phone", placeholder: "+233 24 000 0000" },
              ].map(f => (
                <div key={f.key}>
                  <label style={S.label}>{f.label}</label>
                  <input style={S.input} placeholder={f.placeholder} value={newCand[f.key]}
                    onChange={e => setNewCand(n => ({ ...n, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={S.label}>Stage</label>
              <select style={S.input} value={newCand.stage} onChange={e => setNewCand(n => ({ ...n, stage: e.target.value }))}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={S.label}>Skills / Tags (comma-separated)</label>
              <input style={S.input} placeholder="e.g. ACCA, SAP, Excel" value={newCand.tags}
                onChange={e => setNewCand(n => ({ ...n, tags: e.target.value }))} />
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <button style={S.btn()} className="btn-hover" onClick={addCandidate}>Add Candidate</button>
              <button style={S.btn("secondary")} className="btn-hover" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Candidate Detail ── */}
      {modal === "candidateDetail" && selectedCandidate && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ ...S.avatar(), width: 56, height: 56, fontSize: 20 }}>{selectedCandidate.avatar}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{selectedCandidate.name}</div>
                <div style={{ fontSize: 14, color: "#888" }}>{selectedCandidate.role}</div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <span style={S.stagePill(selectedCandidate.stage)}>{selectedCandidate.stage}</span>
              </div>
            </div>
            <div style={S.goldLine} />
            <div style={S.formGrid}>
              <div><label style={S.label}>Email</label><div style={{ fontSize: 14 }}>{selectedCandidate.email}</div></div>
              <div><label style={S.label}>Phone</label><div style={{ fontSize: 14 }}>{selectedCandidate.phone}</div></div>
              <div><label style={S.label}>Match Score</label><div style={S.score(selectedCandidate.score)}>{selectedCandidate.score}%</div></div>
              <div>
                <label style={S.label}>Skills</label>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {(selectedCandidate.tags || []).map(t => (
                    <span key={t} style={{ background: LIGHT_BG, border: "1px solid #D4C9A8", borderRadius: 3, padding: "2px 8px", fontSize: 11 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
              <button style={S.btn()} className="btn-hover" onClick={() => { advanceStage(selectedCandidate.id); setModal(null); }}>
                Advance Stage →
              </button>
              <button style={S.btn("secondary")} className="btn-hover" onClick={() => { setModal("contract"); }}>
                Generate Contract
              </button>
              <button style={S.btn("secondary")} className="btn-hover" onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Contract Preview ── */}
      {modal === "contract" && selectedCandidate && (
        <div style={S.overlay} onClick={() => setModal(null)}>
          <div style={{ ...S.modal, width: "min(720px,95vw)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>Employment Contract Preview</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={S.btn()} className="btn-hover" onClick={() => {
                  const blob = new Blob([contractText], { type: "text/plain" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `Contract_${selectedCandidate.name.replace(" ", "_")}.txt`;
                  a.click();
                }}>⬇ Download</button>
                <button style={S.btn("secondary")} className="btn-hover" onClick={() => setModal(null)}>✕ Close</button>
              </div>
            </div>
            <div style={S.goldLine} />
            <div style={S.formGrid}>
              <div>
                <label style={S.label}>Start Date</label>
                <input style={S.input} type="date" value={contractData.startDate}
                  onChange={e => setContractData(d => ({ ...d, startDate: e.target.value }))} />
              </div>
              <div>
                <label style={S.label}>Monthly Salary (GHS)</label>
                <input style={S.input} placeholder="e.g. 8,500" value={contractData.salary}
                  onChange={e => setContractData(d => ({ ...d, salary: e.target.value }))} />
              </div>
            </div>
            <div style={{ marginTop: 16, background: LIGHT_BG, border: "1px solid #D4C9A8", borderRadius: 6, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <Logo size={48} />
              </div>
              <pre style={{ fontFamily: "'Barlow', monospace", fontSize: 12, lineHeight: 1.8, whiteSpace: "pre-wrap", color: BLACK }}>
                {contractText}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

