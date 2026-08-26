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
  X,
  Copy,
  Check,
  RefreshCw,
  MessageSquareText,
  ExternalLink
} from "lucide-react";

import "./style.css";
import { supabase } from "./supabase";
import Auth from "./Auth";

/* =========================================================
   NAVIGATION
========================================================= */

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

/* =========================================================
   SOCIAL ACCOUNTS
========================================================= */

const socialAccounts = [
  { name: "Facebook", icon: "f", className: "facebook" },
  { name: "Instagram", icon: "◎", className: "instagram" },
  { name: "X", icon: "𝕏", className: "x" },
  { name: "Pinterest", icon: "p", className: "pinterest" },
  { name: "Tumblr", icon: "t", className: "tumblr" },
  { name: "Blogger", icon: "B", className: "blogger" }
];

/* =========================================================
   RECENT CONTENT
========================================================= */

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

/* =========================================================
   QUICK COMMANDS
========================================================= */

const quickCommands = {
  article:
    "Write a complete SEO-optimized article about AI tools for small businesses. Include an SEO title, meta description, introduction, H2/H3 headings, practical examples, FAQs and a strong conclusion.",

  image:
    "Create a detailed image-generation prompt for a professional marketing image about AI tools for small businesses. Make it modern, premium and suitable for a website article.",

  social:
    "Create a complete social media campaign for a small business. Give me Facebook, Instagram, X and LinkedIn posts with strong hooks, captions, CTAs and relevant hashtags.",

  research:
    "Research the topic of AI tools for small businesses. Give me the important trends, opportunities, problems, target audience, useful statistics to look for, competitors and content ideas."
};

/* =========================================================
   APP
========================================================= */

function App() {
  /* =======================================================
     AUTHENTICATION
  ======================================================= */

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* =======================================================
     DASHBOARD STATE
  ======================================================= */

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");

  /* =======================================================
     AI STATE
  ======================================================= */

  const [command, setCommand] = useState("");
  const [agentRunning, setAgentRunning] = useState(false);

  const [aiResponse, setAiResponse] = useState("");
  const [showAiResponse, setShowAiResponse] = useState(false);
  const [copied, setCopied] = useState(false);

  /* =======================================================
     AUTH SESSION
  ======================================================= */

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

  /* =======================================================
     USER NAME
  ======================================================= */

  const emailName =
    session?.user?.email?.split("@")[0] || "User";

  const metadataName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.name;

  const displayName =
    metadataName ||
    emailName.charAt(0).toUpperCase() + emailName.slice(1);

  /* =======================================================
     CURRENT DATE
  ======================================================= */

  const currentDate = new Date();

  const formattedDate = currentDate.toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric"
    }
  );

  /* =======================================================
     AUTH LOADING
  ======================================================= */

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
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, #6d5dfc, #8b7cff)",
              color: "#fff",
              boxShadow:
                "0 15px 35px rgba(109,93,252,.25)"
            }}
          >
            <Sparkles size={24} />
          </div>

          <strong
            style={{
              fontSize: "18px",
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
            Preparing your workspace...
          </span>
        </div>
      </div>
    );
  }

  /* =======================================================
     AUTH SCREEN
  ======================================================= */

  if (!session) {
    return <Auth />;
  }

  /* =======================================================
     RUN AI AGENT
  ======================================================= */

  const runAgent = async () => {
    if (!command.trim() || agentRunning) return;

    setAgentRunning(true);
    setAiResponse("");
    setShowAiResponse(false);
    setCopied(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: command.trim()
        })
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "AI request failed. Please try again."
        );
      }

      const result =
        data?.response ||
        data?.text ||
        "AI completed the task but returned no visible response.";

      setAiResponse(result);
      setShowAiResponse(true);
      setCommand("");
    } catch (error) {
      console.error("AI Agent Error:", error);

      setAiResponse(
        error?.message ||
          "Something went wrong while contacting the AI."
      );

      setShowAiResponse(true);
    } finally {
      setAgentRunning(false);
    }
  };

  /* =======================================================
     QUICK ACTION
  ======================================================= */

  const useQuickCommand = (type) => {
    const selectedCommand = quickCommands[type];

    if (!selectedCommand) return;

    setCommand(selectedCommand);

    setTimeout(() => {
      document
        .querySelector(".command-input-wrapper textarea")
        ?.focus();
    }, 100);
  };

  /* =======================================================
     COPY AI RESPONSE
  ======================================================= */

  const copyResponse = async () => {
    if (!aiResponse) return;

    try {
      await navigator.clipboard.writeText(aiResponse);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  /* =======================================================
     CLOSE AI RESPONSE
  ======================================================= */

  const closeAiResponse = () => {
    setShowAiResponse(false);
    setCopied(false);
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleNavigation = (page) => {
    setActivePage(page);
    setSidebarOpen(false);

    if (page === "AI Command Center") {
      setTimeout(() => {
        document
          .querySelector(".command-card")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
      }, 100);
    }
  };

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <>
      <div className="app-shell">

        {/* =================================================
            MOBILE OVERLAY
        ================================================= */}

        {sidebarOpen && (
          <div
            className="mobile-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside
          className={`sidebar ${
            sidebarOpen ? "sidebar-open" : ""
          }`}
        >

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

          {/* WORKSPACE */}

          <div className="workspace">

            <div className="workspace-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="workspace-info">
              <strong>{displayName}'s Workspace</strong>

              <span>
                {session.user?.email ||
                  "Personal Account"}
              </span>
            </div>

            <ChevronDown size={15} />

          </div>

          <div className="nav-label">
            WORKSPACE
          </div>

          {/* NAVIGATION */}

          <nav className="main-navigation">

            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  className={`nav-link ${
                    activePage === item.name
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation(item.name)
                  }
                >

                  <Icon size={17} />

                  <span>{item.name}</span>

                  {item.name === "AI Tools" && (
                    <span className="new-badge">
                      NEW
                    </span>
                  )}

                </button>
              );
            })}

          </nav>

          <div className="sidebar-spacer" />

          {/* USAGE */}

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

          {/* MINI AGENT */}

          <div className="mini-agent-card">

            <div className="mini-agent-icon">
              🤖
            </div>

            <div>
              <strong>AI Agent Active</strong>

              <span>
                Everything is running smoothly.
              </span>
            </div>

            <div className="online-dot" />

          </div>

        </aside>

        {/* =================================================
            MAIN AREA
        ================================================= */}

        <main className="main-area">

          {/* TOPBAR */}

          <header className="topbar">

            <div className="mobile-left">

              <button
                className="mobile-menu-button"
                onClick={() =>
                  setSidebarOpen(true)
                }
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
                  {displayName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="user-details">
                  <strong>{displayName}</strong>
                  <span>Free Plan</span>
                </div>

                <ChevronDown size={15} />

              </div>

            </div>

          </header>

          {/* =================================================
              DASHBOARD
          ================================================= */}

          <div className="dashboard-container">

            {/* WELCOME */}

            <section className="welcome-section">

              <div>

                <div className="eyebrow">
                  <span className="status-dot" />
                  AI AGENT ONLINE
                </div>

                <h1>
                  Good morning, {displayName}{" "}
                  <span>👋</span>
                </h1>

                <p>
                  Your AI Agent is ready to create,
                  publish and grow your brand.
                </p>

              </div>

              <button className="date-selector">

                <CalendarDays size={16} />

                <span>{formattedDate}</span>

                <ChevronDown size={14} />

              </button>

            </section>

            {/* =================================================
                STATS
            ================================================= */}

            <section className="stats-grid">

              <StatCard
                icon={<FileText size={19} />}
                label="Articles Published"
                value="24"
                growth="+23%"
                iconClass="purple"
                chart={[
                  25,
                  38,
                  31,
                  48,
                  42,
                  65,
                  78
                ]}
              />

              <StatCard
                icon={<Send size={19} />}
                label="Social Posts"
                value="126"
                growth="+15%"
                iconClass="blue"
                chart={[
                  30,
                  25,
                  44,
                  37,
                  57,
                  53,
                  72
                ]}
              />

              <StatCard
                icon={
                  <span className="heart-symbol">
                    ♡
                  </span>
                }
                label="Total Engagement"
                value="8.7K"
                growth="+28%"
                iconClass="pink"
                chart={[
                  20,
                  30,
                  25,
                  43,
                  36,
                  58,
                  74
                ]}
              />

              <StatCard
                icon={<BarChart3 size={19} />}
                label="Total Reach"
                value="142K"
                growth="+40%"
                iconClass="green"
                chart={[
                  18,
                  32,
                  29,
                  49,
                  40,
                  67,
                  82
                ]}
              />

            </section>

            {/* =================================================
                PRIMARY GRID
            ================================================= */}

            <section className="primary-grid">

              {/* CONNECTED ACCOUNTS */}

              <div className="dashboard-card accounts-card">

                <CardHeader
                  title="Connected Accounts"
                  subtitle="Your publishing destinations"
                  action="Manage All"
                />

                <div className="social-grid">

                  {socialAccounts.map(
                    (account) => (
                      <div
                        className="social-account"
                        key={account.name}
                      >

                        <div
                          className={`social-icon ${account.className}`}
                        >
                          {account.icon}
                        </div>

                        <strong>
                          {account.name}
                        </strong>

                        <span className="connected-status">
                          <i />
                          Connected
                        </span>

                      </div>
                    )
                  )}

                </div>

                <button className="connect-more">
                  <Plus size={14} />
                  Connect another account
                </button>

              </div>

              {/* =================================================
                  AI COMMAND CENTER
              ================================================= */}

              <div className="dashboard-card command-card">

                <div className="command-header">

                  <div className="ai-command-icon">
                    <Sparkles size={18} />
                  </div>

                  <div>
                    <h3>
                      AI Command Center
                    </h3>

                    <p>
                      Tell your agent what you
                      want to accomplish.
                    </p>
                  </div>

                  <div className="command-live">
                    <span />
                    LIVE
                  </div>

                </div>

                {/* COMMAND INPUT */}

                <div className="command-input-wrapper">

                  <textarea
                    value={command}
                    onChange={(event) =>
                      setCommand(
                        event.target.value
                      )
                    }
                    placeholder="Tell AutoPilot what you want to create..."
                    maxLength={2000}
                    disabled={agentRunning}
                  />

                  <div className="input-hint">

                    <span>
                      <WandSparkles
                        size={13}
                      />

                      AI Agent can research,
                      write, design & publish
                    </span>

                    <span>
                      {command.length}/2000
                    </span>

                  </div>

                </div>

                {/* QUICK ACTIONS */}

                <div className="quick-actions">

                  <button
                    onClick={() =>
                      useQuickCommand(
                        "article"
                      )
                    }
                  >
                    <PenLine size={14} />
                    Write Article
                  </button>

                  <button
                    onClick={() =>
                      useQuickCommand(
                        "image"
                      )
                  }
                  >
                    <ImagePlus size={14} />
                    Create Image
                  </button>

                  <button
                    onClick={() =>
                      useQuickCommand(
                        "social"
                      )
                    }
                  >
                    <Share2 size={14} />
                    Social Campaign
                  </button>

                  <button
                    onClick={() =>
                      useQuickCommand(
                        "research"
                      )
                    }
                  >
                    <Search size={14} />
                    Research Topic
                  </button>

                </div>

                {/* RUN BUTTON */}

                <button
                  className={`run-agent-button ${
                    agentRunning
                      ? "running"
                      : ""
                  }`}
                  onClick={runAgent}
                  disabled={
                    agentRunning ||
                    !command.trim()
                  }
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

                      <ArrowUpRight
                        size={15}
                      />
                    </>
                  )}

                </button>

              </div>

            </section>

            {/* =================================================
                LOWER GRID
            ================================================= */}

            <section className="secondary-grid">

              {/* RECENT CONTENT */}

              <div className="dashboard-card content-card">

                <CardHeader
                  title="Recent Content"
                  subtitle="Your latest AI-generated content"
                  action="View All"
                />

                <div className="content-items">

                  {recentContent.map(
                    (item, index) => (
                      <div
                        className="content-item"
                        key={item.title}
                      >

                        <div
                          className={`content-thumbnail ${item.color}`}
                        >

                          {index === 0 && (
                            <FileText size={17} />
                          )}

                          {index === 1 && (
                            <Send size={17} />
                          )}

                          {index === 2 && (
                            <Sparkles size={17} />
                          )}

                          {index === 3 && (
                            <Globe size={17} />
                          )}

                        </div>

                        <div className="content-details">

                          <strong>
                            {item.title}
                          </strong>

                          <span>
                            {item.date} •{" "}
                            {item.type}
                          </span>

                        </div>

                        <span className="published-pill">
                          <CheckCircle2
                            size={12}
                          />
                          Published
                        </span>

                        <button className="more-button">
                          <MoreHorizontal
                            size={17}
                          />
                        </button>

                      </div>
                    )
                  )}

                </div>

                <button className="view-all-button">
                  View all content
                  <ArrowUpRight
                    size={14}
                  />
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

            {/* =================================================
                AGENT STATUS
            ================================================= */}

            <section className="agent-status-card">

              <div className="agent-status-left">

                <div className="large-agent-icon">
                  🤖
                  <span />
                </div>

                <div>

                  <div className="agent-status-title">
                    <strong>
                      Your AI Agent is Active
                    </strong>

                    <span>●</span>
                  </div>

                  <p>
                    AutoPilot is monitoring
                    your schedule and preparing
                    your next content campaign.
                  </p>

                </div>

              </div>

              <div className="agent-task">

                <Clock3 size={17} />

                <div>
                  <span>
                    Next Social Post
                  </span>

                  <strong>
                    Today • 08:00 PM
                  </strong>
                </div>

              </div>

              <div className="agent-task">

                <FileText size={17} />

                <div>
                  <span>
                    Next Article
                  </span>

                  <strong>
                    Tomorrow • 10:00 AM
                  </strong>
                </div>

              </div>

              <button className="schedule-button">
                View Schedule
                <ArrowUpRight
                  size={14}
                />
              </button>

            </section>

          </div>

        </main>

      </div>

      {/* =====================================================
          PROFESSIONAL AI RESPONSE MODAL
      ===================================================== */}

      {showAiResponse && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background:
              "rgba(15, 18, 30, 0.62)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "18px"
          }}
          onClick={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeAiResponse();
            }
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "850px",
              maxHeight: "88vh",
              background: "#ffffff",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow:
                "0 30px 90px rgba(0,0,0,.30)",
              display: "flex",
              flexDirection: "column"
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                padding: "20px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom:
                  "1px solid #edf0f5",
                background:
                  "linear-gradient(180deg,#ffffff,#fafbff)"
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "13px"
                }}
              >

                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    background:
                      "linear-gradient(135deg,#6d5dfc,#8b7cff)",
                    boxShadow:
                      "0 10px 25px rgba(109,93,252,.22)"
                  }}
                >
                  <Bot size={22} />
                </div>

                <div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >

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
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding:
                          "4px 8px",
                        borderRadius: "999px",
                        background:
                          "#ecfdf5",
                        color: "#059669",
                        fontSize: "10px",
                        fontWeight: 800
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius:
                            "50%",
                          background:
                            "#10b981"
                        }}
                      />
                      AI READY
                    </span>

                  </div>

                  <span
                    style={{
                      display: "block",
                      marginTop: "3px",
                      color: "#8a93a5",
                      fontSize: "12px"
                    }}
                  >
                    AI Agent Response
                  </span>

                </div>

              </div>

              <button
                onClick={closeAiResponse}
                style={{
                  width: "38px",
                  height: "38px",
                  border: "1px solid #e8ebf1",
                  borderRadius: "12px",
                  background: "#ffffff",
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
              >
                <X size={18} />
              </button>

            </div>

            {/* COMMAND PREVIEW */}

            <div
              style={{
                margin: "16px 20px 0",
                padding: "12px 14px",
                borderRadius: "14px",
                background: "#f7f8fc",
                border: "1px solid #eceef5"
              }}
            >

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  color: "#6d5dfc",
                  fontSize: "11px",
                  fontWeight: 800,
                  marginBottom: "5px"
                }}
              >
                <MessageSquareText
                  size={13}
                />
                YOUR COMMAND
              </div>

              <div
                style={{
                  color: "#4b5563",
                  fontSize: "13px",
                  lineHeight: 1.5
                }}
              >
                {command ||
                  "AI task completed"}
              </div>

            </div>

            {/* RESPONSE BODY */}

            <div
              style={{
                padding: "20px",
                overflowY: "auto",
                flex: 1,
                minHeight: "200px"
              }}
            >

              <div
                style={{
                  color: "#202638",
                  fontSize: "15px",
                  lineHeight: 1.75,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word"
                }}
              >
                {aiResponse}
              </div>

            </div>

            {/* MODAL FOOTER */}

            <div
              style={{
                padding: "14px 20px",
                borderTop:
                  "1px solid #edf0f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                background: "#fafbfc"
              }}
            >

              <span
                style={{
                  color: "#9aa2b1",
                  fontSize: "11px"
                }}
              >
                Generated by AutoPilot AI
              </span>

              <div
                style={{
                  display: "flex",
                  gap: "8px"
                }}
              >

                <button
                  onClick={copyResponse}
                  style={{
                    height: "40px",
                    padding:
                      "0 14px",
                    borderRadius: "11px",
                    border:
                      "1px solid #e3e6ee",
                    background: "#ffffff",
                    color: "#394150",
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >

                  {copied ? (
                    <>
                      <Check
                        size={15}
                      />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy
                        size={15}
                      />
                      Copy
                    </>
                  )}

                </button>

                <button
                  onClick={closeAiResponse}
                  style={{
                    height: "40px",
                    padding:
                      "0 16px",
                    borderRadius: "11px",
                    border: "none",
                    background:
                      "linear-gradient(135deg,#6d5dfc,#806eff)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow:
                      "0 8px 20px rgba(109,93,252,.20)"
                  }}
                >
                  Done
                  <ArrowUpRight
                    size={14}
                  />
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

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

        {chart.map(
          (height, index) => (
            <i
              key={index}
              style={{
                height: `${height}%`
              }}
            />
          )
        )}

      </div>

    </div>
  );
}

/* =========================================================
   CARD HEADER
========================================================= */

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

/* =========================================================
   MINI CALENDAR
========================================================= */

function MiniCalendar() {
  const days = [
    "",
    "",
    "",
    "",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "31"
  ];

  return (
    <div className="mini-calendar">

      <div className="calendar-weekdays">

        {[
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
          "Sun"
        ].map((day) => (
          <span key={day}>
            {day}
          </span>
        ))}

      </div>

      <div className="calendar-days">

        {days.map(
          (day, index) => {

            const isToday =
              day === "26";

            return (
              <div
                className={`calendar-day ${
                  isToday
                    ? "today"
                    : ""
                }`}
                key={index}
              >

                {day}

                {day &&
                  day !== "26" && (
                    <i />
                  )}

              </div>
            );
          }
        )}

      </div>

    </div>
  );
}

export default App;
