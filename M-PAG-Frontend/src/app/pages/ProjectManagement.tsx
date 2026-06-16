import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Project, projectsApi } from '../services/api';

export function ProjectManagement() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await projectsApi.list();
      setProjects(data || []);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Error loading projects');
    } finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await projectsApi.update(editingId, { name, description });
        setSuccess('Project updated.');
      } else {
        await projectsApi.create({ name, description });
        setSuccess('Project created.');
      }
      setName(''); setDescription(''); setEditingId(null);
      setTimeout(() => setSuccess(''), 4000);
      await load();
    } catch (err: any) {
      setError(err.message || 'Error saving project');
    }
  }

  function startEdit(p: Project) {
    setEditingId(p.id);
    setName(p.name);
    setDescription(p.description);
  }

  function cancelEdit() {
    setEditingId(null); setName(''); setDescription('');
  }

  async function handleToggleActive(p: Project) {
    try {
      await projectsApi.update(p.id, { is_active: !p.is_active });
      await load();
    } catch (err: any) {
      setError(err.message || 'Error toggling project');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this project? All associated data will be lost.')) return;
    try {
      await projectsApi.delete(id);
      await load();
    } catch (err: any) {
      setError(err.message || 'Error deleting project');
    }
  }

  if (!user || user.role !== 'system_admin') {
    return <p>Access denied.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Project Management</h2>

      {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800">{success}</div>}
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800">{error}</div>}

      <form onSubmit={handleSubmit} className="mb-6 space-y-3 border border-slate-200 rounded-2xl p-4 bg-slate-50">
        <h3 className="font-semibold text-slate-700">{editingId ? 'Edit project' : 'Create a new project'}</h3>
        <div>
          <label className="block text-sm font-medium text-slate-700">Project name</label>
          <input required value={name} onChange={e => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900"
            placeholder="Enter project name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900"
            placeholder="Optional description" rows={2} />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700">
            {editingId ? 'Update' : 'Create'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="rounded-lg bg-slate-200 px-4 py-2 text-slate-700 font-medium hover:bg-slate-300">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading && <p className="text-slate-600">Loading...</p>}

      <h3 className="text-lg font-semibold mb-3 text-slate-700">Existing projects</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-200 px-4 py-2 text-left">Name</th>
              <th className="border border-slate-200 px-4 py-2 text-left">Description</th>
              <th className="border border-slate-200 px-4 py-2 text-left">Status</th>
              <th className="border border-slate-200 px-4 py-2 text-left">Created</th>
              <th className="border border-slate-200 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id} className={!p.is_active ? 'opacity-50' : ''}>
                <td className="border border-slate-200 px-4 py-2 font-medium">{p.name}</td>
                <td className="border border-slate-200 px-4 py-2 text-slate-600">{p.description || '—'}</td>
                <td className="border border-slate-200 px-4 py-2">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="border border-slate-200 px-4 py-2 text-sm text-slate-500">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
                <td className="border border-slate-200 px-4 py-2 space-x-2">
                  <button onClick={() => startEdit(p)} className="rounded bg-slate-600 px-3 py-1 text-white text-sm hover:bg-slate-700">Edit</button>
                  <button onClick={() => handleToggleActive(p)} className="rounded bg-yellow-600 px-3 py-1 text-white text-sm hover:bg-yellow-700">
                    {p.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="rounded bg-red-600 px-3 py-1 text-white text-sm hover:bg-red-700">Delete</button>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr><td colSpan={5} className="border border-slate-200 px-4 py-4 text-center text-slate-500">No projects yet. Create one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProjectManagement;
