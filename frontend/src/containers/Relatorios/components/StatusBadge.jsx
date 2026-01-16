import React from 'react';

const StatusBadge = React.memo(({ status }) => {
    let color = '#64748b';
    let bg = '#f1f5f9';

    if(status === 'Ativa') { color = '#16a34a'; bg = '#dcfce7'; }
    if(status === 'Vencendo') { color = '#ea580c'; bg = '#ffedd5'; }
    if(status === 'Vencida') { color = '#dc2626'; bg = '#fee2e2'; }
    if(status === 'Devolvida') { color = '#2563eb'; bg = '#dbeafe'; }

    return (
        <span style={{
            backgroundColor: bg,
            color: color,
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase'
        }}>
            {status}
        </span>
    );
});

export default StatusBadge;
