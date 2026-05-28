import { useState, useEffect, useCallback } from "react";

const BASE_URL = "http://localhost:8080";

const SCORE_COLORS = {
  5: { bg: "#EAF3DE", text: "#3B6D11", bar: "#639922" },
  4: { bg: "#EAF3DE", text: "#3B6D11", bar: "#97C459" },
  3: { bg: "#FAEEDA", text: "#854F0B", bar: "#EF9F27" },
  2: { bg: "#FAECE7", text: "#993C1D", bar: "#D85A30" },
  1: { bg: "#FCEBEB", text: "#A32D2D", bar: "#E24B4A" },
};

function StarRating({ score }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="14" height="14" viewBox="0 0 14 14" fill="none">
          <polygon
            points="7,1 8.8,5.2 13.3,5.6 10.1,8.4 11.1,12.8 7,10.4 2.9,12.8 3.9,8.4 0.7,5.6 5.2,5.2"
            fill={s <= score ? SCORE_COLORS[score]?.bar ?? "#639922" : "var(--color-border-secondary)"}
          />
        </svg>
      ))}
    </div>
  );
}

function ScoreBadge({ score }) {
  const c = SCORE_COLORS[score] ?? SCORE_COLORS[3];
  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        fontWeight: 500,
        fontSize: 13,
        padding: "3px 9px",
        borderRadius: 999,
        letterSpacing: "0.01em",
      }}
    >
      {score}/5
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function AuthorAvatar({ name }) {
  const initials = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("")
    : "?";
  const hue = name
    ? [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
    : 200;
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: `hsl(${hue},40%,88%)`,
        color: `hsl(${hue},40%,32%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 500,
        fontSize: 13,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.content && review.content.length > 220;
  const displayContent =
    !isLong || expanded ? review.content : review.content.slice(0, 220) + "…";

  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        padding: "1rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "var(--color-border-secondary)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--color-border-tertiary)")
      }
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <AuthorAvatar name={review.author} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontWeight: 500,
                fontSize: 14,
                color: "var(--color-text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 180,
              }}
            >
              {review.author || "Anonymous"}
            </span>
            <ScoreBadge score={review.score} />
          </div>
          <div style={{ marginTop: 2 }}>
            <StarRating score={review.score} />
          </div>
        </div>
        <span
          style={{
            fontSize: 12,
            color: "var(--color-text-tertiary)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {formatDate(review.submitted_at)}
        </span>
      </div>

      {review.title && (
        <p
          style={{
            margin: 0,
            fontWeight: 500,
            fontSize: 14,
            color: "var(--color-text-primary)",
          }}
        >
          {review.title}
        </p>
      )}

      {review.content && (
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
          }}
        >
          {displayContent}
          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              style={{
                background: "none",
                border: "none",
                padding: "0 4px",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--color-text-info)",
                fontWeight: 500,
              }}
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </p>
      )}
    </div>
  );
}

function ScoreFilter({ value, onChange, counts }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {["all", "5", "4", "3", "2", "1"].map((s) => {
        const active = value === s;
        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            style={{
              padding: "4px 12px",
              borderRadius: 999,
              border: active
                ? "1.5px solid var(--color-border-info)"
                : "0.5px solid var(--color-border-secondary)",
              background: active
                ? "var(--color-background-info)"
                : "var(--color-background-primary)",
              color: active
                ? "var(--color-text-info)"
                : "var(--color-text-secondary)",
              fontSize: 13,
              fontWeight: active ? 500 : 400,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {s === "all" ? (
              "All"
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 14 14">
                  <polygon
                    points="7,1 8.8,5.2 13.3,5.6 10.1,8.4 11.1,12.8 7,10.4 2.9,12.8 3.9,8.4 0.7,5.6 5.2,5.2"
                    fill={active ? SCORE_COLORS[s]?.bar : "currentColor"}
                  />
                </svg>
                {s}
              </>
            )}
            {counts[s] !== undefined && (
              <span
                style={{
                  fontSize: 11,
                  opacity: 0.7,
                  background: "var(--color-background-secondary)",
                  borderRadius: 999,
                  padding: "0 5px",
                }}
              >
                {counts[s]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function RatingSummary({ reviews }) {
  if (!reviews.length) return null;
  const avg = reviews.reduce((s, r) => s + Number(r.score), 0) / reviews.length;
  const counts = [5, 4, 3, 2, 1].map((s) => ({
    s,
    n: reviews.filter((r) => Number(r.score) === s).length,
  }));
  const max = Math.max(...counts.map((c) => c.n), 1);
  return (
    <div
      style={{
        background: "var(--color-background-secondary)",
        borderRadius: "var(--border-radius-lg)",
        padding: "1rem 1.25rem",
        display: "flex",
        gap: 24,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div style={{ textAlign: "center", minWidth: 64 }}>
        <div
          style={{
            fontSize: 36,
            fontWeight: 500,
            color: "var(--color-text-primary)",
            lineHeight: 1.1,
          }}
        >
          {avg.toFixed(1)}
        </div>
        <StarRating score={Math.round(avg)} />
        <div
          style={{
            fontSize: 12,
            color: "var(--color-text-tertiary)",
            marginTop: 4,
          }}
        >
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 140 }}>
        {counts.map(({ s, n }) => (
          <div
            key={s}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                width: 8,
                textAlign: "right",
              }}
            >
              {s}
            </span>
            <svg width="11" height="11" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
              <polygon
                points="7,1 8.8,5.2 13.3,5.6 10.1,8.4 11.1,12.8 7,10.4 2.9,12.8 3.9,8.4 0.7,5.6 5.2,5.2"
                fill={SCORE_COLORS[s]?.bar}
              />
            </svg>
            <div
              style={{
                flex: 1,
                height: 6,
                background: "var(--color-border-tertiary)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(n / max) * 100}%`,
                  height: "100%",
                  background: SCORE_COLORS[s]?.bar,
                  borderRadius: 3,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <span
              style={{
                fontSize: 12,
                color: "var(--color-text-tertiary)",
                width: 20,
                textAlign: "right",
              }}
            >
              {n}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AppReviews() {
  const [appId, setAppId] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [refreshMsg, setRefreshMsg] = useState(null);

  const fetchReviews = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/reviews/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch (e) {
      setError(e.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (appId) fetchReviews(appId);
  }, [appId, fetchReviews]);

  const handleSearch = () => {
    const id = inputVal.trim();
    if (!id) return;
    setFilter("all");
    setSort("newest");
    setRefreshMsg(null);
    setAppId(id);
  };

  const handleRefresh = async () => {
    if (!appId || refreshing) return;
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      const res = await fetch(
        `${BASE_URL}/api/reviews/${encodeURIComponent(appId)}/refresh`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error(`Refresh failed (${res.status})`);
      setRefreshMsg("Reviews refreshed successfully.");
      await fetchReviews(appId);
    } catch (e) {
      setRefreshMsg(`Error: ${e.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const counts = { all: reviews.length };
  [5, 4, 3, 2, 1].forEach((s) => {
    counts[s] = reviews.filter((r) => Number(r.score) === s).length;
  });

  const filtered =
    filter === "all" ? reviews : reviews.filter((r) => r.score === filter);

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "newest")
      return new Date(b.submitted_at) - new Date(a.submitted_at);
    if (sort === "oldest")
      return new Date(a.submitted_at) - new Date(b.submitted_at);
    if (sort === "highest") return b.score - a.score;
    if (sort === "lowest") return a.score - b.score;
    return 0;
  });

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1rem", fontFamily: "var(--font-sans)" }}>
      <h2 style={{ sr: "only", display: "none" }}>App Reviews Dashboard</h2>

      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 500,
            margin: "0 0 4px",
            color: "var(--color-text-primary)",
          }}
        >
          App reviews
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--color-text-secondary)",
            margin: 0,
          }}
        >
          Enter an app ID to fetch and browse its reviews.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Enter app ID…"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{ flex: 1 }}
        />
        <button
          onClick={handleSearch}
          disabled={!inputVal.trim() || loading}
          style={{ minWidth: 80 }}
        >
          {loading ? "Loading…" : "Fetch"}
        </button>
        {appId && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh reviews from source"
            style={{ minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
          >
            <i
              className="ti ti-refresh"
              aria-hidden="true"
              style={{
                fontSize: 16,
                display: "inline-block",
                animation: refreshing ? "spin 1s linear infinite" : "none",
              }}
            />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {refreshMsg && (
        <div
          style={{
            fontSize: 13,
            padding: "8px 12px",
            borderRadius: "var(--border-radius-md)",
            marginBottom: "1rem",
            background: refreshMsg.startsWith("Error")
              ? "var(--color-background-danger)"
              : "var(--color-background-success)",
            color: refreshMsg.startsWith("Error")
              ? "var(--color-text-danger)"
              : "var(--color-text-success)",
            border: `0.5px solid ${
              refreshMsg.startsWith("Error")
                ? "var(--color-border-danger)"
                : "var(--color-border-success)"
            }`,
          }}
        >
          {refreshMsg}
        </div>
      )}

      {error && (
        <div
          style={{
            fontSize: 14,
            padding: "12px 16px",
            borderRadius: "var(--border-radius-md)",
            marginBottom: "1rem",
            background: "var(--color-background-danger)",
            color: "var(--color-text-danger)",
            border: "0.5px solid var(--color-border-danger)",
          }}
        >
          <i className="ti ti-alert-circle" style={{ marginRight: 6, fontSize: 16, verticalAlign: -2 }} aria-hidden="true" />
          {error}
        </div>
      )}

      {loading && !reviews.length && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: 100,
                borderRadius: "var(--border-radius-lg)",
                background: "var(--color-background-secondary)",
                opacity: 1 - i * 0.2,
                animation: "pulse 1.4s ease-in-out infinite",
              }}
            />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }`}</style>
        </div>
      )}

      {!loading && appId && !error && reviews.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1rem",
            color: "var(--color-text-tertiary)",
            fontSize: 14,
          }}
        >
          <i className="ti ti-mood-empty" style={{ fontSize: 32, display: "block", marginBottom: 8 }} aria-hidden="true" />
          No reviews found for <strong style={{ color: "var(--color-text-secondary)" }}>{appId}</strong>.
        </div>
      )}

      {reviews.length > 0 && (
        <>
          <RatingSummary reviews={reviews} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              margin: "1.25rem 0 0.75rem",
            }}
          >
            <ScoreFilter value={filter} onChange={setFilter} counts={counts} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ fontSize: 13 }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest score</option>
              <option value="lowest">Lowest score</option>
            </select>
          </div>

          {sorted.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "var(--color-text-tertiary)",
                fontSize: 14,
              }}
            >
              No reviews match this filter.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sorted.map((r, i) => (
                <ReviewCard key={i} review={r} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
