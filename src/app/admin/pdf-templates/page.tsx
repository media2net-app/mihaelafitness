'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PDFTemplatesPage() {
  const [activeTab, setActiveTab] = useState('mealplan');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Templates</h1>
          <p className="text-gray-600">Bewerk en ontwerp je PDF sjablonen voor facturen en voedingsplannen</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('mealplan')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'mealplan'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Meal Plan Template
              </button>
              <button
                onClick={() => setActiveTab('invoice')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'invoice'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Invoice Template
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'mealplan' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Meal Plan Template</h2>
                    <p className="text-gray-600">Ontwerp de layout voor voedingsplan PDF's</p>
                  </div>
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                      Preview PDF
                    </button>
                    <button className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors">
                      Save Template
                    </button>
                  </div>
                </div>

                {/* Template Editor Placeholder */}
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Template Editor</h3>
                  <p className="text-gray-600 mb-4">Drag & drop editor komt hier - bouw je eigen PDF layout!</p>
                  <Link 
                    href="/admin/pdf-templates/mealplan-editor"
                    className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                  >
                    Open Editor
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'invoice' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Invoice Template</h2>
                    <p className="text-gray-600">Ontwerp de layout voor factuur PDF's</p>
                  </div>
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                      Preview PDF
                    </button>
                    <button className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors">
                      Save Template
                    </button>
                  </div>
                </div>

                {/* Template Editor Placeholder */}
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Template Editor</h3>
                  <p className="text-gray-600 mb-4">Drag & drop editor komt hier - bouw je eigen factuur layout!</p>
                  <Link 
                    href="/admin/pdf-templates/invoice-editor"
                    className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                  >
                    Open Editor
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors text-left">
              <div className="font-medium text-gray-900">Import Template</div>
              <div className="text-sm text-gray-600">Upload een bestaand PDF sjabloon</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors text-left">
              <div className="font-medium text-gray-900">Export Template</div>
              <div className="text-sm text-gray-600">Download sjabloon als JSON</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-colors text-left">
              <div className="font-medium text-gray-900">Reset to Default</div>
              <div className="text-sm text-gray-600">Herstel naar standaard sjabloon</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
