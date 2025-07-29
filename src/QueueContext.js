import React, { createContext, useState, useEffect } from 'react';

const QueueContext = createContext();

const QueueProvider = ({ children }) => {
  // Inisialisasi dari localStorage jika ada
  const getInitialState = () => {
    try {
      const saved = localStorage.getItem('queue-shared-state');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      queueData: {
        umum: { current: 8, total: 12, waiting: 4, prefix: 'U' },
        anak: { current: 5, total: 8, waiting: 3, prefix: 'A' },
        gigi: { current: 3, total: 5, waiting: 2, prefix: 'G' },
        ptm: { current: 12, total: 15, waiting: 3, prefix: 'P' }
      },
      systemPaused: false,
      currentDisplayPoli: 'umum',
      announcements: [
        { time: '14:25:30', message: 'Nomor U008 dipanggil ke Poli Umum' },
        { time: '14:23:15', message: 'Nomor A005 dipanggil ke Poli Anak' },
        { time: '14:21:45', message: 'Nomor G003 dipanggil ke Poli Gigi' }
      ]
    };
  };
  const [queueData, setQueueData] = useState(getInitialState().queueData);
  const [systemPaused, setSystemPaused] = useState(getInitialState().systemPaused);
  const [currentDisplayPoli, setCurrentDisplayPoli] = useState(getInitialState().currentDisplayPoli);
  const [announcements, setAnnouncements] = useState(getInitialState().announcements);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const poliNames = {
    umum: 'Poli Umum',
    anak: 'Poli Anak',
    gigi: 'Poli Gigi',
    ptm: 'Poli PTM'
  };
  const poliRooms = {
    umum: 'Ruang A1',
    anak: 'Ruang B1',
    gigi: 'Ruang C1',
    ptm: 'Ruang D1'
  };

  // Simpan ke localStorage setiap ada perubahan state utama
  useEffect(() => {
    const data = {
      queueData,
      systemPaused,
      currentDisplayPoli,
      announcements
    };
    localStorage.setItem('queue-shared-state', JSON.stringify(data));
  }, [queueData, systemPaused, currentDisplayPoli, announcements]);

  // Sinkronisasi antar tab
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'queue-shared-state' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data) {
            setQueueData(data.queueData);
            setSystemPaused(data.systemPaused);
            setCurrentDisplayPoli(data.currentDisplayPoli);
            setAnnouncements(data.announcements);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <QueueContext.Provider value={{
      queueData, setQueueData,
      systemPaused, setSystemPaused,
      currentDisplayPoli, setCurrentDisplayPoli,
      announcements, setAnnouncements,
      notification, setNotification,
      poliNames, poliRooms
    }}>
      {children}
    </QueueContext.Provider>
  );
};

export { QueueContext, QueueProvider };
