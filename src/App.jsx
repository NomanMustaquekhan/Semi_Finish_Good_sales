import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ComposedChart,
} from "recharts";

// ── MOCK / REPLACE WITH YOUR REAL HOOK ───────────────────────────────────────
// import useGoogleSheets from './hooks/useGoogleSheets'
const useGoogleSheets = () => null;

// ── SAMPLE DATA (replace with real Google Sheet data) ─────────────────────────
const RAW_DATA = [
  { inv:"INV-001", date:"01-Apr-23", month:"Apr", year:2023, fy:"2023-24", customer:"JSPL Raigarh",    material:"FLY ASH",        qty:1200, rate:850,  price:1020000, total:1020000, region:"Chhattisgarh", gst:18 },
  { inv:"INV-002", date:"05-Apr-23", month:"Apr", year:2023, fy:"2023-24", customer:"ACC Ltd",         material:"MAGNETIC",       qty:800,  rate:1200, price:960000,  total:960000,  region:"Maharashtra",  gst:18 },
  { inv:"INV-003", date:"12-Apr-23", month:"Apr", year:2023, fy:"2023-24", customer:"Ultratech Cement",material:"IRON ORE FINES", qty:2000, rate:650,  price:1300000, total:1300000, region:"Gujarat",      gst:18 },
  { inv:"INV-004", date:"20-Apr-23", month:"Apr", year:2023, fy:"2023-24", customer:"Tata Steel",      material:"ESP DUST",       qty:500,  rate:1800, price:900000,  total:900000,  region:"Odisha",       gst:18 },
  { inv:"INV-005", date:"02-May-23", month:"May", year:2023, fy:"2023-24", customer:"JSPL Raigarh",    material:"FLY ASH",        qty:1400, rate:870,  price:1218000, total:1218000, region:"Chhattisgarh", gst:18 },
  { inv:"INV-006", date:"10-May-23", month:"May", year:2023, fy:"2023-24", customer:"SAIL BSP",        material:"CHAR ASH",       qty:600,  rate:920,  price:552000,  total:552000,  region:"Chhattisgarh", gst:18 },
  { inv:"INV-007", date:"18-May-23", month:"May", year:2023, fy:"2023-24", customer:"ACC Ltd",         material:"MAGNETIC",       qty:900,  rate:1180, price:1062000, total:1062000, region:"Maharashtra",  gst:18 },
  { inv:"INV-008", date:"25-May-23", month:"May", year:2023, fy:"2023-24", customer:"Vedanta Ltd",     material:"IRON ORE FINES", qty:1800, rate:680,  price:1224000, total:1224000, region:"Rajasthan",    gst:18 },
  { inv:"INV-009", date:"03-Jun-23", month:"Jun", year:2023, fy:"2023-24", customer:"Ultratech Cement",material:"DUST",           qty:700,  rate:400,  price:280000,  total:280000,  region:"Gujarat",      gst:18 },
  { inv:"INV-010", date:"15-Jun-23", month:"Jun", year:2023, fy:"2023-24", customer:"JSPL Raigarh",    material:"FLY ASH",        qty:1600, rate:880,  price:1408000, total:1408000, region:"Chhattisgarh", gst:18 },
  { inv:"INV-011", date:"22-Jun-23", month:"Jun", year:2023, fy:"2023-24", customer:"Tata Steel",      material:"MAGNETIC",       qty:1100, rate:1220, price:1342000, total:1342000, region:"Odisha",       gst:18 },
  { inv:"INV-012", date:"05-Jul-23", month:"Jul", year:2023, fy:"2023-24", customer:"SAIL BSP",        material:"CHAR ASH",       qty:750,  rate:940,  price:705000,  total:705000,  region:"Chhattisgarh", gst:18 },
  { inv:"INV-013", date:"14-Jul-23", month:"Jul", year:2023, fy:"2023-24", customer:"Vedanta Ltd",     material:"IRON ORE FINES", qty:2200, rate:700,  price:1540000, total:1540000, region:"Rajasthan",    gst:18 },
  { inv:"INV-014", date:"21-Jul-23", month:"Jul", year:2023, fy:"2023-24", customer:"ACC Ltd",         material:"ESP DUST",       qty:450,  rate:1850, price:832500,  total:832500,  region:"Maharashtra",  gst:18 },
  { inv:"INV-015", date:"01-Aug-23", month:"Aug", year:2023, fy:"2023-24", customer:"Ultratech Cement",material:"FLY ASH",        qty:1300, rate:860,  price:1118000, total:1118000, region:"Gujarat",      gst:18 },
  { inv:"INV-016", date:"12-Aug-23", month:"Aug", year:2023, fy:"2023-24", customer:"JSPL Raigarh",    material:"MAGNETIC",       qty:1000, rate:1250, price:1250000, total:1250000, region:"Chhattisgarh", gst:18 },
  { inv:"INV-017", date:"20-Aug-23", month:"Aug", year:2023, fy:"2023-24", customer:"Tata Steel",      material:"IRON ORE FINES", qty:1900, rate:720,  price:1368000, total:1368000, region:"Odisha",       gst:18 },
  { inv:"INV-018", date:"28-Sep-23", month:"Sep", year:2023, fy:"2023-24", customer:"SAIL BSP",        material:"CHAR ASH",       qty:800,  rate:960,  price:768000,  total:768000,  region:"Chhattisgarh", gst:18 },
  { inv:"INV-019", date:"10-Oct-23", month:"Oct", year:2023, fy:"2023-24", customer:"Vedanta Ltd",     material:"FLY ASH",        qty:2100, rate:900,  price:1890000, total:1890000, region:"Rajasthan",    gst:18 },
  { inv:"INV-020", date:"22-Oct-23", month:"Oct", year:2023, fy:"2023-24", customer:"ACC Ltd",         material:"MAGNETIC",       qty:950,  rate:1300, price:1235000, total:1235000, region:"Maharashtra",  gst:18 },
  { inv:"INV-021", date:"08-Nov-23", month:"Nov", year:2023, fy:"2023-24", customer:"Tata Steel",      material:"IRON ORE FINES", qty:1700, rate:740,  price:1258000, total:1258000, region:"Odisha",       gst:18 },
  { inv:"INV-022", date:"18-Nov-23", month:"Nov", year:2023, fy:"2023-24", customer:"JSPL Raigarh",    material:"FLY ASH",        qty:1800, rate:920,  price:1656000, total:1656000, region:"Chhattisgarh", gst:18 },
  { inv:"INV-023", date:"05-Dec-23", month:"Dec", year:2023, fy:"2023-24", customer:"Ultratech Cement",material:"ESP DUST",       qty:550,  rate:1900, price:1045000, total:1045000, region:"Gujarat",      gst:18 },
  { inv:"INV-024", date:"15-Dec-23", month:"Dec", year:2023, fy:"2023-24", customer:"Vedanta Ltd",     material:"CHAR ASH",       qty:700,  rate:980,  price:686000,  total:686000,  region:"Rajasthan",    gst:18 },
  { inv:"INV-025", date:"02-Jan-24", month:"Jan", year:2024, fy:"2023-24", customer:"SAIL BSP",        material:"FLY ASH",        qty:1500, rate:940,  price:1410000, total:1410000, region:"Chhattisgarh", gst:18 },
  { inv:"INV-026", date:"14-Jan-24", month:"Jan", year:2024, fy:"2023-24", customer:"ACC Ltd",         material:"MAGNETIC",       qty:1050, rate:1280, price:1344000, total:1344000, region:"Maharashtra",  gst:18 },
  { inv:"INV-027", date:"22-Feb-24", month:"Feb", year:2024, fy:"2023-24", customer:"Tata Steel",      material:"IRON ORE FINES", qty:2300, rate:760,  price:1748000, total:1748000, region:"Odisha",       gst:18 },
  { inv:"INV-028", date:"08-Mar-24", month:"Mar", year:2024, fy:"2023-24", customer:"JSPL Raigarh",    material:"FLY ASH",        qty:1900, rate:950,  price:1805000, total:1805000, region:"Chhattisgarh", gst:18 },
  // FY 2024-25
  { inv:"INV-101", date:"04-Apr-24", month:"Apr", year:2024, fy:"2024-25", customer:"JSPL Raigarh",    material:"FLY ASH",        qty:1600, rate:980,  price:1568000, total:1568000, region:"Chhattisgarh", gst:18 },
  { inv:"INV-102", date:"11-Apr-24", month:"Apr", year:2024, fy:"2024-25", customer:"ACC Ltd",         material:"MAGNETIC",       qty:1100, rate:1320, price:1452000, total:1452000, region:"Maharashtra",  gst:18 },
  { inv:"INV-103", date:"19-Apr-24", month:"Apr", year:2024, fy:"2024-25", customer:"Ultratech Cement",material:"IRON ORE FINES", qty:2400, rate:710,  price:1704000, total:1704000, region:"Gujarat",      gst:18 },
  { inv:"INV-104", date:"25-Apr-24", month:"Apr", year:2024, fy:"2024-25", customer:"Tata Steel",      material:"ESP DUST",       qty:650,  rate:1950, price:1267500, total:1267500, region:"Odisha",       gst:18 },
  { inv:"INV-105", date:"07-May-24", month:"May", year:2024, fy:"2024-25", customer:"Vedanta Ltd",     material:"FLY ASH",        qty:1800, rate:1000, price:1800000, total:1800000, region:"Rajasthan",    gst:18 },
  { inv:"INV-106", date:"16-May-24", month:"May", year:2024, fy:"2024-25", customer:"SAIL BSP",        material:"CHAR ASH",       qty:850,  rate:1000, price:850000,  total:850000,  region:"Chhattisgarh", gst:18 },
  { inv:"INV-107", date:"24-May-24", month:"May", year:2024, fy:"2024-25", customer:"ACC Ltd",         material:"MAGNETIC",       qty:1200, rate:1350, price:1620000, total:1620000, region:"Maharashtra",  gst:18 },
  { inv:"INV-108", date:"03-Jun-24", month:"Jun", year:2024, fy:"2024-25", customer:"JSPL Raigarh",    material:"FLY ASH",        qty:2000, rate:1020, price:2040000, total:2040000, region:"Chhattisgarh", gst:18 },
  { inv:"INV-109", date:"12-Jun-24", month:"Jun", year:2024, fy:"2024-25", customer:"Tata Steel",      material:"IRON ORE FINES", qty:2100, rate:740,  price:1554000, total:1554000, region:"Odisha",       gst:18 },
  { inv:"INV-110", date:"20-Jun-24", month:"Jun", year:2024, fy:"2024-25", customer:"Vedanta Ltd",     material:"MAGNETIC",       qty:1300, rate:1380, price:1794000, total:1794000, region:"Rajasthan",    gst:18 },
  { inv:"INV-111", date:"08-Jul-24", month:"Jul", year:2024, fy:"2024-25", customer:"Ultratech Cement",material:"DUST",           qty:900,  rate:420,  price:378000,  total:378000,  region:"Gujarat",      gst:18 },
  { inv:"INV-112", date:"17-Jul-24", month:"Jul", year:2024, fy:"2024-25", customer:"SAIL BSP",        material:"CHAR ASH",       qty:950,  rate:1020, price:969000,  total:969000,  region:"Chhattisgarh", gst:18 },
  { inv:"INV-113", date:"28-Jul-24", month:"Jul", year:2024, fy:"2024-25", customer:"ACC Ltd",         material:"ESP DUST",       qty:700,  rate:2000, price:1400000, total:1400000, region:"Maharashtra",  gst:18 },
  { inv:"INV-114", date:"09-Aug-24", month:"Aug", year:2024, fy:"2024-25", customer:"JSPL Raigarh",    material:"FLY ASH",        qty:2200, rate:1040, price:2288000, total:2288000, region:"Chhattisgarh", gst:18 },
  { inv:"INV-115", date:"21-Aug-24", month:"Aug", year:2024, fy:"2024-25", customer:"Tata Steel",      material:"MAGNETIC",       qty:1400, rate:1400, price:1960000, total:1960000, region:"Odisha",       gst:18 },
  { inv:"INV-116", date:"05-Sep-24", month:"Sep", year:2024, fy:"2024-25", customer:"Vedanta Ltd",     material:"IRON ORE FINES", qty:2600, rate:770,  price:2002000, total:2002000, region:"Rajasthan",    gst:18 },
  { inv:"INV-117", date:"18-Sep-24", month:"Sep", year:2024, fy:"2024-25", customer:"Ultratech Cement",material:"FLY ASH",        qty:1700, rate:1060, price:1802000, total:1802000, region:"Gujarat",      gst:18 },
  { inv:"INV-118", date:"04-Oct-24", month:"Oct", year:2024, fy:"2024-25", customer:"SAIL BSP",        material:"CHAR ASH",       qty:1000, rate:1050, price:1050000, total:1050000, region:"Chhattisgarh", gst:18 },
  { inv:"INV-119", date:"15-Oct-24", month:"Oct", year:2024, fy:"2024-25", customer:"ACC Ltd",         material:"MAGNETIC",       qty:1500, rate:1420, price:2130000, total:2130000, region:"Maharashtra",  gst:18 },
  { inv:"INV-120", date:"26-Oct-24", month:"Oct", year:2024, fy:"2024-25", customer:"JSPL Raigarh",    material:"FLY ASH",        qty:2400, rate:1080, price:2592000, total:2592000, region:"Chhattisgarh", gst:18 },
  { inv:"INV-121", date:"07-Nov-24", month:"Nov", year:2024, fy:"2024-25", customer:"Tata Steel",      material:"IRON ORE FINES", qty:2200, rate:800,  price:1760000, total:1760000, region:"Odisha",       gst:18 },
  { inv:"INV-122", date:"19-Nov-24", month:"Nov", year:2024, fy:"2024-25", customer:"Vedanta Ltd",     material:"ESP DUST",       qty:800,  rate:2050, price:1640000, total:1640000, region:"Rajasthan",    gst:18 },
  { inv:"INV-123", date:"03-Dec-24", month:"Dec", year:2024, fy:"2024-25", customer:"JSPL Raigarh",    material:"FLY ASH",        qty:2300, rate:1100, price:2530000, total:2530000, region:"Chhattisgarh", gst:18 },
  { inv:"INV-124", date:"16-Jan-25", month:"Jan", year:2025, fy:"2024-25", customer:"Ultratech Cement",material:"MAGNETIC",       qty:1600, rate:1450, price:2320000, total:2320000, region:"Gujarat",      gst:18 },
  { inv:"INV-125", date:"28-Feb-25", month:"Feb", year:2025, fy:"2024-25", customer:"ACC Ltd",         material:"IRON ORE FINES", qty:2800, rate:820,  price:2296000, total:2296000, region:"Maharashtra",  gst:18 },
  { inv:"INV-126", date:"12-Mar-25", month:"Mar", year:2025, fy:"2024-25", customer:"SAIL BSP",        material:"FLY ASH",        qty:2100, rate:1120, price:2352000, total:2352000, region:"Chhattisgarh", gst:18 },
];

const MONTHS_ORD = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
const MAT_COLOR = {
  "FLY ASH":        "#F59E0B",
  "MAGNETIC":       "#06B6D4",
  "IRON ORE FINES": "#EF4444",
  "ESP DUST":       "#8B5CF6",
  "CHAR ASH":       "#10B981",
  "DUST":           "#64748B",
};
const FY_COLOR  = { "2023-24":"#F59E0B", "2024-25":"#06B6D4", "2025-26":"#10B981" };
const REG_COLOR = { "Maharashtra":"#F59E0B","Chhattisgarh":"#06B6D4","Rajasthan":"#EF4444","Odisha":"#8B5CF6","Gujarat":"#10B981" };

// ── FORMATTERS ────────────────────────────────────────────────────────────────
const fmtVal  = v => v >= 10000000 ? `₹${(v/10000000).toFixed(2)}Cr` : v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${v?.toLocaleString("en-IN")||0}`;
const fmtQty  = v => v >= 1000 ? `${(v/1000).toFixed(1)}K MT` : `${v} MT`;
const fmtRate = v => `₹${v?.toLocaleString("en-IN")||0}/MT`;
const fmtShort= v => v >= 10000000 ? `${(v/10000000).toFixed(1)}Cr` : v >= 100000 ? `${(v/100000).toFixed(0)}L` : `${v}`;

// ── CUSTOM TOOLTIP ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, type = "value" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:"rgba(10,14,26,0.97)", border:"1px solid rgba(245,158,11,0.3)",
      borderRadius:10, padding:"10px 14px", fontSize:12, backdropFilter:"blur(12px)",
      boxShadow:"0 8px 32px rgba(0,0,0,0.6)",
    }}>
      <p style={{ margin:"0 0 6px", color:"#F59E0B", fontWeight:700, fontFamily:"'Space Mono',monospace" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin:"2px 0", color: p.color || "#F1F5F9" }}>
          <span style={{ color:"#64748B" }}>{p.name}: </span>
          <span style={{ fontWeight:700 }}>{
            typeof p.value === "number"
              ? p.name?.toLowerCase().includes("qty") ? fmtQty(p.value)
              : p.name?.toLowerCase().includes("rate") ? fmtRate(p.value)
              : p.name?.toLowerCase().includes("yoy") ? `${p.value}%`
              : fmtVal(p.value)
              : p.value
          }</span>
        </p>
      ))}
    </div>
  );
};

// ── ANIMATED COUNTER ──────────────────────────────────────────────────────────
const AnimatedNumber = ({ value, format = v => v }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1200;
    const step = end / (duration / 16);
    clearInterval(ref.current);
    ref.current = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(ref.current); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(ref.current);
  }, [value]);
  return <span>{format(display)}</span>;
};

// ── MINI SPARKLINE ─────────────────────────────────────────────────────────────
const Sparkline = ({ data, color = "#F59E0B" }) => {
  if (!data?.length) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const w = 80, h = 30;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow:"visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round"/>
      <circle cx={pts.split(" ").at(-1)?.split(",")[0]} cy={pts.split(" ").at(-1)?.split(",")[1]} r={2.5} fill={color}/>
    </svg>
  );
};

// ── PROGRESS BAR ──────────────────────────────────────────────────────────────
const ProgressBar = ({ pct, color }) => (
  <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden", marginTop:4 }}>
    <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg,${color}88,${color})`, borderRadius:4, transition:"width 1s ease" }}/>
  </div>
);

// ── NAV ICONS ─────────────────────────────────────────────────────────────────
const ICONS = {
  overview:  "◈",
  material:  "⬡",
  customers: "◎",
  rates:     "◉",
};

const TABS = [
  { id:"overview",  label:"Overview"   },
  { id:"material",  label:"Materials"  },
  { id:"customers", label:"Customers"  },
  { id:"rates",     label:"Rates & Trends" },
];

// ═════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [tab,          setTab]       = useState("overview");
  const [filterFY,     setFY]        = useState("All");
  const [filterMat,    setMat]       = useState("All");
  const [filterCust,   setCust]      = useState("All");
  const [filterRegion, setRegion]    = useState("All");
  const [filterMonth,  setMonth]     = useState("All");
  const [filtersOpen,  setFiltersOpen] = useState(false);
  const [custSearch,   setCustSearch]  = useState("");
  const [sortCust,     setSortCust]    = useState("value");
  const [mounted,      setMounted]     = useState(false);

  useEffect(() => {
    // Inject fonts
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap";
    document.head.appendChild(link);
    // Inject global styles
    const style = document.createElement("style");
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      :root { color-scheme: dark; }
      body { background: #060A14; }
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.3); border-radius: 2px; }
      @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      .card { animation: fadeUp 0.4s ease both; }
      .tab-active::after { content:''; position:absolute; bottom:-1px; left:0; right:0; height:2px; background:linear-gradient(90deg,#F59E0B,#FBBF24); border-radius:2px; }
      select option { background: #0D1B2A; }
      .row-hover:hover { background: rgba(245,158,11,0.04) !important; transition: background 0.15s; }
      .nav-item:hover { background: rgba(245,158,11,0.08); }
    `;
    document.head.appendChild(style);
    setTimeout(() => setMounted(true), 100);
    return () => { document.head.removeChild(link); document.head.removeChild(style); };
  }, []);

  const SHEET_ID   = "1O_7K012fvpLpLFdhOXXa6C3qFAldJ5DseBV_hcqSLzo";
  const SHEET_NAMES = ["FY 23-24","FY 24-25","FY 25-26","FY 26-27"];
  const liveRows = useGoogleSheets(SHEET_ID, SHEET_NAMES, { pollInterval: 60000 });
  const baseData = (liveRows?.length) ? liveRows : RAW_DATA;

  const FY_LIST   = useMemo(() => [...new Set(baseData.map(d => d.fy))].sort(), [baseData]);
  const MAT_LIST  = useMemo(() => [...new Set(baseData.map(d => d.material))], [baseData]);
  const CUST_LIST = useMemo(() => [...new Set(baseData.map(d => d.customer))].sort(), [baseData]);
  const REG_LIST  = useMemo(() => [...new Set(baseData.map(d => d.region))], [baseData]);

  const data = useMemo(() => baseData.filter(d =>
    (filterFY     === "All" || d.fy       === filterFY)     &&
    (filterMat    === "All" || d.material === filterMat)    &&
    (filterCust   === "All" || d.customer === filterCust)   &&
    (filterRegion === "All" || d.region   === filterRegion) &&
    (filterMonth  === "All" || d.month    === filterMonth)
  ), [baseData, filterFY, filterMat, filterCust, filterRegion, filterMonth]);

  const totalQty   = data.reduce((s,d) => s + d.qty,   0);
  const totalValue = data.reduce((s,d) => s + d.total, 0);
  const avgRate    = data.length ? Math.round(data.reduce((s,d) => s + d.rate, 0) / data.length) : 0;
  const uniqueCust = new Set(data.map(d => d.customer)).size;

  const fyAgg = useMemo(() => FY_LIST.map(fy => {
    const rows = baseData.filter(d => d.fy === fy);
    return { fy, qty:rows.reduce((s,d)=>s+d.qty,0), value:rows.reduce((s,d)=>s+d.total,0), count:rows.length };
  }), [FY_LIST, baseData]);

  const fyBar = useMemo(() => fyAgg.map((d,i) => ({
    ...d,
    yoy: i===0 ? null : +((d.value - fyAgg[i-1].value)/fyAgg[i-1].value*100).toFixed(1),
  })), [fyAgg]);

  const monthlyData = useMemo(() => MONTHS_ORD.map(m => {
    const rows = data.filter(d => d.month === m);
    return { month:m, qty:rows.reduce((s,d)=>s+d.qty,0), value:rows.reduce((s,d)=>s+d.total,0), rate:rows.length?Math.round(rows.reduce((s,d)=>s+d.rate,0)/rows.length):0, count:rows.length };
  }).filter(d => d.qty > 0), [data]);

  const matData = useMemo(() => MAT_LIST.map(m => {
    const rows = data.filter(d => d.material === m);
    return { material:m, qty:rows.reduce((s,d)=>s+d.qty,0), value:rows.reduce((s,d)=>s+d.total,0), rate:rows.length?Math.round(rows.reduce((s,d)=>s+d.rate,0)/rows.length):0, count:rows.length };
  }).filter(d => d.qty > 0).sort((a,b) => b.value - a.value), [MAT_LIST, data]);

  const custData = useMemo(() => {
    let arr = CUST_LIST.map(c => {
      const rows = data.filter(d => d.customer === c);
      return { customer:c, qty:rows.reduce((s,d)=>s+d.qty,0), value:rows.reduce((s,d)=>s+d.total,0), count:rows.length, region:rows[0]?.region||"" };
    }).filter(d => d.qty > 0);
    if (custSearch) arr = arr.filter(c => c.customer.toLowerCase().includes(custSearch.toLowerCase()));
    return arr.sort((a,b) => b[sortCust] - a[sortCust]);
  }, [CUST_LIST, data, custSearch, sortCust]);

  const regionData = useMemo(() => REG_LIST.map(r => {
    const rows = data.filter(d => d.region === r);
    return { region:r, qty:rows.reduce((s,d)=>s+d.qty,0), value:rows.reduce((s,d)=>s+d.total,0) };
  }).filter(d => d.qty > 0).sort((a,b) => b.value - a.value), [REG_LIST, data]);

  const rateByMonth = useMemo(() => MONTHS_ORD.map(m => {
    const row = { month:m };
    MAT_LIST.forEach(mat => {
      const rows = data.filter(d => d.month === m && d.material === mat);
      row[mat] = rows.length ? Math.round(rows.reduce((s,d)=>s+d.rate,0)/rows.length) : null;
    });
    return row;
  }).filter(d => MAT_LIST.some(m => d[m])), [MAT_LIST, data]);

  const activeFilters = [
    filterFY !== "All" && { label:filterFY, clear:()=>setFY("All") },
    filterMat !== "All" && { label:filterMat, clear:()=>setMat("All") },
    filterCust !== "All" && { label:filterCust, clear:()=>setCust("All") },
    filterRegion !== "All" && { label:filterRegion, clear:()=>setRegion("All") },
    filterMonth !== "All" && { label:filterMonth, clear:()=>setMonth("All") },
  ].filter(Boolean);

  const monthlyQtySpark = MONTHS_ORD.map(m => data.filter(d=>d.month===m).reduce((s,d)=>s+d.qty,0)).filter(Boolean);
  const monthlyValSpark = MONTHS_ORD.map(m => data.filter(d=>d.month===m).reduce((s,d)=>s+d.total,0)).filter(Boolean);
  const monthlyRateSpark= MONTHS_ORD.map(m => { const r=data.filter(d=>d.month===m); return r.length?Math.round(r.reduce((s,d)=>s+d.rate,0)/r.length):0; }).filter(Boolean);

  const S = {
    app:    { minHeight:"100vh", background:"#060A14", color:"#E2E8F0", fontFamily:"'Syne',sans-serif", display:"flex" },
    sidebar:{ width:220, minHeight:"100vh", background:"rgba(255,255,255,0.02)", borderRight:"1px solid rgba(255,255,255,0.06)", flexShrink:0, position:"sticky", top:0, height:"100vh", display:"flex", flexDirection:"column" },
    main:   { flex:1, minHeight:"100vh", overflow:"hidden" },
  };

  const FilterSelect = ({ label, val, set, opts }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <label style={{ fontSize:10, color:"#64748B", fontWeight:700, letterSpacing:1.2, textTransform:"uppercase" }}>{label}</label>
      <select value={val} onChange={e => set(e.target.value)} style={{
        background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", color:"#CBD5E1",
        borderRadius:8, padding:"8px 12px", fontSize:12, cursor:"pointer", outline:"none",
        fontFamily:"'Syne',sans-serif", transition:"border-color 0.2s",
      }}
        onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.5)"}
        onBlur={e => e.target.style.borderColor  = "rgba(255,255,255,0.1)"}
      >
        {["All",...opts].map(o => <option key={o} value={o}>{o==="All"?`All ${label}s`:o}</option>)}
      </select>
    </div>
  );

  const Card = ({ children, style={}, delay=0 }) => (
    <div className="card" style={{
      background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)",
      borderRadius:16, padding:20, animationDelay:`${delay}ms`, ...style,
    }}>{children}</div>
  );

  const SectionTitle = ({ title, sub, right }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:"#CBD5E1", letterSpacing:0.3 }}>{title}</div>
        {sub && <div style={{ fontSize:11, color:"#475569", marginTop:3 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );

  const Tag = ({ label, color="#F59E0B", onRemove }) => (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      background:`${color}18`, color, border:`1px solid ${color}33`,
      borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700,
    }}>
      {label}
      {onRemove && <span onClick={onRemove} style={{ cursor:"pointer", opacity:0.7 }}>×</span>}
    </span>
  );

  // ── TABLE SORT HEADER ──────────────────────────────────────────────────────
  const TH = ({ label, right }) => (
    <th style={{ padding:"10px 14px", color:"#475569", fontWeight:700, fontSize:11, textAlign:right?"right":"left", textTransform:"uppercase", letterSpacing:1, whiteSpace:"nowrap", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>{label}</th>
  );
  const TD = ({ children, right, bold, color, mono }) => (
    <td style={{ padding:"10px 14px", textAlign:right?"right":"left", fontWeight:bold?700:400, color:color||"#CBD5E1", fontFamily:mono?"'Space Mono',monospace":"inherit", fontSize:12 }}>{children}</td>
  );

  return (
    <div style={S.app}>
      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <div style={S.sidebar}>
        {/* Logo */}
        <div style={{ padding:"24px 20px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:10,
              background:"linear-gradient(135deg,#F59E0B,#FBBF24)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:16, boxShadow:"0 4px 16px rgba(245,158,11,0.4)",
            }}>⚙</div>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:"#F1F5F9", lineHeight:1.2 }}>SFG Sales</div>
              <div style={{ fontSize:9, color:"#475569", letterSpacing:1.5, textTransform:"uppercase" }}>Dashboard</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding:"16px 10px", flex:1 }}>
          <div style={{ fontSize:9, color:"#334155", letterSpacing:1.8, textTransform:"uppercase", fontWeight:700, paddingLeft:10, marginBottom:8 }}>Navigation</div>
          {TABS.map(t => (
            <button key={t.id} className="nav-item" onClick={() => setTab(t.id)} style={{
              width:"100%", background: tab===t.id ? "rgba(245,158,11,0.12)" : "transparent",
              border: tab===t.id ? "1px solid rgba(245,158,11,0.25)" : "1px solid transparent",
              color: tab===t.id ? "#FBBF24" : "#64748B",
              borderRadius:10, padding:"10px 12px", cursor:"pointer", textAlign:"left",
              fontSize:13, fontWeight:tab===t.id?700:500, display:"flex", alignItems:"center", gap:10,
              marginBottom:4, transition:"all 0.2s", fontFamily:"'Syne',sans-serif",
            }}>
              <span style={{ fontSize:16 }}>{ICONS[t.id]}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Live status */}
        <div style={{ padding:"16px 20px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#10B981", animation:"pulse 2s infinite", display:"block" }}/>
            <span style={{ fontSize:10, color:"#10B981", fontWeight:700 }}>LIVE · AUTO REFRESH</span>
          </div>
          <div style={{ fontSize:10, color:"#334155" }}>{baseData.length} records loaded</div>
          <div style={{ fontSize:10, color:"#334155" }}>FY 2023-24 to 2025-26</div>
        </div>
      </div>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <div style={S.main}>
        {/* Top Bar */}
        <div style={{
          background:"rgba(6,10,20,0.9)", backdropFilter:"blur(20px)",
          borderBottom:"1px solid rgba(255,255,255,0.06)",
          padding:"14px 28px", position:"sticky", top:0, zIndex:50,
        }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
            <div>
              <h1 style={{ fontSize:18, fontWeight:800, color:"#F1F5F9", margin:0 }}>
                {TABS.find(t=>t.id===tab)?.label}
              </h1>
              <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
                {activeFilters.length ? activeFilters.map((f,i) => (
                  <Tag key={i} label={f.label} onRemove={f.clear}/>
                )) : <span style={{ fontSize:11, color:"#334155" }}>No filters active · showing all data</span>}
              </div>
            </div>
            <button onClick={() => setFiltersOpen(o => !o)} style={{
              background: filtersOpen ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
              border: filtersOpen ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.1)",
              color: filtersOpen ? "#FBBF24" : "#94A3B8",
              borderRadius:10, padding:"9px 18px", cursor:"pointer", fontSize:12, fontWeight:700,
              fontFamily:"'Syne',sans-serif", display:"flex", alignItems:"center", gap:7,
            }}>
              ⊞ Filters {activeFilters.length>0 && <span style={{ background:"#F59E0B", color:"#000", borderRadius:"50%", width:16, height:16, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:10 }}>{activeFilters.length}</span>}
            </button>
          </div>

          {/* Filter panel */}
          {filtersOpen && (
            <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.06)", display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:12, animation:"fadeUp 0.2s ease" }}>
              <FilterSelect label="FY Year"  val={filterFY}     set={setFY}     opts={FY_LIST}  />
              <FilterSelect label="Material" val={filterMat}    set={setMat}    opts={MAT_LIST} />
              <FilterSelect label="Customer" val={filterCust}   set={setCust}   opts={CUST_LIST}/>
              <FilterSelect label="Region"   val={filterRegion} set={setRegion} opts={REG_LIST} />
              <FilterSelect label="Month"    val={filterMonth}  set={setMonth}  opts={MONTHS_ORD}/>
              <div style={{ display:"flex", alignItems:"flex-end" }}>
                <button onClick={() => { setFY("All"); setMat("All"); setCust("All"); setRegion("All"); setMonth("All"); }} style={{
                  background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
                  color:"#F87171", borderRadius:8, padding:"9px 16px", fontSize:12,
                  cursor:"pointer", fontWeight:700, fontFamily:"'Syne',sans-serif", width:"100%",
                }}>✕ Clear All</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding:"24px 28px" }}>

          {/* ══════════ OVERVIEW ══════════ */}
          {tab === "overview" && (
            <>
              {/* KPI Cards */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
                {[
                  { label:"Total Dispatched",   value:totalQty,   format:fmtQty,   icon:"🚛", color:"#F59E0B", spark:monthlyQtySpark,  sub:"quantity" },
                  { label:"Total Sales Value",   value:totalValue, format:fmtVal,   icon:"₹",  color:"#06B6D4", spark:monthlyValSpark,  sub:"revenue"  },
                  { label:"Avg Rate / MT",       value:avgRate,    format:fmtRate,  icon:"◈",  color:"#8B5CF6", spark:monthlyRateSpark, sub:"per tonne" },
                  { label:"Active Customers",    value:uniqueCust, format:v=>`${v}`,icon:"◎",  color:"#10B981", spark:[],               sub:"buying parties" },
                ].map((k,i) => (
                  <div key={i} className="card" style={{
                    background:`linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))`,
                    border:`1px solid ${k.color}22`,
                    borderRadius:16, padding:"20px 22px",
                    animationDelay:`${i*80}ms`, position:"relative", overflow:"hidden",
                  }}>
                    <div style={{ position:"absolute", top:-30, right:-20, width:100, height:100, borderRadius:"50%", background:`radial-gradient(circle,${k.color}12,transparent)` }}/>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div style={{ fontSize:11, color:"#475569", fontWeight:700, textTransform:"uppercase", letterSpacing:1.2 }}>{k.label}</div>
                      <span style={{ fontSize:18, opacity:0.7 }}>{k.icon}</span>
                    </div>
                    <div style={{ fontSize:26, fontWeight:800, color:k.color, margin:"10px 0 4px", fontFamily:"'Space Mono',monospace" }}>
                      <AnimatedNumber value={k.value} format={k.format}/>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                      <span style={{ fontSize:10, color:"#334155" }}>{k.sub}</span>
                      <Sparkline data={k.spark} color={k.color}/>
                    </div>
                    <ProgressBar pct={Math.min((k.value/Math.max(k.value,1))*100,100)} color={k.color}/>
                  </div>
                ))}
              </div>

              {/* Charts Row 1 */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1.8fr", gap:16, marginBottom:16 }}>
                <Card delay={100}>
                  <SectionTitle title="Year-over-Year Performance" sub="Sales value + growth rate"/>
                  <ResponsiveContainer width="100%" height={230}>
                    <ComposedChart data={fyBar}>
                      <defs>
                        {fyBar.map(d => (
                          <linearGradient key={d.fy} id={`fy-${d.fy.replace("-","")}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={FY_COLOR[d.fy]||"#F59E0B"} stopOpacity={1}/>
                            <stop offset="100%" stopColor={FY_COLOR[d.fy]||"#F59E0B"} stopOpacity={0.3}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="fy" tick={{ fill:"#64748B", fontSize:11, fontFamily:"Space Mono" }} axisLine={false} tickLine={false}/>
                      <YAxis yAxisId="l" tick={{ fill:"#64748B", fontSize:10 }} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`} axisLine={false} tickLine={false}/>
                      <YAxis yAxisId="r" orientation="right" tick={{ fill:"#64748B", fontSize:10 }} tickFormatter={v=>`${v}%`} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar yAxisId="l" dataKey="value" name="Total Value" radius={[8,8,0,0]} maxBarSize={56}>
                        {fyBar.map((d,i) => <Cell key={i} fill={`url(#fy-${d.fy.replace("-","")})`}/>)}
                      </Bar>
                      {fyBar.some(d => d.yoy != null) && (
                        <Line yAxisId="r" dataKey="yoy" name="YoY Growth" stroke="#EF4444" strokeWidth={2.5} dot={{ r:5, fill:"#EF4444", strokeWidth:0 }} connectNulls/>
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:10 }}>
                    {fyBar.filter(d=>d.yoy!=null).map((d,i)=>(
                      <Tag key={i} label={`${d.fy}: ${d.yoy>=0?"+":""}${d.yoy}%`} color={d.yoy>=0?"#10B981":"#EF4444"}/>
                    ))}
                  </div>
                </Card>

                <Card delay={150}>
                  <SectionTitle title="Monthly Dispatch Volume & Avg Rate" sub="Qty bars · Rate trend line"/>
                  <ResponsiveContainer width="100%" height={230}>
                    <ComposedChart data={monthlyData}>
                      <defs>
                        <linearGradient id="qty-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="month" tick={{ fill:"#64748B", fontSize:11 }} axisLine={false} tickLine={false}/>
                      <YAxis yAxisId="l" tick={{ fill:"#64748B", fontSize:10 }} tickFormatter={v=>`${v}MT`} axisLine={false} tickLine={false}/>
                      <YAxis yAxisId="r" orientation="right" tick={{ fill:"#64748B", fontSize:10 }} tickFormatter={v=>`₹${v}`} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar yAxisId="l" dataKey="qty" name="Qty" fill="url(#qty-grad)" radius={[5,5,0,0]} maxBarSize={36}/>
                      <Line yAxisId="r" dataKey="rate" name="Avg Rate" stroke="#06B6D4" strokeWidth={2.5} dot={{ r:4, fill:"#06B6D4", strokeWidth:0 }} connectNulls/>
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Charts Row 2 */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:16 }}>
                <Card delay={200}>
                  <SectionTitle title="Sales by Region" sub="Value distribution"/>
                  <div style={{ marginBottom:8 }}>
                    {regionData.map((r, i) => {
                      const maxVal = Math.max(...regionData.map(x => x.value));
                      const pct = maxVal > 0 ? (r.value / maxVal * 100) : 0;
                      return (
                        <div key={i} style={{ marginBottom:12 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                            <span style={{ fontSize:12, fontWeight:600, color:"#CBD5E1" }}>{r.region}</span>
                            <span style={{ fontSize:12, fontFamily:"'Space Mono',monospace", color:REG_COLOR[r.region]||"#F59E0B" }}>{fmtVal(r.value)}</span>
                          </div>
                          <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                            <div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg,${REG_COLOR[r.region]||"#F59E0B"}66,${REG_COLOR[r.region]||"#F59E0B"})`, borderRadius:3, transition:"width 1s ease" }}/>
                          </div>
                          <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
                            <span style={{ fontSize:10, color:"#475569" }}>{fmtQty(r.qty)}</span>
                            <span style={{ fontSize:10, color:"#475569" }}>{totalValue>0?(r.value/totalValue*100).toFixed(1):0}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card delay={250}>
                  <SectionTitle title="Recent Invoice Log" sub={`Showing latest ${Math.min(data.length,8)} of ${data.length} records`}/>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse" }}>
                      <thead>
                        <tr>
                          {["Invoice","Date","Customer","Material","Qty","Rate","Value"].map(h => <TH key={h} label={h} right={["Qty","Rate","Value"].includes(h)}/>)}
                        </tr>
                      </thead>
                      <tbody>
                        {data.slice(0,8).map((d,i) => (
                          <tr key={i} className="row-hover" style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", background:i%2===0?"transparent":"rgba(255,255,255,0.01)" }}>
                            <TD mono bold color="#F59E0B">{d.inv}</TD>
                            <TD color="#64748B">{d.date}</TD>
                            <TD>{d.customer.length>18?d.customer.slice(0,16)+"…":d.customer}</TD>
                            <td style={{ padding:"10px 14px" }}>
                              <span style={{ background:`${MAT_COLOR[d.material]||"#F59E0B"}18`, color:MAT_COLOR[d.material]||"#F59E0B", borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:700 }}>{d.material}</span>
                            </td>
                            <TD right mono>{d.qty.toLocaleString("en-IN")}</TD>
                            <TD right mono color="#FBBF24">{fmtRate(d.rate)}</TD>
                            <TD right mono bold color="#10B981">{fmtVal(d.total)}</TD>
                          </tr>
                        ))}
                        {data.length === 0 && (
                          <tr><td colSpan={7} style={{ padding:"32px", textAlign:"center", color:"#334155", fontSize:13 }}>No records match the current filters.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* ══════════ MATERIALS ══════════ */}
          {tab === "material" && (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
                {matData.slice(0,3).map((m,i) => (
                  <Card key={i} delay={i*60} style={{ borderColor:`${MAT_COLOR[m.material]||"#F59E0B"}22` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <span style={{ background:`${MAT_COLOR[m.material]||"#F59E0B"}18`, color:MAT_COLOR[m.material]||"#F59E0B", borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:800 }}>{m.material}</span>
                      <span style={{ fontSize:10, color:"#475569" }}>{m.count} invoices</span>
                    </div>
                    <div style={{ fontSize:24, fontWeight:800, color:MAT_COLOR[m.material]||"#F59E0B", margin:"12px 0 4px", fontFamily:"'Space Mono',monospace" }}>{fmtVal(m.value)}</div>
                    <div style={{ display:"flex", gap:12, fontSize:11, color:"#64748B" }}>
                      <span>{fmtQty(m.qty)}</span>
                      <span>·</span>
                      <span>{fmtRate(m.rate)} avg rate</span>
                    </div>
                    <ProgressBar pct={totalValue>0?m.value/totalValue*100:0} color={MAT_COLOR[m.material]||"#F59E0B"}/>
                    <div style={{ fontSize:10, color:"#475569", marginTop:4 }}>{totalValue>0?(m.value/totalValue*100).toFixed(1):0}% of total value</div>
                  </Card>
                ))}
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1.1fr 1fr", gap:16, marginBottom:16 }}>
                <Card delay={100}>
                  <SectionTitle title="Volume by Material" sub="Total dispatched quantity"/>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={matData} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="material" tick={{ fill:"#64748B", fontSize:10 }} tickFormatter={v=>v.length>8?v.slice(0,8)+"…":v} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fill:"#64748B", fontSize:10 }} tickFormatter={v=>`${v}MT`} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="qty" name="Qty" radius={[6,6,0,0]}>
                        {matData.map((d,i) => <Cell key={i} fill={MAT_COLOR[d.material]||"#F59E0B"}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card delay={150}>
                  <SectionTitle title="Revenue by Material" sub="Total sales value"/>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={matData} layout="vertical" barSize={22}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
                      <XAxis type="number" tick={{ fill:"#64748B", fontSize:10 }} tickFormatter={v=>fmtVal(v)} axisLine={false} tickLine={false}/>
                      <YAxis type="category" dataKey="material" tick={{ fill:"#94A3B8", fontSize:11 }} width={100} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="value" name="Total Value" radius={[0,6,6,0]}>
                        {matData.map((d,i) => <Cell key={i} fill={MAT_COLOR[d.material]||"#F59E0B"}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              <Card delay={200}>
                <SectionTitle title="Material Performance Summary" sub="Ranked by total revenue"/>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr>
                      {["#","Material","Total Qty","Total Value","Avg Rate","Invoices","Revenue Share"].map(h=><TH key={h} label={h} right={!["#","Material"].includes(h)}/>)}
                    </tr>
                  </thead>
                  <tbody>
                    {matData.map((m,i) => {
                      const share = totalValue>0?(m.value/totalValue*100).toFixed(1):0;
                      return (
                        <tr key={i} className="row-hover" style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                          <TD color="#334155" bold>#{i+1}</TD>
                          <td style={{ padding:"10px 14px" }}>
                            <span style={{ background:`${MAT_COLOR[m.material]||"#F59E0B"}18`, color:MAT_COLOR[m.material]||"#F59E0B", borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:800 }}>{m.material}</span>
                          </td>
                          <TD right mono>{m.qty.toLocaleString("en-IN")} MT</TD>
                          <TD right mono bold color="#10B981">{fmtVal(m.value)}</TD>
                          <TD right mono color="#FBBF24">{fmtRate(m.rate)}</TD>
                          <TD right color="#64748B">{m.count}</TD>
                          <td style={{ padding:"10px 14px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"flex-end" }}>
                              <div style={{ width:80, height:5, borderRadius:3, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                                <div style={{ width:`${share}%`, height:"100%", background:`${MAT_COLOR[m.material]||"#F59E0B"}`, borderRadius:3 }}/>
                              </div>
                              <span style={{ fontSize:11, color:"#64748B", fontFamily:"'Space Mono',monospace", minWidth:36 }}>{share}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            </>
          )}

          {/* ══════════ CUSTOMERS ══════════ */}
          {tab === "customers" && (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:16, marginBottom:16 }}>
                <Card delay={0}>
                  <SectionTitle title="Top Customers by Revenue" sub="Horizontal rank view"/>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={custData.slice(0,8)} layout="vertical" barSize={22}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
                      <XAxis type="number" tick={{ fill:"#64748B", fontSize:10 }} tickFormatter={v=>fmtVal(v)} axisLine={false} tickLine={false}/>
                      <YAxis type="category" dataKey="customer" tick={{ fill:"#CBD5E1", fontSize:11 }} width={160} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="value" name="Total Value" radius={[0,6,6,0]}>
                        {custData.slice(0,8).map((d,i) => <Cell key={i} fill={REG_COLOR[d.region]||"#F59E0B"}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card delay={80}>
                  <SectionTitle title="Qty by Customer" sub="Top dispatches"/>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={custData.slice(0,8)} layout="vertical" barSize={22}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
                      <XAxis type="number" tick={{ fill:"#64748B", fontSize:10 }} tickFormatter={v=>`${v}MT`} axisLine={false} tickLine={false}/>
                      <YAxis type="category" dataKey="customer" tick={{ fill:"#CBD5E1", fontSize:11 }} width={160} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="qty" name="Qty" radius={[0,6,6,0]} fill="#06B6D4"/>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              <Card delay={160}>
                <SectionTitle
                  title="Customer Performance Table"
                  sub={`${custData.length} customers`}
                  right={
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <input
                        placeholder="Search customers…"
                        value={custSearch}
                        onChange={e => setCustSearch(e.target.value)}
                        style={{
                          background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                          color:"#CBD5E1", borderRadius:8, padding:"7px 12px", fontSize:12, outline:"none",
                          fontFamily:"'Syne',sans-serif", width:180,
                        }}
                      />
                      <select value={sortCust} onChange={e=>setSortCust(e.target.value)} style={{
                        background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                        color:"#CBD5E1", borderRadius:8, padding:"7px 12px", fontSize:12, outline:"none",
                        fontFamily:"'Syne',sans-serif",
                      }}>
                        <option value="value">Sort: Value</option>
                        <option value="qty">Sort: Qty</option>
                        <option value="count">Sort: Invoices</option>
                      </select>
                    </div>
                  }
                />
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr>
                      {["#","Customer","Region","Qty (MT)","Total Value","Invoices","Avg / Invoice"].map(h=><TH key={h} label={h} right={["Qty (MT)","Total Value","Invoices","Avg / Invoice"].includes(h)}/>)}
                    </tr>
                  </thead>
                  <tbody>
                    {custData.map((c,i) => (
                      <tr key={i} className="row-hover" style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                        <TD color="#334155" bold>#{i+1}</TD>
                        <TD bold>{c.customer}</TD>
                        <td style={{ padding:"10px 14px" }}>
                          <Tag label={c.region} color={REG_COLOR[c.region]||"#94A3B8"}/>
                        </td>
                        <TD right mono>{c.qty.toLocaleString("en-IN")}</TD>
                        <TD right mono bold color="#10B981">{fmtVal(c.value)}</TD>
                        <TD right color="#64748B">{c.count}</TD>
                        <TD right mono color="#FBBF24">{fmtVal(Math.round(c.value/c.count))}</TD>
                      </tr>
                    ))}
                    {custData.length===0 && (
                      <tr><td colSpan={7} style={{ padding:32, textAlign:"center", color:"#334155" }}>No customers match search.</td></tr>
                    )}
                  </tbody>
                </table>
              </Card>
            </>
          )}

          {/* ══════════ RATES & TRENDS ══════════ */}
          {tab === "rates" && (
            <>
              <Card delay={0} style={{ marginBottom:16 }}>
                <SectionTitle title="Rate Trends by Material" sub="Monthly average rate per material type"/>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={rateByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                    <XAxis dataKey="month" tick={{ fill:"#64748B", fontSize:11 }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fill:"#64748B", fontSize:10 }} tickFormatter={v=>`₹${v}`} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend iconType="circle" wrapperStyle={{ fontSize:11, color:"#64748B", paddingTop:12 }}/>
                    {MAT_LIST.map(m => (
                      <Line key={m} type="monotone" dataKey={m} name={m}
                        stroke={MAT_COLOR[m]||"#F59E0B"} strokeWidth={2.5}
                        dot={{ r:4, strokeWidth:0, fill:MAT_COLOR[m]||"#F59E0B" }}
                        connectNulls activeDot={{ r:6 }}/>
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <Card delay={100}>
                  <SectionTitle title="Monthly Volume Pattern" sub="Seasonal dispatch trends"/>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="area-qty" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="month" tick={{ fill:"#64748B", fontSize:11 }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fill:"#64748B", fontSize:10 }} tickFormatter={v=>`${v}MT`} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Area dataKey="qty" name="Qty" stroke="#F59E0B" strokeWidth={2.5} fill="url(#area-qty)" dot={{ r:4, fill:"#F59E0B", strokeWidth:0 }}/>
                    </AreaChart>
                  </ResponsiveContainer>
                  {monthlyData.length > 0 && (() => {
                    const peak = monthlyData.reduce((a,b) => a.qty>b.qty?a:b);
                    const low  = monthlyData.reduce((a,b) => a.qty<b.qty?a:b);
                    return (
                      <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
                        <Tag label={`▲ Peak: ${peak.month} (${fmtQty(peak.qty)})`} color="#10B981"/>
                        <Tag label={`▼ Low: ${low.month} (${fmtQty(low.qty)})`} color="#EF4444"/>
                      </div>
                    );
                  })()}
                </Card>

                <Card delay={150}>
                  <SectionTitle title="Rate Heatmap" sub="Month × Material · darker = higher rate"/>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:"3px 3px", fontSize:11 }}>
                      <thead>
                        <tr>
                          <th style={{ padding:"6px 8px", color:"#475569", fontSize:10, textAlign:"left" }}>Month</th>
                          {MAT_LIST.map(m => (
                            <th key={m} style={{ padding:"6px 6px", color:MAT_COLOR[m]||"#F59E0B", fontSize:9, fontWeight:700, letterSpacing:0.5, textAlign:"center", whiteSpace:"nowrap" }}>
                              {m.length>6?m.slice(0,6)+"…":m}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rateByMonth.map((row,i) => (
                          <tr key={i}>
                            <td style={{ padding:"5px 8px", color:"#64748B", fontWeight:700, fontSize:11 }}>{row.month}</td>
                            {MAT_LIST.map(m => {
                              const v = row[m];
                              const allVals = rateByMonth.map(r=>r[m]).filter(Boolean);
                              const max = allVals.length?Math.max(...allVals):0;
                              const min = allVals.length?Math.min(...allVals):0;
                              const pct = (max>min && v) ? (v-min)/(max-min) : 0;
                              const c = MAT_COLOR[m]||"#F59E0B";
                              return (
                                <td key={m} style={{
                                  padding:"5px 6px", textAlign:"center",
                                  background: v ? `${c}${Math.round((0.1+pct*0.45)*255).toString(16).padStart(2,"0")}` : "transparent",
                                  borderRadius:6, color: v?"#F1F5F9":"#1E293B",
                                  fontWeight: v?600:400, fontSize:10,
                                  fontFamily: v?"'Space Mono',monospace":"inherit",
                                }}>
                                  {v ? `₹${v.toLocaleString("en-IN")}` : "—"}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* Footer */}
          <div style={{
            marginTop:32, padding:"12px 18px",
            background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.05)",
            borderRadius:10, display:"flex", justifyContent:"space-between", alignItems:"center",
            fontSize:11, color:"#1E293B", flexWrap:"wrap", gap:6,
          }}>
            <span style={{ color:"#334155" }}>SFG Sales Dashboard · {baseData.length} records · React + Recharts</span>
            <span style={{ color:"#1E293B" }}>Google Sheets sync every 60s · FY 2023-24 to 2025-26</span>
          </div>
        </div>
      </div>
    </div>
  );
}const fmtQty  = v => v >= 1000 ? `${(v/1000).toFixed(1)}K MT` : `${v} MT`;
const fmtRate = v => `₹${v.toLocaleString("en-IN")}/MT`;

// ── SHARED STYLES ─────────────────────────────────────────────────────────────
const TT_STYLE = { background:"#1E2D45", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, fontSize:12, color:"#E2E8F0" };
const TT_LABEL = { color:"#A5B4FC", fontWeight:600 };

// ── REUSABLE COMPONENTS ───────────────────────────────────────────────────────
const Chip = ({ children, color = "#6C63FF" }) => (
  <span style={{
    background:`${color}22`, color, border:`1px solid ${color}44`,
    borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700, whiteSpace:"nowrap",
  }}>{children}</span>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background:"rgba(255,255,255,0.03)",
    border:"1px solid rgba(255,255,255,0.08)",
    borderRadius:16, padding:20,
    ...style,
  }}>{children}</div>
);

const CardTitle = ({ title, sub }) => (
  <div style={{ marginBottom:16 }}>
    <div style={{ fontSize:14, fontWeight:700, color:"#CBD5E1" }}>{title}</div>
    {sub && <div style={{ fontSize:11, color:"#475569", marginTop:2 }}>{sub}</div>}
  </div>
);

const SelectFilter = ({ label, val, set, opts = [] }) => (
  <select value={val} onChange={e => set(e.target.value)} style={{
    background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
    color:"#E2E8F0", borderRadius:8, padding:"7px 12px", fontSize:12,
    cursor:"pointer", outline:"none", minWidth:130,
  }}>
    {(opts || []).map(o => (
      <option key={o} value={o} style={{ background:"#1a2744" }}>
        {o === "All" ? `All ${label}s` : o}
      </option>
    ))}
  </select>
);

// ═════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [tab,         setTab]      = useState("overview");
  const [filterFY,    setFY]       = useState("All");
  const [filterMat,   setMat]      = useState("All");
  const [filterCust,  setCust]     = useState("All");
  const [filterRegion,setRegion]   = useState("All");
  const [filterMonth, setMonth]    = useState("All");

  // Live Google Sheet configuration (update if you add FY 26-27 later)
  const SHEET_ID = '1O_7K012fvpLpLFdhOXXa6C3qFAldJ5DseBV_hcqSLzo'
  const SHEET_NAMES = ['FY 23-24','FY 24-25','FY 25-26','FY 26-27']

  // fetch live rows (poll every 60s). Falls back to the embedded `RAW_DATA`.
  const liveRows = useGoogleSheets(SHEET_ID, SHEET_NAMES, { pollInterval: 60000 })
  const baseData = (liveRows && liveRows.length) ? liveRows : RAW_DATA

  // dynamic option lists derived from the active dataset
  const FY_YEARS_LOCAL  = [...new Set(baseData.map(d => d.fy))];
  const MATERIALS_LOCAL = [...new Set(baseData.map(d => d.material))];
  const CUSTOMERS_LOCAL = [...new Set(baseData.map(d => d.customer))];
  const REGIONS_LOCAL   = [...new Set(baseData.map(d => d.region))];

  // ── Filtered dataset ──────────────────────────────────────────────────────
  const data = useMemo(() => baseData.filter(d =>
    (filterFY     === "All" || d.fy       === filterFY)     &&
    (filterMat    === "All" || d.material === filterMat)    &&
    (filterCust   === "All" || d.customer === filterCust)   &&
    (filterRegion === "All" || d.region   === filterRegion) &&
    (filterMonth  === "All" || d.month    === filterMonth)
  ), [baseData, filterFY, filterMat, filterCust, filterRegion, filterMonth]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalQty   = data.reduce((s,d) => s + d.qty,   0);
  const totalValue = data.reduce((s,d) => s + d.total, 0);
  const avgRate    = data.length ? Math.round(data.reduce((s,d) => s + d.rate, 0) / data.length) : 0;
  const uniqueCust = new Set(data.map(d => d.customer)).size;
  const totalInv   = data.length;

  // ── YoY aggregation ───────────────────────────────────────────────────────
  const fyAgg = FY_YEARS_LOCAL.map(fy => {
    const rows = baseData.filter(d => d.fy === fy);
    return { fy, qty:rows.reduce((s,d)=>s+d.qty,0), value:rows.reduce((s,d)=>s+d.total,0), count:rows.length };
  });
  const fyBar = fyAgg.map((d,i) => ({
    ...d,
    yoy: i === 0 ? null : +((d.value - fyAgg[i-1].value) / fyAgg[i-1].value * 100).toFixed(1),
  }));

  // ── Monthly trend ─────────────────────────────────────────────────────────
  const monthlyData = MONTHS_ORD.map(m => {
    const rows = data.filter(d => d.month === m);
    return {
      month: m,
      qty:   rows.reduce((s,d) => s+d.qty,   0),
      value: rows.reduce((s,d) => s+d.total, 0),
      rate:  rows.length ? Math.round(rows.reduce((s,d) => s+d.rate, 0) / rows.length) : 0,
      count: rows.length,
    };
  }).filter(d => d.qty > 0);

  // ── Material breakdown ────────────────────────────────────────────────────
  const matData = MATERIALS_LOCAL.map(m => {
    const rows = data.filter(d => d.material === m);
    return {
      material: m,
      qty:   rows.reduce((s,d) => s+d.qty,   0),
      value: rows.reduce((s,d) => s+d.total, 0),
      rate:  rows.length ? Math.round(rows.reduce((s,d) => s+d.rate, 0) / rows.length) : 0,
      count: rows.length,
    };
  }).filter(d => d.qty > 0).sort((a,b) => b.value - a.value);

  // ── Customer breakdown ────────────────────────────────────────────────────
  const custData = CUSTOMERS_LOCAL.map(c => {
    const rows = data.filter(d => d.customer === c);
    return {
      customer: c.length > 22 ? c.slice(0,20)+"…" : c,
      fullName: c,
      qty:    rows.reduce((s,d) => s+d.qty,   0),
      value:  rows.reduce((s,d) => s+d.total, 0),
      count:  rows.length,
      region: rows[0]?.region || "",
    };
  }).filter(d => d.qty > 0).sort((a,b) => b.value - a.value);

  // ── Rate by month/material ────────────────────────────────────────────────
  const rateByMonth = MONTHS_ORD.map(m => {
    const row = { month: m };
    MATERIALS_LOCAL.forEach(mat => {
      const rows = data.filter(d => d.month === m && d.material === mat);
      row[mat] = rows.length ? Math.round(rows.reduce((s,d) => s+d.rate, 0) / rows.length) : null;
    });
    return row;
  }).filter(d => MATERIALS_LOCAL.some(m => d[m]));

  // ── Region breakdown ──────────────────────────────────────────────────────
  const regionData = REGIONS_LOCAL.map(r => {
    const rows = data.filter(d => d.region === r);
    return {
      region: r,
      qty:   rows.reduce((s,d) => s+d.qty,   0),
      value: rows.reduce((s,d) => s+d.total, 0),
    };
  }).filter(d => d.qty > 0).sort((a,b) => b.value - a.value);

  const TABS = [
    { id:"overview",  label:"📊 Overview"        },
    { id:"material",  label:"🏭 Materials"        },
    { id:"customers", label:"👥 Customers"        },
    { id:"rates",     label:"📈 Rates & Seasonal" },
  ];

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#080E1C", color:"#E2E8F0", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div style={{
        background:"linear-gradient(135deg,#0D1B3E 0%,#111E40 100%)",
        borderBottom:"1px solid rgba(255,255,255,0.07)",
        padding:"20px 28px", position:"sticky", top:0, zIndex:100,
        boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
      }}>
        <div style={{ maxWidth:1500, margin:"0 auto" }}>
          {/* Title Row */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{
                width:44, height:44, borderRadius:12,
                background:"linear-gradient(135deg,#6C63FF,#4ECDC4)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:22, boxShadow:"0 4px 20px rgba(108,99,255,0.45)",
              }}>⚙</div>
              <div>
                <h1 style={{
                  margin:0, fontSize:20, fontWeight:800, letterSpacing:0.3,
                  background:"linear-gradient(90deg,#FFFFFF,#A5B4FC)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                }}>Semi Finished Goods</h1>
                <p style={{ margin:0, fontSize:11, color:"#4B6A9B", letterSpacing:1.5, marginTop:2 }}>
                  MASTER DATA · FY 2023-24 TO 2025-26 · INTERACTIVE FILTERS
                </p>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
              <Chip color="#43C6AC">🟢 LIVE</Chip>
              <Chip color="#6C63FF">{totalInv} Invoices Loaded</Chip>
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
            <SelectFilter label="FY Year"  val={filterFY}     set={setFY}     opts={["All",...FY_YEARS_LOCAL]}  />
            <SelectFilter label="Material" val={filterMat}    set={setMat}    opts={["All",...MATERIALS_LOCAL]} />
            <SelectFilter label="Customer" val={filterCust}   set={setCust}   opts={["All",...CUSTOMERS_LOCAL]} />
            <SelectFilter label="Region"   val={filterRegion} set={setRegion} opts={["All",...REGIONS_LOCAL]}   />
            <SelectFilter label="Month"    val={filterMonth}  set={setMonth}  opts={["All",...MONTHS_ORD]}/>
            <button
              onClick={() => { setFY("All"); setMat("All"); setCust("All"); setRegion("All"); setMonth("All"); }}
              style={{
                background:"rgba(255,101,84,0.15)", border:"1px solid rgba(255,101,84,0.3)",
                color:"#FF6554", borderRadius:8, padding:"7px 16px", fontSize:12,
                cursor:"pointer", fontWeight:600, fontFamily:"inherit",
              }}
            >✕ Reset Filters</button>
          </div>
        </div>
      </div>

      {/* ── TABS ────────────────────────────────────────────────────────── */}
      <div style={{ background:"#0B1425", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"0 28px" }}>
        <div style={{ maxWidth:1500, margin:"0 auto", display:"flex" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background:"none", border:"none",
              color: tab === t.id ? "#A5B4FC" : "#4B6A9B",
              borderBottom: tab === t.id ? "2px solid #6C63FF" : "2px solid transparent",
              padding:"14px 22px", cursor:"pointer", fontSize:13, fontWeight:600,
              transition:"color 0.2s", letterSpacing:0.3, fontFamily:"inherit",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── PAGE CONTENT ────────────────────────────────────────────────── */}
      <div style={{ maxWidth:1500, margin:"0 auto", padding:"24px 28px" }}>

        {/* ════════ OVERVIEW TAB ════════ */}
        {tab === "overview" && (
          <>
            {/* KPI Strip */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:22 }}>
              {[
                { label:"Total Dispatched Qty", value:fmtQty(totalQty),   icon:"🚛", color:"#6C63FF" },
                { label:"Total Sales Value",     value:fmtVal(totalValue), icon:"₹",  color:"#4ECDC4" },
                { label:"Avg Rate / MT",         value:fmtRate(avgRate),   icon:"📊", color:"#FF6584" },
                { label:"Unique Customers",      value:uniqueCust,         icon:"🏢", color:"#FFE66D" },
                { label:"Total Invoices",        value:totalInv,           icon:"🧾", color:"#A78BFA" },
              ].map((k,i) => (
                <div key={i} style={{
                  background:"linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))",
                  border:`1px solid ${k.color}33`, borderRadius:16, padding:"18px 20px",
                  position:"relative", overflow:"hidden",
                }}>
                  <div style={{ position:"absolute", top:-12, right:-12, width:72, height:72, borderRadius:"50%", background:`radial-gradient(circle,${k.color}18,transparent)` }}/>
                  <div style={{ fontSize:24, marginBottom:8 }}>{k.icon}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:k.color, marginBottom:4 }}>{k.value}</div>
                  <div style={{ fontSize:11, color:"#64748B", lineHeight:1.4 }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* YoY Bar + Monthly Trend */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1.8fr", gap:16, marginBottom:16 }}>
              <Card>
                <CardTitle title="Sales Value by FY Year" sub="YoY growth % overlaid as line"/>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={fyBar}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                    <XAxis dataKey="fy" tick={{ fill:"#94A3B8", fontSize:11 }}/>
                    <YAxis yAxisId="l" tick={{ fill:"#94A3B8", fontSize:10 }} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`}/>
                    <YAxis yAxisId="r" orientation="right" tick={{ fill:"#94A3B8", fontSize:10 }} tickFormatter={v => `${v}%`}/>
                    <Tooltip contentStyle={TT_STYLE} labelStyle={TT_LABEL}
                      formatter={(v,n) => n === "yoy" ? [`${v}%`, "YoY Growth"] : [fmtVal(v), "Total Value"]}/>
                    <Bar yAxisId="l" dataKey="value" radius={[8,8,0,0]} maxBarSize={60}>
                      {fyBar.map((d,i) => <Cell key={i} fill={FY_COLOR[d.fy] || "#6C63FF"}/>)}
                    </Bar>
                    {fyBar.some(d => d.yoy !== null) && (
                      <Line yAxisId="r" dataKey="yoy" stroke="#FF6584" strokeWidth={2.5}
                        dot={{ fill:"#FF6584", r:5, strokeWidth:0 }} connectNulls name="YoY %"/>
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:12 }}>
                  {fyBar.map((d,i) => d.yoy !== null && (
                    <Chip key={i} color={d.yoy >= 0 ? "#43C6AC" : "#FF6554"}>
                      {d.fy}: {d.yoy >= 0 ? "+" : ""}{d.yoy}%
                    </Chip>
                  ))}
                  {fyBar.every(d => d.yoy === null) && (
                    <span style={{ fontSize:11, color:"#475569" }}>Paste more FY years of data to show YoY growth</span>
                  )}
                </div>
              </Card>

              <Card>
                <CardTitle title="Monthly Volume & Rate Trend" sub="Dispatched Qty (bars) · Avg Rate ₹/MT (line)"/>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                    <XAxis dataKey="month" tick={{ fill:"#94A3B8", fontSize:11 }}/>
                    <YAxis yAxisId="l" tick={{ fill:"#94A3B8", fontSize:10 }} tickFormatter={v => `${v}MT`}/>
                    <YAxis yAxisId="r" orientation="right" tick={{ fill:"#94A3B8", fontSize:10 }} tickFormatter={v => `₹${v}`}/>
                    <Tooltip contentStyle={TT_STYLE} labelStyle={TT_LABEL}
                      formatter={(v,n) => n === "rate" ? [fmtRate(v), "Avg Rate"] : [`${v} MT`, "Qty"]}/>
                    <Bar yAxisId="l" dataKey="qty" fill="#6C63FF" radius={[4,4,0,0]} maxBarSize={40} name="Qty"/>
                    <Line yAxisId="r" dataKey="rate" stroke="#FFE66D" strokeWidth={2.5}
                      dot={{ fill:"#FFE66D", r:4, strokeWidth:0 }} name="rate"/>
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Region Bar + Invoice Table */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1.5fr", gap:16 }}>
              <Card>
                <CardTitle title="Sales Value by Region" sub="Filtered view"/>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={regionData} layout="vertical" barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false}/>
                    <XAxis type="number" tick={{ fill:"#94A3B8", fontSize:10 }} tickFormatter={v => fmtVal(v)}/>
                    <YAxis type="category" dataKey="region" tick={{ fill:"#94A3B8", fontSize:11 }} width={90}/>
                    <Tooltip contentStyle={TT_STYLE} labelStyle={TT_LABEL} formatter={v => [fmtVal(v), "Value"]}/>
                    <Bar dataKey="value" radius={[0,6,6,0]}>
                      {regionData.map((d,i) => <Cell key={i} fill={REGION_COLOR[d.region] || "#6C63FF"}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <CardTitle title="Invoice Log" sub="Showing up to 8 filtered records"/>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                    <thead>
                      <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                        {["Inv No.","Date","Customer","Material","Qty (MT)","Rate","Total Value"].map(h => (
                          <th key={h} style={{ padding:"8px 10px", color:"#64748B", fontWeight:600, textAlign:"left", whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(0,8).map((d,i) => (
                        <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", background:i%2===0?"transparent":"rgba(255,255,255,0.015)" }}>
                          <td style={{ padding:"8px 10px", color:"#A5B4FC", fontWeight:600 }}>{d.inv}</td>
                          <td style={{ padding:"8px 10px", color:"#94A3B8" }}>{d.date}</td>
                          <td style={{ padding:"8px 10px", color:"#CBD5E1", maxWidth:150, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.customer}</td>
                          <td style={{ padding:"8px 10px" }}>
                            <span style={{ background:`${MAT_COLOR[d.material]||"#6C63FF"}22`, color:MAT_COLOR[d.material]||"#6C63FF", borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:700 }}>
                              {d.material}
                            </span>
                          </td>
                          <td style={{ padding:"8px 10px", color:"#CBD5E1", textAlign:"right" }}>{d.qty.toLocaleString("en-IN")}</td>
                          <td style={{ padding:"8px 10px", color:"#FFE66D", textAlign:"right" }}>{fmtRate(d.rate)}</td>
                          <td style={{ padding:"8px 10px", color:"#43C6AC", fontWeight:700, textAlign:"right" }}>{fmtVal(d.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.length === 0 && (
                    <p style={{ color:"#475569", textAlign:"center", padding:24 }}>No records match your filters.</p>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}

        {/* ════════ MATERIALS TAB ════════ */}
        {tab === "material" && (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
              {matData.slice(0,4).map((m,i) => (
                <div key={i} style={{
                  background:`${MAT_COLOR[m.material]||"#6C63FF"}10`,
                  border:`1px solid ${MAT_COLOR[m.material]||"#6C63FF"}33`,
                  borderRadius:14, padding:"16px 18px",
                }}>
                  <div style={{ fontSize:11, color:"#64748B", marginBottom:6, fontWeight:700, letterSpacing:0.5 }}>{m.material}</div>
                  <div style={{ fontSize:20, fontWeight:800, color:MAT_COLOR[m.material]||"#6C63FF", marginBottom:8 }}>{fmtVal(m.value)}</div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    <Chip color="#94A3B8">{fmtQty(m.qty)}</Chip>
                    <Chip color="#FFE66D">{fmtRate(m.rate)} avg</Chip>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:16, marginBottom:16 }}>
              <Card>
                <CardTitle title="Dispatched Qty by Material" sub=""/>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={matData} barSize={38}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                    <XAxis dataKey="material" tick={{ fill:"#94A3B8", fontSize:10 }} interval={0}
                      tickFormatter={v => v.length > 8 ? v.slice(0,8)+"…" : v}/>
                    <YAxis tick={{ fill:"#94A3B8", fontSize:10 }} tickFormatter={v => `${v}MT`}/>
                    <Tooltip contentStyle={TT_STYLE} labelStyle={TT_LABEL} formatter={v => [fmtQty(v), "Qty"]}/>
                    <Bar dataKey="qty" name="qty" radius={[6,6,0,0]}>
                      {matData.map((d,i) => <Cell key={i} fill={MAT_COLOR[d.material]||"#6C63FF"}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <CardTitle title="Total Value by Material" sub="Including GST"/>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={matData} barSize={38}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                    <XAxis dataKey="material" tick={{ fill:"#94A3B8", fontSize:10 }} interval={0}
                      tickFormatter={v => v.length > 8 ? v.slice(0,8)+"…" : v}/>
                    <YAxis tick={{ fill:"#94A3B8", fontSize:10 }} tickFormatter={v => fmtVal(v)}/>
                    <Tooltip contentStyle={TT_STYLE} labelStyle={TT_LABEL} formatter={v => [fmtVal(v), "Total Value"]}/>
                    <Bar dataKey="value" radius={[6,6,0,0]}>
                      {matData.map((d,i) => <Cell key={i} fill={MAT_COLOR[d.material]||"#6C63FF"}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Party × Material matrices */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              <Card>
                <CardTitle title="Party × Material — Qty (MT)" sub="Sum of dispatched qty per party×material" />
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                    <thead>
                      <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ padding:'8px 10px', color:'#64748B', fontWeight:700, textAlign:'left' }}>Material \ Party</th>
                        {custData.slice(0,10).map(c => (
                          <th key={c.fullName} style={{ padding:'8px 10px', color:'#CBD5E1', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}>{c.fullName}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MATERIALS_LOCAL.map(mat => (
                        <tr key={mat} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding:'8px 10px', color:'#CBD5E1' }}>{mat}</td>
                          {custData.slice(0,10).map(c => {
                            const v = data.filter(d => d.material === mat && d.customer === c.fullName).reduce((s,d) => s + (Number(d.qty)||0), 0)
                            return <td key={c.fullName} style={{ padding:'8px 10px', textAlign:'right', color:'#E2E8F0' }}>{v ? v.toLocaleString('en-IN') : '-'}</td>
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card>
                <CardTitle title="Party × Material — Invoice Count" sub="Count of invoices per party×material" />
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                    <thead>
                      <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ padding:'8px 10px', color:'#64748B', fontWeight:700, textAlign:'left' }}>Material \ Party</th>
                        {custData.slice(0,10).map(c => (
                          <th key={c.fullName} style={{ padding:'8px 10px', color:'#CBD5E1', fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}>{c.fullName}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MATERIALS_LOCAL.map(mat => (
                        <tr key={mat} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding:'8px 10px', color:'#CBD5E1' }}>{mat}</td>
                          {custData.slice(0,10).map(c => {
                            const v = data.filter(d => d.material === mat && d.customer === c.fullName).length
                            return <td key={c.fullName} style={{ padding:'8px 10px', textAlign:'right', color:'#E2E8F0' }}>{v || '-'}</td>
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <Card>
              <CardTitle title="Material Performance Summary" sub="Ranked by total value · with value share bar"/>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                    {["#","Material","Total Qty (MT)","Total Value","Avg Rate/MT","Invoices","Value Share"].map(h => (
                      <th key={h} style={{ padding:"10px 14px", color:"#64748B", fontWeight:700, textAlign:h==="#"||h==="Material"?"left":"right" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matData.map((m,i) => {
                    const share = totalValue > 0 ? (m.value / totalValue * 100).toFixed(1) : 0;
                    return (
                      <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", background:i%2?"rgba(255,255,255,0.015)":"transparent" }}>
                        <td style={{ padding:"10px 14px", color:"#475569", fontWeight:700 }}>#{i+1}</td>
                        <td style={{ padding:"10px 14px" }}>
                          <span style={{ background:`${MAT_COLOR[m.material]||"#6C63FF"}22`, color:MAT_COLOR[m.material]||"#6C63FF", borderRadius:6, padding:"3px 10px", fontWeight:700 }}>
                            {m.material}
                          </span>
                        </td>
                        <td style={{ padding:"10px 14px", color:"#CBD5E1", textAlign:"right" }}>{m.qty.toLocaleString("en-IN")}</td>
                        <td style={{ padding:"10px 14px", color:"#43C6AC", fontWeight:700, textAlign:"right" }}>{fmtVal(m.value)}</td>
                        <td style={{ padding:"10px 14px", color:"#FFE66D", textAlign:"right" }}>{fmtRate(m.rate)}</td>
                        <td style={{ padding:"10px 14px", color:"#94A3B8", textAlign:"right" }}>{m.count}</td>
                        <td style={{ padding:"10px 14px", textAlign:"right" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"flex-end" }}>
                            <div style={{ width:60, height:6, borderRadius:3, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
                              <div style={{ width:`${share}%`, height:"100%", background:MAT_COLOR[m.material]||"#6C63FF", borderRadius:3 }}/>
                            </div>
                            <span style={{ color:"#94A3B8", minWidth:36 }}>{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </>
        )}

        {/* ════════ CUSTOMERS TAB ════════ */}
        {tab === "customers" && (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:16, marginBottom:16 }}>
              <Card>
                <CardTitle title="Top Customers by Total Value" sub="Ranked by all-time total"/>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={custData} layout="vertical" barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false}/>
                    <XAxis type="number" tick={{ fill:"#94A3B8", fontSize:10 }} tickFormatter={v => fmtVal(v)}/>
                    <YAxis type="category" dataKey="customer" tick={{ fill:"#CBD5E1", fontSize:11 }} width={150}/>
                    <Tooltip contentStyle={TT_STYLE} labelStyle={TT_LABEL} formatter={v => [fmtVal(v), "Total Value"]}/>
                    <Bar dataKey="value" name="value" radius={[0,6,6,0]} fill="#6C63FF"/>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <CardTitle title="Dispatched Qty by Customer" sub=""/>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={custData} layout="vertical" barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false}/>
                    <XAxis type="number" tick={{ fill:"#94A3B8", fontSize:10 }} tickFormatter={v => `${v}MT`}/>
                    <YAxis type="category" dataKey="customer" tick={{ fill:"#CBD5E1", fontSize:11 }} width={150}/>
                    <Tooltip contentStyle={TT_STYLE} labelStyle={TT_LABEL} formatter={v => [fmtQty(v), "Qty"]}/>
                    <Bar dataKey="qty" name="qty" radius={[0,6,6,0]} fill="#4ECDC4"/>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card>
              <CardTitle title="Customer Performance Table" sub="All customers in filtered view"/>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                    {["#","Customer","Region","Total Qty","Total Value","Invoices","Avg Value/Invoice"].map(h => (
                      <th key={h} style={{ padding:"10px 14px", color:"#64748B", fontWeight:700, textAlign:h==="#"||h==="Customer"||h==="Region"?"left":"right" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {custData.map((c,i) => (
                    <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", background:i%2?"rgba(255,255,255,0.015)":"transparent" }}>
                      <td style={{ padding:"10px 14px", color:"#475569", fontWeight:700 }}>#{i+1}</td>
                      <td style={{ padding:"10px 14px", color:"#CBD5E1", fontWeight:600 }}>{c.customer}</td>
                      <td style={{ padding:"10px 14px" }}>
                        <Chip color={REGION_COLOR[c.region]||"#94A3B8"}>{c.region}</Chip>
                      </td>
                      <td style={{ padding:"10px 14px", color:"#94A3B8", textAlign:"right" }}>{c.qty.toLocaleString("en-IN")} MT</td>
                      <td style={{ padding:"10px 14px", color:"#43C6AC", fontWeight:700, textAlign:"right" }}>{fmtVal(c.value)}</td>
                      <td style={{ padding:"10px 14px", color:"#94A3B8", textAlign:"right" }}>{c.count}</td>
                      <td style={{ padding:"10px 14px", color:"#FFE66D", textAlign:"right" }}>{fmtVal(Math.round(c.value / c.count))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        )}

        {/* ════════ RATES & SEASONAL TAB ════════ */}
        {tab === "rates" && (
          <>
            <Card style={{ marginBottom:16 }}>
              <CardTitle title="Average Rate by Month & Material" sub="Seasonal rate patterns per material"/>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={rateByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                  <XAxis dataKey="month" tick={{ fill:"#94A3B8", fontSize:11 }}/>
                  <YAxis tick={{ fill:"#94A3B8", fontSize:10 }} tickFormatter={v => `₹${v}`}/>
                  <Tooltip contentStyle={TT_STYLE} labelStyle={TT_LABEL} formatter={(v,n) => [fmtRate(v), n]}/>
                  <Legend iconType="circle" wrapperStyle={{ fontSize:11, color:"#94A3B8" }}/>
                  {MATERIALS_LOCAL.map(m => (
                    <Line key={m} type="monotone" dataKey={m}
                      stroke={MAT_COLOR[m]||"#6C63FF"} strokeWidth={2.5}
                      dot={{ r:4, strokeWidth:0, fill:MAT_COLOR[m]||"#6C63FF" }}
                      connectNulls name={m}/>
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <Card>
                <CardTitle title="Monthly Qty — Seasonal Pattern" sub="Peak month highlighted in teal"/>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={monthlyData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                    <XAxis dataKey="month" tick={{ fill:"#94A3B8", fontSize:11 }}/>
                    <YAxis tick={{ fill:"#94A3B8", fontSize:10 }} tickFormatter={v => `${v}MT`}/>
                    <Tooltip contentStyle={TT_STYLE} labelStyle={TT_LABEL} formatter={v => [fmtQty(v), "Qty"]}/>
                    <Bar dataKey="qty" radius={[6,6,0,0]}>
                      {monthlyData.map((d,i) => {
                        const max = Math.max(...monthlyData.map(x => x.qty));
                        return <Cell key={i} fill={d.qty === max ? "#43C6AC" : "#6C63FF"}/>;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {monthlyData.length > 0 && (() => {
                  const peak = monthlyData.reduce((a,b) => a.qty > b.qty ? a : b);
                  const low  = monthlyData.reduce((a,b) => a.qty < b.qty ? a : b);
                  return (
                    <div style={{ marginTop:12, display:"flex", gap:8, flexWrap:"wrap" }}>
                      <Chip color="#43C6AC">🔺 Peak: {peak.month} ({fmtQty(peak.qty)})</Chip>
                      <Chip color="#FF6554">🔻 Lowest: {low.month} ({fmtQty(low.qty)})</Chip>
                    </div>
                  );
                })()}
              </Card>

              <Card>
                <CardTitle title="Rate Heatmap — Month × Material" sub="Darker = higher rate"/>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
                    <thead>
                      <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                        <th style={{ padding:"6px 10px", color:"#64748B", textAlign:"left" }}>Month</th>
                        {MATERIALS_LOCAL.map(m => (
                          <th key={m} style={{ padding:"6px 8px", color:MAT_COLOR[m]||"#94A3B8", fontWeight:700, whiteSpace:"nowrap" }}>
                            {m.length > 7 ? m.slice(0,7)+"…" : m}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rateByMonth.map((row,i) => (
                        <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding:"6px 10px", color:"#94A3B8", fontWeight:600 }}>{row.month}</td>
                          {MATERIALS_LOCAL.map(m => {
                            const v = row[m];
                            const allVals = rateByMonth.map(r => r[m]).filter(Boolean);
                            const max = allVals.length ? Math.max(...allVals) : 0;
                            const min = allVals.length ? Math.min(...allVals) : 0;
                            const pct = (max > min && v) ? (v - min) / (max - min) : 0;
                            return (
                              <td key={m} style={{
                                padding:"6px 8px", textAlign:"center",
                                background: v ? `rgba(67,198,172,${0.08 + pct * 0.35})` : "transparent",
                                color: v ? "#E2E8F0" : "#334155",
                                borderRadius:4, fontWeight: v ? 600 : 400,
                              }}>
                                {v ? `₹${v.toLocaleString("en-IN")}` : "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <div style={{
          marginTop:32, padding:"14px 20px",
          background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)",
          borderRadius:12, display:"flex", alignItems:"center", justifyContent:"space-between",
          fontSize:11, color:"#334155", flexWrap:"wrap", gap:8,
        }}>
          <span>📋 By-Product Sales Dashboard · Source: MASTER DATA tab · {baseData.length} records · React + Recharts + Vite</span>
          <span style={{ color:"#475569" }}>Add more rows to RAW_DATA in App.jsx to expand analysis · All filters update charts instantly</span>
        </div>
      </div>
    </div>
  );
}
