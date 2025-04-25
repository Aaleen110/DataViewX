import React from 'react';
import styles from './DataViewX.module.css';

const Loading: React.FC = () => (
  <div className={styles.loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex:1, minHeight: '50vh' }}>
    <span className={styles.spinner} role="status" aria-label="Loading" />
  </div>
);

export default Loading; 