import { useState } from 'react';
import Modal from './Modal';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

export default function WalletAdjustModal({ row, onClose, onDone }) {
  const toast = useToast();
  const [type, setType] = useState('credit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!amount || Number(amount) <= 0) {
      setError('Enter an amount greater than 0');
      return;
    }
    setSaving(true);
    try {
      await api.post(`/actions/wallet/${row.user_id}/adjust`, { type, amount: Number(amount), description });
      toast.success('Wallet updated');
      onDone();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to adjust wallet');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`Adjust wallet — user #${row.user_id}`}
      narrow
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? <span className="spinner" /> : 'Apply adjustment'}
          </button>
        </>
      }
    >
      <form onSubmit={submit}>
        {error && <div className="form-error">{error}</div>}
        <div className="field">
          <label>Action</label>
          <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="credit">Credit (add to available balance)</option>
            <option value="debit">Debit (remove from available balance)</option>
          </select>
        </div>
        <div className="field">
          <label>Amount (₹)<span className="required">*</span></label>
          <input className="input" type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Note (optional)</label>
          <input className="input" type="text" placeholder="Reason for this adjustment" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </form>
    </Modal>
  );
}
