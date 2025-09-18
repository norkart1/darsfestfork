"use client";
import { useState, useEffect } from 'react';

interface Dars {
  id: number;
  darsname: string;
  darsplace: string;
  zone: string;
  slug?: string;
  totalCandidates: number;
}

export default function DarsPage() {
  const [darsData, setDarsData] = useState<Dars[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDars, setEditingDars] = useState<Dars | null>(null);
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');

  const [formData, setFormData] = useState({
    darsname: '',
    darsplace: '',
    zone: '',
    slug: ''
  });

  const zones = ['KONDOTTY', 'MALAPPURAM', 'PALAKKAD', 'KOZHIKODE', 'THRISSUR'];

  useEffect(() => {
    fetchDars();
  }, []);

  const fetchDars = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dars');
      if (response.ok) {
        const data = await response.json();
        setDarsData(data.darsData);
      }
    } catch (error) {
      console.error('Error fetching dars:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (darsname: string) => {
    return darsname
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        slug: formData.slug || generateSlug(formData.darsname)
      };

      const url = editingDars ? `/api/admin/dars/${editingDars.id}` : '/api/admin/dars';
      const method = editingDars ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        await fetchDars();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving dars:', error);
    }
  };

  const handleEdit = (dars: Dars) => {
    setEditingDars(dars);
    setFormData({
      darsname: dars.darsname,
      darsplace: dars.darsplace || '',
      zone: dars.zone,
      slug: dars.slug || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this dars? This will also affect related candidates.')) {
      try {
        const response = await fetch(`/api/admin/dars/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchDars();
        }
      } catch (error) {
        console.error('Error deleting dars:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      darsname: '',
      darsplace: '',
      zone: '',
      slug: ''
    });
    setEditingDars(null);
  };

  const filteredDars = darsData.filter(dars => {
    const matchesSearch = dars.darsname.toLowerCase().includes(search.toLowerCase()) ||
                         dars.darsplace?.toLowerCase().includes(search.toLowerCase());
    const matchesZone = !zoneFilter || dars.zone === zoneFilter;
    return matchesSearch && matchesZone;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dars Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage dars institutions and their locations
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Dars
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by dars name or place..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zone
            </label>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Zones</option>
              {zones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-md text-sm font-medium w-full"
            >
              Add New Dars
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Dars</p>
              <p className="text-2xl font-bold text-gray-900">{darsData.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-900">
                {darsData.reduce((sum, dars) => sum + dars.totalCandidates, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Zones</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(darsData.map(dars => dars.zone)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dars Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Dars Institutions ({filteredDars.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dars Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Place
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDars.map((dars) => (
                <tr key={dars.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dars.darsname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dars.darsplace || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {dars.zone}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {dars.totalCandidates} candidates
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(dars)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dars.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredDars.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No dars found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingDars ? 'Edit Dars' : 'Add New Dars'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dars Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.darsname}
                  onChange={(e) => setFormData({ ...formData, darsname: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Place
                </label>
                <input
                  type="text"
                  value={formData.darsplace}
                  onChange={(e) => setFormData({ ...formData, darsplace: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone *
                </label>
                <select
                  required
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select Zone</option>
                  {zones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (Optional)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Auto-generated if empty"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly identifier for this dars
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primaryDark"
                >
                  {editingDars ? 'Update' : 'Create'} Dars
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}