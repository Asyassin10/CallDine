import styles from "./FloorPlan.module.css";

const tables = Array.from({ length: 12 }, (_, index) => `T${index + 1}`);

export function FloorPlan() {
  return <section className={styles.card}><header><p>Dining room</p><h2>Table layout</h2></header><div className={styles.plan}>{tables.map(table => <div className={styles.group} key={table}><i className={styles.topLeft}/><i className={styles.topRight}/><i className={styles.bottomLeft}/><i className={styles.bottomRight}/><i className={styles.left}/><i className={styles.right}/><div className={styles.table}>{table}</div></div>)}</div></section>;
}
