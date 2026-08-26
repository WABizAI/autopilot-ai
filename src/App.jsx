import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Bot,
  FileText,
  Share2,
  CalendarDays,
  Send,
  BarChart3,
  Globe,
  Image as ImageIcon,
  Layers3,
  Settings,
  Plug,
  Sparkles,
  Menu,
  Bell,
  ChevronDown,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  PenLine,
  ImagePlus,
  Search,
  MoreHorizontal,
  WandSparkles,
  Zap,
  X
} from "lucide-react";

import "./style.css";
import { supabase } from "./supabase";
import Auth from "./Auth";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "AI Command Center", icon: Bot },
  { name: "Content", icon: FileText },
  { name: "Social Accounts", icon: Share2 },
  { name: "Calendar", icon: CalendarDays },
  { name: "Posts", icon: Send },
  { name: "Analytics", icon: BarChart3 },
  { name: "Website & Blog", icon: Globe },
  { name: "Media Library", icon: ImageIcon },
  { name: "Templates", icon: Layers3 },
  { name: "Settings", icon: Settings },
  { name: "Integrations", icon: Plug },
  { name: "AI Tools", icon: Sparkles }
];

const socialAccounts = [
  { name: "Facebook", icon: "f", className: "facebook" },
  { name: "Instagram", icon: "◎", className: "instagram" },
  { name: "X", icon: "𝕏", className: "x" },
  { name: "Pinterest", icon: "p", className: "pinterest" },
  { name: "Tumblr", icon: "t", className: "tumblr" },
  { name: "Blogger", icon: "B", className: "blogger" }
];

const recentContent = [
  {
    title: "Best AI Tools for Small Businesses",
    date: "Today • 10:30 AM",
    type: "SEO Article",
    color: "purple"
  },
  {
    title: "5 Ways AI Can Grow Your Business",
    date: "Yesterday • 08:00 PM",
    type: "Social Campaign",
    color: "orange"
  },
  {
    title: "AI Productivity Hacks You Should Try",
    date: "May 23 • 06:30 PM",
    type: "Social Post",
    color: "blue"
  },
  {
    title: "How to Use AI for Content Creation",
    date: "May 22 • 11:00 AM",
    type: "SEO Article",
    color: "yellow"
  }
];

function App() {
  /* =========================
     AUTHENTICATION
  ========================= */

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* =========================
     DASHBOARD STATE
  ========================= */

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [command, setCommand] = useState("");
  const [agentRunning, setAgentRunning] = useState(false);

  /* =========================
     SUPABASE AUTH SESSION
  ========================= */

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error("Supabase session error:", error);
      }

      setSession(data?.session ?? null);
      setAuthLoading(false);
    };

    loadSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =========================
     AUTH LOADING SCREEN
  ========================= */

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f9fc",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px"
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #6d5dfc, #8b7cff)",
              color: "#fff",
              boxShadow: "0 12px 30px rgba(109,93,252,.20)"
            }}
          >
            <Sparkles size={22} />
          </div>

          <strong
            style={{
              fontSize: "17px",
              color: "#172033"
            }}
          >
            AutoPilot AI
          </strong>

          <span
            style={{
              fontSize: "13px",
              color: "#8992a3"
            }}
          >
            Loading your workspace...
          </span>
        </div>
      </div>
    );
  }

  /* =========================
     SHOW AUTH IF NOT LOGGED IN
  ========================= */

  if (!session) {
    return <Auth />;
  }

  /* =========================
     AI AGENT
  ========================= */

  const runAgent = async () => {
  if (!command.trim() || agentRunning) return;

  setAgentRunning(true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: command
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "AI request failed.");
    }

    alert(data.response || "AI completed the task.");

    setCommand("");
  } catch (error) {
    console.error(error);

    alert(
      error.message ||
        "AI Agent could not complete the request."
    );
  } finally {
    setAgentRunning(false);
  }
};

  return (
    <div className="app-shell">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>

        <div className="brand-area">
          <div className="brand-mark">
            <Sparkles size={22} />
          </div>

          <div className="brand-text">
            <strong>AutoPilot AI</strong>
            <span>AI SOCIAL MANAGER</span>
          </div>

          <button
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace">
          <div className="workspace-avatar">F</div>

          <div className="workspace-info">
            <strong>Faisal's Workspace</strong>
            <span>{session.user?.email || "Personal Account"}</span>
          </div>

          <ChevronDown size={15} />
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav className="main-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-link ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => {
                  setActivePage(item.name);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={17} />
                <span>{item.name}</span>

                {item.name === "AI Tools" && (
                  <span className="new-badge">NEW</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* USAGE */}
        <div className="sidebar-spacer" />

        <div className="usage-card">

          <div className="usage-header">
            <span>AI Usage</span>
            <Zap size={14} />
          </div>

          <div className="usage-number">
            23,450 <span>/ 50,000</span>
          </div>

          <div className="usage-progress">
            <div />
          </div>

          <div className="usage-bottom">
            <span>46.9% used</span>
            <span>Tokens</span>
          </div>

          <button className="upgrade-button">
            <Sparkles size={14} />
            Upgrade to Pro
          </button>

        </div>

        {/* MINI AGENT CARD */}
        <div className="mini-agent-card">
          <div className="mini-agent-icon">
            🤖
          </div>

          <div>
            <strong>AI Agent Active</strong>
            <span>Everything is running smoothly.</span>
          </div>

          <div className="online-dot" />
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="main-area">

        {/* TOPBAR */}
        <header className="topbar">

          <div className="mobile-left">

            <button
              className="mobile-menu-button"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={21} />
            </button>

            <div className="mobile-logo">
              <Sparkles size={17} />
            </div>

          </div>

          <div className="topbar-right">

            <button className="create-button">
              <Plus size={17} />
              <span>Create New</span>
              <ChevronDown size={14} />
            </button>

            <button className="notification-button">
              <Bell size={19} />
              <span>3</span>
            </button>

            <div className="user-menu">

              <div className="user-avatar">
                F
              </div>

              <div className="user-details">
                <strong>Faisal</strong>
                <span>Free Plan</span>
              </div>

              <ChevronDown size={15} />

            </div>

          </div>

        </header>

        {/* CONTENT WRAPPER */}
        <div className="dashboard-container">

          {/* PAGE TITLE */}
          <section className="welcome-section">

            <div>
              <div className="eyebrow">
                <span className="status-dot" />
                AI AGENT ONLINE
              </div>

              <h1>
                Good morning, Faisal <span>👋</span>
              </h1>

              <p>
                Your AI Agent is ready to create, publish and grow your brand.
              </p>
            </div>

            <button className="date-selector">
              <CalendarDays size={16} />
              <span>August 26, 2026</span>
              <ChevronDown size={14} />
            </button>

          </section>

          {/* STAT CARDS */}
          <section className="stats-grid">

            <StatCard
              icon={<FileText size={19} />}
              label="Articles Published"
              value="24"
              growth="+23%"
              iconClass="purple"
              chart={[25, 38, 31, 48, 42, 65, 78]}
            />

            <StatCard
              icon={<Send size={19} />}
              label="Social Posts"
              value="126"
              growth="+15%"
              iconClass="blue"
              chart={[30, 25, 44, 37, 57, 53, 72]}
            />

            <StatCard
              icon={<span className="heart-symbol">♡</span>}
              label="Total Engagement"
              value="8.7K"
              growth="+28%"
              iconClass="pink"
              chart={[20, 30, 25, 43, 36, 58, 74]}
            />

            <StatCard
              icon={<BarChart3 size={19} />}
              label="Total Reach"
              value="142K"
              growth="+40%"
              iconClass="green"
              chart={[18, 32, 29, 49, 40, 67, 82]}
            />

          </section>

          {/* TWO COLUMN MAIN */}
          <section className="primary-grid">

            {/* CONNECTED ACCOUNTS */}
            <div className="dashboard-card accounts-card">

              <CardHeader
                title="Connected Accounts"
                subtitle="Your publishing destinations"
                action="Manage All"
              />

              <div className="social-grid">

                {socialAccounts.map((account) => (
                  <div className="social-account" key={account.name}>

                    <div
                      className={`social-icon ${account.className}`}
                    >
                      {account.icon}
                    </div>

                    <strong>{account.name}</strong>

                    <span className="connected-status">
                      <i />
                      Connected
                    </span>

                  </div>
                ))}

              </div>

              <button className="connect-more">
                <Plus size={14} />
                Connect another account
              </button>

            </div>

            {/* AI COMMAND CENTER */}
            <div className="dashboard-card command-card">

              <div className="command-header">

                <div className="ai-command-icon">
                  <Sparkles size={18} />
                </div>

                <div>
                  <h3>AI Command Center</h3>
                  <p>Tell your agent what you want to accomplish.</p>
                </div>

                <div className="command-live">
                  <span />
                  LIVE
                </div>

              </div>

              <div className="command-input-wrapper">

                <textarea
                  value={command}
                  onChange={(event) => setCommand(event.target.value)}
                  placeholder="Tell AutoPilot what you want to create..."
                  maxLength={500}
                />

                <div className="input-hint">
                  <span>
                    <WandSparkles size={13} />
                    AI Agent can research, write, design & publish
                  </span>

                  <span>
                    {command.length}/500
                  </span>
                </div>

              </div>

              <div className="quick-actions">

                <button>
                  <PenLine size={14} />
                  Write Article
                </button>

                <button>
                  <ImagePlus size={14} />
                  Create Image
                </button>

                <button>
                  <Share2 size={14} />
                  Social Campaign
                </button>

                <button>
                  <Search size={14} />
                  Research Topic
                </button>

              </div>

              <button
                className={`run-agent-button ${
                  agentRunning ? "running" : ""
                }`}
                onClick={runAgent}
              >
                {agentRunning ? (
                  <>
                    <span className="loading-spinner" />
                    Agent is working...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Run AI Agent
                    <ArrowUpRight size={15} />
                  </>
                )}
              </button>

            </div>

          </section>

          {/* LOWER GRID */}
          <section className="secondary-grid">

            {/* RECENT CONTENT */}
            <div className="dashboard-card content-card">

              <CardHeader
                title="Recent Content"
                subtitle="Your latest AI-generated content"
                action="View All"
              />

              <div className="content-items">

                {recentContent.map((item, index) => (
                  <div className="content-item" key={item.title}>

                    <div className={`content-thumbnail ${item.color}`}>
                      {index === 0 && <FileText size={17} />}
                      {index === 1 && <Send size={17} />}
                      {index === 2 && <Sparkles size={17} />}
                      {index === 3 && <Globe size={17} />}
                    </div>

                    <div className="content-details">
                      <strong>{item.title}</strong>
                      <span>
                        {item.date} • {item.type}
                      </span>
                    </div>

                    <span className="published-pill">
                      <CheckCircle2 size={12} />
                      Published
                    </span>

                    <button className="more-button">
                      <MoreHorizontal size={17} />
                    </button>

                  </div>
                ))}

              </div>

              <button className="view-all-button">
                View all content
                <ArrowUpRight size={14} />
              </button>

            </div>

            {/* CALENDAR */}
            <div className="dashboard-card calendar-card">

              <CardHeader
                title="Content Calendar"
                subtitle="Your publishing schedule"
                action="View Calendar"
              />

              <MiniCalendar />

              <div className="calendar-summary">

                <div>
                  <strong>8</strong>
                  <span>Articles</span>
                </div>

                <div>
                  <strong>15</strong>
                  <span>Social Posts</span>
                </div>

                <div>
                  <strong>3</strong>
                  <span>Scheduled</span>
                </div>

                <div>
                  <strong>2</strong>
                  <span>Drafts</span>
                </div>

              </div>

            </div>

          </section>

          {/* AGENT STATUS */}
          <section className="agent-status-card">

            <div className="agent-status-left">

              <div className="large-agent-icon">
                🤖
                <span />
              </div>

              <div>
                <div className="agent-status-title">
                  <strong>Your AI Agent is Active</strong>
                  <span>●</span>
                </div>

                <p>
                  AutoPilot is monitoring your schedule and preparing your
                  next content campaign.
                </p>
              </div>

            </div>

            <div className="agent-task">

              <Clock3 size={17} />

              <div>
                <span>Next Social Post</span>
                <strong>Today • 08:00 PM</strong>
              </div>

            </div>

            <div className="agent-task">

              <FileText size={17} />

              <div>
                <span>Next Article</span>
                <strong>Tomorrow • 10:00 AM</strong>
              </div>

            </div>

            <button className="schedule-button">
              View Schedule
              <ArrowUpRight size={14} />
            </button>

          </section>

        </div>

      </main>

    </div>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({
  icon,
  label,
  value,
  growth,
  iconClass,
  chart
}) {
  return (
    <div className="stat-card">

      <div className={`stat-icon ${iconClass}`}>
        {icon}
      </div>

      <div className="stat-info">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div className="stat-growth">
        <span>{growth}</span>
        <small>vs last month</small>
      </div>

      <div className="stat-chart">
        {chart.map((height, index) => (
          <i
            key={index}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

    </div>
  );
}

/* =========================
   CARD HEADER
========================= */

function CardHeader({
  title,
  subtitle,
  action
}) {
  return (
    <div className="card-header">

      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

      <button>
        {action}
        <ArrowUpRight size={13} />
      </button>

    </div>
  );
}

/* =========================
   MINI CALENDAR
========================= */

function MiniCalendar() {

  const days = [
    "", "", "", "", "1", "2", "3",
    "4", "5", "6", "7", "8", "9", "10",
    "11", "12", "13", "14", "15", "16", "17",
    "18", "19", "20", "21", "22", "23", "24",
    "25", "26", "27", "28", "29", "30", "31"
  ];

  return (
    <div className="mini-calendar">

      <div className="calendar-weekdays">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
          (day) => (
            <span key={day}>{day}</span>
          )
        )}
      </div>

      <div className="calendar-days">

        {days.map((day, index) => {

          const isToday = day === "26";

          return (
            <div
              className={`calendar-day ${
                isToday ? "today" : ""
              }`}
              key={index}
            >
              {day}

              {day && day !== "26" && (
                <i />
              )}

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default App;
