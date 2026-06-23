import { useState, useEffect } from "react";

// ─── Live Sheet connection (read jobs, write applications) ──────────────────
const SHEET_BASE = "https://api.sheetbest.com/sheets/2e28ff62-6a2f-4119-b090-734ef4548d85";

async function sheetGet(tabCandidates) {
  for (const tab of tabCandidates) {
    try {
      const res = await fetch(`${SHEET_BASE}/tabs/${encodeURIComponent(tab)}`);
      if (res.ok) {
        const data = await res.json();
        return { data, tab };
      }
    } catch (e) { /* try next */ }
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

const uid = () => Math.random().toString(36).slice(2, 9);

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const GOLD = "#C9A84C";
const DARK_GOLD = "#9C7C28";
const BLACK = "#15130F";
const CREAM = "#FAF7F0";
const LINE = "#E6DFC9";

const Logo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <path d="M95 25 C88 18,78 20,72 26 L60 40 C55 36,48 34,42 37 L30 45 C22 50,18 60,22 68 L28 80 C30 86,36 90,42 88 L50 85 C54 90,58 96,58 96 L68 92 C65 86,63 80,65 74 L72 68 C78 72,86 72,92 66 L100 52 C106 44,104 32,95 25Z" fill={GOLD}/>
    <path d="M42 88 L36 98 L44 96 L48 86" fill={GOLD}/>
    <path d="M58 96 L54 106 L62 104 L66 94" fill={GOLD}/>
    <circle cx="90" cy="30" r="3" fill={DARK_GOLD}/>
  </svg>
);

const S = {
  page: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    background: CREAM,
    minHeight: "100vh",
    color: BLACK,
  },
  header: {
    borderBottom: `2px solid ${GOLD}`,
    background: BLACK,
    padding: "20px 32px",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  brand: { color: GOLD, fontSize: 22, fontWeight: 700, letterSpacing: "0.03em" },
  brandSub: { color: "#999", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" },
  hero: {
    padding: "64px 32px 48px",
    maxWidth: 880,
    margin: "0 auto",
    textAlign: "center",
  },
  eyebrow: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: 12,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: DARK_GOLD,
    marginBottom: 14,
  },
  h1: { fontSize: "clamp(34px, 5vw, 52px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 18, letterSpacing: "-0.01em" },
  lede: { fontFamily: "'Barlow', sans-serif", fontSize: 17, color: "#555", lineHeight: 1.6, maxWidth: 560, margin: "0 auto" },
  goldLine: { width: 56, height: 3, background: GOLD, margin: "28px auto 0", borderRadius: 2 },

  jobsSection: { maxWidth: 880, margin: "0 auto", padding: "0 32px 80px" },
  jobCard: {
    background: "#fff",
    border: `1px solid ${LINE}`,
    borderLeft: `4px solid ${GOLD}`,
    borderRadius: 8,
    padding: "22px 26px",
    marginBottom: 16,
    cursor: "pointer",
    transition: "box-shadow 0.2s, transform 0.15s",
  },
  jobTitle: { fontSize: 21, fontWeight: 700, marginBottom: 4 },
  jobMeta: { fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#888", letterSpacing: "0.02em" },
  jobTag: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: DARK_GOLD,
    background: "#FBF4E0",
    border: `1px solid ${GOLD}`,
    borderRadius: 20,
    padding: "3px 12px",
    display: "inline-block",
    marginTop: 10,
  },
  applyHint: { fontFamily: "'Barlow', sans-serif", fontSize: 13, color: GOLD, fontWeight: 600, marginTop: 12 },

  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#999",
    fontFamily: "'Barlow', sans-serif",
  },

  overlay: {
    position: "fixed", inset: 0, background: "rgba(21,19,15,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 20, zIndex: 999,
  },
  modal: {
    background: "#fff", borderRadius: 10, width: "min(560px, 100%)",
    maxHeight: "90vh", overflowY: "auto", padding: "36px 32px",
    border: `2px solid ${GOLD}`,
    boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
  },
  label: {
    fontFamily: "'Barlow', sans-serif",
    fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", color: "#666", display: "block", marginBottom: 6,
  },
  input: {
    width: "100%", padding: "11px 14px", border: `1px solid ${LINE}`,
    borderRadius: 6, fontSize: 15, fontFamily: "'Barlow', sans-serif",
    background: CREAM, boxSizing: "border-box", outline: "none", marginBottom: 18,
  },
  textarea: {
    width: "100%", padding: "11px 14px", border: `1px solid ${LINE}`,
    borderRadius: 6, fontSize: 15, fontFamily: "'Barlow', sans-serif",
    background: CREAM, boxSizing: "border-box", outline: "none", marginBottom: 18,
    minHeight: 90, resize: "vertical",
  },
  btn: {
    width: "100%", background: GOLD, color: BLACK, border: "none",
    padding: "13px 0", borderRadius: 6, fontSize: 13, fontWeight: 700,
    letterSpacing: "0.08em", textTransform: "uppercase",
    fontFamily: "'Barlow', sans-serif", cursor: "pointer",
  },
  closeBtn: {
    background: "none", border: "none", color: "#999", fontSize: 22,
    cursor: "pointer", position: "absolute", top: 18, right: 22,
  },
  successBox: { textAlign: "center", padding: "20px 0" },
  footer: {
    textAlign: "center", padding: "28px 0 40px", fontFamily: "'Barlow', sans-serif",
    fontSize: 12, color: "#aaa",
  },
};

export default function CareersPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [candTabName, setCandTabName] = useState("Candidates");
  const [jobsTabName, setJobsTabName] = useState("Jobs");
  const [selectedJob, setSelectedJob] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", tags: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      const jobsRes = await sheetGet(["Jobs"]);
      const candRes = await sheetGet(["Candidates", "Candidate"]);
      if (candRes.tab) setCandTabName(candRes.tab);
      if (jobsRes.data) {
        setJobsTabName(jobsRes.tab);
        const open = jobsRes.data.filter(j => (j.status || "").toLowerCase() === "active");
        setJobs(open);
      }
      setLoading(false);
    })();
  }, []);

  const openApply = (job) => {
    setSelectedJob(job);
    setForm({ name: "", email: "", phone: "", tags: "", note: "" });
    setSubmitted(false);
  };

  const submitApplication = async () => {
    if (!form.name || !form.email) return;
    setSubmitting(true);
    const row = {
      id: uid(),
      name: form.name,
      role: selectedJob.title,
      email: form.email,
      phone: form.phone,
      stage: "Search",
      score: "",
      tags: form.tags,
      avatar: form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
      jobId: selectedJob.id || "",
    };
    await sheetPost(candTabName, row);
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Barlow:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .job-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
        input:focus, textarea:focus { border-color: ${GOLD} !important; }
        .apply-btn:hover { opacity: 0.88; }
      `}</style>

      <div style={S.header}>
        <Logo size={36} />
        <div>
          <div style={S.brand}>GOLDCard Resources</div>
          <div style={S.brandSub}>Careers · Ghana</div>
        </div>
      </div>

      <div style={S.hero}>
        <div style={S.eyebrow}>Join the team</div>
        <h1 style={S.h1}>Build your career<br/>with GOLDCard</h1>
        <p style={S.lede}>
          GOLDCard Resources Group is a multi-disciplinary project and procurement
          management company with technical expertise in marine, engineering, and
          construction services. Browse our open roles below and apply directly —
          our HR team reviews every application personally.
        </p>
        <div style={S.goldLine} />
      </div>

      <div style={S.jobsSection}>
        {loading && (
          <div style={S.emptyState}>Loading open positions…</div>
        )}

        {!loading && jobs.length === 0 && (
          <div style={S.emptyState}>
            No open positions right now. Check back soon, or follow us for updates.
          </div>
        )}

        {!loading && jobs.map((job) => (
          <div
            key={job.id || job.title}
            className="job-card"
            style={S.jobCard}
            onClick={() => openApply(job)}
          >
            <div style={S.jobTitle}>{job.title}</div>
            <div style={S.jobMeta}>
              {job.dept} &nbsp;·&nbsp; {job.location} &nbsp;·&nbsp; {job.type}
            </div>
            <div style={S.jobTag}>{job.type || "Open"}</div>
            <div style={S.applyHint}>Click to apply →</div>
          </div>
        ))}
      </div>

      <div style={S.footer}>
        GOLDCard Resources Group — Project & Procurement Management · Marine · Engineering · Construction
      </div>

      {/* ── Apply Modal ── */}
      {selectedJob && (
        <div style={S.overlay} onClick={() => setSelectedJob(null)}>
          <div style={{ ...S.modal, position: "relative" }} onClick={e => e.stopPropagation()}>
            <button style={S.closeBtn} onClick={() => setSelectedJob(null)}>✕</button>

            {!submitted ? (
              <>
                <div style={S.eyebrow}>Applying for</div>
                <h2 style={{ fontSize: 26, fontWeight: 700, marginTop: 4, marginBottom: 4 }}>
                  {selectedJob.title}
                </h2>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#888", marginBottom: 24 }}>
                  {selectedJob.dept} · {selectedJob.location}
                </p>

                <label style={S.label}>Full name</label>
                <input style={S.input} value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Ama Boateng" />

                <label style={S.label}>Email</label>
                <input style={S.input} type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@email.com" />

                <label style={S.label}>Phone</label>
                <input style={S.input} value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+233 24 000 0000" />

                <label style={S.label}>Key skills (comma-separated)</label>
                <input style={S.input} value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="e.g. Excel, SAP, ACCA" />

                <label style={S.label}>Anything you'd like us to know (optional)</label>
                <textarea style={S.textarea} value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="A short note about your experience…" />

                <button
                  className="apply-btn"
                  style={{ ...S.btn, opacity: submitting ? 0.6 : 1 }}
                  disabled={submitting || !form.name || !form.email}
                  onClick={submitApplication}
                >
                  {submitting ? "Submitting…" : "Submit application"}
                </button>
              </>
            ) : (
              <div style={S.successBox}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Application received</h2>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#666", marginBottom: 24 }}>
                  Thank you for applying to <strong>{selectedJob.title}</strong>. Our HR team
                  will review your application and reach out if there's a fit.
                </p>
                <button style={S.btn} onClick={() => setSelectedJob(null)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
 
