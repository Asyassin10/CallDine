import styles from "./Recommendations.module.css";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const categories = [
  { name: "Main courses", orders: 314, change: 18 },
  { name: "Boissons", orders: 286, change: 24 },
  { name: "Seafood", orders: 198, change: 9 },
  { name: "Pasta", orders: 176, change: 12 },
  { name: "Desserts", orders: 121, change: 6 },
];
const recommendations = [
  { day: "Before Friday", title: "Prepare 28 more main-course portions", text: "Demand is forecast to peak between Friday evening and Saturday." },
  { day: "Reorder today", title: "Increase drinks stock by 24%", text: "Boissons has the strongest expected growth across the next seven days." },
  { day: "Friday · 18:00", title: "Add one kitchen shift", text: "The busiest service window is expected from 19:00 to 21:00." },
];

function ForecastChart() {
  const y = [168, 150, 137, 143, 105, 72, 86];
  const points = days.map((_, index) => `${48 + index * 112},${y[index]}`).join(" ");
  const range = "48,145 160,126 272,112 384,118 496,80 608,46 720,60 720,114 608,101 496,132 384,169 272,163 160,176 48,191";
  return <div className={styles.chartWrap}>
    <svg viewBox="0 0 768 230" role="img" aria-label="Seven-day order forecast with confidence range">
      {[50, 100, 150, 200].map(line => <line key={line} x1="48" x2="720" y1={line} y2={line} className={styles.gridLine}/>) }
      <polygon points={range} className={styles.range}/><polyline points={points} className={styles.line}/>
      {days.map((day, index) => <g key={day}><rect x={44 + index * 112} y={y[index] - 4} width="8" height="8" rx="1" className={styles.point}/><text x={48 + index * 112} y="222" className={styles.axis}>{day}</text></g>)}
    </svg>
    <div className={styles.legend}><span><i className={styles.forecastKey}/>Forecast</span><span><i className={styles.rangeKey}/>Likely range</span></div>
  </div>;
}

export default function Recommendations() {
  return <div className="page">
    <div className={styles.kpis}>
      <article><span>Expected orders</span><strong>1,295</strong><small>↑ 14% vs recent average</small></article>
      <article><span>Peak day</span><strong>Saturday</strong><small>236 predicted orders</small></article>
      <article><span>Busiest window</span><strong>19:00–21:00</strong><small>Friday and Saturday</small></article>
      <article><span>Forecast horizon</span><strong>7 days</strong><small>Updated daily</small></article>
    </div>
    <div className={styles.layout}>
      <section className={`${styles.card} ${styles.forecastCard}`}><div className={styles.cardHead}><div><span>All categories</span><h2>Next 7 days</h2></div><div className={styles.total}><small>Forecast total</small><strong>1,295 orders</strong></div></div><ForecastChart/></section>
      <section className={`${styles.card} ${styles.categoryCard}`}><div className={styles.cardHead}><div><span>Menu demand</span><h2>By category</h2></div></div><div className={styles.categories}>{categories.map(category => <div key={category.name} className={styles.category}><div><strong>{category.name}</strong><span>{category.orders} orders · <em>+{category.change}%</em></span></div><div className={styles.bar}><i style={{ width: `${category.orders / 314 * 100}%` }}/></div></div>)}</div></section>
    </div>
    <section className={`${styles.card} ${styles.actionsCard}`}><div className={styles.cardHead}><div><span>Recommended actions</span><h2>Prepare for expected demand</h2></div><p>Prioritized from the forecast</p></div><div className={styles.recommendations}>{recommendations.map((item, index) => <article key={item.title}><div className={styles.number}>{String(index + 1).padStart(2, "0")}</div><div><span>{item.day}</span><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div></section>
    <p className={styles.note}>Demo values shaped like SageMaker DeepAR output. Live model training and inference are not connected yet.</p>
  </div>;
}
