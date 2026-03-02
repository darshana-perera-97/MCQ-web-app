import { useState, useEffect } from 'react';
import { notificationAPI, getAdminSecret } from '../../services/api';
import { BACKEND_URL } from '../../config/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Send, Upload, X } from 'lucide-react';

export function NotificationComposer() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAll();
      setNotifications(response.notifications || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSend = async () => {
    if (!title || !message) {
      window.alert('Please fill in title and message');
      return;
    }
    
    try {
      const adminSecret = getAdminSecret();
      await notificationAPI.send({ title, message }, imageFile, adminSecret);
      alert('Notification sent successfully!');
      // Reset form
      setTitle('');
      setMessage('');
      setImageFile(null);
      setImagePreview('');
      await loadNotifications();
    } catch (err) {
      alert(err.message || 'Failed to send notification');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">Send announcements and updates to all students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composer */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6 lg:p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Compose Notification</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="notification-title">Title *</Label>
                <Input
                  id="notification-title"
                  placeholder="Enter notification title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl border-gray-200 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-message">Message *</Label>
                <Textarea
                  id="notification-message"
                  placeholder="Enter your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="rounded-xl border-gray-200 min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Image (Optional)</Label>
                {imagePreview ? (
                  <div className="relative rounded-xl border-2 border-gray-200 overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="p-4 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-2xl mb-4">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                      <p className="mb-2 text-sm text-gray-600">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>

              <Button
                onClick={handleSend}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white gap-2 shadow-sm"
              >
                <Send className="w-5 h-5" />
                Send Notification
              </Button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              {title || message || imagePreview ? (
                <div className="space-y-3">
                  {title && (
                    <h4 className="font-semibold text-gray-900">{title}</h4>
                  )}
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full rounded-lg"
                    />
                  )}
                  {message && (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{message}</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Your notification preview will appear here
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Notifications</h3>
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No notifications yet</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  {notification.imagePath && (
                    <img 
                      src={`${BACKEND_URL}${notification.imagePath}`} 
                      alt="Notification" 
                      className="mt-3 rounded-lg max-w-xs"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

