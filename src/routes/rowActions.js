// Declares the custom, non-CRUD action buttons available for a given row,
// based on the row's current data. Each action posts to a fixed backend
// endpoint (see src/admin/routes/admin.routes.js) rather than a generic
// field update.

export function getRowActions(entityKey, row) {
  switch (entityKey) {
    case 'users':
      return row.status === 'blocked'
        ? [{ key: 'unblock', label: 'Unblock', tone: 'primary', url: `/actions/users/${row.id}/unblock` }]
        : [{ key: 'block', label: 'Block', tone: 'danger', url: `/actions/users/${row.id}/block`, confirm: `Block user "${row.name || row.mobile}"? They will be signed out everywhere.` }];

    case 'kyc_status':
      if (row.status === 'verified' || row.status === 'failed') return [];
      return [
        { key: 'verify', label: 'Verify', tone: 'primary', url: `/actions/kyc/${row.id}/verify` },
        { key: 'reject', label: 'Reject', tone: 'danger', url: `/actions/kyc/${row.id}/reject`, confirm: 'Reject this KYC submission?' }
      ];

    case 'documents':
      if (row.status === 'verified' || row.status === 'failed') return [];
      return [
        { key: 'verify', label: 'Verify', tone: 'primary', url: `/actions/documents/${row.id}/verify` },
        { key: 'reject', label: 'Reject', tone: 'danger', url: `/actions/documents/${row.id}/reject`, confirm: 'Reject this document?' }
      ];

    case 'withdrawal_requests':
      if (row.status !== 'processing') return [];
      return [
        { key: 'approve', label: 'Approve', tone: 'primary', url: `/actions/withdrawals/${row.id}/approve`, confirm: `Approve withdrawal of ₹${row.amount}?` },
        { key: 'reject', label: 'Reject', tone: 'danger', url: `/actions/withdrawals/${row.id}/reject`, confirm: 'Reject this withdrawal request?' }
      ];

    case 'support_tickets':
      if (row.status === 'resolved' || row.status === 'closed') return [];
      return [{ key: 'resolve', label: 'Resolve', tone: 'primary', url: `/actions/support-tickets/${row.id}/resolve` }];

    case 'sos_cases':
      if (row.status !== 'active') return [];
      return [{ key: 'resolve', label: 'Resolve', tone: 'danger', url: `/actions/sos/${row.id}/resolve`, confirm: 'Mark this SOS case as resolved?' }];

    case 'wallets':
      return [{ key: 'adjust', label: 'Adjust Balance', tone: 'primary', modal: 'wallet-adjust' }];

    default:
      return [];
  }
}
