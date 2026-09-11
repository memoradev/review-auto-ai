import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const MIN_PASSWORD_LENGTH = 12;

function Auth({ recoveryMode = false }) {
  const [mode, setMode] = useState(
    recoveryMode ? "reset" : "login"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (recoveryMode) {
      setMode("reset");
      setError("");
      setMessage("");
    }
  }, [recoveryMode]);

  function clearMessages() {
    setError("");
    setMessage("");
  }

  async function handleLogin(event) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    clearMessages();

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail || !password) {
        throw new Error(
          "Please enter your email and password."
        );
      }

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password
        });

      if (loginError) {
        throw loginError;
      }
    } catch (err) {
      console.error("Login failed:", err);

      /*
       * Do not expose internal auth details.
       * Keep the message generic to reduce account enumeration.
       */
      setError(
        "Unable to sign in with those credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(event) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    clearMessages();

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedName = fullName.trim();

      if (!normalizedEmail || !password) {
        throw new Error(
          "Please enter your email and password."
        );
      }

      if (!normalizedName) {
        throw new Error(
          "Please enter your name."
        );
      }

      if (password.length < MIN_PASSWORD_LENGTH) {
        throw new Error(
          `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
        );
      }

      const {
        data,
        error: signupError
      } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: normalizedName
          }
        }
      });

      if (signupError) {
        throw signupError;
      }

      /*
       * Supabase may require email confirmation.
       * Do not reveal whether an account already exists.
       */
      if (!data.session) {
        setMessage(
          "If the account can be created, check your email for confirmation."
        );
      } else {
        setMessage(
          "Account created successfully."
        );
      }

      setPassword("");
    } catch (err) {
      console.error("Signup failed:", err);

      /*
       * Keep authentication errors deliberately generic.
       */
      setError(
        "Unable to create the account. Check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(event) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    clearMessages();

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        throw new Error(
          "Please enter your email address."
        );
      }

      const redirectTo =
        `${window.location.origin}/reset-password`;

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          {
            redirectTo
          }
        );

      if (error) {
        throw error;
      }

      /*
       * Always show the same message.
       * This prevents account enumeration.
       */
      setMessage(
        "If an account exists for that email, a password reset link has been sent."
      );
    } catch (err) {
      console.error(
        "Password reset request failed:",
        err
      );

      /*
       * Same generic response even when the request fails.
       */
      setMessage(
        "If an account exists for that email, a password reset link has been sent."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordReset(event) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    clearMessages();

    try {
      if (
        newPassword.length <
        MIN_PASSWORD_LENGTH
      ) {
        throw new Error(
          `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
        );
      }

      const {
        error
      } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      /*
       * Explicitly terminate other sessions after a password change.
       * Supabase also supports terminating sessions on password changes
       * depending on project configuration.
       */
      await supabase.auth.signOut({
        scope: "global"
      });

      setNewPassword("");
      setMode("login");

      setMessage(
        "Password changed successfully. Please sign in again."
      );
    } catch (err) {
      console.error(
        "Password update failed:",
        err
      );

      setError(
        "Unable to change your password. The reset link may have expired. Request a new one."
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode) {
    if (loading) return;

    setMode(nextMode);
    setPassword("");
    setNewPassword("");
    clearMessages();
  }

  if (mode === "reset") {
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
              PASSWORD RESET
            </div>

            <h1>
              Set a new password.
            </h1>

            <p>
              Choose a strong password for your ReviewAuto account.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handlePasswordReset}
          >
            <label>
              <span>New password</span>

              <input
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
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
                ? "Updating..."
                : "Change password"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  if (mode === "forgot") {
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
              ACCOUNT RECOVERY
            </div>

            <h1>
              Reset your password.
            </h1>

            <p>
              Enter your email and we'll send you a recovery link.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleForgotPassword}
          >
            <label>
              <span>Email</span>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
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
                ? "Sending..."
                : "Send reset link"}
            </button>
          </form>

          <div className="auth-switch">
            <span>
              Remember your password?
            </span>

            <button
              type="button"
              onClick={() =>
                switchMode("login")
              }
            >
              Sign in
            </button>
          </div>
        </section>
      </main>
    );
  }

  const isLogin = mode === "login";

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
            Manage your review automation from one place.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={
            isLogin
              ? handleLogin
              : handleSignup
          }
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
                maxLength={120}
                required
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
              placeholder={
                isLogin
                  ? "Your password"
                  : `Minimum ${MIN_PASSWORD_LENGTH} characters`
              }
              autoComplete={
                isLogin
                  ? "current-password"
                  : "new-password"
              }
              minLength={
                isLogin
                  ? undefined
                  : MIN_PASSWORD_LENGTH
              }
              required
            />
          </label>

          {isLogin && (
            <button
              type="button"
              onClick={() =>
                switchMode("forgot")
              }
              style={{
                alignSelf: "flex-end",
                border: 0,
                background: "transparent",
                padding: 0,
                cursor: "pointer"
              }}
            >
              Forgot password?
            </button>
          )}

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
            onClick={() =>
              switchMode(
                isLogin
                  ? "signup"
                  : "login"
              )
            }
          >
            {isLogin
              ? "Create account"
              : "Sign in"}
          </button>
        </div>

        <div className="auth-note">
          Authentication is handled by Supabase Auth.
        </div>
      </section>
    </main>
  );
}

export default Auth;
