import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ComposedChart,
} from "recharts";
import "./App.css";
import useGoogleSheets from './hooks/useGoogleSheets'

// ── REAL DATA FROM YOUR GOOGLE SHEET ─────────────────────────────────────────
const RAW_DATA = [
  // Format: { inv, date, month, year, fy, customer, material, qty, rate, price, total, region, gst }
];

const FY_YEARS   = [...new Set(RAW_DATA.map(d => d.fy))];
const MATERIALS  = [...new Set(RAW_DATA.map(d => d.material))];
const CUSTOMERS  = [...new Set(RAW_DATA.map(d => d.customer))];
const REGIONS    = [...new Set(RAW_DATA.map(d => d.region))];
const MONTHS_ORD = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];

const MAT_COLOR = {
  "FLY ASH":        "#4ECDC4",
  "MAGNETIC":       "#FF6B6B",
  "IRON ORE FINES": "#FFE66D",
  "ESP DUST":       "#A78BFA",
  "CHAR ASH":       "#F4A261",
  "DUST":           "#94A3B8",
};
const FY_COLOR = { "2023-24":"#6C63FF", "2024-25":"#FF6584", "2025-26":"#43C6AC" };
const REGION_COLOR = {
  "Maharashtra":"#6C63FF", "Chhattisgarh":"#FF6B6B",
  "Rajasthan":"#FFE66D",   "Odisha":"#4ECDC4",   "Gujarat":"#F4A261",
};

// ── FORMATTERS ────────────────────────────────────────────────────────────────
const fmtVal  = v => v >= 10000000 ? `₹${(v/10000000).toFixed(2)}Cr` : v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${v.toLocaleString("en-IN")}`;
const fmtQty  = v => v >= 1000 ? `${(v/1000).toFixed(1)}K MT` : `${v} MT`;
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
  const SHEET_NAMES = ['FY 23-24','FY 24-25','FY 25-26']

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
                }}>By-Product Sales Dashboard: 3-Year Performance Analysis</h1>
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
