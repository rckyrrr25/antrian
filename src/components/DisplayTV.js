// DisplayTV.js

import React, { useState, useEffect, useContext } from 'react';
import { QueueContext } from '../QueueContext';
import '../css/displaytv.css';


const HospitalQueueDisplay = () => {
  const {
    queueData,
    currentDisplayPoli,
    announcements,
    poliNames,
    poliRooms
  } = useContext(QueueContext);
  const [currentTime, setCurrentTime] = useState(new Date());


  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  const formatTime = (date) => {
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Ambil nomor antrian yang sedang dipanggil
  const getCurrentDisplayNumber = () => {
    const current = queueData[currentDisplayPoli];
    return current.prefix + ' ' + String(current.current).padStart(3, '0');
  };

  // Data untuk daftar antrian bawah
  const getQueueListData = () => {
    return Object.keys(queueData).map(key => ({
      label: poliNames[key].toUpperCase(),
      number: queueData[key].prefix + ' ' + String(queueData[key].current).padStart(3, '0')
    }));
  };


  return (
    <div className="container-main">
      {/* Time Display */}
      <div className="time-display">
        {formatTime(currentTime)}
      </div>
      {/* Main Content */}
      <div className="main-content">
        {/* Top Section with Queue Display and Video */}
        <div className="top-section">
          {/* Current Queue Section */}
          <div className="queue-section">
            {/* Status Indicator */}
            <div className="status-dot blink-animation"></div>
            {/* Pulse Bar */}
            <div className="pulse-bar pulse-animation"></div>
            <div className="queue-label">
              {poliNames[currentDisplayPoli]}
            </div>
            <div className="queue-number queue-number-glow">
              {getCurrentDisplayNumber()}
            </div>
          </div>
          {/* Video Section */}
          <div className="video-section">
            <div className="video-placeholder">
              <iframe 
                src="https://www.youtube.com/embed/93yfxrwqGWw?si=FvTUWjBZEKjN7bVM" 
                title="YouTube video player" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen>
              </iframe>
            </div>
          </div>
        </div>
        {/* Bottom Queue List Section */}
        <div className="queue-list-bottom">
          <div className="queue-grid">
            {getQueueListData().map((queue, index) => (
              <div
                key={index}
                className="queue-item"
              >
                <div className="queue-item-label">
                  {queue.label}
                </div>
                <div className="queue-item-number">
                  {queue.number}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalQueueDisplay;