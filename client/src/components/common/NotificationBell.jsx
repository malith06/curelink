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
        className={`relative p-2.5 transition-all focus:outline-none rounded-xl ${
          isOpen ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:text-primary-600 hover:bg-slate-100'
        }`}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-red-500 rounded-full border-2 border-white shadow-sm ring-1 ring-red-500/20 animate-in zoom-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-[360px] bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 z-50 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary-500" /> Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-800 font-bold flex items-center bg-primary-50 hover:bg-primary-100 px-2 py-1 rounded-md transition-colors"
              >
                <Check className="w-3 h-3 mr-1" />
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-grow custom-scrollbar">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm font-medium">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center">
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <Bell className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm font-medium">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.slice(0, 5).map((notification) => (
                  <Link
                    key={notification._id}
                    to={getNotificationLink(notification)}
                    onClick={() => handleNotificationClick(notification)}
                    className={`block p-4 hover:bg-slate-50 transition-colors relative ${
                      !notification.isRead ? 'bg-primary-50/20' : ''
                    }`}
                  >
                    {!notification.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500"></div>
                    )}
                    <div className="flex items-start gap-3 pl-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${!notification.isRead ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
                         <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold mb-0.5 ${!notification.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <span className="text-[10px] font-bold text-slate-400 mt-2 block uppercase tracking-wider">
                          {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-sm font-bold text-primary-600 hover:text-primary-800 block text-center py-2 bg-white border border-primary-100 hover:border-primary-200 rounded-xl transition-colors shadow-sm"
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
