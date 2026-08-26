import React, { useState } from "react";
import {
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  WandSparkles,
  CheckCircle2
} from "lucide-react";
import { supabase } from "./supabase";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const isLogin = mode === "login";

  const switchMode = () => {
    setMode(isLogin ? "signup" : "login");
    setEmail("");
    setPassword("");
    setMessage("");
    setMessageType("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!email.trim() || !password.trim()) {
      setMessage("Please enter your email and password.");
      setMessageType("error");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) {
          setMessage(error.message);
          setMessageType("error");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });

        if (error) {
          setMessage(error.message);
          setMessageType("error");
        } else if (data?.session) {
          setMessage("Account created successfully.");
          setMessageType("success");
        } else {
          setMessage(
            "Account created! Please check your email and verify your account."
          );
          setMessageType("success");
        }
      }
    } catch (error) {
      setMessage(
        error?.message || "Something went wrong. Please try again."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      position: "relative",
      overflow: "hidden",
      background:
        "linear-gradient(135deg, #f8faff 0%, #f5f7ff 45%, #ffffff 100%)",
      fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: "#172033"
    },

    glowOne: {
      position: "absolute",
      width: "360px",
      height: "360px",
      borderRadius: "50%",
      background: "rgba(124, 105, 255, 0.10)",
      filter: "blur(70px)",
      top: "-150px",
      right: "-120px",
      pointerEvents: "none"
    },

    glowTwo: {
      position: "absolute",
      width: "300px",
      height: "300px",
      borderRadius: "50%",
      background: "rgba(79, 172, 254, 0.08)",
      filter: "blur(70px)",
      bottom: "-130px",
      left: "-110px",
      pointerEvents: "none"
    },

    card: {
      width: "100%",
      maxWidth: "430px",
      boxSizing: "border-box",
      position: "relative",
      zIndex: 2,
      padding: "34px 32px 26px",
      borderRadius: "28px",
      background: "rgba(255, 255, 255, 0.92)",
      border: "1px solid rgba(224, 228, 240, 0.95)",
      boxShadow:
        "0 24px 70px rgba(30, 41, 70, 0.10), 0 4px 16px rgba(30, 41, 70, 0.04)",
      backdropFilter: "blur(18px)"
    },

    brand: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "30px"
    },

    logo: {
      width: "44px",
      height: "44px",
      flexShrink: 0,
      borderRadius: "14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ffffff",
      background: "linear-gradient(135deg, #705cf6, #8979ff)",
      boxShadow: "0 10px 24px rgba(112, 92, 246, 0.24)"
    },

    brandName: {
      display: "block",
      fontSize: "17px",
      lineHeight: "20px",
      fontWeight: 800,
      letterSpacing: "-0.3px",
      color: "#182033"
    },

    brandSub: {
      display: "block",
      marginTop: "3px",
      fontSize: "9px",
      lineHeight: "12px",
      fontWeight: 800,
      letterSpacing: "1.4px",
      color: "#8b93a5"
    },

    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "7px 10px",
      borderRadius: "999px",
      background: "#f1efff",
      color: "#6958e9",
      fontSize: "11px",
      fontWeight: 700,
      marginBottom: "14px"
    },

    title: {
      margin: 0,
      fontSize: "34px",
      lineHeight: "1.12",
      letterSpacing: "-1.2px",
      fontWeight: 800,
      color: "#151d31"
    },

    description: {
      margin: "10px 0 26px",
      fontSize: "14px",
      lineHeight: "1.65",
      color: "#7b8497"
    },

    label: {
      display: "block",
      marginBottom: "8px",
      fontSize: "12px",
      fontWeight: 700,
      color: "#3d4659"
    },

    inputWrap: {
      height: "50px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      boxSizing: "border-box",
      padding: "0 13px",
      marginBottom: "17px",
      borderRadius: "13px",
      border: "1px solid #e2e6ef",
      background: "#fbfcff",
      transition: "all .2s ease"
    },

    inputIcon: {
      flexShrink: 0,
      color: "#929bad"
    },

    input: {
      width: "100%",
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      fontSize: "14px",
      color: "#20283a",
      fontFamily: "inherit"
    },

    eyeButton: {
      border: "none",
      background: "transparent",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#8d95a6",
      cursor: "pointer"
    },

    submit: {
      width: "100%",
      height: "51px",
      border: "none",
      borderRadius: "14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "9px",
      marginTop: "4px",
      color: "#ffffff",
      background: "linear-gradient(135deg, #6c59ef, #8675ff)",
      boxShadow: "0 12px 25px rgba(108, 89, 239, 0.22)",
      fontSize: "14px",
      fontWeight: 750,
      fontFamily: "inherit",
      cursor: loading ? "wait" : "pointer",
      opacity: loading ? 0.75 : 1
    },

    message: {
      padding: "11px 12px",
      borderRadius: "11px",
      marginBottom: "14px",
      fontSize: "12px",
      lineHeight: "1.5",
      fontWeight: 600
    },

    divider: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      margin: "25px 0 20px",
      color: "#a0a7b5",
      fontSize: "9px",
      fontWeight: 800,
      letterSpacing: "1.2px"
    },

    dividerLine: {
      flex: 1,
      height: "1px",
      background: "#eceef4"
    },

    switch: {
      textAlign: "center",
      fontSize: "13px",
      color: "#858d9d"
    },

    switchButton: {
      marginLeft: "5px",
      padding: 0,
      border: "none",
      background: "transparent",
      color: "#6655e8",
      fontSize: "13px",
      fontWeight: 750,
      fontFamily: "inherit",
      cursor: "pointer"
    },

    footer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "7px",
      flexWrap: "wrap",
      marginTop: "22px",
      paddingTop: "17px",
      borderTop: "1px solid #eef0f5",
      color: "#a0a7b4",
      fontSize: "10px",
      fontWeight: 600
    },

    featureRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginTop: "17px",
      padding: "11px 12px",
      borderRadius: "11px",
      background: "#fafaff",
      border: "1px solid #f0effb",
      color: "#70798b",
      fontSize: "11px"
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

      <div style={styles.card}>

        {/* BRAND */}
        <div style={styles.brand}>
          <div style={styles.logo}>
            <Sparkles size={21} />
          </div>

          <div>
            <span style={styles.brandName}>AutoPilot AI</span>
            <span style={styles.brandSub}>AI SOCIAL MANAGER</span>
          </div>
        </div>

        {/* HEADING */}
        <div>
          <div style={styles.badge}>
            <WandSparkles size={12} />
            AI-powered workspace
          </div>

          <h1 style={styles.title}>
            {isLogin ? "Welcome back" : "Create your workspace"}
          </h1>

          <p style={styles.description}>
            {isLogin
              ? "Sign in and let your AI agent handle the busy work."
              : "Create your account and start building your automated social media workspace."}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          <label style={styles.label}>Email address</label>

          <div style={styles.inputWrap}>
            <Mail size={18} style={styles.inputIcon} />

            <input
              style={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <label style={styles.label}>Password</label>

          <div style={styles.inputWrap}>
            <Lock size={18} style={styles.inputIcon} />

            <input
              style={styles.input}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={6}
              required
            />

            <button
              type="button"
              style={styles.eyeButton}
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>

          {/* MESSAGE */}
          {message && (
            <div
              style={{
                ...styles.message,
                color:
                  messageType === "success"
                    ? "#287a4d"
                    : "#b54747",
                background:
                  messageType === "success"
                    ? "#effaf3"
                    : "#fff3f3",
                border:
                  messageType === "success"
                    ? "1px solid #d6f1df"
                    : "1px solid #f5dada"
              }}
            >
              {message}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            style={styles.submit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,.45)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "autopilotSpin .7s linear infinite"
                  }}
                />
                Please wait...
              </>
            ) : (
              <>
                {isLogin ? "Sign in to AutoPilot" : "Create account"}
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* FEATURE */}
        <div style={styles.featureRow}>
          <ShieldCheck size={15} color="#6d5bf1" />
          <span>
            Secure authentication powered by Supabase
          </span>
        </div>

        {/* DIVIDER */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          SECURE AI WORKSPACE
          <span style={styles.dividerLine} />
        </div>

        {/* SWITCH */}
        <div style={styles.switch}>
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            style={styles.switchButton}
            onClick={switchMode}
          >
            {isLogin ? "Create account" : "Sign in"}
          </button>
        </div>

        {/* FOOTER */}
        <div style={styles.footer}>
          <span>
            <CheckCircle2
              size={11}
              style={{ verticalAlign: "middle", marginRight: "3px" }}
            />
            Secure
          </span>

          <span>•</span>

          <span>AI-powered</span>

          <span>•</span>

          <span>Mobile friendly</span>
        </div>

      </div>

      <style>
        {`
          @keyframes autopilotSpin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          input::placeholder {
            color: #a5acba;
          }

          button:focus-visible,
          input:focus-visible {
            outline: 2px solid rgba(108, 89, 239, .25);
            outline-offset: 2px;
          }

          @media (max-width: 480px) {
            body {
              margin: 0;
            }

            [data-autopilot-card] {
              border-radius: 22px;
            }
          }
        `}
      </style>
    </div>
  );
}
