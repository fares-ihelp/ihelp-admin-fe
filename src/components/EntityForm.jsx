import { useState } from 'react';
import FkSelect from './FkSelect';

// Renders one <input>/<select>/<textarea> per field definition and hands
// back a flat { key: value } object on submit. Works for both create
// (initial = {}) and edit (initial = existing row) because entity field
// config is the same either way.
export default function EntityForm({ fields, initial = {}, submitLabel = 'Save', onSubmit, onCancel, isEdit = false }) {
  const [values, setValues] = useState(() => {
    const v = {};
    fields.forEach((f) => {
      v[f.key] = initial[f.key] ?? (f.type === 'boolean' ? false : '');
    });
    return v;
  });
  const [fkLabels, setFkLabels] = useState(() => {
    const l = {};
    fields.forEach((f) => {
      if (f.type === 'fk') l[f.key] = initial[`${f.key}_label`] || null;
    });
    return l;
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const setField = (key, value) => setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    for (const f of fields) {
      const skipRequired = f.type === 'password' && isEdit && f.updateOptional;
      if (f.required && !skipRequired && (values[f.key] === '' || values[f.key] === null || values[f.key] === undefined)) {
        setError(`"${f.label}" is required`);
        return;
      }
      if (f.type === 'json' && values[f.key]) {
        try { JSON.parse(values[f.key]); } catch { setError(`"${f.label}" must be valid JSON`); return; }
      }
    }
    setSaving(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderFieldInput = (f) => {
    const val = values[f.key];

    if (f.type === 'textarea') {
      return (
        <textarea
          className="textarea"
          rows={3}
          value={val || ''}
          onChange={(e) => setField(f.key, e.target.value)}
        />
      );
    }

    if (f.type === 'json') {
      return (
        <textarea
          className="textarea text-mono"
          placeholder='e.g. [{"value":"a","label":"A"}]'
          value={val || ''}
          onChange={(e) => setField(f.key, e.target.value)}
        />
      );
    }

    if (f.type === 'boolean') {
      return (
        <div className="checkbox-row">
          <input
            type="checkbox"
            checked={!!val}
            onChange={(e) => setField(f.key, e.target.checked)}
          />
          <span className="text-faint">{val ? 'Yes' : 'No'}</span>
        </div>
      );
    }

    // Handles both 'enum' and 'select', with either options objects or string arrays
    if (f.type === 'enum' || f.type === 'select') {
      const options = f.options || f.enum || [];
      return (
        <select
          className="select"
          value={val ?? ''}
          onChange={(e) => setField(f.key, e.target.value)}
        >
          <option value="">Select…</option>
          {options.map((opt) => {
            const optVal = typeof opt === 'object' && opt !== null ? opt.value : opt;
            const optLabel = typeof opt === 'object' && opt !== null ? opt.label : String(opt).replace(/_/g, ' ');
            return (
              <option key={optVal} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>
      );
    }

    if (f.type === 'fk') {
      return (
        <FkSelect
          entityKey={f.fkEntity || f.fk?.entity}
          value={val || null}
          initialLabel={fkLabels[f.key]}
          onChange={(v) => setField(f.key, v)}
        />
      );
    }

    if (f.type === 'number' || f.type === 'decimal') {
      return (
        <input
          className="input"
          type="number"
          step={f.type === 'decimal' ? 'any' : 1}
          value={val ?? ''}
          onChange={(e) => setField(f.key, e.target.value === '' ? '' : Number(e.target.value))}
        />
      );
    }

    if (f.type === 'date') {
      return (
        <input
          className="input"
          type="date"
          value={val ? String(val).slice(0, 10) : ''}
          onChange={(e) => setField(f.key, e.target.value)}
        />
      );
    }

    if (f.type === 'datetime') {
      return (
        <input
          className="input"
          type="datetime-local"
          value={val ? String(val).slice(0, 16).replace(' ', 'T') : ''}
          onChange={(e) => setField(f.key, e.target.value)}
        />
      );
    }

    if (f.type === 'password') {
      return (
        <input
          className="input"
          type="password"
          placeholder={isEdit ? 'Leave blank to keep current password' : ''}
          value={val || ''}
          onChange={(e) => setField(f.key, e.target.value)}
        />
      );
    }

    if (f.type === 'email') {
      return (
        <input
          className="input"
          type="email"
          value={val || ''}
          onChange={(e) => setField(f.key, e.target.value)}
        />
      );
    }

    // Default universal fallback for 'text', 'string', or any custom/unspecified type
    return (
      <input
        className="input"
        type="text"
        value={val || ''}
        onChange={(e) => setField(f.key, e.target.value)}
      />
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      {fields.map((f) => (
        <div className="field" key={f.key}>
          <label>
            {f.label}
            {f.required && !(f.type === 'password' && isEdit) && <span className="required">*</span>}
          </label>
          {renderFieldInput(f)}
        </div>
      ))}

      <div className="modal-footer" style={{ padding: '18px 0 0', marginTop: 4, borderTop: '1px solid var(--color-border)' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <span className="spinner" /> : submitLabel}
        </button>
      </div>
    </form>
  );
}
