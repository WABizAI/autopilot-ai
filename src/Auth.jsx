import React, { useState } from "react";
import { Mail, Lock, Sparkles, ArrowRight, Eye, EyeOff } from "lucide-react";
import { supabase } from "./supabase";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isLogin = mode === "login";

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setMessage(error.message);
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Account created! Please check your email to verify your account."
        );
      }
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">

      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <div className="auth-card">

        <div className="auth-brand">
          <div className="auth-logo">
            <Sparkles size={21} />
          </div>

          <div>
            <strong>AutoPilot AI</strong>
            <span>AI SOCIAL MANAGER</span>
          </div>
        </div>

        <div className="auth-heading">
          <div className="auth-mini-badge">
            <Sparkles size={12} />
            AI-powered workspace
          </div>

          <h1>
            {isLogin
              ? "Welcome back"
              : "Create your workspace"}
          </h1>

          <p>
            {isLogin
              ? "Sign in and let your AI agent handle the busy work."
              : "Start building, publishing and growing with your AI agent."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <label>Email address</label>

          <div className="auth-input">
            <Mail size={17} />

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Password</label>

          <div className="auth-input">
            <Lock size={17} />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>

          {message && (
            <div className="auth-message">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="auth-spinner" />
                Please wait...
              </>
            ) : (
              <>
                {isLogin ? "Sign in" : "Create account"}
                <ArrowRight size={17} />
              </>
            )}
          </button>

        </form>

        <div className="auth-divider">
          <span>SECURE AI WORKSPACE</span>
        </div>

        <div className="auth-switch">
          <span>
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>

          <button
            onClick={() => {
              setMode(isLogin ? "signup" : "login");
              setMessage("");
            }}
          >
            {isLogin ? "Create account" : "Sign in"}
          </button>
        </div>

        <div className="auth-footer">
          <span>🔒 Secure authentication</span>
          <span>•</span>
          <span>AI-powered</span>
        </div>

      </div>

    </div>
  );
}
