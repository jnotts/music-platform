"use client";

import { useState } from "react";

type ApiResponse = {
  ok: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

/**
 * Smoke test page for verifying API wiring.
 * Calls GET /api/admin/submissions and displays the response.
 */
export default function ApiTestPage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/admin/submissions");
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem" }}>API Smoke Test</h1>
      <p style={{ marginBottom: "1rem", color: "#666" }}>
        This page tests the API wiring by calling{" "}
        <code>GET /api/admin/submissions</code>.
      </p>

      <button
        onClick={testApi}
        disabled={loading}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: loading ? "#888" : "#2D7DFF",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: "1rem",
        }}
      >
        {loading ? "Loading..." : "Test API"}
      </button>

      {error && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#fee",
            border: "1px solid #f88",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div>
          <h2 style={{ marginBottom: "0.5rem" }}>Response:</h2>
          <div
            style={{
              backgroundColor: response.ok ? "#efe" : "#fee",
              border: `1px solid ${response.ok ? "#8f8" : "#f88"}`,
              borderRadius: "4px",
              padding: "1rem",
              marginBottom: "0.5rem",
            }}
          >
            <strong>Status:</strong> {response.ok ? "✓ Success" : "✗ Error"}
          </div>
          <pre
            style={{
              backgroundColor: "#1e1e1e",
              color: "#d4d4d4",
              padding: "1rem",
              borderRadius: "4px",
              overflow: "auto",
              maxHeight: "400px",
            }}
          >
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#f5f5f5",
          borderRadius: "4px",
        }}
      >
        <h3 style={{ marginBottom: "0.5rem" }}>Expected Results:</h3>
        <ul style={{ marginLeft: "1.5rem" }}>
          <li>
            <strong>Not logged in:</strong> Should return 401 UNAUTHORIZED
          </li>
          <li>
            <strong>Logged in, not admin:</strong> Should return 403 FORBIDDEN
          </li>
          <li>
            <strong>Logged in as admin:</strong> Should return submissions list
          </li>
        </ul>
      </div>
    </div>
  );
}
