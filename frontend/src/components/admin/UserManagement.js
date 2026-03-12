import { useState, useEffect } from 'react';
import { userAPI, getAdminSecret } from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Pencil, Trash2, Search, UserPlus, Check, X, ChevronDown, ChevronUp, Phone, GraduationCap, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [editingUser, setEditingUser] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approveTargetUser, setApproveTargetUser] = useState(null);

  useEffect(() => {
    // Ensure admin secret is set (default to 'admin123' for development)
    const adminSecret = getAdminSecret();
    if (!adminSecret) {
      localStorage.setItem('adminSecret', 'admin123');
    }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const adminSecret = getAdminSecret();
      console.log('Loading users with admin secret:', adminSecret ? 'Present' : 'Missing');
      const response = await userAPI.getAllUsers(adminSecret);
      console.log('Users response:', response);
      setUsers(response.users || []);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load users';
      setError(errorMessage);
      console.error('Error loading users:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) => {
      const matchesRole = (user.role === 'student' || !user.role);
      const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesRole && matchesSearch && matchesStatus;
    }
  );

  const pendingUsers = users.filter(u => (u.role === 'student' || !u.role) && u.status === 'pending');
  const approvedUsers = users.filter(u => (u.role === 'student' || !u.role) && u.status === 'approved');
  const suspendedUsers = users.filter(u => (u.role === 'student' || !u.role) && u.status === 'suspended');
  const rejectedUsers = users.filter(u => (u.role === 'student' || !u.role) && u.status === 'rejected');

  const handleApprove = async (userId, trialDays = 0) => {
    try {
      const adminSecret = getAdminSecret();
      await userAPI.approveUser(userId, adminSecret, { trialDays });
      await loadUsers();
      setApproveTargetUser(null);
      alert(trialDays === 1 ? 'User approved for 1-day trial!' : 'User approved permanently!');
    } catch (err) {
      alert(err.message || 'Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Are you sure you want to reject this user?')) return;
    
    try {
      const adminSecret = getAdminSecret();
      await userAPI.rejectUser(userId, adminSecret);
      await loadUsers();
      alert('User rejected successfully!');
    } catch (err) {
      alert(err.message || 'Failed to reject user');
    }
  };

  const handleSuspend = async (userId) => {
    if (!window.confirm('Suspend this user? They will not be able to log in until you reactivate them.')) return;
    try {
      const adminSecret = getAdminSecret();
      await userAPI.suspendUser(userId, adminSecret);
      await loadUsers();
      alert('User suspended successfully.');
    } catch (err) {
      alert(err.message || 'Failed to suspend user');
    }
  };

  const handleUnsuspend = async (userId) => {
    if (!window.confirm('Reactivate this user? They will be able to log in again.')) return;
    try {
      const adminSecret = getAdminSecret();
      await userAPI.unsuspendUser(userId, adminSecret);
      await loadUsers();
      alert('User reactivated successfully.');
    } catch (err) {
      alert(err.message || 'Failed to reactivate user');
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <div className="text-xl text-gray-600">Loading users...</div>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-semibold text-red-600 mb-2">Error Loading Users</div>
            <div className="text-gray-600 mb-6">{error}</div>
            <div className="space-y-2 text-sm text-gray-500 mb-6 text-left bg-gray-50 p-4 rounded-lg">
              <p><strong>Possible causes:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Backend server is not running (check if the backend server is accessible)</li>
                <li>Admin secret is incorrect</li>
                <li>Network connection issue</li>
                <li>CORS configuration problem</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={loadUsers} 
                className="bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white"
              >
                Retry
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const adminSecret = getAdminSecret();
                  console.log('Current admin secret:', adminSecret);
                  localStorage.setItem('adminSecret', 'admin123');
                  loadUsers();
                }}
              >
                Reset Admin Secret & Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = (user) => {
    setEditingUser({ ...user });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    
    try {
      const adminSecret = getAdminSecret();
      await userAPI.updateUser(editingUser.id, editingUser, adminSecret);
      await loadUsers();
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch (err) {
      alert(err.message || 'Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const adminSecret = getAdminSecret();
      await userAPI.deleteUser(id, adminSecret);
      await loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const toggleUserDetails = (userId) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatEducationLevel = (level) => {
    if (!level) return 'N/A';
    const levels = {
      'high-school': 'High School',
      'diploma': 'Diploma',
      'bachelor': "Bachelor's Degree",
      'master': "Master's Degree",
      'phd': 'PhD',
      'other': 'Other'
    };
    return levels[level] || level;
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage student accounts and track their progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">Total Users</div>
          <div className="text-2xl font-semibold text-gray-900">{users.filter(u => u.role === 'student' || !u.role).length}</div>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 p-4">
          <div className="text-sm text-yellow-700 mb-1">Pending Approval</div>
          <div className="text-2xl font-semibold text-yellow-900">{pendingUsers.length}</div>
        </div>
        <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-4">
          <div className="text-sm text-green-700 mb-1">Approved</div>
          <div className="text-2xl font-semibold text-green-900">{approvedUsers.length}</div>
        </div>
        <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-4">
          <div className="text-sm text-amber-700 mb-1">Suspended</div>
          <div className="text-2xl font-semibold text-amber-900">{suspendedUsers.length}</div>
        </div>
        <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-4">
          <div className="text-sm text-red-700 mb-1">Rejected</div>
          <div className="text-2xl font-semibold text-red-900">{rejectedUsers.length}</div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl border-gray-200"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
            className={`h-12 px-4 rounded-xl ${statusFilter === 'all' ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white shadow-sm' : ''}`}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('pending')}
            className={`h-12 px-4 rounded-xl ${statusFilter === 'pending' ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white shadow-sm' : ''}`}
          >
            Pending ({pendingUsers.length})
          </Button>
          <Button
            variant={statusFilter === 'approved' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('approved')}
            className={`h-12 px-4 rounded-xl ${statusFilter === 'approved' ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white shadow-sm' : ''}`}
          >
            Approved
          </Button>
          <Button
            variant={statusFilter === 'suspended' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('suspended')}
            className={`h-12 px-4 rounded-xl ${statusFilter === 'suspended' ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white shadow-sm' : ''}`}
          >
            Suspended ({suspendedUsers.length})
          </Button>
          <Button
            variant={statusFilter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('rejected')}
            className={`h-12 px-4 rounded-xl ${statusFilter === 'rejected' ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white shadow-sm' : ''}`}
          >
            Rejected ({rejectedUsers.length})
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Daily Progress</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const isExpanded = expandedUsers.has(user.id);
                return (
                  <>
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-600">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                          user.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : user.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : user.status === 'suspended'
                            ? 'bg-amber-100 text-amber-800'
                            : user.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status || 'approved'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-[#84fab0]/20 to-[#8fd3f4]/20">
                          <span className="font-semibold bg-gradient-to-r from-[#84fab0] to-[#8fd3f4] bg-clip-text text-transparent">
                            {user.score || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                            <div
                              className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full transition-all"
                              style={{ width: `${((user.dailyCount || 0) / (user.dailyLimit || 10)) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {user.dailyCount || 0}/{user.dailyLimit || 10}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserDetails(user.id)}
                            className="rounded-lg hover:bg-gray-100"
                            title="View Details"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                          {user.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setApproveTargetUser(user)}
                                className="rounded-lg hover:bg-green-50 hover:text-green-600"
                                title="Approve User"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(user.id)}
                                className="rounded-lg hover:bg-red-50 hover:text-red-600"
                                title="Reject User"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {user.status === 'approved' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(user)}
                                className="rounded-lg hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSuspend(user.id)}
                                className="rounded-lg hover:bg-amber-50 hover:text-amber-600"
                                title="Suspend user"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(user.id)}
                                className="rounded-lg hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {user.status === 'suspended' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUnsuspend(user.id)}
                                className="rounded-lg hover:bg-green-50 hover:text-green-600"
                                title="Reactivate user"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(user.id)}
                                className="rounded-lg hover:bg-red-50 hover:text-red-600"
                                title="Delete from list"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {user.status === 'rejected' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
                              className="rounded-lg hover:bg-red-50 hover:text-red-600"
                              title="Delete from list"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan="6" className="px-6 py-6 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Contact Details */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#667eea]" />
                                Contact Details
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-500">Phone:</span>
                                  <span className="ml-2 text-gray-900">{user.phone || 'N/A'}</span>
                                </div>
                                {user.alternatePhone && (
                                  <div>
                                    <span className="text-gray-500">Alternate:</span>
                                    <span className="ml-2 text-gray-900">{user.alternatePhone}</span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-gray-500">Address:</span>
                                  <div className="mt-1 text-gray-900">
                                    {user.address ? (
                                      <>
                                        {user.address}
                                        {user.city && `, ${user.city}`}
                                        {user.state && `, ${user.state}`}
                                        {user.zipCode && ` ${user.zipCode}`}
                                      </>
                                    ) : 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Education */}
                            <div className="space-y-3 md:col-span-2 lg:col-span-3">
                              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-[#764ba2]" />
                                Education
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Level:</span>
                                  <span className="ml-2 text-gray-900">{formatEducationLevel(user.highestEducation)}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Institution:</span>
                                  <span className="ml-2 text-gray-900">{user.institution || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Field of Study:</span>
                                  <span className="ml-2 text-gray-900">{user.fieldOfStudy || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Graduation Year:</span>
                                  <span className="ml-2 text-gray-900">{user.graduationYear || 'N/A'}</span>
                                </div>
                              </div>
                              {user.additionalEducation && (
                                <div className="mt-3">
                                  <span className="text-gray-500 text-sm">Additional Education:</span>
                                  <div className="mt-1 text-gray-900 text-sm bg-white p-3 rounded-lg border border-gray-200">
                                    {user.additionalEducation}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredUsers.map((user) => {
            const isExpanded = expandedUsers.has(user.id);
            return (
              <div key={user.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                      user.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : user.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : user.status === 'suspended'
                        ? 'bg-amber-100 text-amber-800'
                        : user.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status || 'approved'}
                    </div>
                  </div>
                  <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100">
                    <span className="font-semibold text-gray-900">
                      {user.score || 0}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full"
                      style={{ width: `${((user.dailyCount || 0) / (user.dailyLimit || 10)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {user.dailyCount || 0}/{user.dailyLimit || 10}
                  </span>
                </div>
                
                {/* Expanded Details for Mobile */}
                {isExpanded && (
                  <div className="mb-3 p-4 bg-gray-50 rounded-lg space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#667eea]" />
                        Contact
                      </h4>
                      <div className="space-y-1 text-gray-600">
                        <div>Phone: {user.phone || 'N/A'}</div>
                        {user.alternatePhone && <div>Alternate: {user.alternatePhone}</div>}
                        <div>Address: {user.address ? `${user.address}, ${user.city || ''} ${user.state || ''} ${user.zipCode || ''}`.trim() : 'N/A'}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#764ba2]" />
                        Education
                      </h4>
                      <div className="space-y-1 text-gray-600">
                        <div>Level: {formatEducationLevel(user.highestEducation)}</div>
                        <div>Institution: {user.institution || 'N/A'}</div>
                        <div>Field: {user.fieldOfStudy || 'N/A'}</div>
                        <div>Year: {user.graduationYear || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleUserDetails(user.id)}
                    className="flex-1 rounded-lg gap-2"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {isExpanded ? 'Hide' : 'Details'}
                  </Button>
                  {user.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setApproveTargetUser(user)}
                        className="flex-1 rounded-lg gap-2 text-green-600 hover:bg-green-50"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(user.id)}
                        className="flex-1 rounded-lg gap-2 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  {user.status === 'approved' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        className="flex-1 rounded-lg gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuspend(user.id)}
                        className="flex-1 rounded-lg gap-2 text-amber-600 hover:bg-amber-50"
                      >
                        <X className="w-4 h-4" />
                        Suspend
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="flex-1 rounded-lg gap-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </>
                  )}
                  {user.status === 'suspended' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnsuspend(user.id)}
                        className="flex-1 rounded-lg gap-2 text-green-600 hover:bg-green-50"
                      >
                        <Check className="w-4 h-4" />
                        Reactivate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="flex-1 rounded-lg gap-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </>
                  )}
                  {user.status === 'rejected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      className="flex-1 rounded-lg gap-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Approve options dialog */}
      <Dialog open={!!approveTargetUser} onOpenChange={(open) => !open && setApproveTargetUser(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Approve user</DialogTitle>
            <DialogDescription>
              {approveTargetUser ? `${approveTargetUser.name || approveTargetUser.email} — choose approval type:` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <Button
              onClick={() => approveTargetUser && handleApprove(approveTargetUser.id, 0)}
              className="w-full rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90 text-white"
            >
              Approve permanently
            </Button>
            <Button
              variant="outline"
              onClick={() => approveTargetUser && handleApprove(approveTargetUser.id, 1)}
              className="w-full rounded-xl border-green-300 text-green-700 hover:bg-green-50"
            >
              Approve for 1 day trial
            </Button>
            <Button
              variant="ghost"
              onClick={() => setApproveTargetUser(null)}
              className="w-full rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="score">Score</Label>
                <Input
                  id="score"
                  type="number"
                  value={editingUser.score}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, score: parseInt(e.target.value) })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailyLimit">Daily Limit</Label>
                <Input
                  id="dailyLimit"
                  type="number"
                  value={editingUser.dailyLimit || 10}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, dailyLimit: parseInt(e.target.value) || 10 })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white shadow-sm"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

