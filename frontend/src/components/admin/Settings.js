import { useState, useEffect } from 'react';
import { settingsAPI, whatsappAPI, getAdminSecret } from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Settings as SettingsIcon, Mail, CheckCircle, XCircle, Loader, MessageCircle, QrCode, Bell } from 'lucide-react';

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
    notifications: {
      emailEnabled: true,
      whatsappEnabled: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // WhatsApp state
  const [whatsappStatus, setWhatsappStatus] = useState({
    status: 'disconnected',
    qrCode: null,
    isConnected: false,
    isConnecting: false
  });
  const [whatsappLoading, setWhatsappLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadWhatsAppStatus();
  }, []);

  useEffect(() => {
    // Poll for WhatsApp status updates when connecting
    let interval = null;
    
    if (whatsappStatus.isConnecting || whatsappStatus.status === 'connecting') {
      interval = setInterval(() => {
        loadWhatsAppStatus();
      }, 3000); // Poll every 3 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [whatsappStatus.isConnecting, whatsappStatus.status]);

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
        notifications: data.notifications || {
          emailEnabled: true,
          whatsappEnabled: true,
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

  const loadWhatsAppStatus = async () => {
    try {
      const adminSecret = getAdminSecret();
      const status = await whatsappAPI.getStatus(adminSecret);
      setWhatsappStatus(status);
    } catch (err) {
      console.error('Error loading WhatsApp status:', err);
    }
  };

  const handleConnectWhatsApp = async () => {
    try {
      setWhatsappLoading(true);
      setError(null);
      const adminSecret = getAdminSecret();
      const result = await whatsappAPI.connect(adminSecret);
      setWhatsappStatus({
        status: result.status || 'connecting',
        qrCode: result.qrCode,
        isConnected: result.status === 'connected',
        isConnecting: result.status === 'connecting'
      });
    } catch (err) {
      setError(err.message || 'Failed to connect WhatsApp');
      console.error('Error connecting WhatsApp:', err);
    } finally {
      setWhatsappLoading(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    try {
      setWhatsappLoading(true);
      setError(null);
      const adminSecret = getAdminSecret();
      await whatsappAPI.disconnect(adminSecret);
      setWhatsappStatus({
        status: 'disconnected',
        qrCode: null,
        isConnected: false,
        isConnecting: false
      });
      setSuccess('WhatsApp disconnected successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to disconnect WhatsApp');
      console.error('Error disconnecting WhatsApp:', err);
    } finally {
      setWhatsappLoading(false);
    }
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

        {/* WhatsApp Configuration */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              WhatsApp Configuration
            </h2>
            <div className="flex gap-2">
              {whatsappStatus.isConnected ? (
                <Button
                  onClick={handleDisconnectWhatsApp}
                  disabled={whatsappLoading}
                  variant="outline"
                  className="rounded-lg border-red-300 text-red-600 hover:bg-red-50"
                >
                  {whatsappLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    'Disconnect'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleConnectWhatsApp}
                  disabled={whatsappLoading || whatsappStatus.isConnecting}
                  variant="outline"
                  className="rounded-lg border-[#25D366] text-[#25D366] hover:bg-green-50"
                >
                  {whatsappLoading || whatsappStatus.isConnecting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect WhatsApp'
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Connection Status */}
          <div className="mb-4">
            <div className={`p-4 rounded-lg flex items-center gap-2 ${
              whatsappStatus.isConnected
                ? 'bg-green-50 border border-green-200 text-green-700'
                : whatsappStatus.status === 'connecting'
                ? 'bg-blue-50 border border-blue-200 text-blue-700'
                : 'bg-gray-50 border border-gray-200 text-gray-700'
            }`}>
              {whatsappStatus.isConnected ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <div>
                <p className="font-medium">
                  Status: {whatsappStatus.status === 'connected' 
                    ? 'Connected' 
                    : whatsappStatus.status === 'connecting'
                    ? 'Connecting...'
                    : 'Disconnected'}
                </p>
                {whatsappStatus.isConnected && (
                  <p className="text-sm mt-1">WhatsApp is ready to send messages</p>
                )}
              </div>
            </div>
          </div>

          {/* QR Code Display */}
          {whatsappStatus.qrCode && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-700">
                <QrCode className="w-5 h-5" />
                <p className="font-medium">Scan QR Code to Link WhatsApp</p>
              </div>
              <div className="flex justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <img 
                  src={whatsappStatus.qrCode} 
                  alt="WhatsApp QR Code" 
                  className="max-w-xs w-full h-auto"
                />
              </div>
              <p className="text-sm text-gray-500 text-center">
                Open WhatsApp on your phone → Settings → Linked Devices → Link a Device → Scan this QR code
              </p>
            </div>
          )}

          {!whatsappStatus.qrCode && !whatsappStatus.isConnected && (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Click "Connect WhatsApp" to generate a QR code</p>
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-[#667eea]" />
            Notification Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <Label htmlFor="emailNotifications" className="text-sm font-medium text-gray-900 cursor-pointer">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-gray-500">Send notifications via email to students</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.notifications?.emailEnabled !== false}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        emailEnabled: e.target.checked,
                      },
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#667eea]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#667eea] peer-checked:to-[#764ba2]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                <div>
                  <Label htmlFor="whatsappNotifications" className="text-sm font-medium text-gray-900 cursor-pointer">
                    WhatsApp Notifications
                  </Label>
                  <p className="text-xs text-gray-500">Send notifications via WhatsApp to students</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="whatsappNotifications"
                  checked={settings.notifications?.whatsappEnabled !== false}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        whatsappEnabled: e.target.checked,
                      },
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#25D366]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
              </label>
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

