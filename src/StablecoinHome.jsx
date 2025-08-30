import React, { useState, useEffect } from "react";
import { Flame, Search, ChevronRight, ShieldCheck, Star, Sun, Moon, Check, X } from "lucide-react";

// ===== Theme & Colors =====
const BTC_ORANGE = "#F7931A";
const LIGHT_ORANGE = "#FFE8CC";
const LIGHT_BG = "#f8f9fb";
const DARK_BG = "#0f1115";
const SLOGAN = "找到最好的稳定币理财产品"; // 可配置的标语

// ===== Robust fetch with timeout & helpful errors =====
async function fetchJSON(path, { timeout = 8000 } = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  let res;
  try {
    res = await fetch(path, { cache: "no-store", signal: controller.signal });
  } catch (e) {
    clearTimeout(id);
    throw new Error(`无法请求 ${path}: ${e?.message || e}`);
  }
  clearTimeout(id);
  if (!res.ok) throw new Error(`请求 ${path} 失败，HTTP ${res.status}`);
  try {
    return await res.json();
  } catch (e) {
    throw new Error(`${path} 不是有效的 JSON: ${e?.message || e}`);
  }
}

// ===== Fallback demo data (当 JSON 加载失败时也能展示) =====
const FALLBACK_PRODUCTS = [
  {
    id: "usdc",
    title: "USDC",
    subtitle: "Binance Earn",
    platform: "Binance Earn",
    apy: "12%",
    footerLeft: "Subsidy",
    footerRight: "R1 Low-risk",
    apyNote: "(2% Base APY + 10% Bonus APY)",
    risk: "R1 Low-risk",
  },
  {
    id: "ethena-usd",
    title: "Ethena USD",
    subtitle: "Ethena",
    platform: "Ethena",
    apy: "7.72%",
    footerLeft: "Delta-neutral",
    footerRight: "R1 Low-risk",
    apyNote: "Delta-neutral strategy",
    risk: "R1 Low-risk",
  },
  {
    id: "usds",
    title: "USDS",
    subtitle: "Sky",
    platform: "Sky",
    apy: "4.75%",
    footerLeft: "U.S. Treasuries",
    footerRight: "R1 Low-risk",
    apyNote: "U.S. Treasuries backing",
    risk: "R1 Low-risk",
  },
];

const FALLBACK_AIRDROPS = [
  {
    rank: 1,
    name: "Falcon Finance",
    season: "Season 0",
    risk: { label: "R2 中风险", tone: "warning" },
    airdrop: "5% (Pre-launch)",
    apy: "7.9%",
  },
  {
    rank: 2,
    name: "Huma Finance",
    season: "Season 2",
    risk: { label: "R3 中高风险", tone: "danger" },
    airdrop: "2%",
    apy: "10%",
  },
];

// ===== UI Atoms =====
const Tag = ({ children, tone = "default", isDark = false }) => (
  <span
    className={
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border " +
      (tone === "primary"
        ? isDark
          ? "border-transparent text-black"
          : "border-transparent text-white"
        : tone === "success"
        ? isDark
          ? "border-emerald-700/40 text-emerald-300 bg-emerald-900/20"
          : "border-emerald-200 text-emerald-700 bg-emerald-50"
        : tone === "warning"
        ? isDark
          ? "border-amber-700/40 text-amber-300 bg-amber-900/20"
          : "border-amber-200 text-amber-700 bg-amber-50"
        : tone === "danger"
        ? isDark
          ? "border-red-700/40 text-red-300 bg-red-900/20"
          : "border-red-200 text-red-700 bg-red-50"
        : isDark
        ? "border-white/10 text-white/70 bg-white/5"
        : "border-gray-200 text-gray-700 bg-gray-50")
    }
    style={{ backgroundColor: tone === "primary" ? BTC_ORANGE : "" }}
  >
    {children}
  </span>
);

const Card = ({ title, subtitle, apy, footerLeft, footerRight, isDark, onClick }) => (
  <div
    onClick={onClick}
    className={
      (isDark
        ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50") +
      " group cursor-pointer rounded-2xl border p-5 transition"
    }
  >
    <div className={isDark ? "text-sm text-white/70" : "text-sm text-gray-700"}>{title}</div>
    <div className={isDark ? "text-xs text-white/40 mb-6" : "text-xs text-gray-500 mb-6"}>{subtitle}</div>
    <div className="flex items-end gap-2">
      <div className={isDark ? "text-5xl font-extrabold tracking-tight text-white" : "text-5xl font-extrabold tracking-tight text-gray-900"}>{apy}</div>
      <div className={isDark ? "pb-2 text-sm text-white/60" : "pb-2 text-sm text-gray-600"}>Real-time APY</div>
    </div>
    <div className="mt-6 flex items-center justify-between">
      <Tag isDark={isDark}>{footerLeft}</Tag>
      <Tag tone="success" isDark={isDark}>{footerRight}</Tag>
    </div>
  </div>
);

const ListItem = ({ rank, name, season, risk, airdrop, apy, isDark }) => (
  <div
    className={
      (isDark
        ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50") +
      " flex items-center gap-4 rounded-2xl border p-5 transition"
    }
  >
    <div className={(isDark ? "border-white/10 text-white/70" : "border-gray-200 text-gray-600") + " flex h-10 w-10 items-center justify-center rounded-full border"}>#{rank}</div>
    <div className="flex-1">
      <div className="flex items-center gap-3">
        <div className={isDark ? "text-base font-semibold text-white" : "text-base font-semibold text-gray-900"}>{name}</div>
        <Tag isDark={isDark}>{season}</Tag>
        {risk && <Tag tone={risk.tone} isDark={isDark}>{risk.label}</Tag>}
      </div>
    </div>
    <div className={"hidden md:flex items-center gap-3 text-sm " + (isDark ? "text-white/70" : "text-gray-600")}>
      <div>Airdrop: {airdrop}</div>
      <div>APY: {apy}</div>
    </div>
    <button className="ml-4 inline-flex items-center rounded-xl px-3 py-2 text-sm font-medium text-black transition" style={{ backgroundColor: BTC_ORANGE }}>
      查看详情 <ChevronRight className="ml-1 h-4 w-4" />
    </button>
  </div>
);

const DetailModal = ({ isDark, data, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-8" role="dialog" aria-modal="true">
    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
    <div className={(isDark ? "bg-[#121418] text-white border-white/10" : "bg-white text-gray-900 border-gray-200") + " relative z-10 w-full max-w-3xl rounded-2xl border shadow-2xl"}>
      {/* header */}
      <div className={(isDark ? "border-white/10" : "border-gray-200") + " flex items-center justify-between rounded-t-2xl border-b px-5 py-4"}>
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold">{data?.title || "—"} <span className="text-gray-500">({data?.platform || "—"})</span></div>
          {data?.risk && <Tag tone="success" isDark={isDark}>{data.risk}</Tag>}
        </div>
        <button onClick={onClose} className={isDark ? "text-white/70 hover:text-white" : "text-gray-500 hover:text-gray-700"}>
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* body */}
      <div className="px-6 py-6">
        <p className={isDark ? "text-sm text-white/60" : "text-sm text-gray-600"}>Limited-time yield product launched by Binance in partnership with Circle.</p>
        <div className="mt-4 flex items-end gap-3">
          <div className="text-5xl font-extrabold tracking-tight" style={{ color: isDark ? "#fff" : "#111827" }}>{data?.apy || "—"} APY</div>
          <div className={isDark ? "pb-2 text-xs text-white/60" : "pb-2 text-xs text-gray-600"}>Est. Real-time total APY<br />{data?.apyNote || "(2% Base APY + 10% Bonus APY)"}</div>
        </div>
      </div>
    </div>
  </div>
);

export default function StablecoinHome() {
  const [isDark, setIsDark] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [products, setProducts] = useState([]);
  const [airdrops, setAirdrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [p, a] = await Promise.all([
          fetchJSON("/data/products.json").catch(() => FALLBACK_PRODUCTS),
          fetchJSON("/data/airdrops.json").catch(() => FALLBACK_AIRDROPS),
        ]);
        setProducts(Array.isArray(p) ? p : FALLBACK_PRODUCTS);
        setAirdrops(Array.isArray(a) ? a : FALLBACK_AIRDROPS);
      } catch (e) {
        setError(String(e?.message || e));
        // fallback to demo data so UI still renders
        setProducts(FALLBACK_PRODUCTS);
        setAirdrops(FALLBACK_AIRDROPS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: isDark
          ? `radial-gradient(1200px 600px at 80% -10%, ${BTC_ORANGE}10, transparent 60%), ${DARK_BG}`
          : `radial-gradient(1200px 600px at 80% -10%, ${BTC_ORANGE}15, transparent 60%), ${LIGHT_BG}`,
      }}
    >
      {/* Top bar */}
      <header className={(isDark ? "border-b border-white/10" : "border-b border-gray-200") + " sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/5"}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Brand + Slogan */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md" style={{ backgroundColor: BTC_ORANGE }}>
              <Star className={isDark ? "h-4 w-4 text-black" : "h-4 w-4 text-white"} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className={(isDark ? "text-white" : "text-gray-900") + " font-semibold tracking-wide"}>MSTR <span style={{ color: BTC_ORANGE }}>STABLECOIN</span></div>
                <Tag tone="primary" isDark={isDark}>Beta</Tag>
              </div>
              <div className={(isDark ? "text-sm text-white/80" : "text-sm text-gray-700") + " leading-tight"}>
                {SLOGAN}
              </div>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <input
                className={
                  "w-56 rounded-xl py-2 pl-9 pr-3 text-sm outline-none " +
                  (isDark
                    ? "border border-white/10 bg-white/5 text-white placeholder-white/40 focus:border-white/20"
                    : "border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:border-gray-400")
                }
                placeholder="搜索稳定币或平台…"
                aria-label="搜索"
              />
              <Search className={"absolute left-2.5 top-2.5 h-4 w-4 " + (isDark ? "text-white/40" : "text-gray-400")} />
            </div>
            <button onClick={() => setIsDark(v => !v)} className={(isDark ? "border-white/20 bg-white/5 text-white" : "border-gray-300 bg-white text-gray-800") + " inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition"}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} {isDark ? "浅色" : "深色"}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-6xl px-4">
        <div className="mt-6">
          {error && (
            <div className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              数据加载遇到问题：{error}
            </div>
          )}
        </div>

        {/* Flexible Earn Benchmark */}
        <div className={(isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white") + " mt-6 rounded-2xl border p-5"}>
          <div className="flex items-center justify-between">
            <h2 className={isDark ? "text-lg font-semibold text-white" : "text-lg font-semibold text-gray-900"}>Flexible Earn Benchmark</h2>
            <div className={isDark ? "text-xs text-white/50" : "text-xs text-gray-500"}>Best interest rate for flexible stablecoin earnings with risk coefficient below R1.</div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className={isDark?"text-white/70":"text-gray-600"}>加载中…</div>
            ) : (
              products.map((p) => (
                <Card key={p.id || p.title} {...p} isDark={isDark} onClick={() => setDetailData(p)} />
              ))
            )}
          </div>
        </div>

        {/* With Airdrop */}
        <div className={(isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white") + " mt-8 rounded-2xl border p-5"}>
          <div className="flex items-center gap-2">
            <h2 className={isDark ? "text-lg font-semibold text-white" : "text-lg font-semibold text-gray-900"}>With Airdrop</h2>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-black" style={{ backgroundColor: LIGHT_ORANGE }}>
              <Flame className="h-4 w-4" color={BTC_ORANGE} />
              <span style={{ color: BTC_ORANGE }}>Trending</span>
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {loading ? (
              <div className={isDark?"text-white/70":"text-gray-600"}>加载中…</div>
            ) : (
              airdrops.map((item) => (
                <ListItem key={(item.rank || 0) + (item.name || "")} {...item} isDark={isDark} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Detail modal */}
      {detailData && <DetailModal isDark={isDark} data={detailData} onClose={() => setDetailData(null)} />}
    </div>
  );
}
