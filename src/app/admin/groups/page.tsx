'use client';

import { useState, useEffect } from 'react';
import { Users2, Search, Plus, Trash2, Filter, TrendingUp, User, Edit, GripVertical, X, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Stats Cards Component
function StatsCard({ title, value, icon: Icon, color, trend }: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-sm text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
    </div>
  );
}

// Draggable Member Component
function DraggableMember({ 
  memberId, 
  memberName, 
  groupId 
}: { 
  memberId: string; 
  memberName: string; 
  groupId: string;
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'member',
    item: { memberId, memberName, sourceGroupId: groupId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm cursor-move hover:bg-gray-200 transition-colors flex items-center gap-2 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <GripVertical className="w-4 h-4 text-gray-400" />
      <span>{memberName.trim()}</span>
    </div>
  );
}

// Remove Zone Component
function RemoveZone({ onRemoveMember }: { onRemoveMember: (memberId: string, memberName: string, groupId: string) => void }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'member',
    drop: (item: { memberId: string; memberName: string; sourceGroupId: string }) => {
      onRemoveMember(item.memberId, item.memberName, item.sourceGroupId);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 rounded-2xl border-2 border-dashed transition-all ${
        isOver
          ? 'bg-red-100 border-red-400 scale-105'
          : 'bg-red-50 border-red-200'
      }`}
    >
      <div className="px-6 py-4 flex items-center gap-3">
        <Trash2 className={`w-6 h-6 ${isOver ? 'text-red-600' : 'text-red-400'}`} />
        <span className={`font-medium ${isOver ? 'text-red-700' : 'text-red-600'}`}>
          {isOver ? 'Drop here to remove from group' : 'Drag member here to remove'}
        </span>
      </div>
    </div>
  );
}

// Group Card Component with Drop Zone
function GroupCard({ 
  group, 
  onView, 
  onDelete,
  onMemberMove,
  onAddMember
}: {
  group: any;
  onView: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onMemberMove: (memberId: string, memberName: string, sourceGroupId: string, targetGroupId: string) => void;
  onAddMember: (groupId: string) => void;
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'member',
    drop: (item: { memberId: string; memberName: string; sourceGroupId: string }) => {
      if (item.sourceGroupId !== group.id) {
        onMemberMove(item.memberId, item.memberName, item.sourceGroupId, group.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all ${
        isOver
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-100 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{group.name || 'Unnamed Group'}</h3>
          <p className="text-sm text-gray-500">
            {group.groupSize || group.customerNames?.length || 0} members
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddMember(group.id)}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Add member"
          >
            <UserPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onView(group.id)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(group.id, group.name || 'Unnamed Group')}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users2 className="w-4 h-4" />
            <span className="font-medium">Members:</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {group.customerIds && group.customerNames && group.customerIds.length > 0 ? (
            group.customerIds.map((id: string, index: number) => (
              <DraggableMember
                key={id}
                memberId={id}
                memberName={group.customerNames[index] || 'Unknown'}
                groupId={group.id}
              />
            ))
          ) : (
            <span className="text-sm text-gray-400 italic">Drop members here</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<{id: string, name: string} | null>(null);
  const [movingMember, setMovingMember] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [clients, setClients] = useState<Array<{id: string, name: string, email: string}>>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data || []);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberMove = async (
    memberId: string,
    memberName: string,
    sourceGroupId: string,
    targetGroupId: string
  ) => {
    try {
      setMovingMember(true);

      // Find source and target groups
      const sourceGroup = groups.find(g => g.id === sourceGroupId);
      const targetGroup = groups.find(g => g.id === targetGroupId);

      if (!sourceGroup || !targetGroup) {
        console.error('Source or target group not found');
        return;
      }

      // Remove member from source group
      const sourceCustomerIds = sourceGroup.customerIds.filter((id: string) => id !== memberId);
      const sourceCustomerNames = sourceGroup.customerNames.filter((_: string, index: number) => 
        sourceGroup.customerIds[index] !== memberId
      );

      // Add member to target group
      const targetCustomerIds = [...(targetGroup.customerIds || []), memberId];
      const targetCustomerNames = [...(targetGroup.customerNames || []), memberName];

      // Update both groups via API
      const [sourceResponse, targetResponse] = await Promise.all([
        fetch('/api/groups', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId: sourceGroupId,
            customerIds: sourceCustomerIds,
            customerNames: sourceCustomerNames,
          }),
        }),
        fetch('/api/groups', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId: targetGroupId,
            customerIds: targetCustomerIds,
            customerNames: targetCustomerNames,
          }),
        }),
      ]);

      if (sourceResponse.ok && targetResponse.ok) {
        // Reload groups to get updated data
        await loadGroups();
      } else {
        console.error('Error moving member');
        alert('Failed to move member. Please try again.');
      }
    } catch (error) {
      console.error('Error moving member:', error);
      alert('Failed to move member. Please try again.');
    } finally {
      setMovingMember(false);
    }
  };

  const handleRemoveMember = async (
    memberId: string,
    memberName: string,
    groupId: string
  ) => {
    try {
      setMovingMember(true);

      const group = groups.find(g => g.id === groupId);
      if (!group) {
        console.error('Group not found');
        return;
      }

      // Remove member from group
      const updatedCustomerIds = group.customerIds.filter((id: string) => id !== memberId);
      const updatedCustomerNames = group.customerNames.filter((_: string, index: number) => 
        group.customerIds[index] !== memberId
      );

      // Update group via API
      const response = await fetch('/api/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: groupId,
          customerIds: updatedCustomerIds,
          customerNames: updatedCustomerNames,
        }),
      });

      if (response.ok) {
        // Reload groups to get updated data
        await loadGroups();
      } else {
        console.error('Error removing member');
        alert('Failed to remove member. Please try again.');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member. Please try again.');
    } finally {
      setMovingMember(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setGroupToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return;
    
    try {
      const response = await fetch(`/api/groups?groupId=${groupToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await loadGroups();
        setShowDeleteModal(false);
        setGroupToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleAddMemberClick = async (groupId: string) => {
    setSelectedGroupId(groupId);
    setShowAddMemberModal(true);
    setLoadingClients(true);
    setClientSearchTerm('');

    try {
      const response = await fetch('/api/clients/overview');
      if (response.ok) {
        const data = await response.json();
        const clientsData = data.clients || data.users || [];
        // Filter out admin users
        const regularClients = clientsData.filter((client: any) => 
          client.email !== 'info@mihaelafitness.com' && 
          client.email !== 'mihaela@mihaelafitness.com' && 
          client.email !== 'chiel@media2net.nl'
        );
        setClients(regularClients.map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email || ''
        })));
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleAddMemberToGroup = async (clientId: string, clientName: string) => {
    if (!selectedGroupId) return;

    try {
      setAddingMember(true);
      const group = groups.find(g => g.id === selectedGroupId);
      if (!group) {
        console.error('Group not found');
        return;
      }

      // Check if client is already in this group
      if (group.customerIds && group.customerIds.includes(clientId)) {
        alert('This client is already in this group');
        return;
      }

      // Add client to group (without removing from other groups)
      const updatedCustomerIds = [...(group.customerIds || []), clientId];
      const updatedCustomerNames = [...(group.customerNames || []), clientName];

      const response = await fetch('/api/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          customerIds: updatedCustomerIds,
          customerNames: updatedCustomerNames,
        }),
      });

      if (response.ok) {
        await loadGroups();
        setShowAddMemberModal(false);
        setSelectedGroupId(null);
        setClientSearchTerm('');
      } else {
        alert('Failed to add member. Please try again.');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member. Please try again.');
    } finally {
      setAddingMember(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    (group.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.customerNames || []).some((name: string) => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const stats = {
    total: groups.length,
    totalMembers: groups.reduce((sum, g) => sum + (g.groupSize || g.customerNames?.length || 0), 0),
    averageGroupSize: groups.length > 0 
      ? Math.round(groups.reduce((sum, g) => sum + (g.groupSize || g.customerNames?.length || 0), 0) / groups.length)
      : 0
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Groups</h1>
                <p className="text-gray-600 mt-1">Manage your training groups - Drag members between groups</p>
              </div>
              <button
                onClick={() => router.push('/admin/tarieven')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Add Group
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <StatsCard
                title="Total Groups"
                value={stats.total}
                icon={Users2}
                color="bg-blue-500"
              />
              <StatsCard
                title="Total Members"
                value={stats.totalMembers}
                icon={User}
                color="bg-emerald-500"
              />
              <StatsCard
                title="Avg. Group Size"
                value={stats.averageGroupSize}
                icon={Users2}
                color="bg-purple-500"
              />
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search groups or members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-6 sm:py-8 pb-24">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading groups...</p>
              </div>
            </div>
          ) : (
            <>
              {movingMember && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  Updating member...
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onView={(id) => {
                      router.push(`/admin/tarieven?groupId=${id}`);
                    }}
                    onDelete={handleDeleteClick}
                    onMemberMove={handleMemberMove}
                    onAddMember={handleAddMemberClick}
                  />
                ))}
              </div>
            </>
          )}

          {!loading && filteredGroups.length === 0 && (
            <div className="text-center py-12">
              <Users2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first group'}
              </p>
              <button
                onClick={() => router.push('/admin/tarieven')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Add Group
              </button>
            </div>
          )}
        </div>

        {/* Remove Zone - Fixed at bottom */}
        {!loading && filteredGroups.length > 0 && (
          <RemoveZone onRemoveMember={handleRemoveMember} />
        )}

        {/* Add Member Modal */}
        {showAddMemberModal && selectedGroupId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Add Member to Group</h3>
                    <p className="text-sm text-gray-600">
                      {groups.find(g => g.id === selectedGroupId)?.name || 'Group'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setSelectedGroupId(null);
                    setClientSearchTerm('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Clients List */}
              <div className="flex-1 overflow-y-auto mb-4">
                {loadingClients ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No clients found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredClients.map((client) => {
                      const group = groups.find(g => g.id === selectedGroupId);
                      const isInGroup = group?.customerIds?.includes(client.id);
                      
                      return (
                        <button
                          key={client.id}
                          onClick={() => !isInGroup && handleAddMemberToGroup(client.id, client.name)}
                          disabled={isInGroup || addingMember}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            isInGroup
                              ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                              : addingMember
                              ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{client.name}</div>
                          {client.email && (
                            <div className="text-sm text-gray-500">{client.email}</div>
                          )}
                          {isInGroup && (
                            <div className="text-xs text-emerald-600 mt-1">Already in group</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setSelectedGroupId(null);
                    setClientSearchTerm('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && groupToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Group</h3>
                  <p className="text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{groupToDelete.name}</strong>? 
                All group data will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}
