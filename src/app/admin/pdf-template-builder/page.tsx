'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileEdit, Save, Eye, Download, Plus, Trash2, Settings } from 'lucide-react';

export default function PDFTemplateBuilderPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState([
    { id: '1', name: 'Voedingsplan Template', type: 'nutrition', lastModified: '2024-02-15' },
    { id: '2', name: 'Trainingsschema Template', type: 'training', lastModified: '2024-02-10' },
    { id: '3', name: 'Factuur Template', type: 'invoice', lastModified: '2024-02-05' },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleEditTemplate = (templateId: string) => {
    router.push(`/admin/pdf-template-builder/${templateId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileEdit className="w-6 h-6 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">PDF Template Builder</h1>
            </div>
            <button className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors">
              <Plus className="w-5 h-5" />
              New Template
            </button>
          </div>
          <p className="text-gray-600">Create and manage PDF templates for nutrition plans, training schedules, and invoices</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileEdit className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nutrition Templates</p>
                <p className="text-2xl font-bold text-green-600">
                  {templates.filter(t => t.type === 'nutrition').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FileEdit className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Training Templates</p>
                <p className="text-2xl font-bold text-blue-600">
                  {templates.filter(t => t.type === 'training').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileEdit className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Invoice Templates</p>
                <p className="text-2xl font-bold text-orange-600">
                  {templates.filter(t => t.type === 'invoice').length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileEdit className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Available Templates</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`border-2 rounded-xl p-6 transition-all cursor-pointer hover:shadow-lg ${
                  selectedTemplate === template.id
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-gray-200 hover:border-rose-300'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FileEdit className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    template.type === 'nutrition' ? 'bg-green-100 text-green-700' :
                    template.type === 'training' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {template.type}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-500 mb-4">Last modified: {template.lastModified}</p>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTemplate(template.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-rose-500 text-white px-3 py-2 rounded-lg hover:bg-rose-600 transition-colors text-sm"
                  >
                    <Settings className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Add New Template Card */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-rose-500 hover:bg-rose-50 transition-all">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Create New Template</h3>
              <p className="text-sm text-gray-500 text-center">Click to start building a new PDF template</p>
            </div>
          </div>
        </div>

        {/* Template Editor (Placeholder) */}
        {selectedTemplate && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Template Editor</h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <FileEdit className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Template Editor</p>
              <p className="text-gray-400 text-sm">Drag and drop elements to build your PDF template</p>
              <p className="text-gray-400 text-sm mt-2">This feature is coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

