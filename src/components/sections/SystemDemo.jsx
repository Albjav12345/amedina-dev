import React, { useState, useEffect, useRef } from 'react';
import './SystemDemo.css';

const SystemDemo = () => {
    const [logs, setLogs] = useState([]);
    const logsEndRef = useRef(null);

    const possibleLogs = [
        { type: 'info', msg: 'Connecting to main cluster...' },
        { type: 'success', msg: 'Connection established (Latency: 24ms)' },
        { type: 'info', msg: 'Running diagnostic metrics...' },
        { type: 'warning', msg: 'High load detected on worker-04' },
        { type: 'success', msg: 'Load balanced successfully' },
        { type: 'info', msg: 'Syncing database shards...' },
        { type: 'success', msg: 'Sync complete. 10424 records processed' },
        { type: 'info', msg: 'Deep Learning Model v4.2 loaded' },
        { type: 'success', msg: 'Inference pipeline ready' },
    ];

    useEffect(() => {
        // Initial logs
        const initial = possibleLogs.slice(0, 3);
        setLogs(initial);

        const interval = setInterval(() => {
            const randomLog = possibleLogs[Math.floor(Math.random() * possibleLogs.length)];
            const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

            setLogs(prev => {
                const newLogs = [...prev, { ...randomLog, time: timestamp }];
                if (newLogs.length > 8) return newLogs.slice(newLogs.length - 8);
                return newLogs;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section id="system-demo" className="system-section">
            <div className="container">
                <div className="section-header-meta">
                    <span className="section-id">SYS_03</span>
                    <h2 className="section-title">Live Systems.</h2>
                    <div className="section-line"></div>
                </div>

                <div className="system-dashboard">
                    <div className="dashboard-header mono">
                        <div className="header-left">
                            <span className="status-indicator active"></span>
                            <span>SYSTEM_MONITOR_V2</span>
                        </div>
                        <div className="header-right">
                            <span>CPU: 12%</span>
                            <span>MEM: 4.2GB</span>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        {/* Log Panel */}
                        <div className="panel log-panel">
                            <div className="panel-title mono">Event Log</div>
                            <div className="logs-container mono">
                                {logs.map((log, i) => (
                                    <div key={i} className={`log-entry ${log.type}`}>
                                        <span className="log-time">[{log.time || '10:00:00'}]</span>
                                        <span className="log-msg">&gt; {log.msg}</span>
                                    </div>
                                ))}
                                <div ref={logsEndRef} />
                            </div>
                        </div>

                        {/* Visualizer Panel (Fake Charts) */}
                        <div className="panel visual-panel">
                            <div className="panel-title mono">Active Processes</div>
                            <div className="process-list">
                                <div className="process-item">
                                    <div className="process-info mono">
                                        <span>API_GATEWAY</span>
                                        <span>98%</span>
                                    </div>
                                    <div className="progress-bar"><div className="fill" style={{ width: '98%' }}></div></div>
                                </div>
                                <div className="process-item">
                                    <div className="process-info mono">
                                        <span>GROQ_INFERENCE</span>
                                        <span>64%</span>
                                    </div>
                                    <div className="progress-bar"><div className="fill" style={{ width: '64%' }}></div></div>
                                </div>
                                <div className="process-item">
                                    <div className="process-info mono">
                                        <span>OCR_WORKER_01</span>
                                        <span>32%</span>
                                    </div>
                                    <div className="progress-bar"><div className="fill" style={{ width: '32%' }}></div></div>
                                </div>
                            </div>

                            <div className="graph-viz">
                                {/* CSS Only Bar Graph Simulation */}
                                {[40, 60, 30, 80, 50, 90, 20, 60].map((h, i) => (
                                    <div key={i} className="bar" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SystemDemo;
