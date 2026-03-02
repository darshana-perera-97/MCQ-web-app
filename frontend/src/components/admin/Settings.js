import { useState, useEffect } from 'react';
import { settingsAPI, getAdminSecret } from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Settings as SettingsIcon, Mail, CheckCircle, XCircle, Loader } from 'lucide-react';

export function Settings() {
  const [settings, setSettings] = useState({
    globalDailyLimit: 10,
    smtp: {
      host: '',
      port: '587',
      secure: false,
      user: '',
      password: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const adminSecret = getAdminSecret();
      const data = await settingsAPI.get(adminSecret);
      setSettings({
        globalDailyLimit: data.globalDailyLimit || 10,
        smtp: data.smtp || {
          host: '',
          port: '587',
          secure: false,
          user: '',
          password: '',
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to load settings');
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const adminSecret = getAdminSecret();
      await settingsAPI.update(settings, adminSecret);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSMTP = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      setError(null);
      const adminSecret = getAdminSecret();
      const result = await settingsAPI.testSMTP(adminSecret);
      setTestResult(result);
    } catch (err) {
      setTestResult({
        success: false,
        error: err.message || 'SMTP test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSMTPChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      smtp: {
        ...prev.smtp,
        [field]: field === 'secure' ? value === 'true' || value === true : value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <div className="text-xl text-gray-600">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage system settings and email configuration</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Daily Limit Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Limit</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dailyLimit" className="text-sm font-medium text-gray-700">
                Global Daily Question Limit
              </Label>
              <Input
                id="dailyLimit"
                type="number"
                min="1"
                value={settings.globalDailyLimit}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    globalDailyLimit: parseInt(e.target.value) || 10,
                  }))
                }
                className="rounded-lg border-gray-300 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/30 focus:ring-offset-0 h-11"
              />
              <p className="text-sm text-gray-500">
                Maximum number of questions a student can attempt per day
              </p>
            </div>
          </div>
        </div>

        {/* SMTP Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#667eea]" />
              Email (SMTP) Configuration
            </h2>
            <Button
              onClick={handleTestSMTP}
              disabled={testing || !settings.smtp.host || !settings.smtp.user}
              variant="outline"
              className="rounded-lg"
            >
              {testing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
          </div>

          {testResult && (
            <div
              className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                testResult.success
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <div>
                <p className="font-medium">
                  {testResult.success ? 'SMTP Connection Successful!' : 'SMTP Test Failed'}
                </p>
                {testResult.error && <p className="text-sm mt-1">{testResult.error}</p>}
                {testResult.message && <p className="text-sm mt-1">{testResult.message}</p>}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost" className="text-sm font-medium text-gray-700">
                  SMTP Host <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="smtpHost"
                  type="text"
                  placeholder="smtp.gmail.com"
                  value={settings.smtp.host}
                  onChange={(e) => handleSMTPChange('host', e.target.value)}
                  className="rounded-lg border-gray-300 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/30 focus:ring-offset-0 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPort" className="text-sm font-medium text-gray-700">
                  SMTP Port <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="smtpPort"
                  type="text"
                  placeholder="587"
                  value={settings.smtp.port}
                  onChange={(e) => handleSMTPChange('port', e.target.value)}
                  className="rounded-lg border-gray-300 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/30 focus:ring-offset-0 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpSecure" className="text-sm font-medium text-gray-700">
                Use Secure Connection (TLS/SSL)
              </Label>
              <select
                id="smtpSecure"
                value={settings.smtp.secure ? 'true' : 'false'}
                onChange={(e) => handleSMTPChange('secure', e.target.value)}
                className="w-full h-11 rounded-lg border border-gray-300 focus:border-[#667eea] focus:outline-none focus:ring-2 focus:ring-[#667eea]/30 focus:ring-offset-0 transition-all"
              >
                <option value="false">No (STARTTLS)</option>
                <option value="true">Yes (SSL/TLS)</option>
              </select>
              <p className="text-sm text-gray-500">
                Use SSL/TLS for port 465, STARTTLS for port 587
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpUser" className="text-sm font-medium text-gray-700">
                  SMTP Username/Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="smtpUser"
                  type="email"
                  placeholder="your-email@gmail.com"
                  value={settings.smtp.user}
                  onChange={(e) => handleSMTPChange('user', e.target.value)}
                  className="rounded-lg border-gray-300 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/30 focus:ring-offset-0 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPassword" className="text-sm font-medium text-gray-700">
                  SMTP Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  placeholder="Enter SMTP password"
                  value={settings.smtp.password}
                  onChange={(e) => handleSMTPChange('password', e.target.value)}
                  className="rounded-lg border-gray-300 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/30 focus:ring-offset-0 h-11"
                />
                <p className="text-sm text-gray-500">
                  For Gmail, use an App Password instead of your regular password
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg h-11 px-6 bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}

