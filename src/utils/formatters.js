export function formatCurrency(amount, currency = 'INR') {
  const num = Number(amount || 0);
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(num);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

export function getStatusStyle(status) {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'approved':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'pending':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'rejected':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    case 'under review':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    case 'healthy':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'warning':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'critical':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    default:
      return 'bg-slate-700/20 text-slate-300 border-slate-700/40';
  }
}

export function getPriorityStyle(priority) {
  const p = (priority || '').toLowerCase();
  switch (p) {
    case 'critical':
      return 'bg-rose-950/60 text-rose-400 border-rose-700/50';
    case 'high':
      return 'bg-orange-950/60 text-orange-400 border-orange-700/50';
    case 'normal':
      return 'bg-blue-950/60 text-blue-400 border-blue-700/50';
    case 'low':
      return 'bg-slate-800/60 text-slate-400 border-slate-700/50';
    default:
      return 'bg-slate-800 text-slate-400 border-slate-700';
  }
}
