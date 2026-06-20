import { useState, useEffect } from 'react'
import { userApi } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { FaTrash, FaUserShield, FaUserTie, FaUser, FaEnvelope, FaCalendarAlt } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function UserManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await userApi.getUsers()
      const list = Array.isArray(res) ? res : res?.data || []
      setUsers(list)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userApi.updateUserRole(userId, newRole)
      toast.success('User role updated successfully')
      loadUsers()
    } catch (error) {
      toast.error(error.message || 'Failed to update user role')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? All their records will be removed.')) return
    try {
      await userApi.deleteUser(userId)
      toast.success('User deleted successfully')
      loadUsers()
    } catch (error) {
      toast.error(error.message || 'Failed to delete user')
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="flex items-center gap-1.5 bg-gold/10 text-gold border border-gold/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <FaUserShield className="text-xs" /> Admin
          </span>
        )
      case 'agent':
        return (
          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <FaUserTie className="text-xs" /> Agent / Owner
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <FaUser className="text-xs" /> Buyer
          </span>
        )
    }
  }

  return (
    <section className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-soft space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-luxury">User Management</h2>
          <p className="text-slate-500 mt-1">Review register user metrics, update roles and moderate access.</p>
        </div>
        <div className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-2xl text-sm">
          Total Accounts: {users.length}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          No users registered in the database.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="py-4 px-6">User Information</th>
                <th className="py-4 px-6">Access Level</th>
                <th className="py-4 px-6">Joined Date</th>
                <th className="py-4 px-6 text-center">Modify Level</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isSelf = currentUser?.id === u._id || currentUser?._id === u._id;
                return (
                  <tr key={u._id || u.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* User profile */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-luxury text-sm uppercase">
                          {u.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-luxury">
                            {u.name} {isSelf && <span className="text-xs text-gold font-normal italic">(You)</span>}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                            <FaEnvelope className="text-xxs shrink-0" />
                            <span>{u.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="py-4 px-6">
                      <div className="flex">{getRoleBadge(u.role)}</div>
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-slate-400" />
                        <span>
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Role dropdown modifier */}
                    <td className="py-4 px-6 text-center">
                      {isSelf ? (
                        <span className="text-xs text-slate-400 font-medium italic">Cannot modify self</span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id || u.id, e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-gold transition-colors text-xs font-semibold text-slate-700 cursor-pointer"
                        >
                          <option value="user">Buyer (Standard)</option>
                          <option value="agent">Agent (Owner)</option>
                          <option value="admin">Administrator</option>
                        </select>
                      )}
                    </td>

                    {/* Delete action */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDeleteUser(u._id || u.id)}
                        disabled={isSelf}
                        className={`p-2 rounded-lg transition-colors ${
                          isSelf
                            ? 'text-slate-200 cursor-not-allowed'
                            : 'hover:bg-red-50 text-slate-500 hover:text-red-600'
                        }`}
                        title={isSelf ? 'Cannot delete your own account' : 'Delete user'}
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
