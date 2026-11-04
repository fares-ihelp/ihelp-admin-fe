import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, RotateCw } from 'lucide-react';
import api from '../api/client';
import { useMeta } from '../context/MetaContext';
import { useToast } from '../context/ToastContext';
import Topbar from '../components/Topbar';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EntityForm from '../components/EntityForm';
import WalletAdjustModal from '../components/WalletAdjustModal';
import { getRowActions } from '../routes/rowActions';

export default function EntityList() {
  const { entityKey } = useParams();
  const { getEntity, loaded } = useMeta();
  const toast = useToast();
  const entity = getEntity(entityKey);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ field: '', dir: 'DESC' });

  const [formOpen, setFormOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [deletingRow, setDeletingRow] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { row, action }
  const [walletModalRow, setWalletModalRow] = useState(null);

  const fetchRows = useCallback(async (page = 1) => {
    if (!entity) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/${entityKey}`, {
        params: {
          page,
          limit: pagination.limit,
          search,
          sort: sort.field || entity.defaultSort?.field,
          dir: sort.dir
        }
      });
      setRows(data.data.items);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load records');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, entityKey, search, sort]);

  useEffect(() => {
    setSort({ field: '', dir: 'DESC' });
    setSearch('');
  }, [entityKey]);

  useEffect(() => {
    if (entity) fetchRows(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, search, sort]);

  if (!loaded) return null;
  if (!entity) {
    return (
      <div className="page-body">
        <div className="panel" style={{ padding: 40, textAlign: 'center' }}>Unknown section.</div>
      </div>
    );
  }

  const handleSort = (field) => {
    setSort((s) => (s.field === field ? { field, dir: s.dir === 'ASC' ? 'DESC' : 'ASC' } : { field, dir: 'ASC' }));
  };

  const openCreate = () => { setEditingRow(null); setFormOpen(true); };
  const openEdit = (row) => { setEditingRow(row); setFormOpen(true); };

  const handleSubmit = async (values) => {
    if (editingRow) {
      await api.put(`/${entityKey}/${editingRow[entity.pk]}`, values);
      toast.success(`${entity.label} updated`);
    } else {
      await api.post(`/${entityKey}`, values);
      toast.success(`${entity.label} created`);
    }
    setFormOpen(false);
    fetchRows(pagination.page);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/${entityKey}/${deletingRow[entity.pk]}`);
      toast.success(`${entity.label} deleted`);
      fetchRows(pagination.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingRow(null);
    }
  };

  const runRowAction = async (row, action) => {
    try {
      await api.post(action.url);
      toast.success(`${action.label} applied`);
      fetchRows(pagination.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${action.label.toLowerCase()}`);
    }
  };

  const renderRowActions = (row) => {
    const actions = getRowActions(entityKey, row);
    return actions.map((a) => (
      <button
        key={a.key}
        className={`btn btn-sm ${a.tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
        onClick={() => {
          if (a.modal === 'wallet-adjust') return setWalletModalRow(row);
          if (a.confirm) return setConfirmAction({ row, action: a });
          runRowAction(row, a);
        }}
      >
        {a.label}
      </button>
    ));
  };

  return (
    <>
      <Topbar title={entity.label} crumb={entity.group} />
      <div className="page-body">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-header-title">
              <div className="panel-title">{entity.label}</div>
              <div className="panel-subtitle">{pagination.total} total records</div>
            </div>
            <div className="panel-actions">
              <div className="search-box">
                <Search size={14} />
                <input placeholder={`Search ${entity.label.toLowerCase()}…`} value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button className="icon-btn" onClick={() => fetchRows(pagination.page)} title="Refresh">
                <RotateCw size={14} />
              </button>
              {entity.canCreate !== false && (
                <button className="btn btn-primary" onClick={openCreate}>
                  <Plus size={15} /> Add {entity.label.replace(/s$/, '')}
                </button>
              )}
            </div>
          </div>

          <DataTable
            entity={entity}
            rows={rows}
            loading={loading}
            sort={sort}
            onSort={handleSort}
            onEdit={openEdit}
            onDelete={setDeletingRow}
            renderRowActions={renderRowActions}
          />

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(p) => fetchRows(p)}
          />
        </div>
      </div>

      {formOpen && (
        <Modal title={editingRow ? `Edit ${entity.label}` : `Add ${entity.label}`} onClose={() => setFormOpen(false)}>
          <EntityForm
            fields={entity.fields}
            initial={editingRow || {}}
            isEdit={!!editingRow}
            submitLabel={editingRow ? 'Save changes' : 'Create'}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </Modal>
      )}

      {deletingRow && (
        <ConfirmDialog
          title={`Delete ${entity.label}?`}
          message={`This will permanently delete record #${deletingRow[entity.pk]}. This action cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onClose={() => setDeletingRow(null)}
        />
      )}

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.action.label}
          message={confirmAction.action.confirm}
          confirmLabel={confirmAction.action.label}
          danger={confirmAction.action.tone === 'danger'}
          onConfirm={() => runRowAction(confirmAction.row, confirmAction.action)}
          onClose={() => setConfirmAction(null)}
        />
      )}

      {walletModalRow && (
        <WalletAdjustModal row={walletModalRow} onClose={() => setWalletModalRow(null)} onDone={() => fetchRows(pagination.page)} />
      )}
    </>
  );
}
