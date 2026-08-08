import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    setIsOpen(false);
  };

  const getNotificationLink = (notification) => {
    // Determine the route based on notification entity type and user role
    const entityId = notification.entityId;
    if (!entityId) return '#';

    switch (notification.type) {
      case 'REQUEST_RECEIVED':
        return `/pharmacy/requests/${entityId}`;
      case 'QUOTATION_RECEIVED':
        // For customer, link to quotation details if we have request context, or just request page
        // Here we link to the request as a safe fallback
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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-primary transition-colors focus:outline-none rounded-full hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:text-primary-700 font-medium flex items-center"
              >
                <Check className="w-3 h-3 mr-1" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-grow">
            {loading && notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 5).map((notification) => (
                  <Link
                    key={notification._id}
                    to={getNotificationLink(notification)}
                    onClick={() => handleNotificationClick(notification)}
                    className={`block p-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-primary-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!notification.isRead && (
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                      )}
                      <div className={`flex-1 ${notification.isRead ? 'ml-5' : ''}`}>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <span className="text-[10px] text-gray-400 mt-2 block">
                          {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                          {new Date(notification.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 5 && (
            <div className="border-t border-gray-100 p-2 bg-gray-50 text-center">
              <Link
                to="/notifications" // We'll implement this page next
                onClick={() => setIsOpen(false)}
                className="text-xs font-medium text-primary hover:text-primary-700 block py-1"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
