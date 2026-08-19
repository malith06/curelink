import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';
import { ArrowRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass = 'text-primary-600 bg-primary-100', linkText, linkUrl }) => {
  return (
    <Card className="flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          </div>
          <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>
        {linkText && linkUrl && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center">
            <Link to={linkUrl} className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center group">
              {linkText} <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
