import { useState, useEffect } from 'react';
import { notificationAPI } from '../../services/api';
import { BACKEND_URL } from '../../config/api';
import { Button } from '../ui/button';
import { Bell, X, Loader } from 'lucide-react';

export function NotificationsDrawer({ open, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAll();
      const sortedNotifications = (response.notifications || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNotifications(sortedNotifications);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isNewNotification = (dateString) => {
    const notificationDate = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - notificationDate) / (1000 * 60 * 60);
    return diffInHours < 24; // Less than 24 hours old
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-80px)] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <Loader className="w-8 h-8 animate-spin text-[#667eea] mb-4" />
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 px-6">
              <Bell className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">No notifications</p>
              <p className="text-gray-400 text-sm text-center">
                You'll see announcements and updates here when they're available.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const isNew = isNewNotification(notification.createdAt);
                return (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors relative ${
                      isNew ? 'bg-gradient-to-r from-[#667eea]/5 to-[#764ba2]/5' : ''
                    }`}
                  >
                    {isNew && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10 rounded-lg animate-pulse pointer-events-none"></div>
                    )}
                    <div className="flex items-start gap-4 relative z-10">
                      <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center ${
                        isNew ? 'ring-2 ring-[#667eea] ring-offset-2 animate-pulse' : ''
                      }`}>
                        <Bell className="w-5 h-5 text-white" />
                      </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 text-base">
                            {notification.title}
                          </h3>
                          {isNew && (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white text-xs font-semibold rounded-full animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3 whitespace-pre-wrap">
                        {notification.message}
                      </p>
                      {notification.imagePath && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={`${BACKEND_URL}${notification.imagePath}`}
                            alt="Notification"
                            className="w-full h-auto max-h-48 object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

