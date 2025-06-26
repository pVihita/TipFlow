import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DynamicProvider } from './providers/DynamicProvider';

import { WelcomePage } from './pages/WelcomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { TippingPage } from './pages/TippingPage';
import { MyTipsPage } from './pages/MyTipsPage';

function App() {
  return (
    <DynamicProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/tip/:handle?" element={<TippingPage />} />
            <Route path="/my-tips" element={<MyTipsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </DynamicProvider>
  );
}

export default App;
