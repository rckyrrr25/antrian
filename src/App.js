// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DisplayPage from './pages/DisplayPage';
import AdminPage from './pages/AdminPage';
import TiketPage from './pages/TiketPage';
import { QueueProvider } from './QueueContext';

function App() {
  return (
    <QueueProvider>
      <Router>
        <Routes>
          <Route path="/display" element={<DisplayPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/tiket" element={<TiketPage />} />
        </Routes>
      </Router>
    </QueueProvider>
  );
}

export default App;
