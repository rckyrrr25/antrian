// adminPanel.js
import React, { useContext } from 'react';
import { QueueContext } from '../QueueContext';


const AdminPanel = () => {
  const {
    queueData, setQueueData,
    systemPaused, setSystemPaused,
    currentDisplayPoli, setCurrentDisplayPoli,
    announcements, setAnnouncements,
    notification, setNotification,
    poliNames, poliRooms
  } = useContext(QueueContext);

  const poliConfig = [
    { id: 'umum', name: 'Poli Umum', icon: '👩‍⚕️', room: 'Ruang Praktek A1-A3', gradient: 'from-blue-500 to-blue-700' },
    { id: 'anak', name: 'Poli Anak', icon: '👶', room: 'Ruang Praktek B1-B2', gradient: 'from-orange-500 to-orange-700' },
    { id: 'gigi', name: 'Poli Gigi', icon: '🦷', room: 'Ruang Praktek C1-C2', gradient: 'from-purple-500 to-purple-700' },
    { id: 'ptm', name: 'Poli PTM', icon: '❤️', room: 'Ruang Praktek D1-D2', gradient: 'from-red-500 to-red-700' }
  ];

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const addAnnouncement = (poli, action) => {
    const time = new Date().toLocaleTimeString('id-ID');
    const number = queueData[poli].prefix + String(queueData[poli].current).padStart(3, '0');
    const newAnnouncement = {
      time,
      message: `Nomor ${number} ${action} ke ${poliNames[poli]}`
    };

    setAnnouncements(prev => [newAnnouncement, ...prev.slice(0, 9)]);
  };

  const callNext = (poli) => {
    if (systemPaused) {
      showNotification('Sistem sedang dijeda', 'error');
      return;
    }

    if (queueData[poli].waiting <= 0) {
      showNotification('Tidak ada antrian selanjutnya', 'error');
      return;
    }

    setQueueData(prev => ({
      ...prev,
      [poli]: {
        ...prev[poli],
        current: prev[poli].current + 1,
        waiting: prev[poli].waiting - 1
      }
    }));

    setCurrentDisplayPoli(poli);
    addAnnouncement(poli, 'dipanggil');

    const nextNumber = queueData[poli].prefix + String(queueData[poli].current + 1).padStart(3, '0');
    showNotification(`Nomor ${nextNumber} dipanggil ke ${poliNames[poli]}`);
  };

  const callAgain = (poli) => {
    if (systemPaused) {
      showNotification('Sistem sedang dijeda', 'error');
      return;
    }

    setCurrentDisplayPoli(poli);
    addAnnouncement(poli, 'dipanggil ulang');

    const currentNumber = queueData[poli].prefix + String(queueData[poli].current).padStart(3, '0');
    showNotification(`Nomor ${currentNumber} dipanggil ulang`);
  };

  const skipNumber = (poli) => {
    if (systemPaused) {
      showNotification('Sistem sedang dijeda', 'error');
      return;
    }

    if (queueData[poli].waiting <= 0) {
      showNotification('Tidak ada antrian untuk dilewati', 'error');
      return;
    }

    setQueueData(prev => ({
      ...prev,
      [poli]: {
        ...prev[poli],
        current: prev[poli].current + 1,
        waiting: prev[poli].waiting - 1
      }
    }));

    addAnnouncement(poli, 'dilewati');

    const skippedNumber = queueData[poli].prefix + String(queueData[poli].current + 1).padStart(3, '0');
    showNotification(`Nomor ${skippedNumber} dilewati`);
  };

  const toggleSystem = () => {
    setSystemPaused(!systemPaused);
    if (!systemPaused) {
      showNotification('Sistem telah dijeda', 'error');
    } else {
      showNotification('Sistem telah diaktifkan');
    }
  };

  const resetAllQueues = () => {
    if (!window.confirm('Apakah Anda yakin ingin mereset semua antrian? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    setQueueData(prev => {
      const resetData = {};
      Object.keys(prev).forEach(poli => {
        resetData[poli] = {
          ...prev[poli],
          current: 0,
          total: 0,
          waiting: 0
        };
      });
      return resetData;
    });

    setAnnouncements([]);
    setCurrentDisplayPoli('umum');
    showNotification('Semua antrian telah direset');
  };

  const exportData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      queueData: queueData,
      announcements: announcements
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `queue-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('Data berhasil diexport');
  };

  const getCurrentDisplayNumber = () => {
    const current = queueData[currentDisplayPoli];
    return current.prefix + String(current.current).padStart(3, '0');
  };

  return (
    <div className="min-h-screen text-white p-5" style={{
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
    }}>
      <style jsx>{`
        .container {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        
        .glass-panel:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.15);
        }
        
        .header-panel {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 30px;
          margin-bottom: 30px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .header-title {
          font-size: 32px;
          margin-bottom: 10px;
          font-weight: bold;
          background: linear-gradient(135deg, #3498db, #2ecc71);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .header-subtitle {
          font-size: 18px;
          opacity: 0.8;
          color: #ddd;
        }
        
        .main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        
        .poli-controls {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px;
        }
        
        .poli-panel {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 25px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        
        .poli-panel:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.15);
        }
        
        .poli-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .poli-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin-right: 15px;
          color: white;
        }
        
        .poli-icon.umum { background: linear-gradient(135deg, #2196F3, #1976D2); }
        .poli-icon.anak { background: linear-gradient(135deg, #FF9800, #F57C00); }
        .poli-icon.gigi { background: linear-gradient(135deg, #9C27B0, #7B1FA2); }
        .poli-icon.ptm { background: linear-gradient(135deg, #F44336, #C62828); }
        
        .poli-info h3 {
          font-size: 20px;
          margin-bottom: 5px;
          font-weight: bold;
          color: #fff;
        }
        
        .poli-info p {
          opacity: 0.7;
          font-size: 14px;
          color: #ddd;
        }
        
        .queue-status {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
          padding: 15px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 15px;
          color: #fff;
        }
        
        .status-item {
          text-align: center;
          color: #fff;
        }
        
        .status-item .label {
          font-size: 12px;
          opacity: 0.7;
          margin-bottom: 5px;
          color: #fff;
        }
        
        .status-item .value {
          font-size: 24px;
          font-weight: bold;
          color: #fff;
        }
        
        .current-number {
          color: #2ecc71;
        }
        
        .waiting-count {
          color: #f39c12;
        }
        
        .call-controls {
          display: flex;
          gap: 8px;
          margin-top: 20px;
        }
        
        .call-btn {
          flex: 1;
          padding: 12px 8px;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }
        
        .call-next {
          background: linear-gradient(135deg, #2ecc71, #27ae60);
        }
        
        .call-again {
          background: linear-gradient(135deg, #3498db, #2980b9);
        }
        
        .skip-number {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
        }
        
        .call-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }
        
        .call-btn:disabled {
          background: #7f8c8d !important;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
          opacity: 0.5;
        }
        
        .display-panel {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 30px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
        }
        
        .current-call {
          background: linear-gradient(135deg, #2ecc71, #27ae60);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          color: #fff;
        }
        
        .current-call h2 {
          font-size: 24px;
          margin-bottom: 15px;
          font-weight: bold;
          color: #fff;
        }
        
        .call-number {
          font-size: 72px;
          font-weight: 900;
          margin: 20px 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .call-location {
          font-size: 20px;
          opacity: 0.9;
        }
        
        .announcements {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 20px;
          padding: 20px;
          max-height: 300px;
          overflow-y: auto;
          color: #fff;
        }
        
        .announcements h3 {
          margin-bottom: 15px;
          color: #3498db;
          font-weight: bold;
        }
        
        .announcement-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 15px;
          margin-bottom: 10px;
          border-left: 4px solid #3498db;
        }
        
        .announcement-time {
          font-size: 12px;
          opacity: 0.6;
          margin-bottom: 5px;
        }
        
        .global-controls {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 25px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .global-btn {
          padding: 15px 30px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }
        
        .reset-all {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
        }
        
        .pause-system {
          background: linear-gradient(135deg, #f39c12, #d68910);
        }
        
        .export-data {
          background: linear-gradient(135deg, #9b59b6, #8e44ad);
        }
        
        .global-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }
        
        .system-status {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #2ecc71;
          animation: pulse 2s infinite;
        }
        
        .status-indicator.paused {
          background: #e74c3c;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 25px;
          border-radius: 12px;
          font-weight: bold;
          color: white;
          z-index: 1000;
          transition: all 0.3s ease;
        }
        
        .notification.success {
          background: linear-gradient(135deg, #2ecc71, #27ae60);
        }
        
        .notification.error {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
        }
        
        .notification.show {
          transform: translateX(0);
        }
        
        .notification.hide {
          transform: translateX(400px);
        }
        
        @media (max-width: 1200px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
          
          .poli-controls {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 768px) {
          .global-controls {
            flex-direction: column;
            text-align: center;
          }
          
          .call-number {
            font-size: 48px;
          }
          
          .poli-controls {
            grid-template-columns: 1fr;
          }
          
          .call-controls {
            flex-direction: column;
            gap: 10px;
          }
          
          .call-btn {
            padding: 15px;
            font-size: 16px;
          }
        }
      `}</style>
      <div className="container">
        {/* Header */}
        <div className="header-panel">
          <h1 className="header-title">
            Panel Admin - Sistem Antrian
          </h1>
          <p className="header-subtitle">
            Kelola dan pantau antrian pasien di seluruh poli rumah sakit
          </p>
        </div>

        {/* Main Grid */}
        <div className="main-grid">
          {/* Poli Controls */}
          <div className="poli-controls">
            {poliConfig.map((poli) => (
              <div key={poli.id} className="poli-panel">
                {/* Poli Header */}
                <div className="poli-header">
                  <div className={`poli-icon ${poli.id}`}>
                    {poli.icon}
                  </div>
                  <div className="poli-info">
                    <h3>{poli.name}</h3>
                    <p>{poli.room}</p>
                  </div>
                </div>

                {/* Queue Status */}
                <div className="queue-status">
                  <div className="status-item">
                    <div className="label">Sedang Dipanggil</div>
                    <div className="value current-number">
                      {queueData[poli.id].prefix}{String(queueData[poli.id].current).padStart(3, '0')}
                    </div>
                  </div>
                  <div className="status-item">
                    <div className="label">Menunggu</div>
                    <div className="value waiting-count">
                      {queueData[poli.id].waiting}
                    </div>
                  </div>
                  <div className="status-item">
                    <div className="label">Total Hari Ini</div>
                    <div className="value">
                      {queueData[poli.id].total}
                    </div>
                  </div>
                </div>

                {/* Call Controls */}
                <div className="call-controls">
                  <button
                    onClick={() => callNext(poli.id)}
                    className="call-btn call-next"
                    disabled={systemPaused}
                  >
                    Panggil Selanjutnya
                  </button>
                  <button
                    onClick={() => callAgain(poli.id)}
                    className="call-btn call-again"
                    disabled={systemPaused}
                  >
                    Panggil Ulang
                  </button>
                  <button
                    onClick={() => skipNumber(poli.id)}
                    className="call-btn skip-number"
                    disabled={systemPaused}
                  >
                    Lewati
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Display Panel */}
          <div className="display-panel">
            {/* Current Call */}
            <div className="current-call">
              <h2>Sedang Dipanggil</h2>
              <div className="call-number">
                {getCurrentDisplayNumber()}
              </div>
              <div className="call-location">
                ke {poliNames[currentDisplayPoli]} - {poliRooms[currentDisplayPoli]}
              </div>
            </div>

            {/* Announcements */}
            <div className="announcements">
              <h3>📢 Riwayat Panggilan</h3>
              <div>
                {announcements.map((announcement, index) => (
                  <div key={index} className="announcement-item">
                    <div className="announcement-time">{announcement.time}</div>
                    <div>{announcement.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="global-controls">
          <div className="system-status">
            <div className={`status-indicator ${systemPaused ? 'paused' : ''}`}></div>
            <span>
              {systemPaused ? 'Sistem Dijeda' : 'Sistem Aktif'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button
              onClick={toggleSystem}
              className={`global-btn ${systemPaused ? 'pause-system' : 'pause-system'}`}
            >
              {systemPaused ? '▶️ Aktifkan Sistem' : '⏸️ Jeda Sistem'}
            </button>
            <button
              onClick={exportData}
              className="global-btn export-data"
            >
              📊 Export Data
            </button>
            <button
              onClick={resetAllQueues}
              className="global-btn reset-all"
            >
              🔄 Reset Semua
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type} show`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;