import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

const getColorForLabel = (label, index) => {
  if (!label) return COLORS[index % COLORS.length];
  const lbl = String(label).toUpperCase();
  
  // Specific user requests:
  if (lbl === 'COMPLETED') return '#10b981'; // Green (kola)
  if (lbl.includes('REJECTED') || lbl.includes('CANCELLED') || lbl.includes('FAILED')) return '#ef4444'; // Red (rathu)
  if (lbl.includes('PENDING_PAYMENT') || lbl.includes('COD_PENDING') || lbl.includes('PENDING')) return '#f59e0b'; // Orange (thabili)
  if (lbl.includes('DELIVERED')) return '#3b82f6'; // Blue (nil)
  
  // Defaults for others
  if (lbl.includes('PAID') || lbl.includes('COD_COLLECTED') || lbl === 'APPROVED' || lbl === 'SUCCESS') return '#10b981'; // Green
  
  return COLORS[index % COLORS.length];
};

const StatusChart = ({ data, nameKey = 'label', dataKey = 'value' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        No status data available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColorForLabel(entry[nameKey], index)} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusChart;
