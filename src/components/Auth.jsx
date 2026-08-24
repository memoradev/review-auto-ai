import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (!email.trim() || !password) {
        throw new Error(
          "Please enter your email and password."
        );
      }

      if (!isLogin && !fullName.trim()) {
        throw new Error(
          "Please enter your name."
        );
      }

      if (isLogin) {
        const { error: loginError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
          });

        if (loginError) {
          throw loginError;
        }
      } else {
        const {
          data,
          error: signupError
        } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim()
            }
          }
        });

        if (signupError) {
          throw signupError;
        }

        if (!data.session) {
          setMessage(
            "Account created. Check your email to confirm your account, then log in."
          );
        } else {
          setMessage(
            "Account created successfully."
          );
        }
      }
    } catch (err) {
      setError(
        err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">
            R
          </div>

          <div>
            <strong>ReviewAuto</strong>
            <span>AI</span>
          </div>
        </div>

        <div className="auth-heading">
          <div className="eyebrow">
            {isLogin
              ? "WELCOME BACK"
              : "GET STARTED"}
          </div>

          <h1>
            {isLogin
              ? "Sign in to your workspace."
              : "Create your workspace."}
          </h1>

          <p>
            Manage your review automation from
            one place.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          {!isLogin && (
            <label>
              <span>Full name</span>

              <input
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(
                    event.target.value
                  )
                }
                placeholder="Business Owner"
                autoComplete="name"
              />
            </label>
          )}

          <label>
            <span>Email</span>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            <span>Password</span>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Minimum 6 characters"
              autoComplete={
                isLogin
                  ? "current-password"
                  : "new-password"
              }
              minLength={6}
              required
            />
          </label>

          {error && (
            <div className="auth-message error">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-message success">
              {message}
            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <div className="auth-switch">
          <span>
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>

          <button
            type="button"
            onClick={() => {
              setMode(
                isLogin
                  ? "signup"
                  : "login"
              );
              setError("");
              setMessage("");
            }}
          >
            {isLogin
              ? "Create account"
              : "Sign in"}
          </button>
        </div>

        <div className="auth-note">
          Your account is secured by Supabase
          Authentication.
        </div>
      </section>
    </main>
  );
}

export default Auth;
