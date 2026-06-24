import { useState, useEffect } from "react";

// ─── Live Sheet connection (read jobs, write applications, check status) ────
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

const STAGE_INFO = {
  Search: { label: "Application received", detail: "Your application is in our system and waiting to be reviewed.", step: 1 },
  Screen: { label: "Under review", detail: "Our HR team is reviewing your application against the role.", step: 2 },
  Interview: { label: "Interview stage", detail: "You've been shortlisted. Our team will be in touch to schedule a conversation.", step: 3 },
  Offer: { label: "Offer stage", detail: "Congratulations — your application has progressed to an offer discussion.", step: 4 },
  Contract: { label: "Contract stage", detail: "We're finalizing your employment contract. Check your email for next steps.", step: 5 },
  Onboarding: { label: "Onboarding", detail: "Welcome aboard! You're being onboarded as a new member of the team.", step: 6 },
};
const STAGE_ORDER = ["Search", "Screen", "Interview", "Offer", "Contract", "Onboarding"];

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
  page: { fontFamily: "'Cormorant Garamond', Georgia, serif", background: CREAM, minHeight: "100vh", color: BLACK },
  header: { borderBottom: `2px solid ${GOLD}`, background: BLACK, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  brand: { color: GOLD, fontSize: 22, fontWeight: 700, letterSpacing: "0.03em" },
  brandSub: { color: "#999", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" },
  navLink: { fontFamily: "'Barlow', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: "0.04em", color: GOLD, textDecoration: "none", border: `1px solid ${GOLD}`, borderRadius: 20, padding: "8px 18px", cursor: "pointer", background: "none" },
  hero: { padding: "64px 32px 48px", maxWidth: 880, margin: "0 auto", textAlign: "center" },
  eyebrow: { fontFamily: "'Barlow', sans-serif", fontSize: 12, letterSpacing: "0.25em", textTransform: "uppercase", color: DARK_GOLD, marginBottom: 14 },
  h1: { fontSize: "clamp(34px, 5vw, 52px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 18, letterSpacing: "-0.01em" },
  lede: { fontFamily: "'Barlow', sans-serif", fontSize: 17, color: "#555", lineHeight: 1.6, maxWidth: 560, margin: "0 auto" },
  goldLine: { width: 56, height: 3, background: GOLD, margin: "28px auto 0", borderRadius: 2 },
  jobsSection: { maxWidth: 880, margin: "0 auto", padding: "0 32px 80px" },
  jobCard: { background: "#fff", border: `1px solid ${LINE}`, borderLeft: `4px solid ${GOLD}`, borderRadius: 8, padding: "22px 26px", marginBottom: 16, cursor: "pointer", transition: "box-shadow 0.2s, transform 0.15s" },
  jobTitle: { fontSize: 21, fontWeight: 700, marginBottom: 4 },
  jobMeta: { fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#888", letterSpacing: "0.02em" },
  jobTag: { fontFamily: "'Barlow', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: DARK_GOLD, background: "#FBF4E0", border: `1px solid ${GOLD}`, borderRadius: 20, padding: "3px 12px", display: "inline-block", marginTop: 10 },
  applyHint: { fontFamily: "'Barlow', sans-serif", fontSize: 13, color: GOLD, fontWeight: 600, marginTop: 12 },
  emptyState: { textAlign: "center", padding: "60px 20px", color: "#999", fontFamily: "'Barlow', sans-serif" },
  overlay: { position: "fixed", inset: 0, background: "rgba(21,19,15,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 999 },
  modal: { background: "#fff", borderRadius: 10, width: "min(560px, 100%)", maxHeight: "90vh", overflowY: "auto", padding: "36px 32px", border: `2px solid ${GOLD}`, boxShadow: "0 24px 60px rgba(0,0,0,0.35)" },
  label: { fontFamily: "'Barlow', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#666", display: "block", marginBottom: 6 },
  helper: { fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#999", marginTop: -14, marginBottom: 18, lineHeight: 1.5 },
  input: { width: "100%", padding: "11px 14px", border: `1px solid ${LINE}`, borderRadius: 6, fontSize: 15, fontFamily: "'Barlow', sans-serif", background: CREAM, boxSizing: "border-box", outline: "none", marginBottom: 18 },
  textarea: { width: "100%", padding: "11px 14px", border: `1px solid ${LINE}`, borderRadius: 6, fontSize: 15, fontFamily: "'Barlow', sans-serif", background: CREAM, boxSizing: "border-box", outline: "none", marginBottom: 18, minHeight: 90, resize: "vertical" },
  btn: { width: "100%", background: GOLD, color: BLACK, border: "none", padding: "13px 0", borderRadius: 6, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Barlow', sans-serif", cursor: "pointer" },
  closeBtn: { background: "none", border: "none", color: "#999", fontSize: 22, cursor: "pointer", position: "absolute", top: 18, right: 22 },
  successBox: { textAlign: "center", padding: "20px 0" },
  footer: { textAlign: "center", padding: "28px 0 40px", fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#aaa" },
  statusWrap: { maxWidth: 560, margin: "0 auto", padding: "0 32px 80px" },
  statusCard: { background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, padding: "28px 28px", marginTop: 8 },
  trackRow: { display: "flex", alignItems: "center", marginBottom: 4 },
  trackDot: (active, done) => ({ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: done ? GOLD : "#fff", border: `2px solid ${done || active ? GOLD : LINE}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: done ? BLACK : DARK_GOLD }),
  trackLine: (done) => ({ width: 2, height: 30, background: done ? GOLD : LINE, marginLeft: 10 }),
  trackLabel: (active) => ({ fontFamily: "'Barlow', sans-serif", fontWeight: active ? 700 : 500, fontSize: 15, color: active ? BLACK : "#888", marginLeft: 14 }),
  notFound: { fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#999", textAlign: "center", padding: "20px 0" },
};

export default function CareersPage() {
  const view = window.location.pathname.startsWith("/status") ? "status" : "jobs";

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [candTabName, setCandTabName] = useState("Candidates");
  const [allCandidates, setAllCandidates] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", tags: "", cvLink: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [statusEmail, setStatusEmail] = useState("");
  const [statusResults, setStatusResults] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const jobsRes = await sheetGet(["Jobs"]);
      const candRes = await sheetGet(["Candidates", "Candidate"]);
      if (candRes.tab) setCandTabName(candRes.tab);
      if (candRes.data) setAllCandidates(candRes.data);
      if (jobsRes.data) {
        const open = jobsRes.data.filter(j => (j.status || "").toLowerCase() === "active");
        setJobs(open);
      }
      setLoading(false);
    })();
  }, []);

  const openApply = (job) => {
    setSelectedJob(job);
    setForm({ name: "", email: "", phone: "", tags: "", cvLink: "", note: "" });
    setSubmitted(false);
  };

  const submitApplication = async () => {
    if (!form.name || !form.email) return;
    setSubmitting(true);
    const row = {
      id: uid(), name: form.name, role: selectedJob.title, email: form.email,
      phone: form.phone, stage: "Search", score: "", tags: form.tags,
      avatar: form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
      jobId: selectedJob.id || "", cvLink: form.cvLink, note: form.note,
    };
    await sheetPost(candTabName, row);
    setSubmitting(false);
    setSubmitted(true);
  };

  const checkStatus = async () => {
    setStatusLoading(true);
    setStatusResults(null);
    const candRes = await sheetGet(["Candidates", "Candidate"]);
    const list = candRes.data || allCandidates;
    const matches = list.filter(c => (c.email || "").toLowerCase().trim() === statusEmail.toLowerCase().trim());
    setStatusResults(matches);
    setStatusLoading(false);
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
        .nav-link:hover { background: ${GOLD}; color: ${BLACK} !important; }
      `}</style>

      <div style={S.header}>
        <div style={S.headerLeft}>
          <Logo size={36} />
          <div>
            <div style={S.brand}>GOLDCard Resources</div>
            <div style={S.brandSub}>Careers · Ghana</div>
          </div>
        </div>
        <button className="nav-link" style={S.navLink}
          onClick={() => { window.location.pathname = view === "status" ? "/careers" : "/status"; }}>
          {view === "status" ? "← Back to open roles" : "Check application status"}
        </button>
      </div>

      {view === "jobs" ? (
        <>
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
            {loading && <div style={S.emptyState}>Loading open positions…</div>}
            {!loading && jobs.length === 0 && (
              <div style={S.emptyState}>No open positions right now. Check back soon, or follow us for updates.</div>
            )}
            {!loading && jobs.map((job) => (
              <div key={job.id || job.title} className="job-card" style={S.jobCard} onClick={() => openApply(job)}>
                <div style={S.jobTitle}>{job.title}</div>
                <div style={S.jobMeta}>{job.dept} &nbsp;·&nbsp; {job.location} &nbsp;·&nbsp; {job.type}</div>
                <div style={S.jobTag}>{job.type || "Open"}</div>
                {job.descriptionLink && (
                  <div>
                    <a
                      href={job.descriptionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        fontFamily: "'Barlow', sans-serif", fontSize: 13, fontWeight: 600,
                        color: DARK_GOLD, textDecoration: "underline", marginTop: 10,
                        display: "inline-block",
                      }}
                    >
                      View full job description ↗
                    </a>
                  </div>
                )}
                <div style={S.applyHint}>Click to apply →</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={S.statusWrap}>
          <div style={{ ...S.hero, padding: "56px 0 24px" }}>
            <div style={S.eyebrow}>Track your application</div>
            <h1 style={{ ...S.h1, fontSize: "clamp(28px, 4vw, 40px)" }}>Check your status</h1>
            <p style={S.lede}>Enter the email address you used to apply, and we'll show you where your application currently stands.</p>
          </div>

          <label style={S.label}>Email address</label>
          <input style={S.input} type="email" value={statusEmail}
            onChange={e => setStatusEmail(e.target.value)}
            placeholder="you@email.com"
            onKeyDown={e => e.key === "Enter" && statusEmail && checkStatus()} />
          <button className="apply-btn" style={{ ...S.btn, opacity: statusLoading || !statusEmail ? 0.6 : 1 }}
            disabled={statusLoading || !statusEmail} onClick={checkStatus}>
            {statusLoading ? "Checking…" : "Check status"}
          </button>

          {statusResults !== null && statusResults.length === 0 && (
            <div style={S.notFound}>
              We couldn't find an application with that email. Double-check the address you used, or it may not have been processed yet.
            </div>
          )}

          {statusResults !== null && statusResults.map((c) => {
            const info = STAGE_INFO[c.stage] || STAGE_INFO.Search;
            return (
              <div key={c.id} style={S.statusCard}>
                <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 2 }}>{c.role}</div>
                <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#999", marginBottom: 20 }}>Applied as {c.name}</div>
                {STAGE_ORDER.map((stageName, i) => {
                  const stageData = STAGE_INFO[stageName];
                  const done = stageData.step < info.step;
                  const active = stageName === c.stage;
                  const isLast = i === STAGE_ORDER.length - 1;
                  return (
                    <div key={stageName}>
                      <div style={S.trackRow}>
                        <div style={S.trackDot(active, done)}>{done ? "✓" : ""}</div>
                        <div style={S.trackLabel(active)}>{stageData.label}</div>
                      </div>
                      {!isLast && <div style={S.trackLine(done)} />}
                    </div>
                  );
                })}
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#666", marginTop: 20, paddingTop: 16, borderTop: `1px solid ${LINE}`, lineHeight: 1.6 }}>
                  {info.detail}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div style={S.footer}>
        GOLDCard Resources Group — Project & Procurement Management · Marine · Engineering · Construction
      </div>

      {selectedJob && (
        <div style={S.overlay} onClick={() => setSelectedJob(null)}>
          <div style={{ ...S.modal, position: "relative" }} onClick={e => e.stopPropagation()}>
            <button style={S.closeBtn} onClick={() => setSelectedJob(null)}>✕</button>
            {!submitted ? (
              <>
                <div style={S.eyebrow}>Applying for</div>
                <h2 style={{ fontSize: 26, fontWeight: 700, marginTop: 4, marginBottom: 4 }}>{selectedJob.title}</h2>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#888", marginBottom: 8 }}>{selectedJob.dept} · {selectedJob.location}</p>
                {selectedJob.descriptionLink && (
                  <a
                    href={selectedJob.descriptionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "'Barlow', sans-serif", fontSize: 13, fontWeight: 600,
                      color: DARK_GOLD, textDecoration: "underline", display: "inline-block", marginBottom: 24,
                    }}
                  >
                    View full job description ↗
                  </a>
                )}
                {!selectedJob.descriptionLink && <div style={{ marginBottom: 24 }} />}

                <label style={S.label}>Full name</label>
                <input style={S.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Ama Boateng" />

                <label style={S.label}>Email</label>
                <input style={S.input} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" />

                <label style={S.label}>Phone</label>
                <input style={S.input} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+233 24 000 0000" />

                <label style={S.label}>Key skills (comma-separated)</label>
                <input style={S.input} value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="e.g. Excel, SAP, ACCA" />

                <label style={S.label}>Link to your CV</label>
                <input style={S.input} value={form.cvLink} onChange={e => setForm(f => ({ ...f, cvLink: e.target.value }))} placeholder="Paste a Google Drive, Dropbox, or OneDrive link" />
                <p style={S.helper}>Upload your CV to Google Drive or Dropbox, set sharing to "Anyone with the link can view," then paste that link here.</p>

                <label style={S.label}>Anything you'd like us to know (optional)</label>
                <textarea style={S.textarea} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="A short note about your experience…" />

                <button className="apply-btn" style={{ ...S.btn, opacity: submitting ? 0.6 : 1 }}
                  disabled={submitting || !form.name || !form.email} onClick={submitApplication}>
                  {submitting ? "Submitting…" : "Submit application"}
                </button>
              </>
            ) : (
              <div style={S.successBox}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Application received</h2>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: "#666", marginBottom: 24 }}>
                  Thank you for applying to <strong>{selectedJob.title}</strong>. Our HR team will review your application and reach out if there's a fit.
                  You can check your status any time using the "Check application status" link above.
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

