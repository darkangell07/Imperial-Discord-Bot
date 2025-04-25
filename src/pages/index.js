import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [status, setStatus] = useState('Loading...');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Fetch bot status on page load
    fetchBotStatus();
    
    // Set up polling for status updates every 30 seconds
    const interval = setInterval(fetchBotStatus, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchBotStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setStatus(data.status);
    } catch (error) {
      console.error('Error fetching bot status:', error);
      setStatus('Error fetching status');
    }
  };
  
  const handleCommand = async (command) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/${command}`, { method: 'POST' });
      const data = await response.json();
      alert(data.message);
      // Refresh status after command
      fetchBotStatus();
    } catch (error) {
      console.error(`Error executing ${command}:`, error);
      alert(`Failed to execute ${command}. See console for details.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Discord Bot Dashboard</title>
        <meta name="description" content="Dashboard for Imperial Discord Bot" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className={styles.main}>
        <h1 className={styles.title}>Imperial Discord Bot Dashboard</h1>
        
        <div className={styles.statusContainer}>
          <h2>Bot Status</h2>
          <div className={styles.statusIndicator}>
            <div className={`${styles.statusDot} ${styles[status.toLowerCase()]}`}></div>
            <p className={styles.statusText}>{status}</p>
          </div>
        </div>
        
        <div className={styles.controlsContainer}>
          <h2>Bot Controls</h2>
          <div className={styles.buttonGrid}>
            <button 
              className={`${styles.button} ${styles.restartButton}`}
              onClick={() => handleCommand('restart')}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Restart Bot'}
            </button>
            
            <button 
              className={`${styles.button} ${styles.shutdownButton}`}
              onClick={() => handleCommand('shutdown')}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Shutdown Bot'}
            </button>
          </div>
        </div>
        
        <div className={styles.statsContainer}>
          <h2>Bot Statistics</h2>
          <p>Uptime: <span id="uptime">Fetching...</span></p>
          <p>Servers: <span id="servers">Fetching...</span></p>
          <p>Commands Used: <span id="commands">Fetching...</span></p>
        </div>
      </main>
      
      <footer className={styles.footer}>
        <p>Imperial Discord Bot © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
} 