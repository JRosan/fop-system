import { useState, useEffect } from 'react';
import {
  Users, Search, Plus, Edit2, Trash2, Check, X, Shield,
  Mail, Phone, Building2, MoreVertical, UserCheck, UserX
} from 'lucide-react';
import { apiClient } from '@fop/api';
import { useNotificationStore } from '@fop/core';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  companyName?: string;
  lastLoginAt?: string;
  createdAt: string;
}

type UserRole = 'Applicant' | 'Reviewer' | 'Approver' | 'FinanceOfficer' | 'Administrator';

const roleColors: Record<UserRole, string> = {
  Applicant: 'bg-bvi-atlantic-100 text-bvi-atlantic-700 dark:bg-bvi-atlantic-900/30 dark:text-bvi-atlantic-400',
  Reviewer: 'bg-bvi-turquoise-100 text-bvi-turquoise-700 dark:bg-bvi-turquoise-900/30 dark:text-bvi-turquoise-400',
  Approver: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  FinanceOfficer: 'bg-bvi-gold-100 text-bvi-gold-700 dark:bg-bvi-gold-900/30 dark:text-bvi-gold-400',
  Administrator: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
};

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [actionMenuUser, setActionMenuUser] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get<User[]>('/users');
      setUsers(data);
    } catch {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load users',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      if (user.isActive) {
        await apiClient.post(`/users/${user.id}/deactivate`);
      } else {
        await apiClient.post(`/users/${user.id}/activate`);
      }
      await loadUsers();
      addNotification({
        type: 'success',
        title: 'Success',
        message: `User ${user.isActive ? 'deactivated' : 'activated'} successfully`,
      });
    } catch {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user status',
      });
    }
    setActionMenuUser(null);
  };

  const handleUpdateRole = async (userId: string, role: UserRole) => {
    try {
      await apiClient.patch(`/users/${userId}`, { role });
      await loadUsers();
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'User role updated successfully',
      });
    } catch {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user role',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      (user.companyName?.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchesRole = !roleFilter || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-bvi-atlantic-600 dark:text-white flex items-center gap-3">
            <Users className="w-7 h-7" />
            User Management
          </h1>
          <p className="text-bvi-granite-500 dark:text-bvi-granite-400 mt-1">
            Manage system users and their permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-bvi-turquoise-500 text-white rounded-lg font-semibold hover:bg-bvi-turquoise-400 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-bvi-atlantic-800 rounded-xl border border-bvi-sand-200 dark:border-bvi-atlantic-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bvi-granite-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or company..."
              className="w-full pl-10 pr-4 py-2 border border-bvi-sand-200 dark:border-bvi-atlantic-600 rounded-lg bg-white dark:bg-bvi-atlantic-700 text-bvi-atlantic-600 dark:text-white"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-bvi-sand-200 dark:border-bvi-atlantic-600 rounded-lg bg-white dark:bg-bvi-atlantic-700 text-bvi-atlantic-600 dark:text-white"
          >
            <option value="">All Roles</option>
            <option value="Applicant">Applicant</option>
            <option value="Reviewer">Reviewer</option>
            <option value="Approver">Approver</option>
            <option value="FinanceOfficer">Finance Officer</option>
            <option value="Administrator">Administrator</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-bvi-atlantic-800 rounded-xl border border-bvi-sand-200 dark:border-bvi-atlantic-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 mx-auto border-4 border-bvi-turquoise-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-bvi-granite-300 dark:text-bvi-granite-600" />
            <p className="mt-2 text-bvi-granite-500 dark:text-bvi-granite-400">No users found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-bvi-sand-50 dark:bg-bvi-atlantic-900 border-b border-bvi-sand-200 dark:border-bvi-atlantic-700">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-bvi-granite-600 dark:text-bvi-granite-300">User</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-bvi-granite-600 dark:text-bvi-granite-300">Contact</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-bvi-granite-600 dark:text-bvi-granite-300">Role</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-bvi-granite-600 dark:text-bvi-granite-300">Status</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-bvi-granite-600 dark:text-bvi-granite-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bvi-sand-200 dark:divide-bvi-atlantic-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-bvi-sand-50 dark:hover:bg-bvi-atlantic-700 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-bvi-atlantic-600 flex items-center justify-center text-white font-semibold">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-bvi-atlantic-600 dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        {user.companyName && (
                          <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {user.companyName}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm text-bvi-atlantic-600 dark:text-white flex items-center gap-1">
                        <Mail className="w-3 h-3 text-bvi-granite-400" />
                        {user.email}
                        {user.isEmailVerified && (
                          <Check className="w-3 h-3 text-success-500" />
                        )}
                      </p>
                      {user.phone && (
                        <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value as UserRole)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${roleColors[user.role as UserRole] || 'bg-gray-100 text-gray-700'}`}
                    >
                      <option value="Applicant">Applicant</option>
                      <option value="Reviewer">Reviewer</option>
                      <option value="Approver">Approver</option>
                      <option value="FinanceOfficer">Finance Officer</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      user.isActive
                        ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                        : 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400'
                    }`}>
                      {user.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setActionMenuUser(actionMenuUser === user.id ? null : user.id)}
                        className="p-2 hover:bg-bvi-sand-100 dark:hover:bg-bvi-atlantic-600 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-bvi-granite-500" />
                      </button>
                      {actionMenuUser === user.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-bvi-atlantic-700 rounded-lg shadow-lg border border-bvi-sand-200 dark:border-bvi-atlantic-600 py-1 z-10">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="w-full px-4 py-2 text-left text-sm text-bvi-granite-600 dark:text-bvi-granite-300 hover:bg-bvi-sand-50 dark:hover:bg-bvi-atlantic-600 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit User
                          </button>
                          <button
                            onClick={() => handleToggleActive(user)}
                            className="w-full px-4 py-2 text-left text-sm text-bvi-granite-600 dark:text-bvi-granite-300 hover:bg-bvi-sand-50 dark:hover:bg-bvi-atlantic-600 flex items-center gap-2"
                          >
                            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-bvi-atlantic-800 rounded-xl border border-bvi-sand-200 dark:border-bvi-atlantic-700 p-4">
          <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400">Total Users</p>
          <p className="text-2xl font-bold text-bvi-atlantic-600 dark:text-white">{users.length}</p>
        </div>
        <div className="bg-white dark:bg-bvi-atlantic-800 rounded-xl border border-bvi-sand-200 dark:border-bvi-atlantic-700 p-4">
          <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400">Active</p>
          <p className="text-2xl font-bold text-success-600">{users.filter(u => u.isActive).length}</p>
        </div>
        <div className="bg-white dark:bg-bvi-atlantic-800 rounded-xl border border-bvi-sand-200 dark:border-bvi-atlantic-700 p-4">
          <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400">Reviewers</p>
          <p className="text-2xl font-bold text-bvi-turquoise-600">{users.filter(u => u.role === 'Reviewer').length}</p>
        </div>
        <div className="bg-white dark:bg-bvi-atlantic-800 rounded-xl border border-bvi-sand-200 dark:border-bvi-atlantic-700 p-4">
          <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400">Approvers</p>
          <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'Approver').length}</p>
        </div>
        <div className="bg-white dark:bg-bvi-atlantic-800 rounded-xl border border-bvi-sand-200 dark:border-bvi-atlantic-700 p-4">
          <p className="text-sm text-bvi-granite-500 dark:text-bvi-granite-400">Admins</p>
          <p className="text-2xl font-bold text-error-600">{users.filter(u => u.role === 'Administrator').length}</p>
        </div>
      </div>
    </div>
  );
}
