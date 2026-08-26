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
  RefreshCw,
  Target,
  Hash,
  AlignLeft,
  Check,
  Download,
  Link2,
  Activity,
  TrendingUp,
  Users,
  FileSearch,
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
  {
    name: "Facebook",
    icon: "f",
    className: "facebook"
  },
  {
    name: "Instagram",
    icon: "◎",
    className: "instagram"
  },
  {
    name: "X",
    icon: "𝕏",
    className: "x"
  },
  {
    name: "Pinterest",
    icon: "p",
    className: "pinterest"
  },
  {
    name: "Tumblr",
    icon: "t",
    className: "tumblr"
  },
  {
    name: "Blogger",
    icon: "B",
    className: "blogger"
  }
];

/* =========================================================
   DEFAULT CONTENT
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
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");

  const [command, setCommand] = useState("");
  const [agentRunning, setAgentRunning] = useState(false);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [connectedAccounts, setConnectedAccounts] =
    useState({});

  const [agentActivities, setAgentActivities] =
    useState([
      {
        icon: "✍️",
        title: "Content engine ready",
        text: "AI is ready to create your next article.",
        time: "Now"
      },
      {
        icon: "📊",
        title: "Analytics synchronized",
        text: "Latest workspace metrics are available.",
        time: "12 min ago"
      },
      {
        icon: "📅",
        title: "Schedule checked",
        text: "Your upcoming content calendar is healthy.",
        time: "28 min ago"
      }
    ]);

  /* =======================================================
     ARTICLE STATE
  ======================================================= */

  const [articleModal, setArticleModal] =
    useState(false);

  const [articleKeyword, setArticleKeyword] =
    useState("");

  const [articleAudience, setArticleAudience] =
    useState("General audience");

  const [articleTone, setArticleTone] =
    useState("Professional");

  const [articleLength, setArticleLength] =
    useState("Long");

  const [articleLanguage, setArticleLanguage] =
    useState("English");

  const [articleLoading, setArticleLoading] =
    useState(false);

  const [articleError, setArticleError] =
    useState("");

  const [articleResult, setArticleResult] =
    useState(null);

  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const [recentContent, setRecentContent] =
    useState(defaultRecentContent);

  /* =======================================================
     AUTH
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data, error } =
        await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error(
          "Supabase session error:",
          error
        );
      }

      setSession(data?.session ?? null);
      setAuthLoading(false);
    };

    loadSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setAuthLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =======================================================
     USER
  ======================================================= */

  const userEmail =
    session?.user?.email ||
    "Personal Account";

  const userName = useMemo(() => {
    const metadata =
      session?.user?.user_metadata;

    return (
      metadata?.full_name ||
      metadata?.name ||
      userEmail
        .split("@")[0]
        .replace(/[^a-zA-Z0-9]/g, " ")
        .split(" ")
        .filter(Boolean)[0] ||
      "Faisal"
    );
  }, [session, userEmail]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="loading-brand">
          <div className="loading-brand-icon">
            <Sparkles size={23} />
          </div>

          <strong>AutoPilot AI</strong>

          <span>
            Loading your workspace...
          </span>
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
     NAVIGATION
  ======================================================= */

  const navigateTo = (page) => {
    setActivePage(page);
    setSidebarOpen(false);

    if (page === "Content") {
      openArticleGenerator();
      return;
    }

    if (page === "AI Command Center") {
      document
        .querySelector(".command-card")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
    }
  };

  /* =======================================================
     ARTICLE GENERATOR
  ======================================================= */

  function openArticleGenerator() {
    setArticleError("");
    setArticleModal(true);
  }

  const quickArticle = () => {
    setArticleKeyword("");
    setArticleResult(null);
    setArticleError("");
    setSaved(false);
    setArticleModal(true);
  };

  /* =======================================================
     QUICK COMMAND
  ======================================================= */

  const setQuickCommand = (text) => {
    setCommand(text);

    setTimeout(() => {
      document
        .querySelector(".command-input-wrapper textarea")
        ?.focus();
    }, 50);
  };

  /* =======================================================
     AI AGENT
  ======================================================= */

  const runAgent = async () => {
    if (!command.trim() || agentRunning) return;

    setAgentRunning(true);
    setArticleError("");

    setAgentActivities((previous) => [
      {
        icon: "🤖",
        title: "AI Agent started",
        text: command.trim(),
        time: "Just now"
      },
      ...previous
    ].slice(0, 5));

    try {
      const response = await fetch(
        "/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt: command.trim()
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "AI request failed."
        );
      }

      const responseText =
        data?.response || "";

      setArticleResult({
        title: "AI Agent Response",
        metaDescription: "",
        focusKeyword: command,
        secondaryKeywords: [],
        searchIntent: "",
        excerpt: "",
        introduction: responseText,
        sections: [],
        faq: [],
        conclusion: "",
        imageUrl: null,
        wordCount:
          responseText
            .split(/\s+/)
            .filter(Boolean)
            .length
      });

      setAgentActivities((previous) => [
        {
          icon: "✅",
          title: "AI Agent completed",
          text: "Your request has been completed successfully.",
          time: "Just now"
        },
        ...previous
      ].slice(0, 5));

      setArticleModal(true);
      setCommand("");
    } catch (error) {
      console.error(
        "AI Agent error:",
        error
      );

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
     IMAGE NORMALIZER
  ======================================================= */

  const convertGeneratedImage = (image) => {
    if (!image) return null;

    if (typeof image === "string") {
      if (
        image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("data:image/")
      ) {
        return image;
      }

      return `data:image/png;base64,${image}`;
    }

    const data =
      image?.data ||
      image?.inlineData?.data;

    const mimeType =
      image?.mimeType ||
      image?.inlineData?.mimeType ||
      "image/png";

    if (!data) return null;

    return `data:${mimeType};base64,${data}`;
  };

  /* =======================================================
     SAVE ARTICLE
  ======================================================= */

  const saveArticleToSupabase = async (
    article,
    imageUrl
  ) => {
    try {
      const userId =
        session?.user?.id;

      if (!userId) return false;

      const articleContent =
        JSON.stringify(article);

      const { error } =
        await supabase
          .from("articles")
          .insert({
            user_id: userId,
            title:
              article.title ||
              "Untitled Article",
            content:
              articleContent,
            keyword:
              article.focusKeyword ||
              articleKeyword,
            meta_description:
              article.metaDescription ||
              "",
            slug:
              article.slug ||
              "",
            image_url:
              imageUrl || null
          });

      if (error) {
        console.error(
          "Supabase article save error:",
          error
        );

        return false;
      }

      return true;
    } catch (error) {
      console.error(
        "Article save error:",
        error
      );

      return false;
    }
  };

  /* =======================================================
     GENERATE ARTICLE
  ======================================================= */

  const generateArticle = async () => {
    if (
      !articleKeyword.trim() ||
      articleLoading
    ) {
      setArticleError(
        "Please enter a target keyword."
      );
      return;
    }

    setArticleLoading(true);
    setArticleError("");
    setArticleResult(null);
    setSaved(false);

    try {
      const response = await fetch(
        "/api/article",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            keyword:
              articleKeyword.trim(),
            audience:
              articleAudience,
            tone:
              articleTone,
            length:
              articleLength,
            language:
              articleLanguage,
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
            image: {
              generate: true,
              relatedToArticle: true,
              professional: true
            }
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Article generation failed."
        );
      }

      const article =
        data?.article;

      if (!article) {
        throw new Error(
          "AI returned invalid article data."
        );
      }

      const imageUrl =
        convertGeneratedImage(
          data?.image
        );

      const normalizedArticle = {
        ...article,

        title:
          article.title ||
          "AI Generated Article",

        metaDescription:
          article.metaDescription ||
          "",

        slug:
          article.slug ||
          "",

        focusKeyword:
          article.focusKeyword ||
          articleKeyword,

        secondaryKeywords:
          Array.isArray(
            article.secondaryKeywords
          )
            ? article.secondaryKeywords
            : [],

        searchIntent:
          article.searchIntent ||
          "",

        excerpt:
          article.excerpt ||
          "",

        introduction:
          article.introduction ||
          "",

        sections:
          Array.isArray(
            article.sections
          )
            ? article.sections
            : [],

        faq:
          Array.isArray(
            article.faq
          )
            ? article.faq
            : [],

        conclusion:
          article.conclusion ||
          "",

        imagePrompt:
          article.imagePrompt ||
          "",

        wordCount:
          article.wordCount ||
          calculateArticleWords(
            article
          ),

        imageUrl
      };

      const wasSaved =
        await saveArticleToSupabase(
          normalizedArticle,
          imageUrl
        );

      setSaved(wasSaved);

      setArticleResult(
        normalizedArticle
      );

      setRecentContent(
        (previous) => [
          {
            title:
              normalizedArticle.title,
            date:
              "Just now",
            type:
              "SEO Article",
            color:
              "purple"
          },
          ...previous
        ]
      );

      setAgentActivities(
        (previous) => [
          {
            icon: "📝",
            title:
              "Article generated",
            text:
              normalizedArticle.title,
            time:
              "Just now"
          },
          ...previous
        ].slice(0, 5)
      );
    } catch (error) {
      console.error(
        "Article generation error:",
        error
      );

      setArticleError(
        error.message ||
          "Could not generate the article."
      );
    } finally {
      setArticleLoading(false);
    }
  };

  /* =======================================================
     COPY
  ======================================================= */

  const copyArticle = async () => {
    if (!articleResult) return;

    const text =
      articleToPlainText(
        articleResult
      );

    try {
      await navigator.clipboard.writeText(
        text
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Copy error:",
        error
      );
    }
  };

  /* =======================================================
     DOWNLOAD
  ======================================================= */

  const downloadArticle = () => {
    if (!articleResult) return;

    const text =
      articleToPlainText(
        articleResult
      );

    const blob =
      new Blob(
        [text],
        {
          type:
            "text/plain;charset=utf-8"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `${articleResult.slug || "article"}.txt`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  };

  /* =======================================================
     SOCIAL CONNECT
  ======================================================= */

  const connectSocialAccount = (
    accountName
  ) => {
    setConnectedAccounts(
      (previous) => ({
        ...previous,
        [accountName]:
          !previous[accountName]
      })
    );

    setAgentActivities(
      (previous) => [
        {
          icon: "🔗",
          title:
            connectedAccounts[
              accountName
            ]
              ? `${accountName} disconnected`
              : `${accountName} connected`,
          text:
            "Social account status updated.",
          time:
            "Just now"
        },
        ...previous
      ].slice(0, 5)
    );
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeArticleModal = () => {
    if (articleLoading) return;

    setArticleModal(false);
    setArticleError("");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="app-shell">

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={`sidebar ${
          sidebarOpen
            ? "sidebar-open"
            : ""
        }`}
      >

        <div className="brand-area">

          <div className="brand-mark">
            <Sparkles size={22} />
          </div>

          <div className="brand-text">
            <strong>
              AutoPilot AI
            </strong>

            <span>
              AI SOCIAL MANAGER
            </span>
          </div>

          <button
            className="close-sidebar"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X size={18} />
          </button>

        </div>

        <div className="workspace">

          <div className="workspace-avatar">
            {userName
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="workspace-info">

            <strong>
              {userName}'s Workspace
            </strong>

            <span>
              {userEmail}
            </span>

          </div>

          <ChevronDown size={15} />

        </div>

        <div className="nav-label">
          WORKSPACE
        </div>

        <nav className="main-navigation">

          {navigation.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <button
                  key={
                    item.name
                  }
                  className={`nav-link ${
                    activePage ===
                    item.name
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    navigateTo(
                      item.name
                    )
                  }
                >

                  <Icon size={17} />

                  <span>
                    {item.name}
                  </span>

                  {item.name ===
                    "AI Tools" && (
                    <span className="new-badge">
                      NEW
                    </span>
                  )}

                </button>
              );
            }
          )}

        </nav>

        <div className="sidebar-spacer" />

        {/* USAGE */}

        <div className="usage-card">

          <div className="usage-header">

            <span>
              AI Usage
            </span>

            <Zap size={14} />

          </div>

          <div className="usage-number">
            23,450{" "}
            <span>
              / 50,000
            </span>
          </div>

          <div className="usage-progress">
            <div />
          </div>

          <div className="usage-bottom">

            <span>
              46.9% used
            </span>

            <span>
              Tokens
            </span>

          </div>

          <button className="upgrade-button">

            <Sparkles size={14} />

            Upgrade to Pro

          </button>

        </div>

        {/* AGENT MINI STATUS */}

        <div className="mini-agent-card">

          <div className="mini-agent-icon">
            🤖
          </div>

          <div>

            <strong>
              AI Agent Active
            </strong>

            <span>
              Everything is running
              smoothly.
            </span>

          </div>

          <div className="online-dot" />

        </div>

      </aside>

      {/* ===================================================
          MAIN
      =================================================== */}

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

            <button
              className="create-button"
              onClick={
                quickArticle
              }
            >

              <Plus size={17} />

              <span>
                Create New
              </span>

              <ChevronDown
                size={14}
              />

            </button>

            {/* NOTIFICATIONS */}

            <div className="notification-wrapper">

              <button
                className="notification-button"
                onClick={() =>
                  setNotificationsOpen(
                    (value) =>
                      !value
                  )
                }
              >

                <Bell size={19} />

                <span>
                  3
                </span>

              </button>

              {notificationsOpen && (
                <div className="notification-dropdown">

                  <div className="notification-dropdown-header">

                    <strong>
                      Notifications
                    </strong>

                    <span>
                      3 new
                    </span>

                  </div>

                  <div className="notification-item">

                    <div>
                      <CheckCircle2
                        size={16}
                      />
                    </div>

                    <span>
                      AI Agent is ready
                      for your next task.
                    </span>

                  </div>

                  <div className="notification-item">

                    <div>
                      <FileText
                        size={16}
                      />
                    </div>

                    <span>
                      Your content
                      workspace is ready.
                    </span>

                  </div>

                  <div className="notification-item">

                    <div>
                      <CalendarDays
                        size={16}
                      />
                    </div>

                    <span>
                      3 posts are scheduled
                      this week.
                    </span>

                  </div>

                </div>
              )}

            </div>

            {/* USER */}

            <div className="user-menu">

              <div className="user-avatar">
                {userName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="user-details">

                <strong>
                  {userName}
                </strong>

                <span>
                  Free Plan
                </span>

              </div>

              <ChevronDown
                size={15}
              />

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
                Good morning,{" "}
                {userName}{" "}
                <span>
                  👋
                </span>
              </h1>

              <p>
                Your AI Agent is ready
                to create, publish and
                grow your brand.
              </p>

            </div>

            <button className="date-selector">

              <CalendarDays
                size={16}
              />

              <span>
                August 26, 2026
              </span>

              <ChevronDown
                size={14}
              />

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
                <BarChart3
                  size={19}
                />
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

            {/* CONNECTED ACCOUNTS */}

            <div className="dashboard-card accounts-card">

              <CardHeader
                title="Social Accounts"
                subtitle="Connect your publishing destinations"
                action="Manage All"
              />

              <div className="social-grid">

                {socialAccounts.map(
                  (account) => {
                    const isConnected =
                      !!connectedAccounts[
                        account.name
                      ];

                    return (
                      <div
                        className="social-account"
                        key={
                          account.name
                        }
                      >

                        <div
                          className={`social-icon ${account.className}`}
                        >
                          {
                            account.icon
                          }
                        </div>

                        <strong>
                          {
                            account.name
                          }
                        </strong>

                        <button
                          className={`social-connect-button ${
                            isConnected
                              ? "connected"
                              : ""
                          }`}
                          onClick={() =>
                            connectSocialAccount(
                              account.name
                            )
                          }
                        >

                          {isConnected ? (
                            <>
                              <Check
                                size={12}
                              />
                              Connected
                            </>
                          ) : (
                            <>
                              <Link2
                                size={12}
                              />
                              Connect
                            </>
                          )}

                        </button>

                      </div>
                    );
                  }
                )}

              </div>

              <button className="connect-more">

                <Plus size={14} />

                Connect another
                account

              </button>

            </div>

            {/* AI COMMAND CENTER */}

            <div className="dashboard-card command-card">

              <div className="command-header">

                <div className="ai-command-icon">
                  <Sparkles
                    size={18}
                  />
                </div>

                <div>

                  <h3>
                    AI Command Center
                  </h3>

                  <p>
                    Tell your agent what
                    you want to accomplish.
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
                        .slice(0, 500)
                    )
                  }
                  placeholder="Tell AutoPilot what you want to create..."
                  maxLength={500}
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
                    {command.length}/500
                  </span>

                </div>

              </div>

              {/* QUICK ACTIONS */}

              <div className="quick-actions">

                <button
                  onClick={
                    quickArticle
                  }
                >

                  <PenLine
                    size={14}
                  />

                  Write Article

                </button>

                <button
                  onClick={() =>
                    setQuickCommand(
                      "Create a professional featured image concept for my brand."
                    )
                  }
                >

                  <ImagePlus
                    size={14}
                  />

                  Create Image

                </button>

                <button
                  onClick={() =>
                    setQuickCommand(
                      "Create a complete social media campaign for my business."
                    )
                  }
                >

                  <Share2
                    size={14}
                  />

                  Social Campaign

                </button>

                <button
                  onClick={() =>
                    setQuickCommand(
                      "Research this topic and give me actionable insights."
                    )
                  }
                >

                  <Search
                    size={14}
                  />

                  Research Topic

                </button>

              </div>

              <button
                className={`run-agent-button ${
                  agentRunning
                    ? "running"
                    : ""
                }`}
                onClick={
                  runAgent
                }
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
                    <Sparkles
                      size={16}
                    />

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

                {recentContent
                  .slice(0, 5)
                  .map(
                    (
                      item,
                      index
                    ) => (
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
                            {
                              item.title
                            }
                          </strong>

                          <span>
                            {
                              item.date
                            }{" "}
                            •{" "}
                            {
                              item.type
                            }
                          </span>

                        </div>

                        <span className="published-pill">

                          <CheckCircle2
                            size={12}
                          />

                          Ready

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
                onClick={
                  openArticleGenerator
                }
              >

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
                  <strong>
                    8
                  </strong>

                  <span>
                    Articles
                  </span>
                </div>

                <div>
                  <strong>
                    15
                  </strong>

                  <span>
                    Social Posts
                  </span>
                </div>

                <div>
                  <strong>
                    3
                  </strong>

                  <span>
                    Scheduled
                  </span>
                </div>

                <div>
                  <strong>
                    2
                  </strong>

                  <span>
                    Drafts
                  </span>
                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              AGENT ACTIVITY
          ================================================= */}

          <section className="dashboard-card agent-activity-card">

            <div className="card-header">

              <div>

                <h3>
                  Agent Activity
                </h3>

                <p>
                  What AutoPilot has been
                  doing in your workspace
                </p>

              </div>

              <div className="activity-live">

                <span />

                LIVE

              </div>

            </div>

            <div className="agent-activity-list">

              {agentActivities
                .slice(0, 4)
                .map(
                  (
                    activity,
                    index
                  ) => (
                    <div
                      className="agent-activity-item"
                      key={
                        index
                      }
                    >

                      <div className="activity-icon">
                        {
                          activity.icon
                        }
                      </div>

                      <div className="activity-content">

                        <strong>
                          {
                            activity.title
                          }
                        </strong>

                        <span>
                          {
                            activity.text
                          }
                        </span>

                      </div>

                      <small>
                        {
                          activity.time
                        }
                      </small>

                    </div>
                  )
                )}

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

                  <span>
                    ●
                  </span>

                </div>

                <p>
                  AutoPilot is monitoring
                  your schedule and
                  preparing your next
                  content campaign.
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
          ARTICLE MODAL
      ===================================================== */}

      {articleModal && (
        <ArticleModal
          keyword={
            articleKeyword
          }
          setKeyword={
            setArticleKeyword
          }
          audience={
            articleAudience
          }
          setAudience={
            setArticleAudience
          }
          tone={
            articleTone
          }
          setTone={
            setArticleTone
          }
          length={
            articleLength
          }
          setLength={
            setArticleLength
          }
          language={
            articleLanguage
          }
          setLanguage={
            setArticleLanguage
          }
          loading={
            articleLoading
          }
          error={
            articleError
          }
          result={
            articleResult
          }
          copied={
            copied
          }
          saved={
            saved
          }
          onGenerate={
            generateArticle
          }
          onCopy={
            copyArticle
          }
          onDownload={
            downloadArticle
          }
          onClose={
            closeArticleModal
          }
          onRegenerate={
            generateArticle
          }
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
  saved,
  onGenerate,
  onCopy,
  onDownload,
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

        <div className="article-modal-header">

          <div className="article-modal-title">

            <div className="article-ai-icon">

              <Sparkles
                size={22}
              />

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
            onClick={
              onClose
            }
            disabled={
              loading
            }
          >
            <X size={20} />
          </button>

        </div>

        {error && (
          <div className="article-error">

            <X size={16} />

            <span>
              {error}
            </span>

          </div>
        )}

        {/* FORM */}

        {!result &&
          !loading && (
            <div className="article-generator">

              <div className="generator-hero">

                <div className="generator-hero-icon">

                  <PenLine
                    size={24}
                  />

                </div>

                <div>

                  <h3>
                    What do you want to
                    write about?
                  </h3>

                  <p>
                    Enter your target
                    keyword and
                    AutoPilot will handle
                    SEO, structure,
                    writing and image
                    generation.
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
                  value={
                    keyword
                  }
                  onChange={(e) =>
                    setKeyword(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      onGenerate();
                    }
                  }}
                  placeholder="e.g. best AI tools for small businesses"
                />

              </div>

              <div className="generator-options">

                <GeneratorSelect
                  label="Audience"
                  value={
                    audience
                  }
                  setValue={
                    setAudience
                  }
                  options={[
                    "General audience",
                    "Business owners",
                    "Entrepreneurs",
                    "Marketers",
                    "Beginners",
                    "Professionals"
                  ]}
                />

                <GeneratorSelect
                  label="Tone"
                  value={
                    tone
                  }
                  setValue={
                    setTone
                  }
                  options={[
                    "Professional",
                    "Friendly",
                    "Conversational",
                    "Expert",
                    "Persuasive"
                  ]}
                />

                <GeneratorSelect
                  label="Article Length"
                  value={
                    length
                  }
                  setValue={
                    setLength
                  }
                  options={[
                    "Short",
                    "Medium",
                    "Long",
                    "Comprehensive"
                  ]}
                />

                <GeneratorSelect
                  label="Language"
                  value={
                    language
                  }
                  setValue={
                    setLanguage
                  }
                  options={[
                    "English",
                    "Urdu",
                    "Roman Urdu"
                  ]}
                />

              </div>

              {/* SEO */}

              <div className="seo-feature-box">

                <div className="seo-feature-header">

                  <div className="seo-feature-icon">
                    <Target
                      size={17}
                    />
                  </div>

                  <div>

                    <strong>
                      Full SEO Optimization
                    </strong>

                    <span>
                      Complete on-page SEO
                      package
                    </span>

                  </div>

                  <Check
                    size={18}
                    className="seo-check"
                  />

                </div>

                <div className="seo-feature-list">

                  {[
                    "SEO Title",
                    "Meta Description",
                    "URL Slug",
                    "H1 / H2 / H3",
                    "Focus Keyword",
                    "Semantic Keywords",
                    "FAQ Schema Content",
                    "Human Tone"
                  ].map(
                    (item) => (
                      <span
                        key={
                          item
                        }
                      >
                        <Check
                          size={13}
                        />
                        {item}
                      </span>
                    )
                  )}

                </div>

              </div>

              {/* IMAGE */}

              <div className="image-feature-box">

                <div className="image-feature-icon">

                  <ImagePlus
                    size={18}
                  />

                </div>

                <div>

                  <strong>
                    AI Featured Image
                  </strong>

                  <span>
                    Generate a custom
                    image related to the
                    article
                  </span>

                </div>

                <div className="feature-on">
                  ON
                </div>

              </div>

              <button
                className="generate-article-button"
                onClick={
                  onGenerate
                }
              >

                <Sparkles
                  size={18}
                />

                Generate Professional
                Article

                <ArrowUpRight
                  size={17}
                />

              </button>

            </div>
          )}

        {/* LOADING */}

        {loading && (
          <ArticleGenerating />
        )}

        {/* RESULT */}

        {result &&
          !loading && (
            <ArticleResult
              result={
                result
              }
              copied={
                copied
              }
              saved={
                saved
              }
              onCopy={
                onCopy
              }
              onDownload={
                onDownload
              }
              onRegenerate={
                onRegenerate
              }
            />
          )}

      </div>

    </div>
  );
}

/* =========================================================
   GENERATOR SELECT
========================================================= */

function GeneratorSelect({
  label,
  value,
  setValue,
  options
}) {
  return (
    <div className="form-group">

      <label>
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          setValue(
            e.target.value
          )
        }
      >

        {options.map(
          (option) => (
            <option
              key={
                option
              }
            >
              {option}
            </option>
          )
        )}

      </select>

    </div>
  );
}

/* =========================================================
   GENERATING
========================================================= */

function ArticleGenerating() {
  return (
    <div className="article-generating">

      <div className="generating-orb">

        <div>
          <Sparkles
            size={32}
          />
        </div>

      </div>

      <h2>
        AutoPilot is creating
        your article...
      </h2>

      <p>
        Building SEO structure,
        writing the article and
        generating your featured image.
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
            Writing article
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

        AutoPilot is creating
        your complete SEO package.

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
  saved,
  onCopy,
  onDownload,
  onRegenerate
}) {
  const article =
    normalizeArticle(
      result
    );

  return (
    <div className="article-result">

      <div className="article-document">

        {/* TOP */}

        <div className="article-top-bar">

          <div className="article-brand-small">

            <Sparkles
              size={14}
            />

            AutoPilot AI

          </div>

          <div className="article-status-right">

            {saved && (
              <span className="saved-badge">

                <CheckCircle2
                  size={13}
                />

                Saved

              </span>
            )}

            <span className="publication-badge">

              <CheckCircle2
                size={13}
              />

              Publication Ready

            </span>

          </div>

        </div>

        {/* HEADER */}

        <div className="article-document-header">

          <div className="article-category">
            SEO ARTICLE
          </div>

          <h1 className="professional-article-title">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="article-excerpt">
              {
                article.excerpt
              }
            </p>
          )}

          <div className="professional-meta">

            <span>

              <Target
                size={14}
              />

              {
                article.focusKeyword
              }

            </span>

            <span>

              <AlignLeft
                size={14}
              />

              {
                article.wordCount
              }{" "}
              words

            </span>

            {article.searchIntent && (
              <span>

                <Search
                  size={14}
                />

                {
                  article.searchIntent
                }

              </span>
            )}

          </div>

        </div>

        {/* IMAGE */}

        {article.imageUrl ? (
          <div className="professional-featured-image">

            <img
              src={
                article.imageUrl
              }
              alt={
                article.title
              }
            />

            <div className="featured-image-badge">

              <ImageIcon
                size={14}
              />

              AI Generated Featured Image

            </div>

          </div>
        ) : (
          <div className="image-missing-box">

            <ImageIcon
              size={30}
            />

            <strong>
              Featured image unavailable
            </strong>

            <span>
              The article was generated,
              but the image API did not
              return an image.
            </span>

          </div>
        )}

        {/* SEO */}

        <div className="seo-dashboard">

          <div className="seo-dashboard-title">

            <Target size={17} />

            SEO Optimization

          </div>

          <div className="seo-grid">

            <div className="seo-item">

              <span>
                SEO TITLE
              </span>

              <strong>
                {article.title}
              </strong>

            </div>

            <div className="seo-item">

              <span>
                META DESCRIPTION
              </span>

              <strong>
                {
                  article.metaDescription
                }
              </strong>

              <small>
                {
                  article
                    .metaDescription
                    .length
                }
                /160
              </small>

            </div>

            <div className="seo-item">

              <span>
                URL SLUG
              </span>

              <strong>
                /{article.slug}
              </strong>

            </div>

            <div className="seo-item">

              <span>
                FOCUS KEYWORD
              </span>

              <strong>
                {
                  article.focusKeyword
                }
              </strong>

            </div>

          </div>

          {article.secondaryKeywords
            .length > 0 && (
            <div className="keyword-list">

              <span>
                Secondary Keywords
              </span>

              <div>

                {article.secondaryKeywords.map(
                  (
                    keyword,
                    index
                  ) => (
                    <span
                      key={
                        index
                      }
                      className="keyword-pill"
                    >

                      <Hash
                        size={11}
                      />

                      {keyword}

                    </span>
                  )
                )}

              </div>

            </div>
          )}

        </div>

        {/* CONTENT */}

        <article className="professional-article-content">

          {article.introduction && (
            <section className="article-introduction">

              <div className="section-label">
                INTRODUCTION
              </div>

              <p className="lead-paragraph">
                {
                  article.introduction
                }
              </p>

            </section>
          )}

          {article.sections.map(
            (
              section,
              index
            ) => (
              <ArticleSection
                key={
                  index
                }
                section={
                  section
                }
              />
            )
          )}

          {article.faq.length >
            0 && (
            <section className="article-faq">

              <div className="section-label">
                FREQUENTLY ASKED QUESTIONS
              </div>

              <h2>
                Frequently Asked
                Questions
              </h2>

              {article.faq.map(
                (
                  item,
                  index
                ) => (
                  <div
                    className="faq-item"
                    key={
                      index
                    }
                  >

                    <h3>

                      <span>
                        Q
                      </span>

                      {
                        item.question
                      }

                    </h3>

                    <p>
                      {
                        item.answer
                      }
                    </p>

                  </div>
                )
              )}

            </section>
          )}

          {article.conclusion && (
            <section className="article-conclusion">

              <div className="section-label">
                CONCLUSION
              </div>

              <h2>
                Conclusion
              </h2>

              <p>
                {
                  article.conclusion
                }
              </p>

            </section>
          )}

        </article>

        {/* FOOTER */}

        <div className="article-document-footer">

          <div className="article-generated-by">

            <div className="small-ai-icon">

              <Sparkles
                size={14}
              />

            </div>

            <div>

              <strong>
                Generated by AutoPilot AI
              </strong>

              <span>
                SEO optimized •
                Human-quality writing •
                AI featured image
              </span>

            </div>

          </div>

          <div className="article-actions">

            <button
              className="copy-article-button"
              onClick={
                onCopy
              }
            >

              {copied ? (
                <>
                  <Check
                    size={16}
                  />
                  Copied
                </>
              ) : (
                <>
                  <Copy
                    size={16}
                  />
                  Copy Article
                </>
              )}

            </button>

            <button
              className="download-article-button"
              onClick={
                onDownload
              }
            >

              <Download
                size={16}
              />

              Download

            </button>

            <button
              className="regenerate-button"
              onClick={
                onRegenerate
              }
            >

              <RefreshCw
                size={15}
              />

              Regenerate

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   ARTICLE SECTION
========================================================= */

function ArticleSection({
  section
}) {
  if (!section) return null;

  return (
    <section className="article-section">

      {section.heading && (
        <h2>
          {section.heading}
        </h2>
      )}

      {Array.isArray(
        section.paragraphs
      ) &&
        section.paragraphs.map(
          (
            paragraph,
            index
          ) => (
            <p key={index}>
              {paragraph}
            </p>
          )
        )}

      {Array.isArray(
        section.bullets
      ) &&
        section.bullets.length >
          0 && (
          <ul className="article-bullet-list">

            {section.bullets.map(
              (
                bullet,
                index
              ) => (
                <li
                  key={
                    index
                  }
                >

                  <span className="bullet-check">

                    <Check
                      size={13}
                    />

                  </span>

                  <span>
                    {bullet}
                  </span>

                </li>
              )
            )}

          </ul>
        )}

      {Array.isArray(
        section.subsections
      ) &&
        section.subsections.map(
          (
            subsection,
            index
          ) => (
            <div
              className="article-subsection"
              key={
                index
              }
            >

              {subsection.heading && (
                <h3>
                  {
                    subsection.heading
                  }
                </h3>
              )}

              {Array.isArray(
                subsection.paragraphs
              ) &&
                subsection.paragraphs.map(
                  (
                    paragraph,
                    paragraphIndex
                  ) => (
                    <p
                      key={
                        paragraphIndex
                      }
                    >
                      {
                        paragraph
                      }
                    </p>
                  )
                )}

              {Array.isArray(
                subsection.bullets
              ) &&
                subsection.bullets.length >
                  0 && (
                  <ul className="article-bullet-list">

                    {subsection.bullets.map(
                      (
                        bullet,
                        bulletIndex
                      ) => (
                        <li
                          key={
                            bulletIndex
                          }
                        >

                          <span className="bullet-check">

                            <Check
                              size={13}
                            />

                          </span>

                          <span>
                            {
                              bullet
                            }
                          </span>

                        </li>
                      )
                    )}

                  </ul>
                )}

            </div>
          )
        )}

    </section>
  );
}

/* =========================================================
   NORMALIZE
========================================================= */

function normalizeArticle(
  article
) {
  return {
    title:
      article?.title ||
      "AI Generated Article",

    metaDescription:
      article?.metaDescription ||
      "",

    slug:
      article?.slug ||
      "",

    focusKeyword:
      article?.focusKeyword ||
      article?.keyword ||
      "",

    secondaryKeywords:
      Array.isArray(
        article?.secondaryKeywords
      )
        ? article.secondaryKeywords
        : [],

    searchIntent:
      article?.searchIntent ||
      "",

    excerpt:
      article?.excerpt ||
      "",

    introduction:
      article?.introduction ||
      "",

    sections:
      Array.isArray(
        article?.sections
      )
        ? article.sections
        : [],

    faq:
      Array.isArray(
        article?.faq
      )
        ? article.faq
        : [],

    conclusion:
      article?.conclusion ||
      "",

    wordCount:
      article?.wordCount ||
      calculateArticleWords(
        article
      ),

    imageUrl:
      article?.imageUrl ||
      null
  };
}

/* =========================================================
   WORD COUNT
========================================================= */

function calculateArticleWords(
  article
) {
  let text = "";

  text +=
    ` ${article?.title || ""}`;

  text +=
    ` ${article?.introduction || ""}`;

  text +=
    ` ${article?.conclusion || ""}`;

  if (
    Array.isArray(
      article?.sections
    )
  ) {
    article.sections.forEach(
      (section) => {

        text +=
          ` ${section?.heading || ""}`;

        if (
          Array.isArray(
            section?.paragraphs
          )
        ) {
          text +=
            ` ${section.paragraphs.join(
              " "
            )}`;
        }

        if (
          Array.isArray(
            section?.bullets
          )
        ) {
          text +=
            ` ${section.bullets.join(
              " "
            )}`;
        }

        if (
          Array.isArray(
            section?.subsections
          )
        ) {
          section.subsections.forEach(
            (
              subsection
            ) => {

              text +=
                ` ${
                  subsection?.heading ||
                  ""
                }`;

              if (
                Array.isArray(
                  subsection?.paragraphs
                )
              ) {
                text +=
                  ` ${subsection.paragraphs.join(
                    " "
                  )}`;
              }

              if (
                Array.isArray(
                  subsection?.bullets
                )
              ) {
                text +=
                  ` ${subsection.bullets.join(
                    " "
                  )}`;
              }

            }
          );
        }

      }
    );
  }

  if (
    Array.isArray(
      article?.faq
    )
  ) {
    article.faq.forEach(
      (item) => {

        text +=
          ` ${item?.question || ""}`;

        text +=
          ` ${item?.answer || ""}`;

      }
    );
  }

  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

/* =========================================================
   PLAIN TEXT
========================================================= */

function articleToPlainText(
  article
) {
  const lines = [];

  lines.push(
    article.title
  );

  lines.push("");

  if (
    article.metaDescription
  ) {
    lines.push(
      `Meta Description: ${article.metaDescription}`
    );

    lines.push("");
  }

  if (
    article.focusKeyword
  ) {
    lines.push(
      `Focus Keyword: ${article.focusKeyword}`
    );

    lines.push("");
  }

  if (
    article.introduction
  ) {
    lines.push(
      "Introduction"
    );

    lines.push(
      article.introduction
    );

    lines.push("");
  }

  article.sections?.forEach(
    (section) => {

      if (section.heading) {
        lines.push(
          section.heading
        );
      }

      section.paragraphs?.forEach(
        (paragraph) =>
          lines.push(
            paragraph
          )
      );

      section.bullets?.forEach(
        (bullet) =>
          lines.push(
            `• ${bullet}`
          )
      );

      section.subsections?.forEach(
        (subsection) => {

          if (
            subsection.heading
          ) {
            lines.push(
              subsection.heading
            );
          }

          subsection.paragraphs?.forEach(
            (paragraph) =>
              lines.push(
                paragraph
              )
          );

          subsection.bullets?.forEach(
            (bullet) =>
              lines.push(
                `• ${bullet}`
              )
          );

        }
      );

      lines.push("");

    }
  );

  if (
    article.faq?.length
  ) {
    lines.push(
      "Frequently Asked Questions"
    );

    article.faq.forEach(
      (item) => {

        lines.push(
          `Q: ${item.question}`
        );

        lines.push(
          `A: ${item.answer}`
        );

        lines.push("");

      }
    );
  }

  if (
    article.conclusion
  ) {
    lines.push(
      "Conclusion"
    );

    lines.push(
      article.conclusion
    );
  }

  return lines.join(
    "\n"
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
          (
            height,
            index
          ) => (
            <i
              key={
                index
              }
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
        ].map(
          (day) => (
            <span
              key={
                day
              }
            >
              {day}
            </span>
          )
        )}

      </div>

      <div className="calendar-days">

        {days.map(
          (
            day,
            index
          ) => {

            const isToday =
              day ===
              "26";

            return (
              <div
                className={`calendar-day ${
                  isToday
                    ? "today"
                    : ""
                }`}
                key={
                  index
                }
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
