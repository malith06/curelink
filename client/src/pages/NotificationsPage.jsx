import React, { useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2 } from 'lucide-react';

const NotificationsPage = () => {
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  // If we needed pagination, we'd handle it here. 
  // For now we'll just show the ones we fetched in context or fetch more if context was empty.

  const getNotificationLink = (notification) => {
    const entityId = notification.entityId;
    if (!entityId) return '#';

    switch (notification.type) {
      case 'REQUEST_RECEIVED':
        return `/pharmacy/requests/${entityId}`;
      case 'QUOTATION_RECEIVED':
        return `/customer/requests/${notification.entity?.requestId || entityId}`;
      case 'QUOTATION_ACCEPTED':
        return `/pharmacy/quotations`;
      case 'ORDER_ACCEPTED':
      case 'ORDER_PREPARING':
      case 'ORDER_READY':
      case 'ORDER_OUT_FOR_DELIVERY':
      case 'ORDER_DELIVERED':
      case 'ORDER_CANCELLED':
      case 'ORDER_REJECTED':
      case 'PAYMENT_SUCCESSFUL':
      case 'PAYMENT_FAILED':
        return notification.recipientRole === 'PHARMACY' 
          ? `/pharmacy/orders/${entityId}` 
          : `/customer/orders`;
      default:
        return '#';
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Bell className="w-6 h-6 mr-2 text-primary" />
          Notifications
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center text-sm font-medium text-primary hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-lg transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Loading your notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications yet</h3>
            <p className="text-gray-500 max-w-sm">
              When you receive updates about your requests, quotations, or orders, they will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <li 
                key={notification._id}
                className={`transition-colors hover:bg-gray-50 ${
                  !notification.isRead ? 'bg-primary-50/20' : ''
                }`}
              >
                <Link
                  to={getNotificationLink(notification)}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                  className="block p-4 sm:px-6"
                >
                  <div className="flex gap-4">
                    {!notification.isRead && (
                      <div className="w-2.5 h-2.5 mt-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                    <div className={`flex-1 ${notification.isRead ? 'ml-6.5' : ''}`}>
                      <h4 className={`text-sm font-semibold mb-1 ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <time className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </time>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
