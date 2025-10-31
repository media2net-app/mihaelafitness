import { useEffect, useMemo, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';
import { IconMoney, IconUsers, IconChart, IconRocket, IconUser, IconBox, IconFile, IconDollar } from '../components/Icons.jsx';

const CSV_URL = '/producten/wc-product-export-30-10-2025-1761806553346.csv';
const ORDERS_XML = '/bestellingen/shopelectroproject.WordPress.2025-10-30.xml';

// Counter animation component
function AnimatedCounter({ value, suffix = '', duration = 1500, delay = 0, formatter }) {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const targetValue = useRef(value);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    targetValue.current = value;
    setIsAnimating(true);
    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current - delay;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress < 1) {
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeOutCubic * value));
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(value);
        setIsAnimating(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration, delay]);

  const displayValue = formatter ? formatter(count) : count;
  return <span className={isAnimating ? 'counting' : ''}>{displayValue}{suffix}</span>;
}

function parseCsvLine(line){ let cur='', inQuotes=false, out=[]; for(let i=0;i<line.length;i++){ const c=line[i]; if(c==='"'){ inQuotes=!inQuotes; } else if(c===',' && !inQuotes){ out.push(cur); cur=''; } else { cur+=c; } } out.push(cur); return out; }
function parseCsv(text){ const lines=text.split(/\r?\n/); if(!lines[0]) return []; const headers=parseCsvLine(lines[0]).map(s=>s.trim().replace(/^"|"$/g,'')); return lines.slice(1).filter(l=>l.trim()).map(line=>{ const cols=parseCsvLine(line).map(s=>s.trim().replace(/^"|"$/g,'')); const obj={}; headers.forEach((h,i)=> obj[h]=(cols[i]||'')); return obj; }); }

function countQuoteRequestsFromXml(xmlText, year = null){ 
  try{ 
    const parser=new DOMParser(); 
    const doc=parser.parseFromString(xmlText,'text/xml'); 
    const items=Array.from(doc.getElementsByTagName('item')); 
    let count=0; 
    items.forEach(it=>{ 
      const wpns='wp:';
      const postDate=(it.getElementsByTagName(`${wpns}post_date`)[0]?.textContent)||'';
      const d=postDate?new Date(postDate.replace(' ','T')):null;
      
      // Filter op jaar als opgegeven
      if(year && d && d.getFullYear()!==year) return;
      
      const cats=Array.from(it.getElementsByTagName('category')).map(c=>(c.textContent||''));
      const desc=((it.getElementsByTagName('description')[0]?.textContent)||'').toLowerCase(); 
      const content=((it.getElementsByTagName('content:encoded')[0]?.textContent)||'').toLowerCase();
      const title = ((it.getElementsByTagName('title')[0]?.textContent)||'').toLowerCase();
      const rawStatus = ((it.getElementsByTagName(`${wpns}status`)[0]?.textContent)||'').toLowerCase();
      const anyText=[desc,content,title,rawStatus,...cats].join(' '); 
      
      // Zelfde logica als Offerte pagina: /offerte|quote|prijsopgave/i
      const isQuote = /offerte|quote|prijsopgave/i.test(anyText);
      if(isQuote){ count++; } 
    }); 
    return count; 
  }catch(e){ return 0; }
}

function buildRevenueByMonth(xmlText, year){ try{ const parser=new DOMParser(); const doc=parser.parseFromString(xmlText,'text/xml'); const items=Array.from(doc.getElementsByTagName('item')); const months=new Array(12).fill(0); items.forEach(it=>{ const wpns='wp:'; const postDate=(it.getElementsByTagName(`${wpns}post_date`)[0]?.textContent)||''; if(!postDate) return; const d=new Date(postDate.replace(' ','T')); if(d.getFullYear()!==year) return; const postmeta=Array.from(it.getElementsByTagName(`${wpns}postmeta`)); let total=0; postmeta.forEach(pm=>{ const k=(pm.getElementsByTagName(`${wpns}meta_key`)[0]?.textContent)||''; if(k==='_order_total'){ const v=(pm.getElementsByTagName(`${wpns}meta_value`)[0]?.textContent)||'0'; total=Number(v)||0; } }); const m=d.getMonth(); months[m]+=total; }); return months; }catch(e){ return new Array(12).fill(0); }}

function aggregateFromXml(xmlText){ try{ const parser=new DOMParser(); const doc=parser.parseFromString(xmlText,'text/xml'); const items=Array.from(doc.getElementsByTagName('item')); let revenue2025=0, revenue2024=0; const emailsAll=new Set(); const quoteEmails=new Set(); let offerCount=0; items.forEach(it=>{ const wpns='wp:'; const postDate=(it.getElementsByTagName(`${wpns}post_date`)[0]?.textContent)||''; const d=postDate?new Date(postDate.replace(' ','T')):null; const cats=Array.from(it.getElementsByTagName('category')).map(c=>(c.textContent||'').toLowerCase()); const desc=((it.getElementsByTagName('description')[0]?.textContent)||'').toLowerCase(); const content=((it.getElementsByTagName('content:encoded')[0]?.textContent)||'').toLowerCase(); const anyText=[desc,content,...cats].join(' '); const postmeta=Array.from(it.getElementsByTagName(`${wpns}postmeta`)); let total=0; let email=''; postmeta.forEach(pm=>{ const k=(pm.getElementsByTagName(`${wpns}meta_key`)[0]?.textContent)||''; const v=(pm.getElementsByTagName(`${wpns}meta_value`)[0]?.textContent)||''; if(k==='_order_total'){ total=Number(v)||0; } if(k==='_billing_email'){ email=(v||'').toLowerCase(); } }); if(email) emailsAll.add(email); const isQuote=anyText.includes('offerte')||anyText.includes('prijsopgave')||anyText.includes('quote'); if(isQuote){ offerCount++; if(email) quoteEmails.add(email); } if(d){ if(d.getFullYear()===2025) revenue2025+=total; if(d.getFullYear()===2024) revenue2024+=total; } }); return { offerCount, leadsCount: quoteEmails.size, customersCount: emailsAll.size, revenueTotal2025: revenue2025, revenueTotal2024: revenue2024 }; }catch(e){ return { offerCount:0, leadsCount:0, customersCount:0, revenueTotal2025:0, revenueTotal2024:0 }; }}

function RevenueChart({data2025, data2024}){
  const [hover,setHover]=useState(null);
  const [animated2025, setAnimated2025] = useState(new Array(12).fill(0));
  const [animated2024, setAnimated2024] = useState(new Array(12).fill(0));
  const [isAnimating, setIsAnimating] = useState(false);
  const vbW=960, vbH=320, pad=40; 
  const innerW=vbW-pad*2, innerH=vbH-pad*2; 
  const max=Math.max(1,...data2025,...data2024); 
  const groups=data2025.length; 
  const gap=8; 
  const barW=(innerW/groups-gap)/2; 
  const months=['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec']; 
  const tipW=150, tipH=70; 
  function fmt(v){ return `€ ${v.toLocaleString('nl-NL',{minimumFractionDigits:2, maximumFractionDigits:2})}`; }
  function clamp(v,min,max){ return Math.max(min, Math.min(max,v)); }
  
  // Animate bars when data changes
  useEffect(() => {
    setIsAnimating(true);
    const duration = 1500;
    const startTime = Date.now();
    const startValues2025 = animated2025;
    const startValues2024 = animated2024;
    const targetValues2025 = data2025;
    const targetValues2024 = data2024;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      const new2025 = startValues2025.map((start, i) => 
        Math.floor(start + (targetValues2025[i] - start) * easeOutCubic)
      );
      const new2024 = startValues2024.map((start, i) => 
        Math.floor(start + (targetValues2024[i] - start) * easeOutCubic)
      );
      
      setAnimated2025(new2025);
      setAnimated2024(new2024);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    const rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [data2025, data2024]);

  return (
    <div className="revchart-wrap">
      <svg className="revchart" viewBox={`0 0 ${vbW} ${vbH}`} preserveAspectRatio="xMidYMid meet" onMouseLeave={()=>setHover(null)}>
        <g transform={`translate(${pad},${pad})`}>
          <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="#29505d" />
          {data2025.map((v,i)=>{ 
            const xGroup=i*((barW*2)+gap); 
            const h2025=max?(animated2025[i]/max)*innerH:0; 
            const y2025=innerH-h2025; 
            const v24=data2024[i]||0; 
            const h2024=max?(animated2024[i]/max)*innerH:0; 
            const y2024=innerH-h2024; 
            const centerX = pad + xGroup + barW;
            const diff = v - v24;
            const diffPct = v24 ? ((diff / v24) * 100) : 0;
            
            const handleMouseMove = (e) => {
              const topY = pad + Math.min(y2024, y2025) - 8;
              const clampedX = clamp(centerX, pad+tipW/2, vbW-pad-tipW/2);
              const clampedY = clamp(topY, pad+tipH+10, vbH-pad-10);
              setHover({ 
                x: clampedX, 
                y: clampedY, 
                month: months[i], 
                value2025: v, 
                value2024: v24,
                diff: diff,
                diffPct: diffPct
              });
            };
            
            return (
              <g key={i} transform={`translate(${xGroup},0)`}>
                <rect 
                  x={0} 
                  y={y2024} 
                  width={barW} 
                  height={h2024} 
                  rx={6} 
                  fill="#14505e" 
                  opacity={.6} 
                  className="chart-bar"
                  onMouseMove={handleMouseMove}
                  style={{ cursor: 'pointer' }}
                />
                <g transform={`translate(${barW},0)`}>
                  <rect 
                    x={0} 
                    y={y2025} 
                    width={barW} 
                    height={h2025} 
                    rx={6} 
                    fill="var(--brand-accent)" 
                    opacity={.85} 
                    className="chart-bar"
                    onMouseMove={handleMouseMove}
                    style={{ cursor: 'pointer' }}
                  />
                </g>
                <text x={(barW)} y={innerH+14} textAnchor="middle" fill="#9ec9d6" fontSize="11">{months[i]}</text>
              </g>
            );
          })}
        </g>
        {hover&&(
          <g className="revchart-tip">
            <rect x={hover.x-tipW/2} y={hover.y-tipH} width={tipW} height={tipH} rx={8} fill="#0d2330" stroke="#2a5566"/>
            <text x={hover.x} y={hover.y-55} textAnchor="middle" fill="#a7dbe8" fontSize="11" fontWeight="600">{hover.month.toUpperCase()}</text>
            <text x={hover.x} y={hover.y-42} textAnchor="middle" fill="#9ec9d6" fontSize="9">2025: <tspan fill="#e6fcff" fontWeight="600">{fmt(hover.value2025)}</tspan></text>
            <text x={hover.x} y={hover.y-30} textAnchor="middle" fill="#9ec9d6" fontSize="9">2024: <tspan fill="#9ec9d6">{fmt(hover.value2024)}</tspan></text>
            <text 
              x={hover.x} 
              y={hover.y-18} 
              textAnchor="middle" 
              fill={hover.diff >= 0 ? '#8ff0b1' : '#ffb3b3'} 
              fontSize="10" 
              fontWeight="700"
            >
              {hover.diff >= 0 ? '+' : ''}{fmt(hover.diff)} ({hover.diffPct >= 0 ? '+' : ''}{hover.diffPct.toFixed(1)}%)
            </text>
          </g>
        )}
      </svg>
      <div className="revchart-legend"><span className="lg lg-2025"/>2025 <span className="lg lg-2024"/>2024</div>
    </div>
  );
}

export default function Dashboard(){ 
  const [products,setProducts]=useState([]);
  const [offerCount,setOfferCount]=useState(null);
  const [revenue2025,setRevenue2025]=useState(new Array(12).fill(0));
  const [revenue2024,setRevenue2024]=useState(new Array(12).fill(0));
  const [totals,setTotals]=useState({ revenueTotal2025:0, revenueTotal2024:0, customersCount:0, leadsCount:0, offerCount:0 });
  const [leadStats, setLeadStats] = useState({ leads:0, customers:0 });
  const [projectStats, setProjectStats] = useState({ total:0, actief:0, afgerond:0, totaalBudget:0 });
  const [teamStats, setTeamStats] = useState({ total:0, actief:0 });

  useEffect(()=>{ 
    fetch(CSV_URL)
      .then(r=>r.text())
      .then(txt=>{ 
        const parsed=parseCsv(txt);
        // Zelfde validatie als Producten.jsx
        const full = parsed.filter(p => {
          const naam = p['Naam'] && p['Naam'].length > 0;
          const prijs = p['Reguliere prijs'] && p['Reguliere prijs'].length > 0 && Number(p['Reguliere prijs']) > 0;
          let img = (p['Afbeeldingen'] || '').split(',')[0].trim();
          const hasImg = img && img.startsWith('http');
          return naam && prijs && hasImg;
        });
        setProducts(full);
      })
      .catch(()=>{}); 
  },[]);

  useEffect(()=>{ 
    fetch(ORDERS_XML)
      .then(r=>r.text())
      .then(txt=>{ 
        setOfferCount(countQuoteRequestsFromXml(txt, 2025)); // Alleen 2025 offertes
        setRevenue2025(buildRevenueByMonth(txt,2025)); 
        setRevenue2024(buildRevenueByMonth(txt,2024)); 
        setTotals(aggregateFromXml(txt)); 
      })
      .catch(()=>{ 
        setOfferCount(0); 
        setRevenue2025(new Array(12).fill(0)); 
        setRevenue2024(new Array(12).fill(0)); 
        setTotals({ revenueTotal2025:0, revenueTotal2024:0, customersCount:0, leadsCount:0, offerCount:0 }); 
      }); 
  },[]);

  useEffect(()=>{
    try{
      const saved = localStorage.getItem('ep_leads');
      if(saved){
        const parsed = JSON.parse(saved);
        const leads = parsed.length;
        const customers = parsed.filter(l=> (l.status||'').toLowerCase()==='klant').length;
        setLeadStats({ leads, customers });
      }
    }catch(e){ setLeadStats({ leads:0, customers:0 }); }
  },[]);

  // Project stats
  useEffect(()=>{
    const demoProjects = [
      { id: 'P-2001', status: 'In uitvoering', budget: 45000 },
      { id: 'P-2002', status: 'In uitvoering', budget: 85000 },
      { id: 'P-2003', status: 'Afgerond', budget: 120000 },
      { id: 'P-2004', status: 'Gepland', budget: 95000 },
      { id: 'P-2005', status: 'In uitvoering', budget: 65000 },
      { id: 'P-2006', status: 'In uitvoering', budget: 28000 },
    ];
    const total = demoProjects.length;
    const actief = demoProjects.filter(p => p.status === 'In uitvoering').length;
    const afgerond = demoProjects.filter(p => p.status === 'Afgerond').length;
    const totaalBudget = demoProjects.reduce((sum, p) => sum + p.budget, 0);
    setProjectStats({ total, actief, afgerond, totaalBudget });
  },[]);

  // Team stats
  useEffect(()=>{
    const demoUsers = [
      { id: 'U-1001', status: 'Actief' },
      { id: 'U-1002', status: 'Actief' },
      { id: 'U-1003', status: 'Actief' },
      { id: 'U-1004', status: 'Actief' },
      { id: 'U-1005', status: 'Inactief' },
      { id: 'U-1006', status: 'Actief' },
    ];
    const total = demoUsers.length;
    const actief = demoUsers.filter(u => u.status === 'Actief').length;
    setTeamStats({ total, actief });
  },[]);

  const outOfStock=useMemo(()=> products.filter(p=> !(p['Op voorraad?']==='1'||p['Op voorraad?']===1)).length,[products]);
  const omzet2025=totals.revenueTotal2025; const omzet2024=totals.revenueTotal2024; const diff=omzet2025-omzet2024; const pct=omzet2024? (diff/omzet2024)*100 : 100; const omzetFmt=`€ ${omzet2025.toLocaleString('nl-NL',{minimumFractionDigits:2, maximumFractionDigits:2})}`; const diffFmt=`${diff>=0?'+':''}€ ${Math.abs(diff).toLocaleString('nl-NL',{minimumFractionDigits:2, maximumFractionDigits:2})} (${pct>=0?'+':''}${pct.toFixed(1)}%)`;

  const klanten = leadStats.customers || totals.customersCount;
  const leads = leadStats.leads || totals.leadsCount;
  const offers = offerCount ?? 0; // Gebruik direct offerCount (alleen 2025)
  const totaalProducten = products.length;
  const inStock = totaalProducten - outOfStock;

  const projectenBudgetFmt = `€ ${projectStats.totaalBudget.toLocaleString('nl-NL', {minimumFractionDigits:0, maximumFractionDigits:0})}`;

  return (
    <div className="dashboard-wrapper">
        <Sidebar />
        <main className="dashboard-main dash-main">
        <div className="dash-titlebar">
          <h1>Dashboard</h1>
        </div>
        
        <section className="stat-grid">
          {/* Omzet stats */}
          <article className="stat-card stat-card-primary animate-in" style={{animationDelay: '0ms'}}>
            <div className="stat-label">Omzet (2025)</div>
            <div className="stat-value">
              <AnimatedCounter 
                value={omzet2025} 
                suffix="" 
                duration={1500} 
                delay={0}
                formatter={(val) => `€ ${val.toLocaleString('nl-NL', {minimumFractionDigits:0, maximumFractionDigits:0})}`}
              />
            </div>
            <div className={`stat-delta ${diff>=0?'up':'down'}`}>{diffFmt}</div>
          </article>

          {/* Klanten */}
          <article className="stat-card stat-card-success animate-in" style={{animationDelay: '100ms'}}>
            <div className="stat-label">Klanten</div>
            <div className="stat-value">
              <AnimatedCounter value={klanten} suffix="" duration={1500} delay={100} />
            </div>
          </article>

          {/* Leads */}
          <article className="stat-card stat-card-warning animate-in" style={{animationDelay: '200ms'}}>
            <div className="stat-label">Leads</div>
            <div className="stat-value">
              <AnimatedCounter value={leads} suffix="" duration={1500} delay={200} />
            </div>
          </article>

          {/* Projecten */}
          <article className="stat-card stat-card-info animate-in" style={{animationDelay: '300ms'}}>
            <div className="stat-label">Projecten</div>
            <div className="stat-value">
              <AnimatedCounter value={projectStats.total} suffix="" duration={1500} delay={300} />
            </div>
            <div className="stat-sub">
              {projectStats.actief} actief, {projectStats.afgerond} afgerond
            </div>
          </article>

          {/* Team */}
          <article className="stat-card stat-card-purple animate-in" style={{animationDelay: '400ms'}}>
            <div className="stat-label">Teamleden</div>
            <div className="stat-value">
              <AnimatedCounter value={teamStats.total} suffix="" duration={1500} delay={400} />
            </div>
            <div className="stat-sub">
              {teamStats.actief} actief
            </div>
          </article>

          {/* Producten */}
          <article className="stat-card stat-card-orange animate-in" style={{animationDelay: '500ms'}}>
            <div className="stat-label">Producten</div>
            <div className="stat-value">
              <AnimatedCounter value={totaalProducten} suffix="" duration={1500} delay={500} />
            </div>
            <div className="stat-sub">
              {inStock} op voorraad, {outOfStock} niet
            </div>
          </article>

          {/* Offerte aanvragen */}
          <article className="stat-card stat-card-teal animate-in" style={{animationDelay: '600ms'}}>
            <div className="stat-label">Offerte aanvragen</div>
            <div className="stat-value">
              <AnimatedCounter value={offers} suffix="" duration={1500} delay={600} />
            </div>
          </article>

          {/* Projecten budget */}
          <article className="stat-card stat-card-green animate-in" style={{animationDelay: '700ms'}}>
            <div className="stat-label">Totaal projectbudget</div>
            <div className="stat-value-large">
              <AnimatedCounter 
                value={projectStats.totaalBudget} 
                suffix="" 
                duration={1500} 
                delay={700}
                formatter={(val) => `€ ${val.toLocaleString('nl-NL', {minimumFractionDigits:0, maximumFractionDigits:0})}`}
              />
            </div>
          </article>
        </section>

        {/* Charts section */}
        <div className="dashboard-charts-section animate-in" style={{animationDelay: '800ms'}}>
          <section className="revchart-section">
            <div className="revchart-title">Omzet 2025 vs 2024 (op basis van offerte-aanvragen)</div>
            <RevenueChart data2025={revenue2025} data2024={revenue2024} />
          </section>
        </div>
      </main>
    </div>
  );
}


