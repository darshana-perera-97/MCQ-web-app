import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { LandingPageSinhala } from './components/LandingPageSinhala';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoginSignup } from './components/LoginSignup';
import { AdminLogin } from './components/AdminLogin';
import { Dashboard } from './components/student/Dashboard';
import { QuizInterface } from './components/student/QuizInterface';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserManagement } from './components/admin/UserManagement';
import { QuestionEditor } from './components/admin/QuestionEditor';
import { NotificationComposer } from './components/admin/NotificationComposer';
import { Analytics } from './components/admin/Analytics';
import { Settings } from './components/admin/Settings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sin" element={<LandingPageSinhala />} />
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/student/dashboard" element={<Dashboard />} />
          <Route path="/quiz" element={<QuizInterface />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="questions" element={<QuestionEditor />} />
            <Route path="notifications" element={<NotificationComposer />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
