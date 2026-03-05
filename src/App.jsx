import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ComposedChart, ReferenceLine,
} from "recharts";

// ── HOOK (replace with real one) ──────────────────────────────────────────────
const useGoogleSheets = () => null;

// ── DATA ─────────────────────────────────────────────────────────────────────
const RAW_DATA = [
  {inv:"INV-001",date:"01-Apr-23",month:"Apr",year:2023,fy:"2023-24",customer:"JSPL Raigarh",material:"FLY ASH",qty:1200,rate:850,total:1020000,region:"Chhattisgarh"},
  {inv:"INV-002",date:"05-Apr-23",month:"Apr",year:2023,fy:"2023-24",customer:"ACC Ltd",material:"MAGNETIC",qty:800,rate:1200,total:960000,region:"Maharashtra"},
  {inv:"INV-003",date:"12-Apr-23",month:"Apr",year:2023,fy:"2023-24",customer:"Ultratech Cement",material:"IRON ORE FINES",qty:2000,rate:650,total:1300000,region:"Gujarat"},
  {inv:"INV-004",date:"20-Apr-23",month:"Apr",year:2023,fy:"2023-24",customer:"Tata Steel",material:"ESP DUST",qty:500,rate:1800,total:900000,region:"Odisha"},
  {inv:"INV-005",date:"02-May-23",month:"May",year:2023,fy:"2023-24",customer:"JSPL Raigarh",material:"FLY ASH",qty:1400,rate:870,total:1218000,region:"Chhattisgarh"},
  {inv:"INV-006",date:"10-May-23",month:"May",year:2023,fy:"2023-24",customer:"SAIL BSP",material:"CHAR ASH",qty:600,rate:920,total:552000,region:"Chhattisgarh"},
  {inv:"INV-007",date:"18-May-23",month:"May",year:2023,fy:"2023-24",customer:"ACC Ltd",material:"MAGNETIC",qty:900,rate:1180,total:1062000,region:"Maharashtra"},
  {inv:"INV-008",date:"25-May-23",month:"May",year:2023,fy:"2023-24",customer:"Vedanta Ltd",material:"IRON ORE FINES",qty:1800,rate:680,total:1224000,region:"Rajasthan"},
  {inv:"INV-009",date:"03-Jun-23",month:"Jun",year:2023,fy:"2023-24",customer:"Ultratech Cement",material:"DUST",qty:700,rate:400,total:280000,region:"Gujarat"},
  {inv:"INV-010",date:"15-Jun-23",month:"Jun",year:2023,fy:"2023-24",customer:"JSPL Raigarh",material:"FLY ASH",qty:1600,rate:880,total:1408000,region:"Chhattisgarh"},
  {inv:"INV-011",date:"22-Jun-23",month:"Jun",year:2023,fy:"2023-24",customer:"Tata Steel",material:"MAGNETIC",qty:1100,rate:1220,total:1342000,region:"Odisha"},
  {inv:"INV-012",date:"05-Jul-23",month:"Jul",year:2023,fy:"2023-24",customer:"SAIL BSP",material:"CHAR ASH",qty:750,rate:940,total:705000,region:"Chhattisgarh"},
  {inv:"INV-013",date:"14-Jul-23",month:"Jul",year:2023,fy:"2023-24",customer:"Vedanta Ltd",material:"IRON ORE FINES",qty:2200,rate:700,total:1540000,region:"Rajasthan"},
  {inv:"INV-014",date:"21-Jul-23",month:"Jul",year:2023,fy:"2023-24",customer:"ACC Ltd",material:"ESP DUST",qty:450,rate:1850,total:832500,region:"Maharashtra"},
  {inv:"INV-015",date:"01-Aug-23",month:"Aug",year:2023,fy:"2023-24",customer:"Ultratech Cement",material:"FLY ASH",qty:1300,rate:860,total:1118000,region:"Gujarat"},
  {inv:"INV-016",date:"12-Aug-23",month:"Aug",year:2023,fy:"2023-24",customer:"JSPL Raigarh",material:"MAGNETIC",qty:1000,rate:1250,total:1250000,region:"Chhattisgarh"},
  {inv:"INV-017",date:"20-Aug-23",month:"Aug",year:2023,fy:"2023-24",customer:"Tata Steel",material:"IRON ORE FINES",qty:1900,rate:720,total:1368000,region:"Odisha"},
  {inv:"INV-018",date:"28-Sep-23",month:"Sep",year:2023,fy:"2023-24",customer:"SAIL BSP",material:"CHAR ASH",qty:800,rate:960,total:768000,region:"Chhattisgarh"},
  {inv:"INV-019",date:"10-Oct-23",month:"Oct",year:2023,fy:"2023-24",customer:"Vedanta Ltd",material:"FLY ASH",qty:2100,rate:900,total:1890000,region:"Rajasthan"},
  {inv:"INV-020",date:"22-Oct-23",month:"Oct",year:2023,fy:"2023-24",customer:"ACC Ltd",material:"MAGNETIC",qty:950,rate:1300,total:1235000,region:"Maharashtra"},
  {inv:"INV-021",date:"08-Nov-23",month:"Nov",year:2023,fy:"2023-24",customer:"Tata Steel",material:"IRON ORE FINES",qty:1700,rate:740,total:1258000,region:"Odisha"},
  {inv:"INV-022",date:"18-Nov-23",month:"Nov",year:2023,fy:"2023-24",customer:"JSPL Raigarh",material:"FLY ASH",qty:1800,rate:920,total:1656000,region:"Chhattisgarh"},
  {inv:"INV-023",date:"05-Dec-23",month:"Dec",year:2023,fy:"2023-24",customer:"Ultratech Cement",material:"ESP DUST",qty:550,rate:1900,total:1045000,region:"Gujarat"},
  {inv:"INV-024",date:"15-Dec-23",month:"Dec",year:2023,fy:"2023-24",customer:"Vedanta Ltd",material:"CHAR ASH",qty:700,rate:980,total:686000,region:"Rajasthan"},
  {inv:"INV-025",date:"02-Jan-24",month:"Jan",year:2024,fy:"2023-24",customer:"SAIL BSP",material:"FLY ASH",qty:1500,rate:940,total:1410000,region:"Chhattisgarh"},
  {inv:"INV-026",date:"14-Jan-24",month:"Jan",year:2024,fy:"2023-24",customer:"ACC Ltd",material:"MAGNETIC",qty:1050,rate:1280,total:1344000,region:"Maharashtra"},
  {inv:"INV-027",date:"22-Feb-24",month:"Feb",year:2024,fy:"2023-24",customer:"Tata Steel",material:"IRON ORE FINES",qty:2300,rate:760,total:1748000,region:"Odisha"},
  {inv:"INV-028",date:"08-Mar-24",month:"Mar",year:2024,fy:"2023-24",customer:"JSPL Raigarh",material:"FLY ASH",qty:1900,rate:950,total:1805000,region:"Chhattisgarh"},
  {inv:"INV-101",date:"04-Apr-24",month:"Apr",year:2024,fy:"2024-25",customer:"JSPL Raigarh",material:"FLY ASH",qty:1600,rate:980,total:1568000,region:"Chhattisgarh"},
  {inv:"INV-102",date:"11-Apr-24",month:"Apr",year:2024,fy:"2024-25",customer:"ACC Ltd",material:"MAGNETIC",qty:1100,rate:1320,total:1452000,region:"Maharashtra"},
  {inv:"INV-103",date:"19-Apr-24",month:"Apr",year:2024,fy:"2024-25",customer:"Ultratech Cement",material:"IRON ORE FINES",qty:2400,rate:710,total:1704000,region:"Gujarat"},
  {inv:"INV-104",date:"25-Apr-24",month:"Apr",year:2024,fy:"2024-25",customer:"Tata Steel",material:"ESP DUST",qty:650,rate:1950,total:1267500,region:"Odisha"},
  {inv:"INV-105",date:"07-May-24",month:"May",year:2024,fy:"2024-25",customer:"Vedanta Ltd",material:"FLY ASH",qty:1800,rate:1000,total:1800000,region:"Rajasthan"},
  {inv:"INV-106",date:"16-May-24",month:"May",year:2024,fy:"2024-25",customer:"SAIL BSP",material:"CHAR ASH",qty:850,rate:1000,total:850000,region:"Chhattisgarh"},
  {inv:"INV-107",date:"24-May-24",month:"May",year:2024,fy:"2024-25",customer:"ACC Ltd",material:"MAGNETIC",qty:1200,rate:1350,total:1620000,region:"Maharashtra"},
  {inv:"INV-108",date:"03-Jun-24",month:"Jun",year:2024,fy:"2024-25",customer:"JSPL Raigarh",material:"FLY ASH",qty:2000,rate:1020,total:2040000,region:"Chhattisgarh"},
  {inv:"INV-109",date:"12-Jun-24",month:"Jun",year:2024,fy:"2024-25",customer:"Tata Steel",material:"IRON ORE FINES",qty:2100,rate:740,total:1554000,region:"Odisha"},
  {inv:"INV-110",date:"20-Jun-24",month:"Jun",year:2024,fy:"2024-25",customer:"Vedanta Ltd",material:"MAGNETIC",qty:1300,rate:1380,total:1794000,region:"Rajasthan"},
  {inv:"INV-111",date:"08-Jul-24",month:"Jul",year:2024,fy:"2024-25",customer:"Ultratech Cement",material:"DUST",qty:900,rate:420,total:378000,region:"Gujarat"},
  {inv:"INV-112",date:"17-Jul-24",month:"Jul",year:2024,fy:"2024-25",customer:"SAIL BSP",material:"CHAR ASH",qty:950,rate:1020,total:969000,region:"Chhattisgarh"},
  {inv:"INV-113",date:"28-Jul-24",month:"Jul",year:2024,fy:"2024-25",customer:"ACC Ltd",material:"ESP DUST",qty:700,rate:2000,total:1400000,region:"Maharashtra"},
  {inv:"INV-114",date:"09-Aug-24",month:"Aug",year:2024,fy:"2024-25",customer:"JSPL Raigarh",material:"FLY ASH",qty:2200,rate:1040,total:2288000,region:"Chhattisgarh"},
  {inv:"INV-115",date:"21-Aug-24",month:"Aug",year:2024,fy:"2024-25",customer:"Tata Steel",material:"MAGNETIC",qty:1400,rate:1400,total:1960000,region:"Odisha"},
  {inv:"INV-116",date:"05-Sep-24",month:"Sep",year:2024,fy:"2024-25",customer:"Vedanta Ltd",material:"IRON ORE FINES",qty:2600,rate:770,total:2002000,region:"Rajasthan"},
  {inv:"INV-117",date:"18-Sep-24",month:"Sep",year:2024,fy:"2024-25",customer:"Ultratech Cement",material:"FLY ASH",qty:1700,rate:1060,total:1802000,region:"Gujarat"},
  {inv:"INV-118",date:"04-Oct-24",month:"Oct",year:2024,fy:"2024-25",customer:"SAIL BSP",material:"CHAR ASH",qty:1000,rate:1050,total:1050000,region:"Chhattisgarh"},
  {inv:"INV-119",date:"15-Oct-24",month:"Oct",year:2024,fy:"2024-25",customer:"ACC Ltd",material:"MAGNETIC",qty:1500,rate:1420,total:2130000,region:"Maharashtra"},
  {inv:"INV-120",date:"26-Oct-24",month:"Oct",year:2024,fy:"2024-25",customer:"JSPL Raigarh",material:"FLY ASH",qty:2400,rate:1080,total:2592000,region:"Chhattisgarh"},
  {inv:"INV-121",date:"07-Nov-24",month:"Nov",year:2024,fy:"2024-25",customer:"Tata Steel",material:"IRON ORE FINES",qty:2200,rate:800,total:1760000,region:"Odisha"},
  {inv:"INV-122",date:"19-Nov-24",month:"Nov",year:2024,fy:"2024-25",customer:"Vedanta Ltd",material:"ESP DUST",qty:800,rate:2050,total:1640000,region:"Rajasthan"},
  {inv:"INV-123",date:"03-Dec-24",month:"Dec",year:2024,fy:"2024-25",customer:"JSPL Raigarh",material:"FLY ASH",qty:2300,rate:1100,total:2530000,region:"Chhattisgarh"},
  {inv:"INV-124",date:"16-Jan-25",month:"Jan",year:2025,fy:"2024-25",customer:"Ultratech Cement",material:"MAGNETIC",qty:1600,rate:1450,total:2320000,region:"Gujarat"},
  {inv:"INV-125",date:"28-Feb-25",month:"Feb",year:2025,fy:"2024-25",customer:"ACC Ltd",material:"IRON ORE FINES",qty:2800,rate:820,total:2296000,region:"Maharashtra"},
  {inv:"INV-126",date:"12-Mar-25",month:"Mar",year:2025,fy:"2024-25",customer:"SAIL BSP",material:"FLY ASH",qty:2100,rate:1120,total:2352000,region:"Chhattisgarh"},
];

const MONTHS_ORD = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
const MAT_COLOR  = {"FLY ASH":"#F59E0B","MAGNETIC":"#06B6D4","IRON ORE FINES":"#EF4444","ESP DUST":"#8B5CF6","CHAR ASH":"#10B981","DUST":"#64748B"};
const FY_COLOR   = {"2023-24":"#F59E0B","2024-25":"#06B6D4","2025-26":"#10B981"};
const REG_COLOR  = {"Maharashtra":"#F59E0B","Chhattisgarh":"#06B6D4","Rajasthan":"#EF4444","Odisha":"#8B5CF6","Gujarat":"#10B981"};

// India state bubble-map coordinates (on 500×560 canvas)
const STATE_POS = {
  "Rajasthan":{cx:158,cy:178},"Gujarat":{cx:112,cy:238},"Maharashtra":{cx:172,cy:302},
  "Chhattisgarh":{cx:272,cy:252},"Odisha":{cx:318,cy:260},
  "Delhi":{cx:204,cy:132},"Uttar Pradesh":{cx:268,cy:158},"Bihar":{cx:332,cy:178},
  "West Bengal":{cx:362,cy:208},"Madhya Pradesh":{cx:228,cy:218},
  "Jharkhand":{cx:328,cy:218},"Karnataka":{cx:188,cy:388},"Tamil Nadu":{cx:218,cy:442},
  "Telangana":{cx:238,cy:338},"Kerala":{cx:175,cy:448},"Punjab":{cx:162,cy:98},
};

// ── UTILS ────────────────────────────────────────────────────────────────────
const fmtVal  = v => v>=10000000?`₹${(v/10000000).toFixed(2)}Cr`:v>=100000?`₹${(v/100000).toFixed(1)}L`:`₹${(v||0).toLocaleString("en-IN")}`;
const fmtQty  = v => v>=1000?`${(v/1000).toFixed(1)}K MT`:`${v} MT`;
const fmtRate = v => `₹${(v||0).toLocaleString("en-IN")}/MT`;
const fmtPct  = v => `${v>0?"+":""}${(v||0).toFixed(1)}%`;

function linReg(ys) {
  const n=ys.length; if(n<2) return {predict:x=>ys[0]||0};
  const sx=ys.reduce((s,_,i)=>s+i,0),sy=ys.reduce((s,v)=>s+v,0);
  const sxy=ys.reduce((s,v,i)=>s+i*v,0),sx2=ys.reduce((s,_,i)=>s+i*i,0);
  const m=(n*sxy-sx*sy)/(n*sx2-sx*sx||1);
  const b=(sy-m*sx)/n;
  return {m,b,predict:x=>Math.max(0,Math.round(m*x+b))};
}

function movingAvg(arr,key,w=3) {
  return arr.map((d,i)=>{
    const sl=arr.slice(Math.max(0,i-w+1),i+1);
    return {...d,[`${key}_ma`]:Math.round(sl.reduce((s,x)=>s+x[key],0)/sl.length)};
  });
}

function computeRFM(customers,allData) {
  const lastMI = d => MONTHS_ORD.indexOf(d.month);
  return customers.map(c=>{
    const rows=allData.filter(d=>d.customer===c.customer);
    const recency = 11-Math.max(...rows.map(lastMI));
    return {...c,recency,frequency:rows.length,monetary:c.value};
  });
}

function rfmSegment(rec,freq,mon,allRec,allFreq,allMon) {
  const pct=(v,a)=>a.length?a.filter(x=>x<=v).length/a.length:0;
  const r=Math.round(5-(pct(rec,allRec)*4));
  const f=Math.round(1+pct(freq,allFreq)*4);
  const m=Math.round(1+pct(mon,allMon)*4);
  const avg=(r+f+m)/3;
  if(avg>=4.2) return {label:"Champion",color:"#10B981",icon:"👑"};
  if(avg>=3.2&&f>=3) return {label:"Loyal",color:"#06B6D4",icon:"💎"};
  if(avg>=3.2) return {label:"Potential",color:"#F59E0B",icon:"⭐"};
  if(r<=2&&m>=3) return {label:"At Risk",color:"#EF4444",icon:"⚠️"};
  if(r<=2) return {label:"Lapsed",color:"#64748B",icon:"💤"};
  return {label:"New",color:"#8B5CF6",icon:"🆕"};
}

function computeAlerts(baseData,fyList,thresholdPct,rateFloor) {
  const alerts=[];
  if(fyList.length<2) return alerts;
  const [prevFY,curFY]=[fyList[fyList.length-2],fyList[fyList.length-1]];
  const prev=baseData.filter(d=>d.fy===prevFY);
  const curr=baseData.filter(d=>d.fy===curFY);
  // Customer volume drops
  const custsPrev=[...new Set(prev.map(d=>d.customer))];
  custsPrev.forEach(c=>{
    const pV=prev.filter(d=>d.customer===c).reduce((s,d)=>s+d.qty,0);
    const cV=curr.filter(d=>d.customer===c).reduce((s,d)=>s+d.qty,0);
    if(cV===0){alerts.push({type:"danger",icon:"🚨",msg:`${c}: No orders in ${curFY}`,detail:`Was ${fmtQty(pV)} in ${prevFY}`,value:null});}
    else if(pV>0&&(pV-cV)/pV*100>thresholdPct){alerts.push({type:"warning",icon:"📉",msg:`${c}: Volume dropped ${((pV-cV)/pV*100).toFixed(0)}%`,detail:`${fmtQty(pV)} → ${fmtQty(cV)}`,value:-(pV-cV)/pV*100});}
  });
  // Rate floor breach
  const matList=[...new Set(curr.map(d=>d.material))];
  matList.forEach(m=>{
    const rows=curr.filter(d=>d.material===m);
    const avgRate=rows.length?Math.round(rows.reduce((s,d)=>s+d.rate,0)/rows.length):0;
    if(avgRate>0&&avgRate<rateFloor){alerts.push({type:"info",icon:"💰",msg:`${m}: Avg rate ₹${avgRate}/MT below floor`,detail:`Floor set at ₹${rateFloor}/MT`,value:avgRate});}
  });
  // Customers buying in prev but not in last 3 months of curr
  const currMonths=[...new Set(curr.map(d=>d.month))];
  const lastMonths=MONTHS_ORD.filter(m=>currMonths.includes(m)).slice(-3);
  const recentCusts=new Set(curr.filter(d=>lastMonths.includes(d.month)).map(d=>d.customer));
  custsPrev.forEach(c=>{
    if(curr.some(d=>d.customer===c)&&!recentCusts.has(c)){
      alerts.push({type:"warning",icon:"🔕",msg:`${c}: No invoice in last 3 months`,detail:"Potential churn risk",value:null});
    }
  });
  return alerts;
}

function computeTopMovers(baseData,fyList) {
  if(fyList.length<2) return {gainers:[],losers:[]};
  const [prevFY,curFY]=[fyList[fyList.length-2],fyList[fyList.length-1]];
  const prev=baseData.filter(d=>d.fy===prevFY);
  const curr=baseData.filter(d=>d.fy===curFY);
  const mats=[...new Set(baseData.map(d=>d.material))];
  const movers=mats.map(m=>{
    const pV=prev.filter(d=>d.material===m).reduce((s,d)=>s+d.total,0);
    const cV=curr.filter(d=>d.material===m).reduce((s,d)=>s+d.total,0);
    const pct=pV>0?(cV-pV)/pV*100:cV>0?100:0;
    return {name:m,prevVal:pV,currVal:cV,pct,type:"material"};
  }).filter(d=>d.prevVal>0||d.currVal>0).sort((a,b)=>b.pct-a.pct);
  return {gainers:movers.filter(d=>d.pct>0).slice(0,3),losers:movers.filter(d=>d.pct<0).slice(0,3)};
}

// ── CUSTOM TOOLTIP ────────────────────────────────────────────────────────────
const CTip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:"rgba(6,10,20,0.97)",border:"1px solid rgba(245,158,11,0.25)",borderRadius:10,padding:"10px 14px",fontSize:12,boxShadow:"0 8px 32px rgba(0,0,0,0.6)"}}>
      <p style={{margin:"0 0 6px",color:"#F59E0B",fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{label}</p>
      {payload.map((p,i)=>(
        <p key={i} style={{margin:"2px 0",color:p.color||"#F1F5F9"}}>
          <span style={{color:"#475569"}}>{p.name}: </span>
          <span style={{fontWeight:700}}>
            {p.name?.includes("Rate")||p.name?.includes("rate")?fmtRate(p.value):p.name?.includes("Qty")||p.name?.includes("qty")?fmtQty(p.value):p.name?.includes("YoY")||p.name?.includes("pct")||p.name?.includes("MA_")?`${p.value?.toFixed?.(1)}%`:fmtVal(p.value)}
          </span>
        </p>
      ))}
    </div>
  );
};

// ── ANIMATED COUNTER ──────────────────────────────────────────────────────────
const AnimNum = ({value,fmt=v=>v}) => {
  const [d,setD]=useState(0); const t=useRef();
  useEffect(()=>{
    let s=0; clearInterval(t.current);
    t.current=setInterval(()=>{s+=value/60;if(s>=value){setD(value);clearInterval(t.current);}else setD(Math.floor(s));},16);
    return ()=>clearInterval(t.current);
  },[value]);
  return <span>{fmt(d)}</span>;
};

// ── SPARKLINE ─────────────────────────────────────────────────────────────────
const Spark = ({data=[],color="#F59E0B"}) => {
  if(!data.length) return null;
  const max=Math.max(...data),min=Math.min(...data),w=72,h=28;
  const pts=data.map((v,i)=>`${(i/(data.length-1||1))*w},${h-((v-min)/(max-min||1))*h}`).join(" ");
  const last=pts.split(" ").at(-1)?.split(",");
  return <svg width={w} height={h} style={{overflow:"visible"}}>
    <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round"/>
    {last&&<circle cx={last[0]} cy={last[1]} r={2.5} fill={color}/>}
  </svg>;
};

// ── INDIA BUBBLE MAP ──────────────────────────────────────────────────────────
const IndiaMap = ({regionData}) => {
  const [hov,setHov]=useState(null);
  const maxV=Math.max(...regionData.map(d=>d.value),1);
  return (
    <svg viewBox="0 0 500 560" style={{width:"100%",maxHeight:380,display:"block"}}>
      {/* simplified India outline */}
      <path d="M175,42 L208,38 L248,43 L288,49 L330,52 L368,42 L398,50 L428,65 L450,90 L460,120 L457,148 L448,170 L435,190 L420,202 L406,198 L392,206 L375,200 L360,210 L345,218 L330,222 L318,232 L315,255 L322,278 L328,298 L312,320 L295,338 L275,358 L258,382 L248,412 L235,442 L220,462 L202,478 L185,462 L168,435 L158,402 L148,368 L142,335 L132,308 L115,285 L105,258 L112,235 L100,212 L90,182 L98,158 L114,138 L130,125 L150,115 L165,102 L170,85 L162,65 L172,50 Z"
        fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.1)" strokeWidth={1}/>
      {/* context state dots */}
      {Object.entries(STATE_POS).map(([s,p])=>!regionData.find(d=>d.region===s)&&(
        <circle key={s} cx={p.cx} cy={p.cy} r={3.5} fill="rgba(255,255,255,0.06)"/>
      ))}
      {/* data bubbles */}
      {regionData.map(d=>{
        const pos=STATE_POS[d.region]; if(!pos) return null;
        const r=14+(d.value/maxV)*42;
        const c=REG_COLOR[d.region]||"#F59E0B";
        const ih=hov===d.region;
        const share=(d.value/maxV*100).toFixed(0);
        return (
          <g key={d.region} onMouseEnter={()=>setHov(d.region)} onMouseLeave={()=>setHov(null)} style={{cursor:"pointer"}}>
            <circle cx={pos.cx} cy={pos.cy} r={r+6} fill={`${c}10`} stroke={`${c}25`} strokeWidth={1}/>
            <circle cx={pos.cx} cy={pos.cy} r={r} fill={ih?`${c}cc`:`${c}88`} stroke={c} strokeWidth={ih?2:1} style={{transition:"all 0.2s"}}/>
            <text x={pos.cx} y={pos.cy+3} textAnchor="middle" fontSize={8} fill="#fff" fontWeight={700} fontFamily="'Space Mono',monospace">{fmtVal(d.value).replace("₹","")}</text>
            {ih&&(
              <g>
                <rect x={pos.cx-62} y={pos.cy-r-44} width={124} height={38} rx={7} fill="rgba(6,10,20,0.97)" stroke={c} strokeWidth={1}/>
                <text x={pos.cx} y={pos.cy-r-28} textAnchor="middle" fontSize={10} fill={c} fontWeight={700} fontFamily="'Syne',sans-serif">{d.region}</text>
                <text x={pos.cx} y={pos.cy-r-14} textAnchor="middle" fontSize={9} fill="#94A3B8" fontFamily="'Space Mono',monospace">{fmtQty(d.qty)} · {fmtVal(d.value)}</text>
              </g>
            )}
            <text x={pos.cx} y={pos.cy+r+12} textAnchor="middle" fontSize={8} fill={c} fontWeight={600}>{d.region}</text>
          </g>
        );
      })}
      {/* legend */}
      <text x={15} y={548} fontSize={9} fill="#334155" fontFamily="'Syne',sans-serif">Bubble size = sales value · Hover for details</text>
    </svg>
  );
};

// ── SANKEY DIAGRAM ────────────────────────────────────────────────────────────
const SankeyDiagram = ({data,matData,regionData,custData}) => {
  const W=680,H=380,NW=12,GAP=16;
  const layout=(items,x,idFn,valFn,colorFn)=>{
    const total=items.reduce((s,d)=>s+valFn(d),1);
    const usable=H-GAP*(items.length-1);
    let y=0;
    return items.map(d=>{
      const h=Math.max(18,(valFn(d)/total)*usable);
      const node={id:idFn(d),x,y,h,w:NW,val:valFn(d),label:idFn(d).split("-").slice(1).join("-"),color:colorFn(d)};
      y+=h+GAP; return node;
    });
  };
  const mNodes=layout(matData,20,d=>`m-${d.material}`,d=>d.value,d=>MAT_COLOR[d.material]||"#F59E0B");
  const rNodes=layout(regionData,(W-NW)/2,d=>`r-${d.region}`,d=>d.value,d=>REG_COLOR[d.region]||"#06B6D4");
  const cNodes=layout(custData.slice(0,6),W-NW-20,d=>`c-${d.customer}`,d=>d.value,()=>"#8B5CF6");
  const nodeMap=Object.fromEntries([...mNodes,...rNodes,...cNodes].map(n=>[n.id,n]));
  const used=Object.fromEntries(Object.keys(nodeMap).map(k=>[k,{out:0,in:0}]));

  const buildFlows=(pairs,fromKey,toKey,fromPre,toPre)=>pairs.flatMap(([from,to])=>{
    const v=data.filter(d=>d[fromKey]===from&&d[toKey]===to).reduce((s,d)=>s+d.total,0);
    if(!v) return [];
    const sN=nodeMap[`${fromPre}-${from}`],tN=nodeMap[`${toPre}-${to}`];
    if(!sN||!tN) return [];
    const sw=(v/sN.val)*sN.h, tw=(v/tN.val)*tN.h;
    const y0=sN.y+used[sN.id].out, y1=tN.y+used[tN.id].in;
    used[sN.id].out+=sw; used[tN.id].in+=tw;
    const mx=(sN.x+sN.w+tN.x)/2;
    return [{d:`M${sN.x+sN.w},${y0+sw/2} C${mx},${y0+sw/2} ${mx},${y1+tw/2} ${tN.x},${y1+tw/2}`,color:sN.color,w:Math.max(1.5,Math.min(sw,tw))}];
  });

  const matPairs=matData.flatMap(m=>regionData.map(r=>[m.material,r.region]));
  const regPairs=regionData.flatMap(r=>custData.slice(0,6).map(c=>[r.region,c.customer]));
  const flows1=buildFlows(matPairs,"material","region","m","r");
  const flows2=buildFlows(regPairs,"region","customer","r","c");

  return (
    <svg viewBox={`0 0 ${W} ${H+30}`} style={{width:"100%",overflow:"visible"}}>
      {[...flows1,...flows2].map((f,i)=>(
        <path key={i} d={f.d} fill="none" stroke={f.color} strokeWidth={f.w} strokeOpacity={0.35}/>
      ))}
      {[...mNodes,...rNodes,...cNodes].map(n=>(
        <g key={n.id}>
          <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={3} fill={n.color} fillOpacity={0.85}/>
          {n.x<W/3&&<text x={n.x+n.w+7} y={n.y+n.h/2+4} fontSize={9} fill="#94A3B8" fontFamily="'Syne',sans-serif">{n.label.length>12?n.label.slice(0,11)+"…":n.label}</text>}
          {n.x>W*2/3&&<text x={n.x-7} y={n.y+n.h/2+4} fontSize={9} fill="#94A3B8" textAnchor="end" fontFamily="'Syne',sans-serif">{n.label.length>14?n.label.slice(0,13)+"…":n.label}</text>}
          {n.x>=W/3&&n.x<=W*2/3&&<text x={n.x+n.w/2} y={n.y-6} fontSize={9} fill="#94A3B8" textAnchor="middle" fontFamily="'Syne',sans-serif">{n.label.length>10?n.label.slice(0,9)+"…":n.label}</text>}
        </g>
      ))}
      {[["Materials",30],["Regions",W/2],["Customers",W-30]].map(([l,x])=>(
        <text key={l} x={x} y={H+22} textAnchor="middle" fontSize={10} fill="#475569" fontFamily="'Syne',sans-serif" fontWeight={700} letterSpacing={1}>{l.toUpperCase()}</text>
      ))}
    </svg>
  );
};

// ── TAG / CHIP ────────────────────────────────────────────────────────────────
const Tag = ({label,color="#F59E0B",onRemove,small}) => (
  <span style={{display:"inline-flex",alignItems:"center",gap:5,background:`${color}18`,color,border:`1px solid ${color}30`,borderRadius:20,padding:small?"2px 8px":"3px 10px",fontSize:small?10:11,fontWeight:700,whiteSpace:"nowrap"}}>
    {label}{onRemove&&<span onClick={onRemove} style={{cursor:"pointer",opacity:0.7,marginLeft:2}}>×</span>}
  </span>
);

// ── PROGRESS BAR ──────────────────────────────────────────────────────────────
const PBar = ({pct,color}) => (
  <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden",marginTop:5}}>
    <div style={{width:`${Math.min(pct,100)}%`,height:"100%",background:`linear-gradient(90deg,${color}66,${color})`,borderRadius:4,transition:"width 1s ease"}}/>
  </div>
);

const TH = ({l,right,onClick,sorted}) => (
  <th onClick={onClick} style={{padding:"9px 13px",color:sorted?"#F59E0B":"#475569",fontWeight:700,fontSize:10,textAlign:right?"right":"left",textTransform:"uppercase",letterSpacing:1,whiteSpace:"nowrap",borderBottom:"1px solid rgba(255,255,255,0.07)",cursor:onClick?"pointer":"default",userSelect:"none"}}>
    {l}{sorted?" ↓":""}
  </th>
);
const TD = ({children,right,bold,color,mono}) => (
  <td style={{padding:"9px 13px",textAlign:right?"right":"left",fontWeight:bold?700:400,color:color||"#CBD5E1",fontFamily:mono?"'Space Mono',monospace":"'Syne',sans-serif",fontSize:12}}>
    {children}
  </td>
);

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
const TABS = [
  {id:"overview", label:"Overview",    icon:"◈"},
  {id:"material", label:"Materials",   icon:"⬡"},
  {id:"customers",label:"Customers",   icon:"◎"},
  {id:"rates",    label:"Forecast",    icon:"◉"},
  {id:"intel",    label:"Intelligence",icon:"⚡"},
  {id:"geo",      label:"Geo & Flow",  icon:"🌍"},
];

export default function Dashboard() {
  const [tab,          setTab]        = useState("overview");
  const [filterFY,     setFY]         = useState("All");
  const [filterMat,    setMat]        = useState("All");
  const [filterCust,   setCust]       = useState("All");
  const [filterRegion, setRegion]     = useState("All");
  const [filterMonth,  setMonth]      = useState("All");
  const [monthFrom,    setMonthFrom]  = useState("All");
  const [monthTo,      setMonthTo]    = useState("All");
  const [filtersOpen,  setFiltersOpen]= useState(false);
  const [compareMode,  setCompareMode]= useState(false);
  const [compareFY1,   setCFY1]       = useState("");
  const [compareFY2,   setCFY2]       = useState("");
  const [drillMat,     setDrillMat]   = useState(null);
  const [sortCust,     setSortCust]   = useState("value");
  const [custSearch,   setCustSearch] = useState("");
  const [showForecast, setShowForecast]=useState(true);
  const [showMA,       setShowMA]     = useState(true);
  const [alertPct,     setAlertPct]   = useState(20);
  const [rateFloor,    setRateFloor]  = useState(500);
  const [copyMsg,      setCopyMsg]    = useState("");

  // Inject styles & fonts once
  useEffect(()=>{
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap";
    document.head.appendChild(link);
    const s=document.createElement("style");
    s.textContent=`
      *{box-sizing:border-box;margin:0;padding:0;}:root{color-scheme:dark;}body{background:#060A14;}
      ::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(245,158,11,0.3);border-radius:2px;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
      @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
      .card{animation:fadeUp 0.35s ease both;}.nav-item:hover{background:rgba(245,158,11,0.07)!important;}
      .row-h:hover{background:rgba(245,158,11,0.04)!important;}
      select option{background:#0D1B2A;}
      @media print{.no-print{display:none!important;}.print-area{padding:0!important;}}
    `;
    document.head.appendChild(s);
    // Restore filters from URL hash
    try{
      const hash=window.location.hash.slice(1);
      if(hash){const f=JSON.parse(atob(hash));setFY(f.fy||"All");setMat(f.mat||"All");setCust(f.cust||"All");setRegion(f.reg||"All");setMonth(f.mon||"All");}
    }catch(e){}
    return ()=>{document.head.removeChild(link);document.head.removeChild(s);};
  },[]);

  // Sync filters → URL hash
  useEffect(()=>{
    const obj={fy:filterFY,mat:filterMat,cust:filterCust,reg:filterRegion,mon:filterMonth};
    const allDefault=Object.values(obj).every(v=>v==="All");
    window.location.hash=allDefault?"":btoa(JSON.stringify(obj));
  },[filterFY,filterMat,filterCust,filterRegion,filterMonth]);

  const liveRows=useGoogleSheets();
  const baseData=liveRows?.length?liveRows:RAW_DATA;

  const FY_LIST  =useMemo(()=>[...new Set(baseData.map(d=>d.fy))].sort(),[baseData]);
  const MAT_LIST =useMemo(()=>[...new Set(baseData.map(d=>d.material))]   ,[baseData]);
  const CUST_LIST=useMemo(()=>[...new Set(baseData.map(d=>d.customer))].sort(),[baseData]);
  const REG_LIST =useMemo(()=>[...new Set(baseData.map(d=>d.region))]     ,[baseData]);

  // Date range filter
  const inRange=useCallback(d=>{
    if(monthFrom==="All"&&monthTo==="All") return true;
    const i=MONTHS_ORD.indexOf(d.month);
    const f=monthFrom==="All"?0:MONTHS_ORD.indexOf(monthFrom);
    const t=monthTo==="All"?11:MONTHS_ORD.indexOf(monthTo);
    return i>=f&&i<=t;
  },[monthFrom,monthTo]);

  const data=useMemo(()=>baseData.filter(d=>
    (filterFY==="All"||d.fy===filterFY)&&
    (filterMat==="All"||d.material===filterMat)&&
    (filterCust==="All"||d.customer===filterCust)&&
    (filterRegion==="All"||d.region===filterRegion)&&
    (filterMonth==="All"||d.month===filterMonth)&&
    inRange(d)
  ),[baseData,filterFY,filterMat,filterCust,filterRegion,filterMonth,inRange]);

  const totalQty  =data.reduce((s,d)=>s+d.qty,0);
  const totalValue=data.reduce((s,d)=>s+d.total,0);
  const avgRate   =data.length?Math.round(data.reduce((s,d)=>s+d.rate,0)/data.length):0;
  const uniqCust  =new Set(data.map(d=>d.customer)).size;

  const fyAgg=useMemo(()=>FY_LIST.map(fy=>{
    const r=baseData.filter(d=>d.fy===fy);
    return {fy,qty:r.reduce((s,d)=>s+d.qty,0),value:r.reduce((s,d)=>s+d.total,0),count:r.length};
  }),[FY_LIST,baseData]);
  const fyBar=useMemo(()=>fyAgg.map((d,i)=>({...d,yoy:i===0?null:+((d.value-fyAgg[i-1].value)/fyAgg[i-1].value*100).toFixed(1)})),[fyAgg]);

  const rawMonthly=useMemo(()=>MONTHS_ORD.map(m=>{
    const r=data.filter(d=>d.month===m);
    return {month:m,qty:r.reduce((s,d)=>s+d.qty,0),value:r.reduce((s,d)=>s+d.total,0),rate:r.length?Math.round(r.reduce((s,d)=>s+d.rate,0)/r.length):0,count:r.length};
  }).filter(d=>d.qty>0),[data]);

  // Moving average + MoM %
  const monthlyData=useMemo(()=>{
    const withMA=movingAvg(movingAvg(rawMonthly,"qty"),"value");
    return withMA.map((d,i)=>{
      const prev=withMA[i-1];
      return {...d,mom_qty:prev&&prev.qty?+((d.qty-prev.qty)/prev.qty*100).toFixed(1):null,mom_val:prev&&prev.value?+((d.value-prev.value)/prev.value*100).toFixed(1):null};
    });
  },[rawMonthly]);

  // Forecast
  const forecastData=useMemo(()=>{
    if(!showForecast||monthlyData.length<2) return monthlyData;
    const seenIdxs=monthlyData.map(d=>MONTHS_ORD.indexOf(d.month));
    const maxIdx=Math.max(...seenIdxs);
    const remaining=MONTHS_ORD.slice(maxIdx+1);
    if(!remaining.length) return monthlyData;
    const reg=linReg(monthlyData.map(d=>d.qty));
    const regV=linReg(monthlyData.map(d=>d.value));
    const forecast=remaining.map((m,i)=>({month:m,qty:null,value:null,forecastQty:reg.predict(monthlyData.length+i),forecastVal:regV.predict(monthlyData.length+i)}));
    const last=monthlyData[monthlyData.length-1];
    return [...monthlyData.map((d,i)=>({...d,forecastQty:i===monthlyData.length-1?d.qty:null,forecastVal:i===monthlyData.length-1?d.value:null})),{...last,...forecast[0]??{},forecastQty:forecast[0]?.forecastQty,month:forecast[0]?.month||last.month},...forecast.slice(1)];
  },[monthlyData,showForecast]);

  // FY Comparison data
  const compareData=useMemo(()=>{
    if(!compareMode||!compareFY1||!compareFY2) return [];
    const fy1=baseData.filter(d=>d.fy===compareFY1);
    const fy2=baseData.filter(d=>d.fy===compareFY2);
    return MONTHS_ORD.map(m=>({
      month:m,
      [compareFY1]:fy1.filter(d=>d.month===m).reduce((s,d)=>s+d.total,0)||null,
      [compareFY2]:fy2.filter(d=>d.month===m).reduce((s,d)=>s+d.total,0)||null,
    })).filter(d=>d[compareFY1]||d[compareFY2]);
  },[compareMode,compareFY1,compareFY2,baseData]);

  // Rate heatmap
  const rateByMonth=useMemo(()=>MONTHS_ORD.map(m=>{
    const row={month:m};
    MAT_LIST.forEach(mat=>{const r=data.filter(d=>d.month===m&&d.material===mat);row[mat]=r.length?Math.round(r.reduce((s,d)=>s+d.rate,0)/r.length):null;});
    return row;
  }).filter(d=>MAT_LIST.some(m=>d[m])),[MAT_LIST,data]);

  const matData=useMemo(()=>MAT_LIST.map(m=>{
    const r=data.filter(d=>d.material===m);
    return {material:m,qty:r.reduce((s,d)=>s+d.qty,0),value:r.reduce((s,d)=>s+d.total,0),rate:r.length?Math.round(r.reduce((s,d)=>s+d.rate,0)/r.length):0,count:r.length};
  }).filter(d=>d.qty>0).sort((a,b)=>b.value-a.value),[MAT_LIST,data]);

  const custRaw=useMemo(()=>{
    let arr=CUST_LIST.map(c=>{
      const r=data.filter(d=>d.customer===c);
      return {customer:c,qty:r.reduce((s,d)=>s+d.qty,0),value:r.reduce((s,d)=>s+d.total,0),count:r.length,region:r[0]?.region||""};
    }).filter(d=>d.qty>0);
    if(custSearch) arr=arr.filter(c=>c.customer.toLowerCase().includes(custSearch.toLowerCase()));
    return arr.sort((a,b)=>b[sortCust]-a[sortCust]);
  },[CUST_LIST,data,custSearch,sortCust]);

  const rfmData=useMemo(()=>{
    const raw=computeRFM(custRaw,baseData);
    const allR=raw.map(d=>d.recency),allF=raw.map(d=>d.frequency),allM=raw.map(d=>d.monetary);
    return raw.map(d=>({...d,seg:rfmSegment(d.recency,d.frequency,d.monetary,allR,allF,allM)}));
  },[custRaw,baseData]);

  const regionData=useMemo(()=>REG_LIST.map(r=>{
    const rows=data.filter(d=>d.region===r);
    return {region:r,qty:rows.reduce((s,d)=>s+d.qty,0),value:rows.reduce((s,d)=>s+d.total,0)};
  }).filter(d=>d.qty>0).sort((a,b)=>b.value-a.value),[REG_LIST,data]);

  const alerts=useMemo(()=>computeAlerts(baseData,FY_LIST,alertPct,rateFloor),[baseData,FY_LIST,alertPct,rateFloor]);
  const movers=useMemo(()=>computeTopMovers(baseData,FY_LIST),[baseData,FY_LIST]);

  // Invoice gap: customers with no invoice in last 3 months
  const gapCustomers=useMemo(()=>{
    const withInvoices=custRaw.filter(c=>{
      const rows=baseData.filter(d=>d.customer===c.customer);
      const lastMI=Math.max(...rows.map(d=>MONTHS_ORD.indexOf(d.month)));
      return 11-lastMI>2;
    });
    return withInvoices;
  },[custRaw,baseData]);

  const activeFilters=[
    filterFY!=="All"&&{label:filterFY,clear:()=>setFY("All")},
    filterMat!=="All"&&{label:filterMat,clear:()=>setMat("All")},
    filterCust!=="All"&&{label:filterCust,clear:()=>setCust("All")},
    filterRegion!=="All"&&{label:filterRegion,clear:()=>setRegion("All")},
    filterMonth!=="All"&&{label:filterMonth,clear:()=>setMonth("All")},
    drillMat&&{label:`Drill: ${drillMat}`,clear:()=>{setDrillMat(null);setMat("All");}},
  ].filter(Boolean);

  // Export CSV
  const exportCSV=()=>{
    const cols=["inv","date","month","year","fy","customer","material","qty","rate","total","region"];
    const rows=[cols.join(","),...data.map(d=>cols.map(c=>`"${d[c]}"`).join(","))];
    const blob=new Blob([rows.join("\n")],{type:"text/csv"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="sfg_sales.csv"; a.click();
  };

  // Copy shareable link
  const copyLink=()=>{
    navigator.clipboard.writeText(window.location.href).then(()=>{setCopyMsg("Copied!");setTimeout(()=>setCopyMsg(""),2000);});
  };

  // Drill-down handler
  const handleDrillMat=useCallback(mat=>{
    if(drillMat===mat){setDrillMat(null);setMat("All");}
    else{setDrillMat(mat);setMat(mat);}
  },[drillMat]);

  const FS=({label,val,set,opts})=>(
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      <label style={{fontSize:10,color:"#64748B",fontWeight:700,letterSpacing:1.2,textTransform:"uppercase"}}>{label}</label>
      <select value={val} onChange={e=>set(e.target.value)} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"#CBD5E1",borderRadius:8,padding:"7px 11px",fontSize:12,cursor:"pointer",outline:"none",fontFamily:"'Syne',sans-serif"}}>
        {["All",...opts].map(o=><option key={o} value={o}>{o==="All"?`All ${label}s`:o}</option>)}
      </select>
    </div>
  );

  const Card=({children,style={},delay=0})=>(
    <div className="card" style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:20,animationDelay:`${delay}ms`,...style}}>{children}</div>
  );

  const SecTitle=({title,sub,right})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
      <div>
        <div style={{fontSize:13,fontWeight:700,color:"#CBD5E1",letterSpacing:0.3}}>{title}</div>
        {sub&&<div style={{fontSize:11,color:"#475569",marginTop:3}}>{sub}</div>}
      </div>
      {right}
    </div>
  );

  const monthlyQtySpark=MONTHS_ORD.map(m=>data.filter(d=>d.month===m).reduce((s,d)=>s+d.qty,0)).filter(Boolean);
  const monthlyValSpark=MONTHS_ORD.map(m=>data.filter(d=>d.month===m).reduce((s,d)=>s+d.total,0)).filter(Boolean);
  const monthlyRateSpark=MONTHS_ORD.map(m=>{const r=data.filter(d=>d.month===m);return r.length?Math.round(r.reduce((s,d)=>s+d.rate,0)/r.length):0;}).filter(Boolean);

  return (
    <div style={{minHeight:"100vh",background:"#060A14",color:"#E2E8F0",fontFamily:"'Syne',sans-serif",display:"flex"}}>

      {/* ── SIDEBAR ── */}
      <div className="no-print" style={{width:216,minHeight:"100vh",background:"rgba(255,255,255,0.018)",borderRight:"1px solid rgba(255,255,255,0.06)",flexShrink:0,position:"sticky",top:0,height:"100vh",display:"flex",flexDirection:"column",zIndex:60}}>
        <div style={{padding:"22px 18px 18px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#F59E0B,#FBBF24)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:"0 4px 16px rgba(245,158,11,0.4)"}}>⚙</div>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:"#F1F5F9",lineHeight:1.2}}>SFG Analytics</div>
              <div style={{fontSize:9,color:"#475569",letterSpacing:1.5,textTransform:"uppercase"}}>Pro Dashboard</div>
            </div>
          </div>
        </div>

        <nav style={{padding:"14px 10px",flex:1,overflowY:"auto"}}>
          <div style={{fontSize:9,color:"#334155",letterSpacing:1.8,textTransform:"uppercase",fontWeight:700,paddingLeft:10,marginBottom:8}}>Navigation</div>
          {TABS.map(t=>(
            <button key={t.id} className="nav-item" onClick={()=>setTab(t.id)} style={{width:"100%",background:tab===t.id?"rgba(245,158,11,0.12)":"transparent",border:tab===t.id?"1px solid rgba(245,158,11,0.25)":"1px solid transparent",color:tab===t.id?"#FBBF24":"#64748B",borderRadius:10,padding:"10px 12px",cursor:"pointer",textAlign:"left",fontSize:13,fontWeight:tab===t.id?700:500,display:"flex",alignItems:"center",gap:10,marginBottom:4,transition:"all 0.2s",fontFamily:"'Syne',sans-serif"}}>
              <span style={{fontSize:15,opacity:tab===t.id?1:0.7}}>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>

        <div style={{padding:"14px 18px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#10B981",animation:"pulse 2s infinite",display:"block"}}/>
            <span style={{fontSize:10,color:"#10B981",fontWeight:700}}>LIVE · AUTO REFRESH</span>
          </div>
          <div style={{fontSize:10,color:"#334155"}}>{baseData.length} records · FY 2023–25</div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{flex:1,minWidth:0}}>
        {/* Top Bar */}
        <div className="no-print" style={{background:"rgba(6,10,20,0.92)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"13px 26px",position:"sticky",top:0,zIndex:50}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
            <div>
              <h1 style={{fontSize:17,fontWeight:800,color:"#F1F5F9",margin:0}}>{TABS.find(t=>t.id===tab)?.label}</h1>
              <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap"}}>
                {activeFilters.length?activeFilters.map((f,i)=><Tag key={i} label={f.label} onRemove={f.clear} small/>):<span style={{fontSize:11,color:"#334155"}}>No filters · showing all data</span>}
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              {/* Export buttons */}
              <button onClick={exportCSV} style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",color:"#10B981",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'Syne',sans-serif"}}>↓ CSV</button>
              <button onClick={()=>window.print()} style={{background:"rgba(139,92,246,0.1)",border:"1px solid rgba(139,92,246,0.3)",color:"#8B5CF6",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'Syne',sans-serif"}}>🖨 Print</button>
              <button onClick={copyLink} style={{background:"rgba(6,182,212,0.1)",border:"1px solid rgba(6,182,212,0.3)",color:"#06B6D4",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'Syne',sans-serif"}}>{copyMsg||"🔗 Share"}</button>
              <button onClick={()=>setFiltersOpen(o=>!o)} style={{background:filtersOpen?"rgba(245,158,11,0.15)":"rgba(255,255,255,0.05)",border:filtersOpen?"1px solid rgba(245,158,11,0.4)":"1px solid rgba(255,255,255,0.1)",color:filtersOpen?"#FBBF24":"#94A3B8",borderRadius:10,padding:"8px 16px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Syne',sans-serif",display:"flex",alignItems:"center",gap:7}}>
                ⊞ Filters {activeFilters.length>0&&<span style={{background:"#F59E0B",color:"#000",borderRadius:"50%",width:16,height:16,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10}}>{activeFilters.length}</span>}
              </button>
            </div>
          </div>
          {filtersOpen&&(
            <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.06)",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,animation:"fadeUp 0.2s ease"}}>
              <FS label="FY Year"   val={filterFY}     set={setFY}     opts={FY_LIST}/>
              <FS label="Material"  val={filterMat}    set={setMat}    opts={MAT_LIST}/>
              <FS label="Customer"  val={filterCust}   set={setCust}   opts={CUST_LIST}/>
              <FS label="Region"    val={filterRegion} set={setRegion} opts={REG_LIST}/>
              <FS label="Month"     val={filterMonth}  set={setMonth}  opts={MONTHS_ORD}/>
              {/* Date range */}
              <FS label="From Month" val={monthFrom} set={setMonthFrom} opts={MONTHS_ORD}/>
              <FS label="To Month"   val={monthTo}   set={setMonthTo}   opts={MONTHS_ORD}/>
              <div style={{display:"flex",alignItems:"flex-end"}}>
                <button onClick={()=>{setFY("All");setMat("All");setCust("All");setRegion("All");setMonth("All");setMonthFrom("All");setMonthTo("All");setDrillMat(null);}} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#F87171",borderRadius:8,padding:"8px 14px",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"'Syne',sans-serif",width:"100%"}}>✕ Clear All</button>
              </div>
            </div>
          )}
        </div>

        <div className="print-area" style={{padding:"22px 26px"}}>

          {/* ══════════ OVERVIEW ══════════ */}
          {tab==="overview"&&(
            <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:18}}>
                {[
                  {label:"Total Dispatched",  value:totalQty,   fmt:fmtQty,  icon:"🚛",color:"#F59E0B",spark:monthlyQtySpark},
                  {label:"Total Sales Value",  value:totalValue, fmt:fmtVal,  icon:"₹", color:"#06B6D4",spark:monthlyValSpark},
                  {label:"Avg Rate / MT",      value:avgRate,    fmt:fmtRate, icon:"◈", color:"#8B5CF6",spark:monthlyRateSpark},
                  {label:"Active Customers",   value:uniqCust,   fmt:v=>`${v}`,icon:"◎",color:"#10B981",spark:[]},
                ].map((k,i)=>(
                  <div key={i} className="card" style={{background:`linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))`,border:`1px solid ${k.color}22`,borderRadius:16,padding:"20px 20px",animationDelay:`${i*70}ms`,position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:-25,right:-18,width:90,height:90,borderRadius:"50%",background:`radial-gradient(circle,${k.color}14,transparent)`}}/>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{fontSize:11,color:"#475569",fontWeight:700,textTransform:"uppercase",letterSpacing:1.1}}>{k.label}</div>
                      <span style={{fontSize:17,opacity:0.7}}>{k.icon}</span>
                    </div>
                    <div style={{fontSize:24,fontWeight:800,color:k.color,margin:"10px 0 4px",fontFamily:"'Space Mono',monospace"}}>
                      <AnimNum value={k.value} fmt={k.fmt}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                      <span style={{fontSize:10,color:"#334155"}}>{data.length} records</span>
                      <Spark data={k.spark} color={k.color}/>
                    </div>
                    <PBar pct={100} color={k.color}/>
                  </div>
                ))}
              </div>

              {/* YoY + Monthly trend */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1.8fr",gap:16,marginBottom:16}}>
                <Card delay={100}>
                  <SecTitle title="Year-over-Year" sub="Sales value + YoY growth %"/>
                  <ResponsiveContainer width="100%" height={230}>
                    <ComposedChart data={fyBar}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="fy" tick={{fill:"#64748B",fontSize:11,fontFamily:"Space Mono"}} axisLine={false} tickLine={false}/>
                      <YAxis yAxisId="l" tick={{fill:"#64748B",fontSize:10}} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`} axisLine={false} tickLine={false}/>
                      <YAxis yAxisId="r" orientation="right" tick={{fill:"#64748B",fontSize:10}} tickFormatter={v=>`${v}%`} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CTip/>}/>
                      <Bar yAxisId="l" dataKey="value" name="Total Value" radius={[8,8,0,0]} maxBarSize={56}>
                        {fyBar.map((d,i)=><Cell key={i} fill={FY_COLOR[d.fy]||"#F59E0B"}/>)}
                      </Bar>
                      {fyBar.some(d=>d.yoy!=null)&&<Line yAxisId="r" dataKey="yoy" name="YoY %" stroke="#EF4444" strokeWidth={2.5} dot={{r:5,fill:"#EF4444",strokeWidth:0}} connectNulls/>}
                    </ComposedChart>
                  </ResponsiveContainer>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10}}>
                    {fyBar.filter(d=>d.yoy!=null).map((d,i)=><Tag key={i} label={`${d.fy}: ${d.yoy>=0?"+":""}${d.yoy}%`} color={d.yoy>=0?"#10B981":"#EF4444"} small/>)}
                  </div>
                </Card>

                <Card delay={130}>
                  <SecTitle title="Monthly Dispatch · MoM Change" sub="Bars = Qty · Line = Rate · Chips = MoM %"/>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
                    {monthlyData.filter(d=>d.mom_qty!=null).map((d,i)=>(
                      <Tag key={i} label={`${d.month}: ${d.mom_qty>0?"+":""}${d.mom_qty}%`} color={d.mom_qty>=0?"#10B981":"#EF4444"} small/>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={210}>
                    <ComposedChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="month" tick={{fill:"#64748B",fontSize:11}} axisLine={false} tickLine={false}/>
                      <YAxis yAxisId="l" tick={{fill:"#64748B",fontSize:10}} tickFormatter={v=>`${v}MT`} axisLine={false} tickLine={false}/>
                      <YAxis yAxisId="r" orientation="right" tick={{fill:"#64748B",fontSize:10}} tickFormatter={v=>`₹${v}`} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CTip/>}/>
                      <Bar yAxisId="l" dataKey="qty" name="Qty" fill="#F59E0B" fillOpacity={0.8} radius={[5,5,0,0]} maxBarSize={36}/>
                      <Line yAxisId="r" dataKey="rate" name="Avg Rate" stroke="#06B6D4" strokeWidth={2.5} dot={{r:4,fill:"#06B6D4",strokeWidth:0}} connectNulls/>
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Region bars + invoice log */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1.6fr",gap:16}}>
                <Card delay={160}>
                  <SecTitle title="Sales by Region"/>
                  {regionData.map((r,i)=>{
                    const pct=regionData[0]?.value?r.value/regionData[0].value*100:0;
                    return (
                      <div key={i} style={{marginBottom:12}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontSize:12,fontWeight:600,color:"#CBD5E1"}}>{r.region}</span>
                          <span style={{fontSize:12,fontFamily:"'Space Mono',monospace",color:REG_COLOR[r.region]||"#F59E0B"}}>{fmtVal(r.value)}</span>
                        </div>
                        <PBar pct={pct} color={REG_COLOR[r.region]||"#F59E0B"}/>
                        <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                          <span style={{fontSize:10,color:"#475569"}}>{fmtQty(r.qty)}</span>
                          <span style={{fontSize:10,color:"#475569"}}>{totalValue>0?(r.value/totalValue*100).toFixed(1):0}%</span>
                        </div>
                      </div>
                    );
                  })}
                </Card>

                <Card delay={190}>
                  <SecTitle title="Invoice Log" sub={`Latest ${Math.min(data.length,8)} of ${data.length}`}/>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr>{["Invoice","Date","Customer","Material","Qty","Rate","Value"].map(h=><TH key={h} l={h} right={["Qty","Rate","Value"].includes(h)}/>)}</tr></thead>
                      <tbody>
                        {data.slice(0,8).map((d,i)=>(
                          <tr key={i} className="row-h" style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                            <TD mono bold color="#F59E0B">{d.inv}</TD>
                            <TD color="#64748B">{d.date}</TD>
                            <TD>{d.customer.length>18?d.customer.slice(0,16)+"…":d.customer}</TD>
                            <td style={{padding:"9px 13px"}}><span style={{background:`${MAT_COLOR[d.material]||"#F59E0B"}18`,color:MAT_COLOR[d.material]||"#F59E0B",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{d.material}</span></td>
                            <TD right mono>{d.qty.toLocaleString("en-IN")}</TD>
                            <TD right mono color="#FBBF24">{fmtRate(d.rate)}</TD>
                            <TD right mono bold color="#10B981">{fmtVal(d.total)}</TD>
                          </tr>
                        ))}
                        {!data.length&&<tr><td colSpan={7} style={{padding:28,textAlign:"center",color:"#334155"}}>No records match filters.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* ══════════ MATERIALS (with drill-down) ══════════ */}
          {tab==="material"&&(
            <>
              {drillMat&&<div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.25)",borderRadius:10,padding:"10px 16px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,color:"#FBBF24",fontWeight:700}}>🔍 Drilling into: {drillMat}</span>
                <button onClick={()=>{setDrillMat(null);setMat("All");}} style={{background:"none",border:"none",color:"#F59E0B",cursor:"pointer",fontSize:12,fontWeight:700}}>✕ Exit Drill</button>
              </div>}

              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:18}}>
                {matData.slice(0,3).map((m,i)=>(
                  <Card key={i} delay={i*60} style={{borderColor:`${MAT_COLOR[m.material]||"#F59E0B"}22`,cursor:"pointer"}} >
                    <div onClick={()=>handleDrillMat(m.material)}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <span style={{background:`${MAT_COLOR[m.material]||"#F59E0B"}18`,color:MAT_COLOR[m.material]||"#F59E0B",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:800}}>{m.material}</span>
                        <span style={{fontSize:10,color:"#475569"}}>{m.count} inv · click to drill</span>
                      </div>
                      <div style={{fontSize:24,fontWeight:800,color:MAT_COLOR[m.material]||"#F59E0B",margin:"12px 0 4px",fontFamily:"'Space Mono',monospace"}}>{fmtVal(m.value)}</div>
                      <div style={{fontSize:11,color:"#64748B"}}>{fmtQty(m.qty)} · {fmtRate(m.rate)} avg</div>
                      <PBar pct={totalValue>0?m.value/totalValue*100:0} color={MAT_COLOR[m.material]||"#F59E0B"}/>
                      <div style={{fontSize:10,color:"#475569",marginTop:4}}>{totalValue>0?(m.value/totalValue*100).toFixed(1):0}% share</div>
                    </div>
                  </Card>
                ))}
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1.1fr 1fr",gap:16,marginBottom:16}}>
                <Card delay={100}>
                  <SecTitle title="Volume by Material" sub="Click bar to drill down"/>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={matData} barSize={40} onClick={e=>e?.activePayload&&handleDrillMat(e.activePayload[0]?.payload?.material)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="material" tick={{fill:"#64748B",fontSize:10}} tickFormatter={v=>v.length>8?v.slice(0,7)+"…":v} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:"#64748B",fontSize:10}} tickFormatter={v=>`${v}MT`} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CTip/>}/>
                      <Bar dataKey="qty" name="Qty" radius={[6,6,0,0]} style={{cursor:"pointer"}}>
                        {matData.map((d,i)=><Cell key={i} fill={MAT_COLOR[d.material]||"#F59E0B"} fillOpacity={drillMat&&drillMat!==d.material?0.3:1}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
                <Card delay={140}>
                  <SecTitle title="Revenue by Material"/>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={matData} layout="vertical" barSize={22}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
                      <XAxis type="number" tick={{fill:"#64748B",fontSize:10}} tickFormatter={v=>fmtVal(v)} axisLine={false} tickLine={false}/>
                      <YAxis type="category" dataKey="material" tick={{fill:"#94A3B8",fontSize:11}} width={100} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CTip/>}/>
                      <Bar dataKey="value" name="Total Value" radius={[0,6,6,0]}>
                        {matData.map((d,i)=><Cell key={i} fill={MAT_COLOR[d.material]||"#F59E0B"}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              <Card delay={180}>
                <SecTitle title="Material Performance Table" sub="Ranked by revenue · click material to drill down"/>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["#","Material","Qty (MT)","Revenue","Avg Rate","Invoices","Share"].map(h=><TH key={h} l={h} right={!["#","Material"].includes(h)}/>)}</tr></thead>
                  <tbody>
                    {matData.map((m,i)=>{
                      const sh=totalValue>0?(m.value/totalValue*100).toFixed(1):0;
                      return (
                        <tr key={i} className="row-h" style={{borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:"pointer",opacity:drillMat&&drillMat!==m.material?0.4:1}} onClick={()=>handleDrillMat(m.material)}>
                          <TD color="#334155" bold>#{i+1}</TD>
                          <td style={{padding:"9px 13px"}}><span style={{background:`${MAT_COLOR[m.material]||"#F59E0B"}18`,color:MAT_COLOR[m.material]||"#F59E0B",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:800}}>{m.material}</span></td>
                          <TD right mono>{m.qty.toLocaleString("en-IN")}</TD>
                          <TD right mono bold color="#10B981">{fmtVal(m.value)}</TD>
                          <TD right mono color="#FBBF24">{fmtRate(m.rate)}</TD>
                          <TD right color="#64748B">{m.count}</TD>
                          <td style={{padding:"9px 13px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"flex-end"}}>
                              <div style={{width:70,height:5,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}><div style={{width:`${sh}%`,height:"100%",background:MAT_COLOR[m.material]||"#F59E0B",borderRadius:3}}/></div>
                              <span style={{fontSize:11,color:"#64748B",fontFamily:"'Space Mono',monospace",minWidth:34}}>{sh}%</span>
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

          {/* ══════════ CUSTOMERS (RFM + Gap) ══════════ */}
          {tab==="customers"&&(
            <>
              {gapCustomers.length>0&&(
                <div style={{background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:12,padding:"12px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  <span style={{fontSize:14}}>⚠️</span>
                  <span style={{fontSize:13,color:"#FCA5A5",fontWeight:700}}>{gapCustomers.length} customer{gapCustomers.length>1?"s":""} with invoice gap &gt;3 months:</span>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{gapCustomers.map((c,i)=><Tag key={i} label={c.customer} color="#EF4444" small/>)}</div>
                </div>
              )}

              <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:16,marginBottom:16}}>
                <Card delay={0}>
                  <SecTitle title="Top Customers by Revenue"/>
                  <ResponsiveContainer width="100%" height={290}>
                    <BarChart data={custRaw.slice(0,8)} layout="vertical" barSize={22}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
                      <XAxis type="number" tick={{fill:"#64748B",fontSize:10}} tickFormatter={v=>fmtVal(v)} axisLine={false} tickLine={false}/>
                      <YAxis type="category" dataKey="customer" tick={{fill:"#CBD5E1",fontSize:11}} width={148} axisLine={false} tickLine={false} tickFormatter={v=>v.length>18?v.slice(0,17)+"…":v}/>
                      <Tooltip content={<CTip/>}/>
                      <Bar dataKey="value" name="Total Value" radius={[0,6,6,0]}>
                        {custRaw.slice(0,8).map((d,i)=><Cell key={i} fill={REG_COLOR[d.region]||"#F59E0B"}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* RFM Segments Summary */}
                <Card delay={80}>
                  <SecTitle title="RFM Segment Distribution" sub="Recency · Frequency · Monetary"/>
                  {(()=>{
                    const segs=["Champion","Loyal","Potential","At Risk","Lapsed","New"];
                    const segColors={"Champion":"#10B981","Loyal":"#06B6D4","Potential":"#F59E0B","At Risk":"#EF4444","Lapsed":"#64748B","New":"#8B5CF6"};
                    const segIcons={"Champion":"👑","Loyal":"💎","Potential":"⭐","At Risk":"⚠️","Lapsed":"💤","New":"🆕"};
                    return segs.map(s=>{
                      const count=rfmData.filter(d=>d.seg.label===s).length;
                      if(!count) return null;
                      const pct=rfmData.length?count/rfmData.length*100:0;
                      return (
                        <div key={s} style={{marginBottom:12}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                            <span style={{fontSize:12,color:"#CBD5E1"}}>{segIcons[s]} {s}</span>
                            <span style={{fontSize:12,fontFamily:"'Space Mono',monospace",color:segColors[s]}}>{count} · {pct.toFixed(0)}%</span>
                          </div>
                          <PBar pct={pct} color={segColors[s]}/>
                        </div>
                      );
                    });
                  })()}
                </Card>
              </div>

              <Card delay={150}>
                <SecTitle title="Customer Performance + RFM Score"
                  right={
                    <div style={{display:"flex",gap:8}}>
                      <input placeholder="Search…" value={custSearch} onChange={e=>setCustSearch(e.target.value)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#CBD5E1",borderRadius:8,padding:"6px 11px",fontSize:12,outline:"none",fontFamily:"'Syne',sans-serif",width:160}}/>
                      <select value={sortCust} onChange={e=>setSortCust(e.target.value)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#CBD5E1",borderRadius:8,padding:"6px 11px",fontSize:12,outline:"none",fontFamily:"'Syne',sans-serif"}}>
                        <option value="value">Sort: Value</option>
                        <option value="qty">Sort: Qty</option>
                        <option value="count">Sort: Invoices</option>
                      </select>
                    </div>
                  }
                />
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>{["#","Customer","Region","RFM","Qty","Value","Invoices","Avg/Invoice","Last Active"].map(h=><TH key={h} l={h} right={["Qty","Value","Invoices","Avg/Invoice"].includes(h)}/>)}</tr></thead>
                    <tbody>
                      {rfmData.map((c,i)=>{
                        const lastMI=Math.max(...baseData.filter(d=>d.customer===c.customer).map(d=>MONTHS_ORD.indexOf(d.month)));
                        return (
                          <tr key={i} className="row-h" style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                            <TD color="#334155" bold>#{i+1}</TD>
                            <TD bold>{c.customer.length>20?c.customer.slice(0,19)+"…":c.customer}</TD>
                            <td style={{padding:"9px 13px"}}><Tag label={c.region} color={REG_COLOR[c.region]||"#94A3B8"} small/></td>
                            <td style={{padding:"9px 13px"}}><Tag label={`${c.seg.icon} ${c.seg.label}`} color={c.seg.color} small/></td>
                            <TD right mono>{c.qty.toLocaleString("en-IN")}</TD>
                            <TD right mono bold color="#10B981">{fmtVal(c.value)}</TD>
                            <TD right color="#64748B">{c.count}</TD>
                            <TD right mono color="#FBBF24">{fmtVal(Math.round(c.value/c.count))}</TD>
                            <td style={{padding:"9px 13px"}}><Tag label={MONTHS_ORD[lastMI]||"?"} color={11-lastMI>2?"#EF4444":"#10B981"} small/></td>
                          </tr>
                        );
                      })}
                      {!rfmData.length&&<tr><td colSpan={9} style={{padding:28,textAlign:"center",color:"#334155"}}>No customers found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {/* ══════════ RATES & FORECAST ══════════ */}
          {tab==="rates"&&(
            <>
              {/* Toggles */}
              <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
                {[
                  {label:"Show Forecast",state:showForecast,set:setShowForecast,color:"#8B5CF6"},
                  {label:"Show 3-Month MA",state:showMA,set:setShowMA,color:"#06B6D4"},
                  {label:"FY Comparison",state:compareMode,set:setCompareMode,color:"#10B981"},
                ].map(t=>(
                  <button key={t.label} onClick={()=>t.set(s=>!s)} style={{background:t.state?`${t.color}18`:"rgba(255,255,255,0.04)",border:`1px solid ${t.state?t.color+"44":"rgba(255,255,255,0.1)"}`,color:t.state?t.color:"#64748B",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Syne',sans-serif",transition:"all 0.2s"}}>
                    {t.state?"✓":""} {t.label}
                  </button>
                ))}
                {compareMode&&(
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <select value={compareFY1} onChange={e=>setCFY1(e.target.value)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#CBD5E1",borderRadius:8,padding:"7px 11px",fontSize:12,outline:"none",fontFamily:"'Syne',sans-serif"}}>
                      <option value="">FY 1</option>{FY_LIST.map(f=><option key={f} value={f}>{f}</option>)}
                    </select>
                    <span style={{color:"#475569"}}>vs</span>
                    <select value={compareFY2} onChange={e=>setCFY2(e.target.value)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#CBD5E1",borderRadius:8,padding:"7px 11px",fontSize:12,outline:"none",fontFamily:"'Syne',sans-serif"}}>
                      <option value="">FY 2</option>{FY_LIST.map(f=><option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* FY Comparison Chart */}
              {compareMode&&compareData.length>0&&(
                <Card delay={0} style={{marginBottom:16}}>
                  <SecTitle title={`FY Comparison: ${compareFY1} vs ${compareFY2}`} sub="Monthly sales value overlay"/>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={compareData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="month" tick={{fill:"#64748B",fontSize:11}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:"#64748B",fontSize:10}} tickFormatter={v=>fmtVal(v)} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CTip/>}/>
                      <Legend iconType="circle" wrapperStyle={{fontSize:11,color:"#64748B"}}/>
                      {compareFY1&&<Line dataKey={compareFY1} stroke={FY_COLOR[compareFY1]||"#F59E0B"} strokeWidth={2.5} dot={{r:4,fill:FY_COLOR[compareFY1]||"#F59E0B",strokeWidth:0}} connectNulls/>}
                      {compareFY2&&<Line dataKey={compareFY2} stroke={FY_COLOR[compareFY2]||"#06B6D4"} strokeWidth={2.5} dot={{r:4,fill:FY_COLOR[compareFY2]||"#06B6D4",strokeWidth:0}} connectNulls strokeDasharray="6 3"/>}
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Forecast + MA Chart */}
              <Card delay={80} style={{marginBottom:16}}>
                <SecTitle title="Monthly Volume · Forecast · Moving Average" sub="Solid = actual · Dashed = forecast · Line = 3M MA"/>
                <ResponsiveContainer width="100%" height={270}>
                  <ComposedChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                    <XAxis dataKey="month" tick={{fill:"#64748B",fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis yAxisId="l" tick={{fill:"#64748B",fontSize:10}} tickFormatter={v=>`${v}MT`} axisLine={false} tickLine={false}/>
                    <YAxis yAxisId="r" orientation="right" tick={{fill:"#64748B",fontSize:10}} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CTip/>}/>
                    <Bar yAxisId="l" dataKey="qty" name="Actual Qty" fill="#F59E0B" fillOpacity={0.7} radius={[4,4,0,0]} maxBarSize={32}/>
                    {showForecast&&<Bar yAxisId="l" dataKey="forecastQty" name="Forecast Qty" fill="#8B5CF6" fillOpacity={0.45} radius={[4,4,0,0]} maxBarSize={32}/>}
                    {showMA&&<Line yAxisId="l" dataKey="qty_ma" name="3M MA Qty" stroke="#06B6D4" strokeWidth={2} strokeDasharray="5 3" dot={false} connectNulls/>}
                    {showForecast&&<Line yAxisId="r" dataKey="forecastVal" name="Forecast Value" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls/>}
                  </ComposedChart>
                </ResponsiveContainer>
                {showForecast&&forecastData.some(d=>d.forecastQty&&!d.qty)&&(
                  <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap"}}>
                    {forecastData.filter(d=>d.forecastQty&&!d.qty).map((d,i)=>(
                      <Tag key={i} label={`${d.month}: ~${fmtQty(d.forecastQty)}`} color="#8B5CF6" small/>
                    ))}
                  </div>
                )}
              </Card>

              {/* Rate trends + heatmap */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <Card delay={160}>
                  <SecTitle title="Rate Trends by Material"/>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={rateByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="month" tick={{fill:"#64748B",fontSize:11}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:"#64748B",fontSize:10}} tickFormatter={v=>`₹${v}`} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CTip/>}/>
                      <Legend iconType="circle" wrapperStyle={{fontSize:10,color:"#64748B"}}/>
                      {MAT_LIST.map(m=><Line key={m} type="monotone" dataKey={m} name={m} stroke={MAT_COLOR[m]||"#F59E0B"} strokeWidth={2.5} dot={{r:3,strokeWidth:0,fill:MAT_COLOR[m]||"#F59E0B"}} connectNulls/>)}
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
                <Card delay={190}>
                  <SecTitle title="Rate Heatmap" sub="Month × Material · darker = higher"/>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"3px"}}>
                      <thead><tr>
                        <th style={{padding:"5px 8px",color:"#475569",fontSize:10,textAlign:"left"}}>Month</th>
                        {MAT_LIST.map(m=><th key={m} style={{padding:"5px 6px",color:MAT_COLOR[m]||"#F59E0B",fontSize:9,fontWeight:700,textAlign:"center",whiteSpace:"nowrap"}}>{m.length>7?m.slice(0,6)+"…":m}</th>)}
                      </tr></thead>
                      <tbody>
                        {rateByMonth.map((row,i)=>(
                          <tr key={i}>
                            <td style={{padding:"5px 8px",color:"#64748B",fontWeight:700,fontSize:11}}>{row.month}</td>
                            {MAT_LIST.map(m=>{
                              const v=row[m];
                              const all=rateByMonth.map(r=>r[m]).filter(Boolean);
                              const max=all.length?Math.max(...all):0,min=all.length?Math.min(...all):0;
                              const pct=(max>min&&v)?(v-min)/(max-min):0;
                              const c=MAT_COLOR[m]||"#F59E0B";
                              const alpha=Math.round((0.08+pct*0.5)*255).toString(16).padStart(2,"0");
                              return <td key={m} style={{padding:"5px 6px",textAlign:"center",background:v?`${c}${alpha}`:"transparent",borderRadius:5,color:v?"#F1F5F9":"#1E293B",fontWeight:v?600:400,fontSize:10,fontFamily:v?"'Space Mono',monospace":"inherit"}}>{v?`₹${v.toLocaleString("en-IN")}`:"—"}</td>;
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

          {/* ══════════ INTELLIGENCE ══════════ */}
          {tab==="intel"&&(
            <>
              {/* Config */}
              <Card delay={0} style={{marginBottom:16}}>
                <SecTitle title="Alert Configuration" sub="Set thresholds for automated alerts"/>
                <div style={{display:"flex",gap:24,flexWrap:"wrap",alignItems:"center"}}>
                  <div>
                    <label style={{fontSize:11,color:"#64748B",fontWeight:700,display:"block",marginBottom:6}}>VOLUME DROP THRESHOLD: {alertPct}%</label>
                    <input type="range" min={5} max={50} step={5} value={alertPct} onChange={e=>setAlertPct(+e.target.value)} style={{width:200,accentColor:"#F59E0B"}}/>
                  </div>
                  <div>
                    <label style={{fontSize:11,color:"#64748B",fontWeight:700,display:"block",marginBottom:6}}>RATE FLOOR: ₹{rateFloor}/MT</label>
                    <input type="range" min={200} max={2000} step={100} value={rateFloor} onChange={e=>setRateFloor(+e.target.value)} style={{width:200,accentColor:"#F59E0B"}}/>
                  </div>
                </div>
              </Card>

              <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:16,marginBottom:16}}>
                {/* Alerts */}
                <Card delay={80}>
                  <SecTitle title="Live Alerts" sub={`${alerts.length} active alerts`}/>
                  {alerts.length===0&&<p style={{color:"#334155",fontSize:13,padding:"16px 0"}}>✅ No alerts — all thresholds met.</p>}
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {alerts.map((a,i)=>{
                      const bg=a.type==="danger"?"rgba(239,68,68,0.08)":a.type==="warning"?"rgba(245,158,11,0.08)":"rgba(6,182,212,0.08)";
                      const br=a.type==="danger"?"rgba(239,68,68,0.25)":a.type==="warning"?"rgba(245,158,11,0.25)":"rgba(6,182,212,0.25)";
                      const c=a.type==="danger"?"#FCA5A5":a.type==="warning"?"#FCD34D":"#67E8F9";
                      return (
                        <div key={i} style={{background:bg,border:`1px solid ${br}`,borderRadius:10,padding:"11px 14px"}}>
                          <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                            <span style={{fontSize:16}}>{a.icon}</span>
                            <div>
                              <div style={{fontSize:12,fontWeight:700,color:c}}>{a.msg}</div>
                              <div style={{fontSize:11,color:"#475569",marginTop:3}}>{a.detail}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Top Movers */}
                <Card delay={120}>
                  <SecTitle title="Top Movers" sub={`${FY_LIST.at(-2)||"Prev FY"} → ${FY_LIST.at(-1)||"Curr FY"}`}/>
                  <div style={{marginBottom:16}}>
                    <div style={{fontSize:11,color:"#10B981",fontWeight:700,letterSpacing:1,marginBottom:8}}>▲ GAINERS</div>
                    {movers.gainers.length===0&&<p style={{color:"#334155",fontSize:12}}>Not enough data for comparison.</p>}
                    {movers.gainers.map((m,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                        <div>
                          <span style={{background:`${MAT_COLOR[m.name]||"#10B981"}18`,color:MAT_COLOR[m.name]||"#10B981",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{m.name}</span>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:13,fontWeight:800,color:"#10B981"}}>+{m.pct.toFixed(1)}%</div>
                          <div style={{fontSize:10,color:"#475569"}}>{fmtVal(m.prevVal)} → {fmtVal(m.currVal)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontSize:11,color:"#EF4444",fontWeight:700,letterSpacing:1,marginBottom:8}}>▼ LOSERS</div>
                    {movers.losers.map((m,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                        <div>
                          <span style={{background:`${MAT_COLOR[m.name]||"#EF4444"}18`,color:MAT_COLOR[m.name]||"#EF4444",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700}}>{m.name}</span>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:13,fontWeight:800,color:"#EF4444"}}>{m.pct.toFixed(1)}%</div>
                          <div style={{fontSize:10,color:"#475569"}}>{fmtVal(m.prevVal)} → {fmtVal(m.currVal)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Invoice gap table */}
              <Card delay={160}>
                <SecTitle title="Invoice Gap Detector" sub="Customers with no activity in last 3 months of data"/>
                {gapCustomers.length===0?(
                  <p style={{color:"#334155",fontSize:13,padding:"16px 0"}}>✅ All customers have recent activity.</p>
                ):(
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>{["Customer","Region","Last Active","Total Value","Invoices","Status"].map(h=><TH key={h} l={h} right={["Total Value","Invoices"].includes(h)}/>)}</tr></thead>
                    <tbody>
                      {gapCustomers.map((c,i)=>{
                        const rows=baseData.filter(d=>d.customer===c.customer);
                        const lastMI=Math.max(...rows.map(d=>MONTHS_ORD.indexOf(d.month)));
                        const gap=11-lastMI;
                        return (
                          <tr key={i} className="row-h" style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                            <TD bold>{c.customer}</TD>
                            <td style={{padding:"9px 13px"}}><Tag label={c.region} color={REG_COLOR[c.region]||"#94A3B8"} small/></td>
                            <TD color="#64748B">{MONTHS_ORD[lastMI]||"?"}</TD>
                            <TD right mono bold color="#10B981">{fmtVal(c.value)}</TD>
                            <TD right color="#64748B">{c.count}</TD>
                            <td style={{padding:"9px 13px"}}><Tag label={`${gap}m gap · At Risk`} color="#EF4444" small/></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </Card>
            </>
          )}

          {/* ══════════ GEO & FLOW ══════════ */}
          {tab==="geo"&&(
            <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                <Card delay={0}>
                  <SecTitle title="India Sales Bubble Map" sub="Bubble size = revenue · hover for details"/>
                  <IndiaMap regionData={regionData}/>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
                    {regionData.map((r,i)=><Tag key={i} label={`${r.region}: ${fmtVal(r.value)}`} color={REG_COLOR[r.region]||"#F59E0B"} small/>)}
                  </div>
                </Card>

                <Card delay={80}>
                  <SecTitle title="Region Deep-Dive" sub="Value and volume breakdown"/>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={regionData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="region" tick={{fill:"#64748B",fontSize:10}} tickFormatter={v=>v.length>8?v.slice(0,7)+"…":v} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:"#64748B",fontSize:10}} tickFormatter={v=>fmtVal(v)} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CTip/>}/>
                      <Bar dataKey="value" name="Total Value" radius={[6,6,0,0]}>
                        {regionData.map((d,i)=><Cell key={i} fill={REG_COLOR[d.region]||"#F59E0B"}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{marginTop:12}}>
                    {regionData.map((r,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                        <Tag label={r.region} color={REG_COLOR[r.region]||"#F59E0B"} small/>
                        <div style={{display:"flex",gap:16}}>
                          <span style={{fontSize:11,color:"#94A3B8",fontFamily:"'Space Mono',monospace"}}>{fmtQty(r.qty)}</span>
                          <span style={{fontSize:11,fontWeight:700,color:"#10B981",fontFamily:"'Space Mono',monospace"}}>{fmtVal(r.value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card delay={140}>
                <SecTitle title="Material → Region → Customer Flow (Sankey)" sub="Line thickness = revenue flow"/>
                <div style={{overflowX:"auto",paddingTop:20,paddingBottom:10}}>
                  <SankeyDiagram data={data} matData={matData} regionData={regionData} custData={custRaw}/>
                </div>
                <div style={{display:"flex",gap:20,marginTop:16,justifyContent:"center",flexWrap:"wrap"}}>
                  {[["Materials",MAT_COLOR],["Regions",REG_COLOR]].map(([group,colorMap])=>(
                    <div key={group}>
                      <div style={{fontSize:10,color:"#475569",fontWeight:700,letterSpacing:1,marginBottom:6}}>{group.toUpperCase()}</div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {Object.entries(colorMap).filter(([k])=>group==="Materials"?MAT_LIST.includes(k):REG_LIST.includes(k)).map(([k,c])=>(
                          <Tag key={k} label={k.length>10?k.slice(0,9)+"…":k} color={c} small/>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* Footer */}
          <div style={{marginTop:28,padding:"11px 16px",background:"rgba(255,255,255,0.012)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,color:"#1E293B",flexWrap:"wrap",gap:6}}>
            <span style={{color:"#334155"}}>SFG Analytics Pro · {baseData.length} records · React + Recharts</span>
            <span style={{color:"#1E293B"}}>14 features · Google Sheets sync · URL filter sharing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
