import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, UserRole, usersApi } from '../services/api';

const ROLE_OPTIONS: UserRole[] = [
  'administrateur',
  'responsable_risques',
  'responsable_org',
  'auditeur',
  'decideur',
  'observateur',
];

const ROLE_LABELS: Record<UserRole, string> = {
  administrateur: 'Administrative Organizer',
  responsable_risques: 'Risk Manager',
  responsable_org: 'Organization Manager',
  auditeur: 'Auditor',
  decideur: 'Decision Maker',
  observateur: 'Observer',
};

const ROLE_ABBREVIATIONS: Record<string, string> = {
  administrateur: 'admin',
  responsable_risques: 'risk',
  responsable_org: 'org',
  auditeur: 'audit',
  decideur: 'decide',
  observateur: 'observer',
};

function generatePassword(role: UserRole, countForRole: number): string {
  const abbr = ROLE_ABBREVIATIONS[role] || role;
  const num = String(countForRole + 1).padStart(3, '0');
  return `${abbr}${num}`;
}

export function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  

  // form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('observateur');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await usersApi.list();
      setUsers(data || []);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Error loading users');
    } finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const countForRole = users.filter(u => u.role === role).length;
      const autoPassword = generatePassword(role, countForRole);
      
      await usersApi.create({ 
        username, 
        email, 
        first_name: firstName, 
        last_name: lastName, 
        password: autoPassword, 
        role 
      });
      
      setSuccessMessage('Account created successfully!');
      setUsername(''); 
      setEmail(''); 
      setFirstName(''); 
      setLastName(''); 
      setRole('observateur');
      
      setTimeout(() => setSuccessMessage(''), 5000);
      await load();
    } catch (err: any) {
      setError(err.message || 'Error creating account');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this user?')) return;
    try {
      await usersApi.delete(id);
      await load();
    } catch (err: any) {
      setError(err.message || 'Error deleting user');
    }
  }

  async function handleChangeRole(u: User, newRole: UserRole) {
    try {
      await usersApi.update(u.id, { role: newRole });
      await load();
    } catch (err: any) {
      setError(err.message || 'Error updating role');
    }
  }

  if (!user || user.role !== 'system_admin') {
    return <p>Access denied. Only the system administrator can manage accounts.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="mb-6 space-y-3 border border-slate-200 rounded-2xl p-4 bg-slate-50">
        <h3 className="font-semibold text-slate-700">Create a new account</h3>
        <div>
          <label className="block text-sm font-medium text-slate-700">Username</label>
          <input 
            required 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900"
            placeholder="username"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input 
            type="email"
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900"
            placeholder="user@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">First name</label>
          <input 
            value={firstName} 
            onChange={e => setFirstName(e.target.value)} 
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900"
            placeholder="First name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Last name</label>
          <input 
            value={lastName} 
            onChange={e => setLastName(e.target.value)} 
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900"
            placeholder="Last name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Role</label>
          <select 
            value={role} 
            onChange={e => setRole(e.target.value as UserRole)} 
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900"
          >
            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </div>
        <div className="pt-2">
            <button 
            type="submit" 
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
          >
            Create account
          </button>
        </div>
      </form>

      {loading && <p className="text-slate-600">Loading...</p>}

      <h3 className="text-lg font-semibold mb-3 text-slate-700">Existing users</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-200">
          <thead>
              <tr className="bg-slate-100">
              <th className="border border-slate-200 px-4 py-2 text-left">Name</th>
              <th className="border border-slate-200 px-4 py-2 text-left">Email</th>
              <th className="border border-slate-200 px-4 py-2 text-left">Role</th>
              <th className="border border-slate-200 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="border border-slate-200 px-4 py-2">{u.username}</td>
                <td className="border border-slate-200 px-4 py-2">{u.email}</td>
                <td className="border border-slate-200 px-4 py-2">
                  <select 
                    value={u.role} 
                    onChange={e => handleChangeRole(u, e.target.value as UserRole)} 
                    className="rounded border border-slate-200 px-2 py-1 text-slate-900"
                  >
                    {ROLE_OPTIONS.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </td>
                <td className="border border-slate-200 px-4 py-2">
                  <button 
                    onClick={() => handleDelete(u.id)} 
                    className="rounded bg-red-600 px-3 py-1 text-white text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
