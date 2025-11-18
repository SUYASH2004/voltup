export default function StatusBadge({ status, size = 'md' }) {
  const statusConfig = {
    active: { 
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
      label: 'Active',
      dot: 'bg-emerald-500'
    },
    available: { 
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
      label: 'Available',
      dot: 'bg-emerald-500'
    },
    inuse: { 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      label: 'In Use',
      dot: 'bg-blue-500'
    },
    'in-use': { 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      label: 'In Use',
      dot: 'bg-blue-500'
    },
    'in-progress': { 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      label: 'In Progress',
      dot: 'bg-blue-500'
    },
    maintenance: { 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      label: 'Maintenance',
      dot: 'bg-yellow-500'
    },
    pending: { 
      color: 'bg-orange-100 text-orange-800 border-orange-200', 
      label: 'Pending',
      dot: 'bg-orange-500'
    },
    completed: { 
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
      label: 'Completed',
      dot: 'bg-emerald-500'
    },
    cancelled: { 
      color: 'bg-red-100 text-red-800 border-red-200', 
      label: 'Cancelled',
      dot: 'bg-red-500'
    },
  };

  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');
  const config = statusConfig[normalizedStatus] || statusConfig.pending;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <span className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-medium border ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`}></span>
      {config.label}
    </span>
  );
}
