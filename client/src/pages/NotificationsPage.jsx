import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';

const NotificationsPage = () => {
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  // If we needed pagination, we'd handle it here. 
  // For now we'll just show the ones we fetched in context or fetch more if context was empty.

  const getNotificationLink = (notification) => {
    if (notification.actionUrl) {
      return notification.actionUrl;
    }

    const entityId = notification.entityId;
    if (!entityId) return '#';

    switch (notification.type) {
      case 'REQUEST_RECEIVED':
        return `/pharmacy/requests/${entityId}`;
      case 'QUOTATION_RECEIVED':
        return `/customer/requests/${notification.metadata?.requestId || notification.relatedRequestId || entityId}`;
      case 'QUOTATION_ACCEPTED':
        return `/pharmacy/quotations`;
      case 'ORDER_ACCEPTED':
      case 'ORDER_PREPARING':
      case 'ORDER_READY':
      case 'ORDER_OUT_FOR_DELIVERY':
      case 'ORDER_DELIVERED':
      case 'ORDER_COMPLETED':
      case 'ORDER_CANCELLED':
      case 'ORDER_REJECTED':
      case 'PAYMENT_SUCCESSFUL':
      case 'PAYMENT_FAILED':
        return notification.recipientRole === 'PHARMACY' 
          ? `/pharmacy/orders/${entityId}` 
          : `/customer/orders`;
      case 'PHARMACY_SUBMITTED':
        return `/admin/pharmacies/${entityId}`;
      default:
        return '#';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center tracking-tight">
            <Bell className="w-8 h-8 mr-3 text-primary-500" />
            Notifications
          </h1>
          <p className="text-slate-500 font-medium mt-2">Stay updated on your requests, quotations, and orders.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center text-sm font-bold text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark all as read
          </button>
        )}
      </div>

      <Card className="overflow-hidden">
        {loading && notifications.length === 0 ? (
           <div className="p-6 space-y-4">
             {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 w-full" />)}
           </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="When you receive updates about your requests, quotations, or orders, they will appear here."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div 
                key={notification._id}
                className={`transition-colors group hover:bg-slate-50 relative ${
                  !notification.isRead ? 'bg-primary-50/30' : ''
                }`}
              >
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500"></div>
                )}
                <Link
                  to={getNotificationLink(notification)}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                  className="block p-5 sm:px-8"
                >
                  <div className="flex gap-5 items-start">
                    <div className="flex-shrink-0 mt-1">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!notification.isRead ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400'}`}>
                          <Bell className="w-5 h-5" />
                       </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1 gap-4">
                        <h4 className={`text-base font-bold ${!notification.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                          {notification.title}
                        </h4>
                        <time className="text-xs font-medium text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                          {new Date(notification.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </time>
                      </div>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed pr-8">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex-shrink-0 self-center text-slate-300 group-hover:text-primary-500 transition-colors group-hover:translate-x-1 duration-200">
                       <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;
