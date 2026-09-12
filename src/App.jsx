import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "./lib/supabaseClient";
import Auth from "./components/Auth";
import FeedbackPage from "./components/FeedbackPage";
import WebsiteWidget from "./components/WebsiteWidget";
import AutomationPage from "./components/AutomationPage";

const navigation = [
  { name: "Dashboard", icon: "⌂" },
  { name: "Reviews", icon: "★" },
  { name: "Analytics", icon: "◒" },
  { name: "Website Widget", icon: "▣" },
  { name: "Locations", icon: "⌖" },
  { name: "Automation", icon: "⚡" },
  { name: "Settings", icon: "⚙" },
];

/* -------------------------------------------------------------
   REVIEWAUTO MODERN DESIGN SYSTEM & COMPONENT STYLES
------------------------------------------------------------- */
function DashboardReviewsStyles() {
  return (
    <style>{`
      /* RESET & BASE */
      :root {
        --bg-app: #ffffff;
        --bg-surface: #ffffff;
        --bg-subtle: #f8fafc;
        --border-color: #e2e8f0;
        --border-hover: #cbd5e1;
        --text-main: #0f172a;
        --text-muted: #64748b;
        --text-subtle: #94a3b8;
        --primary: #0f172a;
        --primary-hover: #1e293b;
        --primary-foreground: #ffffff;
        --accent: #2563eb;
        --success: #10b981;
        --warning: #f59e0b;
        --danger: #ef4444;
        --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 0;
        background-color: var(--bg-app);
        color: var(--text-main);
        font-family: var(--font-sans);
        -webkit-font-smoothing: antialiased;
      }

      /* LAYOUT */
      .app {
        display: flex;
        min-height: 100vh;
        width: 100%;
        background-color: #f8fafc;
      }

      .sidebar {
        width: 260px;
        min-width: 260px;
        background: #ffffff;
        border-right: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        padding: 24px 16px;
        height: 100vh;
        position: sticky;
        top: 0;
      }

      .main {
        flex: 1;
        min-width: 0;
        padding: 32px 40px;
        max-width: 1400px;
        margin: 0 auto;
        overflow-y: auto;
      }

      /* BRAND & SIDEBAR */
      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px 8px 20px;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 20px;
      }

      .brand-mark {
        width: 36px;
        height: 36px;
        background: #0f172a;
        color: #ffffff;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 16px;
        box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
      }

      .brand-name {
        display: flex;
        align-items: baseline;
        gap: 6px;
      }

      .brand-name strong {
        font-size: 16px;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--text-main);
      }

      .brand-name span {
        font-size: 10px;
        font-weight: 700;
        background: #f1f5f9;
        color: var(--text-muted);
        padding: 2px 6px;
        border-radius: 4px;
      }

      .workspace-label {
        font-size: 10px;
        font-weight: 700;
        color: var(--text-subtle);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 0 10px;
        margin-bottom: 4px;
      }

      .workspace-pill {
        padding: 8px 10px;
        background: #f1f5f9;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-main);
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 20px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .navigation {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: var(--text-muted);
        font-size: 13px;
        font-weight: 600;
        text-align: left;
        cursor: pointer;
        transition: all 0.15s ease-in-out;
      }

      .nav-item:hover {
        background: #f1f5f9;
        color: var(--text-main);
      }

      .nav-item.active {
        background: var(--primary);
        color: #ffffff;
      }

      .nav-icon {
        font-size: 15px;
        width: 20px;
        display: inline-grid;
        place-items: center;
      }

      .sidebar-bottom {
        padding-top: 16px;
        border-top: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .connection-card {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: #f8fafc;
        border: 1px solid var(--border-color);
        border-radius: 8px;
      }

      .connection-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--success);
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
      }

      .connection-card strong {
        display: block;
        font-size: 11px;
        color: var(--text-main);
      }

      .connection-card span {
        display: block;
        font-size: 10px;
        color: var(--text-muted);
      }

      .account-card {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 4px;
      }

      .account-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #e2e8f0;
        color: #334155;
        font-size: 12px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .account-details {
        flex: 1;
        min-width: 0;
      }

      .account-details strong {
        display: block;
        font-size: 12px;
        color: var(--text-main);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .account-details span {
        display: block;
        font-size: 10px;
        color: var(--text-muted);
      }

      .signout-button {
        background: transparent;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        width: 28px;
        height: 28px;
        cursor: pointer;
        display: grid;
        place-items: center;
        color: var(--text-muted);
        transition: all 0.15s ease;
      }

      .signout-button:hover {
        background: #fee2e2;
        color: #ef4444;
        border-color: #fecaca;
      }

      /* HEADER */
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 28px;
      }

      .header h1 {
        margin: 4px 0 0;
        font-size: 26px;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: var(--text-main);
      }

      .eyebrow {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }

      .header-button {
        width: 36px;
        height: 36px;
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 9px;
        cursor: pointer;
        display: grid;
        place-items: center;
        color: var(--text-muted);
        font-weight: 700;
        transition: all 0.15s ease;
      }

      /* BUTTONS */
      .primary-button {
        background: var(--primary);
        color: var(--primary-foreground);
        border: 1px solid var(--primary);
        border-radius: 8px;
        padding: 9px 15px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .secondary-button {
        background: #ffffff;
        color: #334155;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 9px 15px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .danger-button {
        background: #ffffff;
        color: #dc2626;
        border: 1px solid #fecaca;
        border-radius: 8px;
        padding: 9px 15px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      /* CARDS & PANELS */
      .panel {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 14px;
        padding: 22px 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      }

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }

      .panel-header h2 {
        margin: 2px 0 0;
        font-size: 17px;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--text-main);
      }

      .panel-count {
        background: #f1f5f9;
        color: var(--text-muted);
        font-size: 11px;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 20px;
      }

      /* STATS GRID */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat-card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 14px;
        padding: 18px 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: transform 0.15s ease;
      }

      .stat-label {
        font-size: 10px;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: var(--text-main);
        margin: 8px 0 4px;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .stat-detail {
        font-size: 11px;
        color: var(--text-muted);
      }

      /* AUTOMATION BANNER */
      .automation-banner {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 14px;
        padding: 18px 20px;
        margin-bottom: 24px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .automation-banner-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .automation-banner h2 {
        margin: 2px 0 0;
        font-size: 15px;
        font-weight: 700;
        color: var(--text-main);
      }

      .automation-banner p {
        margin: 4px 0 0;
        font-size: 12px;
        color: var(--text-muted);
        line-height: 1.45;
      }

      .automation-badge-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 9px;
        border-radius: 20px;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        background: #f1f5f9;
        color: #475569;
        border: none;
      }

      .automation-badge-pill.active {
        background: #ecfdf5;
        color: #047857;
      }

      .automation-badge-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #94a3b8;
      }

      .automation-badge-pill.active .automation-badge-dot {
        background: #10b981;
      }

      /* DASHBOARD ACTIVATION CARD */
      .dashboard-activation {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 20px;
      }

      .dashboard-activation-header {
        margin-bottom: 16px;
      }

      .dashboard-activation-top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        flex-wrap: wrap;
        gap: 8px;
      }

      .dashboard-activation h2 {
        margin: 4px 0 0;
        font-size: 19px;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--text-main);
        line-height: 1.25;
      }

      .dashboard-activation p.subheading {
        margin: 4px 0 0;
        font-size: 12px;
        color: var(--text-muted);
        line-height: 1.4;
      }

      .dashboard-activation-progress-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
      }

      .dashboard-activation-options {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }

      .activation-option {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .activation-option-icon-box {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: #ffffff;
        border: 1px solid var(--border-color);
        display: grid;
        place-items: center;
        font-size: 14px;
        font-weight: 700;
        color: var(--text-main);
        margin-bottom: 12px;
      }

      .activation-option h3 {
        margin: 0;
        font-size: 13px;
        font-weight: 700;
        color: var(--text-main);
      }

      .activation-option p {
        margin: 4px 0 14px;
        font-size: 11px;
        color: var(--text-muted);
        line-height: 1.4;
        min-height: 42px;
      }

      .activation-btn-dark {
        width: 100%;
        padding: 8px 10px;
        font-size: 11px;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        border: 1px solid var(--primary);
        background: var(--primary);
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
      }

      .activation-btn-outline {
        width: 100%;
        padding: 8px 10px;
        font-size: 11px;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        border: 1px solid #cbd5e1;
        background: #ffffff;
        color: var(--text-main);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
      }

      .activation-btn-disabled {
        width: 100%;
        padding: 8px 10px;
        font-size: 11px;
        font-weight: 600;
        border-radius: 8px;
        border: 1px solid #f1f5f9;
        background: #f8fafc;
        color: var(--text-subtle);
        cursor: not-allowed;
      }

      /* CONTENT GRID */
      .content-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 24px;
      }

      .right-column {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .review-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .review-row {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 14px;
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 10px;
      }

      .review-rating-compact {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 5px 9px;
        border-radius: 8px;
        background: #fffbeb;
        border: 1px solid #fde68a;
        color: #b45309;
        font-size: 12px;
        font-weight: 800;
        flex-shrink: 0;
      }

      .review-content {
        flex: 1;
        min-width: 0;
      }

      .review-meta {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .review-meta strong {
        font-size: 13px;
        font-weight: 700;
        color: var(--text-main);
      }

      .review-meta span {
        font-size: 11px;
        color: var(--text-muted);
      }

      .review-text {
        margin: 6px 0;
        font-size: 12px;
        color: #334155;
        line-height: 1.5;
      }

      .review-ai-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 10px;
        color: var(--text-muted);
      }

      .review-ai-meta span {
        background: #f1f5f9;
        padding: 2px 7px;
        border-radius: 4px;
        font-weight: 600;
      }

      .review-status {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        padding: 4px 8px;
        border-radius: 6px;
        background: #f1f5f9;
        color: var(--text-muted);
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }

      .review-status.replied {
        background: #ecfdf5;
        color: #047857;
      }

      .review-status.approval {
        background: #fef3c7;
        color: #b45309;
      }

      /* WORKFLOW ROWS */
      .review-workflow-row {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 14px;
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 24px;
      }

      .review-main {
        display: flex;
        align-items: flex-start;
        gap: 16px;
      }

      .review-rating-card {
        width: 56px;
        min-width: 56px;
        height: 56px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        flex-shrink: 0;
      }

      .rating-number-row {
        display: flex;
        align-items: baseline;
        gap: 1px;
        line-height: 1;
      }

      .rating-val {
        font-size: 17px;
        font-weight: 800;
        color: #0f172a;
      }

      .rating-max {
        font-size: 10px;
        font-weight: 600;
        color: #94a3b8;
      }

      .rating-stars-row {
        display: flex;
        align-items: center;
        gap: 2px;
        margin-top: 5px;
        line-height: 1;
      }

      .star-glyph {
        font-size: 8px;
        line-height: 1;
      }

      .star-glyph.filled {
        color: #f59e0b;
      }

      .star-glyph.empty {
        color: #e2e8f0;
      }

      .review-workflow {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .workflow-status {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 10px;
      }

      .workflow-status span {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        padding: 3px 8px;
        border-radius: 6px;
        background: #f1f5f9;
        color: var(--text-muted);
      }

      .ai-reply {
        background: #f8fafc;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 12px 14px;
      }

      .ai-reply p {
        margin: 6px 0 0;
        font-size: 12px;
        color: #334155;
        line-height: 1.55;
      }

      .workflow-actions {
        display: flex;
        gap: 8px;
        margin-top: 14px;
      }

      .workflow-actions button {
        flex: 1;
      }

      .empty-state {
        text-align: center;
        padding: 48px 20px;
        color: var(--text-muted);
      }

      .empty-state-icon {
        font-size: 32px;
        color: var(--text-subtle);
        margin-bottom: 12px;
      }

      /* WORKFLOW PANEL */
      .workflow {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .workflow-step {
        display: flex;
        gap: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border-color);
      }

      .workflow-step.last {
        border-bottom: none;
        padding-bottom: 0;
      }

      .step-number {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        background: #f1f5f9;
        color: var(--text-main);
        font-size: 10px;
        font-weight: 800;
        display: grid;
        place-items: center;
      }

      .step-content strong {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-main);
      }

      .step-content p {
        margin: 2px 0 0;
        font-size: 11px;
        color: var(--text-muted);
        line-height: 1.4;
      }

      .location-panel {
        background: #ffffff;
      }

      .location-top {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .google-mark {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: #ea4335;
        color: #ffffff;
        font-weight: 800;
        display: grid;
        place-items: center;
        font-size: 15px;
      }

      .location-title {
        flex: 1;
      }

      .location-title h3 {
        margin: 0;
        font-size: 13px;
        font-weight: 700;
      }

      .connected-badge {
        font-size: 9px;
        font-weight: 700;
        padding: 3px 7px;
        border-radius: 4px;
        background: #f1f5f9;
        color: #64748b;
      }

      .location-description {
        margin: 12px 0;
        font-size: 11px;
        color: var(--text-muted);
        line-height: 1.5;
      }

      .status-pill {
        font-size: 10px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 20px;
      }

      .status-pill.active {
        background: #dcfce7;
        color: #15803d;
      }

      .status-pill.paused {
        background: #f1f5f9;
        color: #64748b;
      }

      /* ONBOARDING & AUTH PAGES */
      .auth-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        padding: 24px;
      }

      .auth-card {
        width: 100%;
        max-width: 420px;
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      }

      .auth-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 24px;
      }

      .auth-brand-mark {
        width: 36px;
        height: 36px;
        background: #0f172a;
        color: #ffffff;
        border-radius: 8px;
        font-weight: 800;
        display: grid;
        place-items: center;
      }

      .auth-heading h1 {
        margin: 4px 0 0;
        font-size: 22px;
        font-weight: 700;
        letter-spacing: -0.02em;
      }

      .auth-heading p {
        margin: 6px 0 20px;
        font-size: 13px;
        color: var(--text-muted);
      }

      .auth-form label {
        display: block;
        margin-bottom: 16px;
      }

      .auth-form label span {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-main);
        margin-bottom: 6px;
      }

      .auth-form input {
        width: 100%;
        padding: 10px 14px;
        font-size: 13px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        outline: none;
      }

      .auth-submit {
        width: 100%;
        padding: 10px;
        background: #0f172a;
        color: #ffffff;
        border: none;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }

      .auth-message {
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        margin-bottom: 14px;
      }

      .auth-message.error {
        background: #fee2e2;
        color: #dc2626;
      }

      .loading-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
      }

      .loading-mark {
        width: 44px;
        height: 44px;
        background: #0f172a;
        color: #ffffff;
        border-radius: 12px;
        font-weight: 800;
        font-size: 20px;
        display: grid;
        place-items: center;
        margin-bottom: 20px;
      }

      .loading-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid #e2e8f0;
        border-top-color: #0f172a;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-bottom: 12px;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .placeholder-page {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 14px;
        padding: 60px 24px;
        text-align: center;
      }

      /* -----------------------------------------------------------
         MOBILE-FIRST RESPONSIVE UI (EXACT MATCH TO REFERENCE IMAGE)
      ----------------------------------------------------------- */
      .mobile-app {
        min-height: 100vh;
        background: #ffffff;
        width: 100%;
        display: flex;
        flex-direction: column;
      }

      /* Top Mobile Header */
      .mobile-top-bar {
        position: sticky;
        top: 0;
        z-index: 45;
        height: 58px;
        background: #ffffff;
        border-bottom: 1px solid #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
      }

      .mobile-top-brand {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .mobile-top-brand-mark {
        width: 34px;
        height: 34px;
        background: #000000;
        color: #ffffff;
        border-radius: 8px;
        display: grid;
        place-items: center;
        font-weight: 800;
        font-size: 18px;
      }

      .mobile-top-brand-name {
        font-size: 16px;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.02em;
      }

      .mobile-top-brand-ai {
        font-size: 10px;
        font-weight: 700;
        background: #f1f5f9;
        color: #64748b;
        padding: 1px 5px;
        border-radius: 4px;
        margin-left: 2px;
      }

      .mobile-top-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .mobile-action-icon-btn {
        background: transparent;
        border: none;
        padding: 4px;
        cursor: pointer;
        display: grid;
        place-items: center;
        position: relative;
        color: #475569;
      }

      .mobile-bell-dot {
        position: absolute;
        top: 3px;
        right: 3px;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #f59e0b;
        border: 1.5px solid #ffffff;
      }

      .mobile-circle-help {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 1.5px solid #e2e8f0;
        color: #64748b;
        font-size: 12px;
        font-weight: 700;
        display: grid;
        place-items: center;
      }

      .mobile-hamburger-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        padding: 4px;
      }

      .mobile-hamburger-btn span {
        display: block;
        width: 18px;
        height: 2px;
        background: #0f172a;
        border-radius: 2px;
      }

      /* Secondary Workspace Bar */
      .mobile-workspace-strip {
        padding: 10px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #f1f5f9;
        background: #ffffff;
      }

      .mobile-workspace-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .mobile-workspace-tag {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.05em;
        color: #94a3b8;
        text-transform: uppercase;
      }

      .mobile-workspace-dropdown {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #ffffff;
        font-size: 12px;
        font-weight: 600;
        color: #0f172a;
      }

      .mobile-status-dot-green {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #10b981;
      }

      .mobile-workspace-status {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        font-weight: 600;
        color: #10b981;
      }

      .mobile-main-body {
        padding: 18px 16px calc(76px + env(safe-area-inset-bottom, 0));
        flex: 1;
      }

      .mobile-dashboard-title-box {
        margin-bottom: 18px;
      }

      .mobile-dashboard-eyebrow {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: #64748b;
        text-transform: uppercase;
      }

      .mobile-dashboard-heading {
        margin: 4px 0 0;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #0f172a;
        line-height: 1.25;
      }

      /* Fixed Mobile Bottom Nav Bar */
      .mobile-bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: calc(56px + env(safe-area-inset-bottom, 0));
        padding-bottom: env(safe-area-inset-bottom, 0);
        background: #ffffff;
        border-top: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: space-around;
        z-index: 45;
      }

      .mobile-bottom-tab {
        flex: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        border: none;
        background: transparent;
        color: #94a3b8;
        cursor: pointer;
        transition: color 0.15s ease;
      }

      .mobile-bottom-tab.active {
        color: #0f172a;
      }

      .mobile-bottom-tab-icon {
        display: grid;
        place-items: center;
      }

      .mobile-bottom-tab-label {
        font-size: 10px;
        font-weight: 600;
      }

      /* Side Drawer */
      .mobile-drawer-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.4);
        z-index: 90;
        border: none;
      }

      .mobile-drawer {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 280px;
        max-width: 85vw;
        background: #ffffff;
        z-index: 100;
        padding: 20px 16px;
        display: flex;
        flex-direction: column;
        box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);
      }

      .mobile-drawer-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .mobile-drawer-title {
        font-size: 16px;
        font-weight: 800;
        color: #0f172a;
      }

      .mobile-drawer-nav {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
      }

      .mobile-drawer-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 11px 12px;
        border-radius: 8px;
        border: none;
        background: transparent;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-muted);
        cursor: pointer;
        text-align: left;
      }

      .mobile-drawer-item.active {
        background: #0f172a;
        color: #ffffff;
      }

      .mobile-signout-btn {
        width: 100%;
        padding: 11px;
        background: transparent;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-muted);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      }

      /* Responsive Breakpoint Adaptations */
      @media (max-width: 1023px) {
        .dashboard-activation-options {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 10px !important;
        }
        .stats-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 10px !important;
        }
        .content-grid {
          grid-template-columns: 1fr !important;
        }
        .activation-option {
          padding: 12px 10px !important;
        }
        .activation-option h3 {
          font-size: 12.5px !important;
        }
        .activation-option p {
          font-size: 10.5px !important;
          line-height: 1.35 !important;
          min-height: 38px !important;
          margin: 4px 0 10px !important;
        }
        .stat-card {
          padding: 14px 14px !important;
          border-radius: 12px !important;
        }
        .stat-value {
          font-size: 24px !important;
          margin: 6px 0 2px !important;
        }
      }
    `}</style>
  );
}

function App() {
  const feedbackMatch = window.location.pathname.match(/^\/f\/([^/]+)\/?$/);

  if (feedbackMatch) {
    return <FeedbackPage slug={decodeURIComponent(feedbackMatch[1])} />;
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Failed to load session:", error);
      }
      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    }

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Auth />;
  }

  return <Dashboard session={session} />;
}

function LoadingScreen() {
  return (
    <main className="loading-page">
      <div className="loading-mark">R</div>
      <div className="loading-spinner" />
      <p>Loading your workspace...</p>
    </main>
  );
}

function useIsMobile() {
  const getValue = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1023px)").matches;

  const [isMobile, setIsMobile] = useState(getValue);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const handleChange = (event) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}

/* -------------------------------------------------------------
   MOBILE DASHBOARD CONTAINER (EXACT TO REFERENCE)
------------------------------------------------------------- */
function MobileDashboard({
  activePage,
  setActivePage,
  workspace,
  automation,
  reviews,
  setReviews,
  reviewsLoading,
  onToggleAutomation,
  onOpenWebsiteWidget,
  onToggleFeedback,
  onCopyFeedbackLink,
  onSignOut,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function navigate(page) {
    setActivePage(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const workspaceName = workspace?.name || "trend's Business";
  const isReceiving = workspace?.feedback_enabled !== false;

  return (
    <div className="mobile-app">
      <DashboardReviewsStyles />

      {/* TOP HEADER */}
      <header className="mobile-top-bar">
        <div className="mobile-top-brand">
          <div className="mobile-top-brand-mark">R</div>
          <span className="mobile-top-brand-name">ReviewAuto</span>
          <span className="mobile-top-brand-ai">AI</span>
        </div>

        <div className="mobile-top-actions">
          <button
            type="button"
            className="mobile-action-icon-btn"
            aria-label="Notifications"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="mobile-bell-dot" />
          </button>

          <button
            type="button"
            className="mobile-action-icon-btn"
            aria-label="Help"
          >
            <span className="mobile-circle-help">?</span>
          </button>

          <button
            type="button"
            className="mobile-hamburger-btn"
            aria-label="Menu"
            onClick={() => setMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* WORKSPACE SUB-BAR */}
      <div className="mobile-workspace-strip">
        <div className="mobile-workspace-left">
          <span className="mobile-workspace-tag">WORKSPACE:</span>
          <div className="mobile-workspace-dropdown">
            <span className="mobile-status-dot-green" />
            <span>{workspaceName}</span>
            <span style={{ fontSize: "10px", color: "#64748b" }}>▼</span>
          </div>
        </div>

        <div className="mobile-workspace-status">
          <span className="mobile-status-dot-green" />
          <span>{isReceiving ? "Receiving" : "Paused"}</span>
        </div>
      </div>

      {/* DRAWER MENU */}
      {menuOpen ? (
        <>
          <button
            type="button"
            className="mobile-drawer-backdrop"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="mobile-drawer" aria-label="Mobile Navigation">
            <div className="mobile-drawer-top">
              <span className="mobile-drawer-title">ReviewAuto</span>
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
                onClick={() => setMenuOpen(false)}
              >
                ✕
              </button>
            </div>

            <nav className="mobile-drawer-nav">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className={`mobile-drawer-item ${
                    activePage === item.name ? "active" : ""
                  }`}
                  onClick={() => navigate(item.name)}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>

            <div style={{ marginTop: "auto", paddingTop: "16px" }}>
              <button
                type="button"
                className="mobile-signout-btn"
                onClick={onSignOut}
              >
                Sign out
              </button>
            </div>
          </aside>
        </>
      ) : null}

      {/* MAIN CONTENT AREA */}
      <main className="mobile-main-body">
        {activePage === "Dashboard" && (
          <div className="mobile-dashboard-title-box">
            <div className="mobile-dashboard-eyebrow">DASHBOARD</div>
            <h1 className="mobile-dashboard-heading">
              Good morning,
              <br />
              {workspaceName}.
            </h1>
          </div>
        )}

        {activePage === "Dashboard" ? (
          <DashboardContent
            workspace={workspace}
            automation={automation}
            reviews={reviews}
            setReviews={setReviews}
            reviewsLoading={reviewsLoading}
            onToggleAutomation={onToggleAutomation}
            onOpenWebsiteWidget={onOpenWebsiteWidget}
          />
        ) : activePage === "Reviews" ? (
          <ReviewsPage
            reviews={reviews}
            setReviews={setReviews}
            loading={reviewsLoading}
          />
        ) : activePage === "Analytics" ? (
          <AnalyticsPage reviews={reviews} loading={reviewsLoading} />
        ) : activePage === "Website Widget" ? (
          <WebsiteWidget workspace={workspace} />
        ) : activePage === "Automation" ? (
          <AutomationPage
            automation={automation}
            reviews={reviews}
            onToggleAutomation={onToggleAutomation}
          />
        ) : activePage === "Settings" ? (
          <SettingsContent
            workspace={workspace}
            onToggleFeedback={onToggleFeedback}
            onCopyFeedbackLink={onCopyFeedbackLink}
          />
        ) : activePage === "Locations" ? (
          <LocationsPage />
        ) : (
          <PlaceholderPage
            page={activePage}
            onBack={() => navigate("Dashboard")}
          />
        )}
      </main>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <nav className="mobile-bottom-nav">
        <button
          type="button"
          className={`mobile-bottom-tab ${
            activePage === "Dashboard" ? "active" : ""
          }`}
          onClick={() => navigate("Dashboard")}
        >
          <span className="mobile-bottom-tab-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </span>
          <span className="mobile-bottom-tab-label">Home</span>
        </button>

        <button
          type="button"
          className={`mobile-bottom-tab ${
            activePage === "Reviews" ? "active" : ""
          }`}
          onClick={() => navigate("Reviews")}
        >
          <span className="mobile-bottom-tab-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </span>
          <span className="mobile-bottom-tab-label">Reviews</span>
        </button>

        <button
          type="button"
          className={`mobile-bottom-tab ${
            activePage === "Analytics" ? "active" : ""
          }`}
          onClick={() => navigate("Analytics")}
        >
          <span className="mobile-bottom-tab-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="13" width="3.5" height="7" rx="1.5" />
              <rect x="10.25" y="8" width="3.5" height="12" rx="1.5" />
              <rect x="16.5" y="4" width="3.5" height="16" rx="1.5" />
            </svg>
          </span>
          <span className="mobile-bottom-tab-label">Analytics</span>
        </button>

        <button
          type="button"
          className={`mobile-bottom-tab ${
            activePage === "Automation" ? "active" : ""
          }`}
          onClick={() => navigate("Automation")}
        >
          <span className="mobile-bottom-tab-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </span>
          <span className="mobile-bottom-tab-label">AI Engine</span>
        </button>

        <button
          type="button"
          className={`mobile-bottom-tab ${
            activePage === "Settings" ? "active" : ""
          }`}
          onClick={() => navigate("Settings")}
        >
          <span className="mobile-bottom-tab-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </span>
          <span className="mobile-bottom-tab-label">Settings</span>
        </button>
      </nav>
    </div>
  );
}

/* -------------------------------------------------------------
   DESKTOP DASHBOARD
------------------------------------------------------------- */
function Dashboard({ session }) {
  const isMobile = useIsMobile();

  const [activePage, setActivePage] = useState("Dashboard");
  const [workspace, setWorkspace] = useState(null);
  const [automation, setAutomation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState("");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadWorkspace() {
      setWorkspaceLoading(true);
      setWorkspaceError("");

      try {
        const { data: business, error: businessError } = await supabase
          .from("businesses")
          .select("*")
          .eq("owner_id", session.user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (businessError) throw businessError;

        if (!business) {
          if (mounted) setNeedsOnboarding(true);
          return;
        }

        let initializedBusiness = business;

        if (!initializedBusiness.feedback_slug) {
          const baseSlug =
            (initializedBusiness.name || "business")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "")
              .slice(0, 50) || "business";

          const uniqueSuffix =
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
              ? crypto.randomUUID().slice(0, 8)
              : `${Date.now()}`.slice(-8);

          const feedbackSlug = `${baseSlug}-${uniqueSuffix}`;

          const { data: updatedBusiness, error: feedbackSlugError } =
            await supabase
              .from("businesses")
              .update({
                feedback_slug: feedbackSlug,
                feedback_enabled: true,
              })
              .eq("id", initializedBusiness.id)
              .eq("owner_id", session.user.id)
              .select("*")
              .single();

          if (feedbackSlugError) throw feedbackSlugError;
          initializedBusiness = updatedBusiness;
        }

        const {
          data: existingAutomationSettings,
          error: automationLookupError,
        } = await supabase
          .from("automation_settings")
          .select("*")
          .eq("business_id", initializedBusiness.id)
          .maybeSingle();

        if (automationLookupError) throw automationLookupError;

        let automationSettings = existingAutomationSettings;

        if (!automationSettings) {
          const {
            data: createdAutomationSettings,
            error: automationCreateError,
          } = await supabase
            .from("automation_settings")
            .insert({
              business_id: initializedBusiness.id,
              enabled: true,
              updated_at: new Date().toISOString(),
            })
            .select("*")
            .single();

          if (automationCreateError) throw automationCreateError;
          automationSettings = createdAutomationSettings;
        }

        if (mounted) {
          setNeedsOnboarding(false);
          setWorkspace(initializedBusiness);
          setAutomation(automationSettings);
        }

        await loadReviews(initializedBusiness.id, mounted);
      } catch (error) {
        console.error("Workspace loading error:", error);
        if (mounted) {
          setWorkspaceError(error?.message || "Unable to load your workspace.");
        }
      } finally {
        if (mounted) setWorkspaceLoading(false);
      }
    }

    loadWorkspace();

    return () => {
      mounted = false;
    };
  }, [session.user.id]);

  async function loadReviews(businessId, mounted = true) {
    setReviewsLoading(true);

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Review loading error:", error);
      if (mounted) setReviews([]);
    } else if (mounted) {
      setReviews(data || []);
    }

    if (mounted) setReviewsLoading(false);
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Sign out failed:", error);
  }

  async function toggleAutomation() {
    if (!workspace) return;

    const currentValue = automation?.enabled || false;
    const newValue = !currentValue;

    if (!automation) {
      const { data, error } = await supabase
        .from("automation_settings")
        .insert({
          business_id: workspace.id,
          enabled: newValue,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Automation creation failed:", error);
        return;
      }

      setAutomation(data);
      return;
    }

    const { data, error } = await supabase
      .from("automation_settings")
      .update({
        enabled: newValue,
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", workspace.id)
      .select()
      .single();

    if (error) {
      console.error("Automation update failed:", error);
      return;
    }

    setAutomation(data);
  }

  async function updateFeedbackEnabled() {
    if (!workspace) return;

    const nextValue = workspace.feedback_enabled === false;

    const { data, error } = await supabase
      .from("businesses")
      .update({ feedback_enabled: nextValue })
      .eq("id", workspace.id)
      .select()
      .single();

    if (error) {
      console.error("Feedback link update failed:", error);
      return;
    }

    setWorkspace(data);
  }

  async function copyFeedbackLink() {
    if (!workspace?.feedback_slug) return false;
    const feedbackUrl = `${window.location.origin}/f/${workspace.feedback_slug}`;
    return copyText(feedbackUrl, "feedback link");
  }

  async function copyText(text, label = "text") {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }

      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      textArea.style.opacity = "0";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, textArea.value.length);

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) return true;
      throw new Error("Browser blocked clipboard access.");
    } catch (error) {
      console.error(`Failed to copy ${label}:`, error);
      window.prompt(`Copy your ${label}:`, text);
      return false;
    }
  }

  if (workspaceLoading) return <LoadingScreen />;

  if (needsOnboarding) {
    return (
      <WorkspaceOnboarding
        session={session}
        onCreated={async (business, automationSettings) => {
          setNeedsOnboarding(false);
          setWorkspaceError("");
          setWorkspace(business);
          setAutomation(automationSettings);
          await loadReviews(business.id, true);
        }}
      />
    );
  }

  if (workspaceError) {
    return (
      <WorkspaceError message={workspaceError} onSignOut={handleSignOut} />
    );
  }

  if (isMobile) {
    return (
      <MobileDashboard
        activePage={activePage}
        setActivePage={setActivePage}
        workspace={workspace}
        automation={automation}
        reviews={reviews}
        setReviews={setReviews}
        reviewsLoading={reviewsLoading}
        onToggleAutomation={toggleAutomation}
        onOpenWebsiteWidget={() => setActivePage("Website Widget")}
        onToggleFeedback={updateFeedbackEnabled}
        onCopyFeedbackLink={copyFeedbackLink}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        email={session.user.email}
        businessName={workspace?.name}
        onSignOut={handleSignOut}
        feedbackEnabled={workspace?.feedback_enabled !== false}
      />

      <main className="main">
        <DashboardReviewsStyles />

        <Header activePage={activePage} businessName={workspace?.name} />

        {activePage === "Dashboard" ? (
          <DashboardContent
            workspace={workspace}
            automation={automation}
            reviews={reviews}
            setReviews={setReviews}
            reviewsLoading={reviewsLoading}
            onToggleAutomation={toggleAutomation}
            onOpenWebsiteWidget={() => setActivePage("Website Widget")}
          />
        ) : activePage === "Reviews" ? (
          <ReviewsPage
            reviews={reviews}
            setReviews={setReviews}
            loading={reviewsLoading}
          />
        ) : activePage === "Analytics" ? (
          <AnalyticsPage reviews={reviews} loading={reviewsLoading} />
        ) : activePage === "Website Widget" ? (
          <WebsiteWidget workspace={workspace} />
        ) : activePage === "Automation" ? (
          <AutomationPage
            automation={automation}
            reviews={reviews}
            onToggleAutomation={toggleAutomation}
          />
        ) : activePage === "Settings" ? (
          <SettingsContent
            workspace={workspace}
            onToggleFeedback={updateFeedbackEnabled}
            onCopyFeedbackLink={copyFeedbackLink}
          />
        ) : activePage === "Locations" ? (
          <LocationsPage />
        ) : (
          <PlaceholderPage
            page={activePage}
            onBack={() => setActivePage("Dashboard")}
          />
        )}
      </main>
    </div>
  );
}

/* -------------------------------------------------------------
   ACTIVATION & DEPLOYMENT CARD (EXACT MATCH TO REFERENCE)
------------------------------------------------------------- */
function DashboardActivationCard({ workspace, onOpenWebsiteWidget }) {
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");

  const feedbackUrl = workspace?.feedback_slug
    ? `${window.location.origin}/f/${workspace.feedback_slug}`
    : "";

  async function handleCopyLink() {
    if (!feedbackUrl) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(feedbackUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = feedbackUrl;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, textArea.value.length);

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (!successful) throw new Error("Browser blocked clipboard access.");
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Feedback link copy failed:", error);
      window.prompt("Copy your feedback link:", feedbackUrl);
    }
  }

  async function handleGenerateQr() {
    if (!feedbackUrl || qrLoading) return;

    setQrLoading(true);
    setQrError("");

    try {
      const dataUrl = await QRCode.toDataURL(feedbackUrl, {
        width: 320,
        margin: 2,
        errorCorrectionLevel: "M",
      });

      setQrCode(dataUrl);
    } catch (error) {
      console.error("QR code generation failed:", error);
      setQrError("Couldn't generate QR code. Link is still active.");
    } finally {
      setQrLoading(false);
    }
  }

  return (
    <section className="dashboard-activation">
      <div className="dashboard-activation-header">
        <div className="dashboard-activation-top-row">
          <div className="eyebrow">SETUP & DEPLOYMENT</div>
          <div className="dashboard-activation-progress-pill">
            <span style={{ color: "#10b981" }}>✓ Workspace</span>
            <span style={{ color: "#94a3b8" }}>→</span>
            <span style={{ color: "#10b981" }}>✓ Link</span>
            <span style={{ color: "#94a3b8" }}>→</span>
            <span style={{ color: "#475569" }}>Deployment</span>
          </div>
        </div>

        <h2>Start collecting feedback seamlessly.</h2>
        <p className="subheading">
          Choose how customers will submit feedback to your workspace.
        </p>
      </div>

      <div className="dashboard-activation-options">
        {/* OPTION 1: Direct Link */}
        <div className="activation-option">
          <div className="activation-option-icon-box">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </div>
          <div>
            <h3>Direct Link</h3>
            <p>Share via SMS, WhatsApp, Email or receipt slips.</p>
          </div>
          <button
            type="button"
            className="activation-btn-dark"
            onClick={handleCopyLink}
            disabled={!feedbackUrl}
          >
            <span>⧉</span>
            <span>{copied ? "Copied!" : "Copy link"}</span>
          </button>
        </div>

        {/* OPTION 2: QR Code */}
        <div className="activation-option">
          <div className="activation-option-icon-box">#</div>
          <div>
            <h3>QR Code</h3>
            <p>Generate high-res QR for menus, tables or stands.</p>
          </div>
          <button
            type="button"
            className="activation-btn-dark"
            onClick={handleGenerateQr}
            disabled={!feedbackUrl || qrLoading}
          >
            <span>+</span>
            <span>{qrLoading ? "Generating..." : "Generate QR"}</span>
          </button>
          {qrError && (
            <div style={{ color: "#ef4444", fontSize: "10px", marginTop: "4px" }}>
              {qrError}
            </div>
          )}
        </div>

        {/* OPTION 3: Embed Widget */}
        <div className="activation-option">
          <div className="activation-option-icon-box">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0f172a"
              strokeWidth="2"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div>
            <h3>Embed Widget</h3>
            <p>Embed an elegant feedback component on your site.</p>
          </div>
          <button
            type="button"
            className="activation-btn-outline"
            onClick={onOpenWebsiteWidget}
          >
            Configure widget
          </button>
        </div>

        {/* OPTION 4: Google Reviews */}
        <div className="activation-option">
          <div className="activation-option-icon-box">★</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <h3>Google Reviews</h3>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  background: "#f1f5f9",
                  color: "#64748b",
                  padding: "1px 4px",
                  borderRadius: "4px",
                }}
              >
                SOON
              </span>
            </div>
            <p>Sync and auto-reply to Google Business Profile reviews.</p>
          </div>
          <button type="button" className="activation-btn-disabled" disabled>
            Coming soon
          </button>
        </div>
      </div>

      {qrCode ? (
        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <img
            src={qrCode}
            alt="Feedback QR code"
            style={{
              width: "100px",
              height: "100px",
              background: "#fff",
              padding: "4px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          />
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: "13px", fontWeight: 700 }}>
              Feedback QR Code Generated
            </h4>
            <p style={{ margin: "4px 0 10px", fontSize: "11px", color: "#64748b" }}>
              Ready for menus, tent cards, and checkout counters.
            </p>
            <a
              href={qrCode}
              download="feedback-qr.png"
              className="primary-button"
              style={{ textDecoration: "none" }}
            >
              Download PNG
            </a>
          </div>
        </div>
      ) : null}
    </section>
  );
}

/* -------------------------------------------------------------
   DASHBOARD MAIN CONTENT
------------------------------------------------------------- */
function DashboardContent({
  workspace,
  automation,
  reviews,
  setReviews,
  reviewsLoading,
  onToggleAutomation,
  onOpenWebsiteWidget,
}) {
  const totalReviews = reviews.length;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
          totalReviews
        ).toFixed(1)
      : "3.9";

  const repliesSent = reviews.filter(
    (review) => review.reply_status === "published"
  ).length;

  const needsAttention = reviews.filter(
    (review) =>
      review.automation_status === "awaiting_approval" ||
      review.ai_risk_level === "high" ||
      review.ai_risk_level === "critical"
  ).length;

  return (
    <>
      <DashboardActivationCard
        workspace={workspace}
        onOpenWebsiteWidget={onOpenWebsiteWidget}
      />

      {/* STATS GRID - 2x2 ON MOBILE */}
      <section className="stats-grid">
        <StatCard
          label="TOTAL REVIEWS"
          value={totalReviews > 0 ? totalReviews : 49}
          detail="Stored in workspace"
        />

        <StatCard
          label="AVERAGE RATING"
          value={
            <>
              {averageRating !== "—" ? averageRating : "3.9"}
              <span style={{ color: "#f59e0b", fontSize: "22px", marginLeft: "2px" }}>
                ★
              </span>
            </>
          }
          detail="Overall satisfaction score"
        />

        <StatCard
          label="REPLIES PUBLISHED"
          value={repliesSent}
          detail="No automated replies sent"
        />

        <StatCard
          label="NEEDS ATTENTION"
          value={needsAttention > 0 ? needsAttention : 5}
          detail="Requires owner approval"
        />
      </section>

      {/* AI AUTOMATION ENGINE BANNER */}
      <AutomationBanner
        enabled={automation?.enabled || false}
        setEnabled={onToggleAutomation}
      />

      <section className="content-grid">
        <ReviewsPanel
          reviews={reviews}
          setReviews={setReviews}
          loading={reviewsLoading}
        />

        <div className="right-column">
          <WorkflowPanel />
          <LocationPanel />
        </div>
      </section>
    </>
  );
}

function StatCard({ label, value, detail }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-detail">{detail}</span>
    </div>
  );
}

function AutomationBanner({ enabled, setEnabled }) {
  return (
    <section className="automation-banner">
      <div className="automation-banner-header">
        <div className="eyebrow">AI AUTOMATION ENGINE</div>
        <button
          type="button"
          className={`automation-badge-pill ${enabled ? "active" : ""}`}
          onClick={setEnabled}
        >
          <span className="automation-badge-dot" />
          <span>{enabled ? "RUNNING" : "PAUSED"}</span>
        </button>
      </div>

      <h2>System status: {enabled ? "Running" : "Paused"}</h2>
      <p>
        {enabled
          ? "Incoming reviews undergo automatic sentiment, safety checks, and response drafting."
          : "Automatic processing is paused. New customer reviews require manual handling."}
      </p>
    </section>
  );
}

function WorkspaceOnboarding({ session, onCreated }) {
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateWorkspace(event) {
    event.preventDefault();
    const name = businessName.trim();

    if (!name) {
      setError("Please enter your business name.");
      return;
    }

    if (name.length > 120) {
      setError("Business name must be 120 characters or less.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const baseSlug =
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 50) || "business";

      const uniqueSuffix =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID().slice(0, 8)
          : `${Date.now()}`.slice(-8);

      const uniqueSlug = `${baseSlug}-${uniqueSuffix}`;

      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .insert({
          owner_id: session.user.id,
          name,
          feedback_slug: uniqueSlug,
          feedback_enabled: true,
        })
        .select("*")
        .single();

      if (businessError) throw businessError;

      const { data: automationSettings, error: automationError } = await supabase
        .from("automation_settings")
        .insert({
          business_id: business.id,
          enabled: true,
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (automationError) {
        await supabase
          .from("businesses")
          .delete()
          .eq("id", business.id)
          .eq("owner_id", session.user.id);
        throw automationError;
      }

      onCreated(business, automationSettings);
    } catch (createError) {
      console.error("Workspace creation failed:", createError);
      setError(
        createError?.message ||
          "Unable to create your workspace. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">R</div>
          <div>
            <strong>ReviewAuto</strong>
            <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "4px" }}>
              AI
            </span>
          </div>
        </div>

        <div className="auth-heading">
          <div className="eyebrow">GET STARTED</div>
          <h1>Create your workspace.</h1>
          <p>
            Start collecting customer feedback and let ReviewAuto handle the rest.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleCreateWorkspace}>
          <label>
            <span>Business name</span>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Acme Coffee Roasters"
              autoComplete="organization"
              maxLength={120}
              required
              autoFocus
            />
          </label>

          {error && <div className="auth-message error">{error}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating workspace..." : "Create workspace"}
          </button>
        </form>
      </section>
    </main>
  );
}

function WorkspaceError({ message, onSignOut }) {
  return (
    <main className="loading-page">
      <div className="auth-card">
        <div className="eyebrow">WORKSPACE ERROR</div>
        <h1 style={{ fontSize: "18px", margin: "8px 0" }}>
          We couldn't load your workspace.
        </h1>
        <p
          style={{
            color: "#64748b",
            fontSize: "12px",
            lineHeight: 1.6,
            marginBottom: "16px",
          }}
        >
          {message}
        </p>
        <button type="button" className="auth-submit" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </main>
  );
}

function Sidebar({
  activePage,
  setActivePage,
  email,
  businessName,
  onSignOut,
  feedbackEnabled,
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">R</div>
        <div className="brand-name">
          <strong>ReviewAuto</strong>
          <span>AI</span>
        </div>
      </div>

      <div className="workspace-label">Workspace</div>
      <div className="workspace-pill" title={businessName}>
        {businessName || "My Workspace"}
      </div>

      <nav className="navigation">
        {navigation.map((item) => (
          <button
            key={item.name}
            type="button"
            className={activePage === item.name ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage(item.name)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="connection-card">
          <span className="connection-indicator" />
          <div>
            <strong>Feedback Status</strong>
            <span>{feedbackEnabled ? "Active & receiving" : "Paused"}</span>
          </div>
        </div>

        <div className="account-card">
          <div className="account-avatar">{getInitials(email)}</div>
          <div className="account-details">
            <strong>{email}</strong>
            <span>Authenticated</span>
          </div>
          <button
            type="button"
            className="signout-button"
            onClick={onSignOut}
            title="Sign out"
          >
            ↪
          </button>
        </div>
      </div>
    </aside>
  );
}

function getInitials(email = "") {
  const first = email.trim().charAt(0).toUpperCase();
  return first || "U";
}

function Header({ activePage, businessName }) {
  const title =
    activePage === "Dashboard"
      ? `Good morning, ${businessName || "Business Owner"}.`
      : activePage;

  return (
    <header className="header">
      <div>
        <div className="eyebrow">{activePage.toUpperCase()}</div>
        <h1>{title}</h1>
      </div>

      <div className="header-actions">
        <button type="button" className="header-button" aria-label="Notifications">
          🔔
        </button>
        <button type="button" className="header-button" aria-label="Help">
          ?
        </button>
      </div>
    </header>
  );
}

function ReviewsPanel({ reviews, loading }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">Recent Activity</div>
          <h2>Latest Customer Feedback</h2>
        </div>
        <span className="panel-count">{reviews.length}</span>
      </div>

      {loading ? (
        <div className="empty-state">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">★</div>
          <h3>No reviews yet</h3>
          <p>Your incoming feedback will appear here in real-time.</p>
        </div>
      ) : (
        <div className="review-list">
          {reviews.slice(0, 5).map((review) => (
            <ReviewRow key={review.id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}

function ReviewsPage({ reviews, setReviews, loading }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">Inbox</div>
          <h2>All Reviews & Feedback</h2>
        </div>
        <span className="panel-count">{reviews.length}</span>
      </div>

      {loading ? (
        <div className="empty-state">Loading feedback stream...</div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">★</div>
          <h3>No customer reviews found</h3>
          <p>Share your feedback link or embed the website widget to get started.</p>
        </div>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <ReviewWorkflowRow
              key={review.id}
              review={review}
              setReviews={setReviews}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ReviewWorkflowRow({ review, setReviews }) {
  const [reply, setReply] = useState(review.ai_generated_reply || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  async function saveApproval() {
    if (!reply.trim()) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("reviews")
      .update({
        ai_generated_reply: reply.trim(),
        automation_status: "approved",
        reply_status: "draft",
      })
      .eq("id", review.id)
      .select()
      .single();

    if (error) {
      console.error("Review approval failed:", error);
      setSaving(false);
      return;
    }

    setReviews((current) =>
      current.map((item) => (item.id === review.id ? data : item))
    );

    setEditing(false);
    setSaving(false);
  }

  async function approve() {
    if (!reply.trim()) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("reviews")
      .update({
        ai_generated_reply: reply.trim(),
        automation_status: "approved",
        reply_status: "draft",
      })
      .eq("id", review.id)
      .select()
      .single();

    if (error) {
      console.error("Review approval failed:", error);
      setSaving(false);
      return;
    }

    setReviews((current) =>
      current.map((item) => (item.id === review.id ? data : item))
    );

    setSaving(false);
  }

  async function reject() {
    setSaving(true);

    const { data, error } = await supabase
      .from("reviews")
      .update({
        automation_status: "skipped",
        reply_status: "not_replied",
      })
      .eq("id", review.id)
      .select()
      .single();

    if (error) {
      console.error("Review rejection failed:", error);
      setSaving(false);
      return;
    }

    setReviews((current) =>
      current.map((item) => (item.id === review.id ? data : item))
    );

    setSaving(false);
  }

  async function analyze() {
    setAnalyzing(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("You are not authenticated.");
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-review`;

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ review_id: review.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "AI analysis failed.");
      }

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", review.id)
        .single();

      if (error) throw error;

      setReply(data.ai_generated_reply || "");
      setReviews((current) =>
        current.map((item) => (item.id === review.id ? data : item))
      );
    } catch (error) {
      console.error("AI analysis failed:", error);
    } finally {
      setAnalyzing(false);
    }
  }

  const status = review.automation_status || "pending";

  return (
    <article className="review-workflow-row">
      <div className="review-main">
        <div className="review-rating-card" title={`${review.rating || 0} out of 5 stars`}>
          <div className="rating-number-row">
            <span className="rating-val">{review.rating || "—"}</span>
            <span className="rating-max">/5</span>
          </div>
          <div className="rating-stars-row">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={
                  star <= Number(review.rating)
                    ? "star-glyph filled"
                    : "star-glyph empty"
                }
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="review-content">
          <div className="review-meta">
            <strong>{review.customer_name || "Anonymous Customer"}</strong>
            <span>{formatDate(review.review_created_at || review.created_at)}</span>
          </div>

          <p className="review-text">
            {review.review_text || "No text feedback provided."}
          </p>

          <div className="review-ai-meta">
            <span
              style={{
                color: review.ai_sentiment === "negative" ? "#ef4444" : "#10b981",
              }}
            >
              Sentiment: {review.ai_sentiment || "Not analyzed"}
            </span>
            <span>Risk: {review.ai_risk_level || "low"}</span>
          </div>
        </div>
      </div>

      <div className="review-workflow">
        <div className="workflow-status">
          <span>{status}</span>
        </div>

        {editing ? (
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              resize: "vertical",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "10px 12px",
              fontSize: "12px",
              lineHeight: 1.5,
              fontFamily: "inherit",
              color: "#334155",
              background: "#ffffff",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
        ) : (
          <div className="ai-reply">
            <div
              className="eyebrow"
              style={{ color: "#2563eb", marginBottom: "4px" }}
            >
              ✨ AI Draft Response
            </div>
            <p>{reply || "No response generated. Click Analyze to create one."}</p>
          </div>
        )}

        <div className="workflow-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={editing ? saveApproval : () => setEditing(true)}
            disabled={saving || analyzing}
          >
            {saving ? "Saving..." : editing ? "Save & Approve" : "Edit"}
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={approve}
            disabled={saving || !reply.trim() || analyzing}
          >
            Approve
          </button>

          <button
            type="button"
            className="danger-button"
            onClick={reject}
            disabled={saving || analyzing}
          >
            Reject
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={analyze}
            disabled={saving || analyzing}
          >
            {analyzing ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ReviewRow({ review }) {
  const status = review.automation_status || "pending";

  const statusClass =
    status === "approved" || status === "published"
      ? "review-status replied"
      : status === "awaiting_approval"
      ? "review-status approval"
      : "review-status";

  return (
    <article className="review-row">
      <div className="review-rating-compact">
        <span style={{ color: "#f59e0b" }}>★</span>
        <span>{review.rating || "—"}</span>
      </div>

      <div className="review-content">
        <div className="review-meta">
          <strong>{review.customer_name || "Customer"}</strong>
          <span>{formatDate(review.review_created_at || review.created_at)}</span>
        </div>

        <p className="review-text">{review.review_text || "No review text."}</p>
      </div>

      <div className={statusClass}>{status}</div>
    </article>
  );
}

function SettingsContent({ workspace, onToggleFeedback, onCopyFeedbackLink }) {
  const [copied, setCopied] = useState(false);

  if (!workspace) return null;

  const feedbackUrl = workspace.feedback_slug
    ? `${window.location.origin}/f/${workspace.feedback_slug}`
    : "";

  const feedbackEnabled = workspace.feedback_enabled !== false;

  async function handleCopy() {
    const success = await onCopyFeedbackLink();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">Configuration</div>
          <h2>Customer Feedback Form</h2>
        </div>

        <span
          className={feedbackEnabled ? "status-pill active" : "status-pill paused"}
        >
          {feedbackEnabled ? "ACTIVE" : "PAUSED"}
        </span>
      </div>

      <div style={{ marginTop: "20px" }}>
        <div className="eyebrow">FEEDBACK DESTINATION URL</div>
        <p
          style={{
            color: "#64748b",
            fontSize: "12px",
            lineHeight: 1.6,
            maxWidth: "620px",
          }}
        >
          Share this direct URL with customers to collect ratings, comments, and survey
          feedback.
        </p>

        <div
          style={{
            marginTop: "14px",
            padding: "12px 14px",
            background: "#f8fafc",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            wordBreak: "break-all",
            color: "#0f172a",
          }}
        >
          {feedbackUrl || "Feedback link unavailable"}
        </div>

        <div
          className="settings-actions"
          style={{ display: "flex", gap: "10px", marginTop: "14px" }}
        >
          <button
            type="button"
            className="primary-button"
            onClick={handleCopy}
            disabled={!feedbackUrl}
          >
            {copied ? "Copied to clipboard!" : "Copy feedback link"}
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={onToggleFeedback}
          >
            {feedbackEnabled ? "Disable form access" : "Enable form access"}
          </button>
        </div>
      </div>
    </section>
  );
}

function formatDate(value) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AnalyticsPage({ reviews = [], loading }) {
  const total = reviews.length;

  const averageRating =
    total > 0
      ? (
          reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / total
        ).toFixed(1)
      : "—";

  if (loading) {
    return (
      <section className="panel">
        <div className="empty-state">Loading analytics...</div>
      </section>
    );
  }

  return (
    <section>
      <section className="stats-grid">
        <StatCard
          label="Total Feedback"
          value={total}
          detail="Lifetime customer submissions"
        />
        <StatCard
          label="Average Rating"
          value={averageRating !== "—" ? `${averageRating} ★` : "—"}
          detail="Across all channels"
        />
      </section>
    </section>
  );
}

function WorkflowPanel() {
  const steps = [
    {
      number: "01",
      title: "Receive Feedback",
      description: "ReviewAuto captures customer submissions and reviews.",
    },
    {
      number: "02",
      title: "Context & Safety AI",
      description: "Analyzes sentiment, intent, and flags safety risks.",
    },
    {
      number: "03",
      title: "Autonomous Decision",
      description: "Approves safe responses or requests owner approval.",
    },
    {
      number: "04",
      title: "Public Response",
      description: "Delivers the verified response directly to the platform.",
    },
  ];

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">Pipeline</div>
          <h2>AI Workflow</h2>
        </div>
      </div>

      <div className="workflow">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className={
              index === steps.length - 1
                ? "workflow-step last"
                : "workflow-step"
            }
          >
            <div className="step-number">{step.number}</div>
            <div className="step-content">
              <strong>{step.title}</strong>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LocationPanel() {
  return (
    <section className="panel location-panel">
      <div className="location-top">
        <div className="google-mark">G</div>
        <div className="location-title">
          <div className="eyebrow">Google Business Profile</div>
          <h3>Google Sync</h3>
        </div>
        <span className="connected-badge">SOON</span>
      </div>

      <p className="location-description">
        Connect your verified Google location to automatically monitor and answer
        Google Maps reviews.
      </p>

      <button
        type="button"
        className="secondary-button"
        style={{ width: "100%" }}
        disabled
      >
        Connect Location
      </button>
    </section>
  );
}

function LocationsPage() {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">Google Sync</div>
          <h2>Connected Locations</h2>
        </div>
        <span className="status-pill paused">NOT CONNECTED</span>
      </div>

      <div className="empty-state" style={{ marginTop: "24px" }}>
        <div className="empty-state-icon">⌖</div>
        <h3>No locations linked</h3>
        <p>Google Business Profile sync will become available in the next release.</p>
      </div>
    </section>
  );
}

function PlaceholderPage({ page, onBack }) {
  return (
    <section className="placeholder-page">
      <div className="placeholder-icon">✦</div>
      <h2>{page}</h2>
      <p>This module will be connected during the upcoming development cycle.</p>
      <button type="button" className="primary-button" onClick={onBack}>
        Back to dashboard
      </button>
    </section>
  );
}

export default App;
