import React, { useEffect, useMemo, useState } from "react";
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
  Download,
  RefreshCw,
  Eye,
  Target,
  Hash,
  Type,
  AlignLeft,
  Check,
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
   DEMO RECENT CONTENT
========================================================= */

const defaultRecentContent = [
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
   APP
========================================================= */

function App() {
  /* =======================================================
     AUTH
  ======================================================= */

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* =======================================================
     DASHBOARD
  ======================================================= */

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");

  /* =======================================================
     AI COMMAND
  ======================================================= */

  const [command, setCommand] = useState("");
  const [agentRunning, setAgentRunning] = useState(false);

  /* =======================================================
     ARTICLE GENERATOR
  ======================================================= */

  const [articleModal, setArticleModal] = useState(false);

  const [articleKeyword, setArticleKeyword] = useState("");
  const [articleAudience, setArticleAudience] = useState("General audience");
  const [articleTone, setArticleTone] = useState("Professional");
  const [articleLength, setArticleLength] = useState("Long");
  const [articleLanguage, setArticleLanguage] = useState("English");

  const [articleLoading, setArticleLoading] = useState(false);
  const [articleError, setArticleError] = useState("");
  const [articleResult, setArticleResult] = useState(null);

  const [copied, setCopied] = useState(false);

  const [recentContent, setRecentContent] = useState(
    defaultRecentContent
  );

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
     AUTH LOADING
  ======================================================= */

  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="loading-brand">
          <div className="loading-brand-icon">
            <Sparkles size={23} />
          </div>

          <strong>AutoPilot AI</strong>

          <span>Loading your workspace...</span>
        </div>
      </div>
    );
  }

  /* =======================================================
     AUTH
  ======================================================= */

  if (!session) {
    return <Auth />;
  }

  /* =======================================================
     AI COMMAND CENTER
  ======================================================= */

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
        throw new Error(
          data?.error || "AI request failed."
        );
      }

      setArticleResult({
        title: "AI Agent Response",
        content: data.response || "Task completed.",
        imageUrl: null,
        metaDescription: "",
        keyword: command,
        wordCount: (data.response || "")
          .split(/\s+/)
          .filter(Boolean).length
      });

      setArticleModal(true);
      setCommand("");
    } catch (error) {
      console.error("AI Agent error:", error);

      setArticleError(
        error.message ||
          "AI Agent could not complete the request."
      );

      setArticleModal(true);
    } finally {
      setAgentRunning(false);
    }
  };

  /* =======================================================
     OPEN ARTICLE GENERATOR
  ======================================================= */

  const openArticleGenerator = () => {
    setArticleError("");
    setArticleModal(true);
  };

  /* =======================================================
     GENERATE ARTICLE
  ======================================================= */

  const generateArticle = async () => {
    if (!articleKeyword.trim() || articleLoading) {
      setArticleError("Please enter a target keyword.");
      return;
    }

    setArticleLoading(true);
    setArticleError("");
    setArticleResult(null);

    try {
      const response = await fetch("/api/article", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          keyword: articleKeyword.trim(),
          audience: articleAudience,
          tone: articleTone,
          length: articleLength,
          language: articleLanguage,

          /* SEO REQUIREMENTS */
          seo: {
            optimized: true,
            includeTitle: true,
            includeMetaDescription: true,
            includeHeadings: true,
            includeSubheadings: true,
            includeKeywords: true,
            includeFaq: true,
            includeConclusion: true,
            naturalHumanTone: true
          },

          /* IMAGE REQUIREMENT */
          image: {
            generate: true,
            relatedToArticle: true,
            professional: true
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Article generation failed."
        );
      }

      /*
        The following supports different response
        structures from api/article.js.
      */

      const article =
        data?.article ||
        data?.data ||
        data;

      const title =
        article?.title ||
        article?.seoTitle ||
        article?.headline ||
        "AI Generated Article";

      const content =
        article?.content ||
        article?.article ||
        article?.body ||
        article?.text ||
        "";

      const imageUrl =
        article?.imageUrl ||
        article?.image_url ||
        article?.image ||
        data?.imageUrl ||
        data?.image_url ||
        data?.image ||
        null;

      const metaDescription =
        article?.metaDescription ||
        article?.meta_description ||
        data?.metaDescription ||
        "";

      const seoScore =
        article?.seoScore ||
        article?.seo_score ||
        data?.seoScore ||
        null;

      const wordCount =
        article?.wordCount ||
        article?.word_count ||
        content
          .replace(/[#*_`]/g, "")
          .split(/\s+/)
          .filter(Boolean).length;

      if (!content) {
        throw new Error(
          "AI returned an empty article."
        );
      }

      setArticleResult({
        title,
        content,
        imageUrl,
        metaDescription,
        keyword:
          article?.keyword ||
          article?.targetKeyword ||
          articleKeyword,
        seoScore,
        wordCount
      });

      /* ================================================
         ADD TO RECENT CONTENT
      ================================================= */

      setRecentContent((previous) => [
        {
          title,
          date: "Just now",
          type: "SEO Article",
          color: "purple"
        },
        ...previous
      ]);

    } catch (error) {
      console.error("Article generation error:", error);

      setArticleError(
        error.message ||
          "Could not generate the article."
      );
    } finally {
      setArticleLoading(false);
    }
  };

  /* =======================================================
     COPY ARTICLE
  ======================================================= */

  const copyArticle = async () => {
    if (!articleResult) return;

    const text = [
      articleResult.title,
      "",
      articleResult.metaDescription
        ? `Meta Description: ${articleResult.metaDescription}`
        : "",
      "",
      articleResult.content
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy error:", error);
    }
  };

  /* =======================================================
     QUICK ARTICLE
  ======================================================= */

  const quickArticle = () => {
    setArticleKeyword("");
    setArticleResult(null);
    setArticleError("");
    setArticleModal(true);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
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

        <div className="workspace">

          <div className="workspace-avatar">
            F
          </div>

          <div className="workspace-info">
            <strong>Faisal's Workspace</strong>

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
                onClick={() => {

                  if (
                    item.name ===
                    "AI Command Center"
                  ) {
                    setActivePage(item.name);
                    setSidebarOpen(false);
                    return;
                  }

                  if (item.name === "Content") {
                    setActivePage(item.name);
                    openArticleGenerator();
                    setSidebarOpen(false);
                    return;
                  }

                  setActivePage(item.name);
                  setSidebarOpen(false);
                }}
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

        {/* =================================================
            USAGE
        ================================================= */}

        <div className="usage-card">

          <div className="usage-header">
            <span>AI Usage</span>
            <Zap size={14} />
          </div>

          <div className="usage-number">
            23,450{" "}
            <span>/ 50,000</span>
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

        {/* =================================================
            MINI AGENT
        ================================================= */}

        <div className="mini-agent-card">

          <div className="mini-agent-icon">
            🤖
          </div>

          <div>
            <strong>
              AI Agent Active
            </strong>

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

        {/* =================================================
            TOPBAR
        ================================================= */}

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

            <button
              className="create-button"
              onClick={quickArticle}
            >
              <Plus size={17} />

              <span>
                Create New
              </span>

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

                <strong>
                  Faisal
                </strong>

                <span>
                  Free Plan
                </span>

              </div>

              <ChevronDown size={15} />

            </div>

          </div>

        </header>

        {/* =================================================
            DASHBOARD
        ================================================= */}

        <div className="dashboard-container">

          {/* =================================================
              WELCOME
          ================================================= */}

          <section className="welcome-section">

            <div>

              <div className="eyebrow">

                <span className="status-dot" />

                AI AGENT ONLINE

              </div>

              <h1>
                Good morning, Faisal{" "}
                <span>👋</span>
              </h1>

              <p>
                Your AI Agent is ready to create,
                publish and grow your brand.
              </p>

            </div>

            <button className="date-selector">

              <CalendarDays size={16} />

              <span>
                August 26, 2026
              </span>

              <ChevronDown size={14} />

            </button>

          </section>

          {/* =================================================
              STATS
          ================================================= */}

          <section className="stats-grid">

            <StatCard
              icon={
                <FileText size={19} />
              }
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
              icon={
                <Send size={19} />
              }
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
              icon={
                <BarChart3 size={19} />
              }
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

            {/* =================================================
                CONNECTED ACCOUNTS
            ================================================= */}

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

              <div className="command-input-wrapper">

                <textarea
                  value={command}
                  onChange={(event) =>
                    setCommand(
                      event.target.value
                    )
                  }
                  placeholder="Tell AutoPilot what you want to create..."
                  maxLength={500}
                />

                <div className="input-hint">

                  <span>

                    <WandSparkles size={13} />

                    AI Agent can research,
                    write, design & publish

                  </span>

                  <span>
                    {command.length}/500
                  </span>

                </div>

              </div>

              <div className="quick-actions">

                <button
                  onClick={quickArticle}
                >
                  <PenLine size={14} />
                  Write Article
                </button>

                <button
                  onClick={() => {
                    setCommand(
                      "Create a professional image concept for my brand."
                    );
                  }}
                >
                  <ImagePlus size={14} />
                  Create Image
                </button>

                <button
                  onClick={() => {
                    setCommand(
                      "Create a complete social media campaign for my business."
                    );
                  }}
                >
                  <Share2 size={14} />
                  Social Campaign
                </button>

                <button
                  onClick={() => {
                    setCommand(
                      "Research this topic and give me actionable insights."
                    );
                  }}
                >
                  <Search size={14} />
                  Research Topic
                </button>

              </div>

              <button
                className={`run-agent-button ${
                  agentRunning
                    ? "running"
                    : ""
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

            {/* =================================================
                RECENT CONTENT
            ================================================= */}

            <div className="dashboard-card content-card">

              <CardHeader
                title="Recent Content"
                subtitle="Your latest AI-generated content"
                action="View All"
              />

              <div className="content-items">

                {recentContent
                  .slice(0, 5)
                  .map(
                    (item, index) => (
                      <div
                        className="content-item"
                        key={`${item.title}-${index}`}
                      >

                        <div
                          className={`content-thumbnail ${item.color}`}
                        >

                          {index % 4 ===
                            0 && (
                            <FileText
                              size={17}
                            />
                          )}

                          {index % 4 ===
                            1 && (
                            <Send
                              size={17}
                            />
                          )}

                          {index % 4 ===
                            2 && (
                            <Sparkles
                              size={17}
                            />
                          )}

                          {index % 4 ===
                            3 && (
                            <Globe
                              size={17}
                            />
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

              <button
                className="view-all-button"
                onClick={openArticleGenerator}
              >
                View all content
                <ArrowUpRight size={14} />
              </button>

            </div>

            {/* =================================================
                CALENDAR
            ================================================= */}

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

      {/* =====================================================
          ARTICLE GENERATOR MODAL
      ===================================================== */}

      {articleModal && (
        <ArticleModal
          keyword={articleKeyword}
          setKeyword={setArticleKeyword}
          audience={articleAudience}
          setAudience={setArticleAudience}
          tone={articleTone}
          setTone={setArticleTone}
          length={articleLength}
          setLength={setArticleLength}
          language={articleLanguage}
          setLanguage={setArticleLanguage}
          loading={articleLoading}
          error={articleError}
          result={articleResult}
          copied={copied}
          onGenerate={generateArticle}
          onCopy={copyArticle}
          onClose={() => {
            if (!articleLoading) {
              setArticleModal(false);
              setArticleError("");
            }
          }}
          onRegenerate={generateArticle}
        />
      )}

    </div>
  );
}

/* =========================================================
   ARTICLE MODAL
========================================================= */

function ArticleModal({
  keyword,
  setKeyword,
  audience,
  setAudience,
  tone,
  setTone,
  length,
  setLength,
  language,
  setLanguage,
  loading,
  error,
  result,
  copied,
  onGenerate,
  onCopy,
  onClose,
  onRegenerate
}) {
  return (
    <div className="article-modal-overlay">

      <div
        className={`article-modal ${
          result
            ? "article-modal-result"
            : ""
        }`}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="article-modal-header">

          <div className="article-modal-title">

            <div className="article-ai-icon">
              <Sparkles size={22} />
            </div>

            <div>

              <div className="article-title-row">

                <h2>
                  AI Article Studio
                </h2>

                <span className="ai-ready-badge">
                  <span />
                  AI READY
                </span>

              </div>

              <p>
                Create SEO-optimized,
                human-quality articles
              </p>

            </div>

          </div>

          <button
            className="modal-close"
            onClick={onClose}
            disabled={loading}
          >
            <X size={20} />
          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="article-error">
            <X size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* =================================================
            GENERATOR FORM
        ================================================= */}

        {!result && !loading && (
          <div className="article-generator">

            <div className="generator-hero">

              <div className="generator-hero-icon">
                <PenLine size={24} />
              </div>

              <div>
                <h3>
                  What do you want to
                  write about?
                </h3>

                <p>
                  Enter your target keyword
                  and AutoPilot will handle
                  research, SEO, structure,
                  writing and image generation.
                </p>
              </div>

            </div>

            <label className="form-label">
              <span>
                Target Keyword
              </span>

              <small>
                Main keyword
              </small>
            </label>

            <div className="keyword-input">

              <Search size={18} />

              <input
                value={keyword}
                onChange={(e) =>
                  setKeyword(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter"
                  ) {
                    onGenerate();
                  }
                }}
                placeholder="e.g. best AI tools for small businesses"
              />

            </div>

            <div className="generator-options">

              <div className="form-group">

                <label>
                  Audience
                </label>

                <select
                  value={audience}
                  onChange={(e) =>
                    setAudience(
                      e.target.value
                    )
                  }
                >
                  <option>
                    General audience
                  </option>

                  <option>
                    Business owners
                  </option>

                  <option>
                    Entrepreneurs
                  </option>

                  <option>
                    Marketers
                  </option>

                  <option>
                    Beginners
                  </option>

                  <option>
                    Professionals
                  </option>
                </select>

              </div>

              <div className="form-group">

                <label>
                  Tone
                </label>

                <select
                  value={tone}
                  onChange={(e) =>
                    setTone(
                      e.target.value
                    )
                  }
                >
                  <option>
                    Professional
                  </option>

                  <option>
                    Friendly
                  </option>

                  <option>
                    Conversational
                  </option>

                  <option>
                    Expert
                  </option>

                  <option>
                    Persuasive
                  </option>
                </select>

              </div>

              <div className="form-group">

                <label>
                  Article Length
                </label>

                <select
                  value={length}
                  onChange={(e) =>
                    setLength(
                      e.target.value
                    )
                  }
                >
                  <option>
                    Short
                  </option>

                  <option>
                    Medium
                  </option>

                  <option>
                    Long
                  </option>

                  <option>
                    Comprehensive
                  </option>
                </select>

              </div>

              <div className="form-group">

                <label>
                  Language
                </label>

                <select
                  value={language}
                  onChange={(e) =>
                    setLanguage(
                      e.target.value
                    )
                  }
                >
                  <option>
                    English
                  </option>

                  <option>
                    Urdu
                  </option>

                  <option>
                    Roman Urdu
                  </option>
                </select>

              </div>

            </div>

            {/* SEO FEATURES */}

            <div className="seo-feature-box">

              <div className="seo-feature-header">

                <div className="seo-feature-icon">
                  <Target size={17} />
                </div>

                <div>
                  <strong>
                    Full SEO Optimization
                  </strong>

                  <span>
                    AutoPilot will optimize
                    the entire article
                  </span>
                </div>

                <Check
                  size={18}
                  className="seo-check"
                />

              </div>

              <div className="seo-feature-list">

                <span>
                  <Check size={13} />
                  SEO Title
                </span>

                <span>
                  <Check size={13} />
                  Meta Description
                </span>

                <span>
                  <Check size={13} />
                  H1 / H2 / H3 Structure
                </span>

                <span>
                  <Check size={13} />
                  Keyword Optimization
                </span>

                <span>
                  <Check size={13} />
                  FAQ Section
                </span>

                <span>
                  <Check size={13} />
                  Human Tone
                </span>

              </div>

            </div>

            {/* IMAGE */}

            <div className="image-feature-box">

              <div className="image-feature-icon">
                <ImagePlus size={18} />
              </div>

              <div>

                <strong>
                  AI Featured Image
                </strong>

                <span>
                  Generate a professional
                  image related to your article
                </span>

              </div>

              <div className="feature-on">
                ON
              </div>

            </div>

            <button
              className="generate-article-button"
              onClick={onGenerate}
            >

              <Sparkles size={18} />

              Generate Professional Article

              <ArrowUpRight size={17} />

            </button>

          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <ArticleGenerating />
        )}

        {/* =================================================
            RESULT
        ================================================= */}

        {result && !loading && (
          <ArticleResult
            result={result}
            copied={copied}
            onCopy={onCopy}
            onRegenerate={onRegenerate}
          />
        )}

      </div>

    </div>
  );
}

/* =========================================================
   ARTICLE GENERATING SCREEN
========================================================= */

function ArticleGenerating() {
  return (
    <div className="article-generating">

      <div className="generating-orb">
        <div>
          <Sparkles size={32} />
        </div>
      </div>

      <h2>
        AutoPilot is creating
        your article...
      </h2>

      <p>
        Researching topic, building
        SEO structure, writing content
        and generating your featured image.
      </p>

      <div className="generation-steps">

        <div className="generation-step active">
          <div>
            <Check size={14} />
          </div>
          <span>
            Analyzing keyword
          </span>
        </div>

        <div className="generation-step active">
          <div>
            <Check size={14} />
          </div>
          <span>
            Building SEO structure
          </span>
        </div>

        <div className="generation-step active">
          <div>
            <RefreshCw
              size={14}
              className="spin"
            />
          </div>
          <span>
            Writing human-quality article
          </span>
        </div>

        <div className="generation-step">
          <div />
          <span>
            Generating featured image
          </span>
        </div>

      </div>

      <div className="generation-note">
        <Zap size={14} />
        This may take a little while
        because AutoPilot is creating
        the complete SEO package.
      </div>

    </div>
  );
}

/* =========================================================
   ARTICLE RESULT
========================================================= */

function ArticleResult({
  result,
  copied,
  onCopy,
  onRegenerate
}) {
  const formattedContent = useMemo(() => {
    return formatArticleContent(
      result.content
    );
  }, [result.content]);

  return (
    <div className="article-result">

      {/* =================================================
          RESULT TOP
      ================================================= */}

      <div className="article-result-top">

        <div>

          <div className="result-status">
            <CheckCircle2 size={15} />
            Article generated successfully
          </div>

          <h1>
            {result.title}
          </h1>

          <div className="article-meta-row">

            <span>
              <Target size={14} />
              {result.keyword ||
                "Target keyword"}
            </span>

            <span>
              <AlignLeft size={14} />
              {result.wordCount || 0}
              {" "}
              words
            </span>

            {result.seoScore && (
              <span className="seo-score">
                <CheckCircle2 size={14} />
                SEO {result.seoScore}
              </span>
            )}

          </div>

        </div>

        <button
          className="regenerate-button"
          onClick={onRegenerate}
        >
          <RefreshCw size={15} />
          Regenerate
        </button>

      </div>

      {/* =================================================
          FEATURED IMAGE
      ================================================= */}

      {result.imageUrl && (
        <div className="article-featured-image">

          <img
            src={result.imageUrl}
            alt={
              result.title ||
              "AI generated article image"
            }
          />

          <div className="image-overlay-label">
            <ImageIcon size={14} />
            AI Generated Featured Image
          </div>

        </div>
      )}

      {/* =================================================
          SEO SUMMARY
      ================================================= */}

      {result.metaDescription && (
        <div className="seo-preview">

          <div className="seo-preview-header">

            <div>
              <Target size={16} />
              SEO Meta Description
            </div>

            <span>
              {result.metaDescription.length}
              /160
            </span>

          </div>

          <p>
            {result.metaDescription}
          </p>

        </div>
      )}

      {/* =================================================
          ARTICLE BODY
      ================================================= */}

      <div className="article-body">

        {formattedContent}

      </div>

      {/* =================================================
          RESULT FOOTER
      ================================================= */}

      <div className="article-result-footer">

        <div className="article-generated-by">

          <div className="small-ai-icon">
            <Sparkles size={14} />
          </div>

          <div>
            <strong>
              Generated by AutoPilot AI
            </strong>

            <span>
              SEO optimized • Human tone •
              AI featured image
            </span>
          </div>

        </div>

        <div className="article-actions">

          <button
            className="copy-article-button"
            onClick={onCopy}
          >

            {copied ? (
              <>
                <Check size={16} />
                Copied
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy Article
              </>
            )}

          </button>

          <button className="done-article-button">

            <Check size={16} />

            Done

            <ArrowUpRight
              size={15}
            />

          </button>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   ARTICLE MARKDOWN FORMATTER
========================================================= */

function formatArticleContent(content) {
  if (!content) return null;

  const lines = content.split("\n");

  return lines.map((line, index) => {

    const trimmed = line.trim();

    if (!trimmed) {
      return (
        <div
          key={index}
          className="article-spacer"
        />
      );
    }

    /* H1 */

    if (
      trimmed.startsWith("# ") &&
      !trimmed.startsWith("## ")
    ) {
      return (
        <h1 key={index}>
          {renderInlineMarkdown(
            trimmed.replace(/^# /, "")
          )}
        </h1>
      );
    }

    /* H2 */

    if (
      trimmed.startsWith("## ") &&
      !trimmed.startsWith("### ")
    ) {
      return (
        <h2 key={index}>
          {renderInlineMarkdown(
            trimmed.replace(/^## /, "")
          )}
        </h2>
      );
    }

    /* H3 */

    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={index}>
          {renderInlineMarkdown(
            trimmed.replace(/^### /, "")
          )}
        </h3>
      );
    }

    /* BULLET */

    if (
      trimmed.startsWith("- ") ||
      trimmed.startsWith("* ")
    ) {
      return (
        <li key={index}>
          {renderInlineMarkdown(
            trimmed.substring(2)
          )}
        </li>
      );
    }

    /* NUMBERED */

    if (/^\d+\.\s/.test(trimmed)) {
      return (
        <li
          key={index}
          className="numbered-article-item"
        >
          {renderInlineMarkdown(
            trimmed.replace(
              /^\d+\.\s/,
              ""
            )
          )}
        </li>
      );
    }

    /* QUOTE */

    if (trimmed.startsWith("> ")) {
      return (
        <blockquote key={index}>
          {renderInlineMarkdown(
            trimmed.replace(/^> /, "")
          )}
        </blockquote>
      );
    }

    /* NORMAL PARAGRAPH */

    return (
      <p key={index}>
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });
}

/* =========================================================
   INLINE MARKDOWN
========================================================= */

function renderInlineMarkdown(text) {
  const parts = text.split(
    /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g
  );

  return parts.map((part, index) => {

    if (
      part.startsWith("**") &&
      part.endsWith("**")
    ) {
      return (
        <strong key={index}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (
      part.startsWith("*") &&
      part.endsWith("*")
    ) {
      return (
        <em key={index}>
          {part.slice(1, -1)}
        </em>
      );
    }

    if (
      part.startsWith("`") &&
      part.endsWith("`")
    ) {
      return (
        <code key={index}>
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
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

      <div
        className={`stat-icon ${iconClass}`}
      >
        {icon}
      </div>

      <div className="stat-info">

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

      <div className="stat-growth">

        <span>
          {growth}
        </span>

        <small>
          vs last month
        </small>

      </div>

      <div className="stat-chart">

        {chart.map(
          (height, index) => (
            <i
              key={index}
              style={{
                height:
                  `${height}%`
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

        <h3>
          {title}
        </h3>

        <p>
          {subtitle}
        </p>

      </div>

      <button>

        {action}

        <ArrowUpRight
          size={13}
        />

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
                  day !==
                    "26" && (
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
