'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useState } from 'react';
import { 
  DocumentTextIcon, 
  PlusIcon, 
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: Date;
  blocks: any[];
  thumbnail: string;
}

const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Series',
    description: 'Perfect for onboarding new subscribers',
    category: 'Onboarding',
    createdAt: new Date('2024-01-15'),
    blocks: [],
    thumbnail: 'welcome'
  },
  {
    id: '2',
    name: 'Product Launch',
    description: 'Announce new products with style',
    category: 'Marketing',
    createdAt: new Date('2024-01-10'),
    blocks: [],
    thumbnail: 'launch'
  },
  {
    id: '3',
    name: 'Weekly Newsletter',
    description: 'Keep your audience engaged weekly',
    category: 'Newsletter',
    createdAt: new Date('2024-01-08'),
    blocks: [],
    thumbnail: 'newsletter'
  },
  {
    id: '4',
    name: 'Promotional Offer',
    description: 'Drive sales with special offers',
    category: 'Promotional',
    createdAt: new Date('2024-01-05'),
    blocks: [],
    thumbnail: 'promo'
  },
  {
    id: '5',
    name: 'Event Invitation',
    description: 'Invite customers to your events',
    category: 'Events',
    createdAt: new Date('2024-01-03'),
    blocks: [],
    thumbnail: 'event'
  },
  {
    id: '6',
    name: 'Customer Survey',
    description: 'Collect valuable feedback',
    category: 'Feedback',
    createdAt: new Date('2024-01-01'),
    blocks: [],
    thumbnail: 'survey'
  },
];

const categories = ['All', 'Onboarding', 'Marketing', 'Newsletter', 'Promotional', 'Events', 'Feedback'];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getThumbnailColor = (thumbnail: string) => {
    const colors: Record<string, string> = {
      welcome: 'bg-gradient-to-br from-blue-500 to-purple-600',
      launch: 'bg-gradient-to-br from-green-500 to-teal-600',
      newsletter: 'bg-gradient-to-br from-orange-500 to-red-600',
      promo: 'bg-gradient-to-br from-pink-500 to-rose-600',
      event: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      survey: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    };
    return colors[thumbnail] || 'bg-gradient-to-br from-gray-500 to-gray-600';
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <Link href={"/"}>
              <h1 className="text-xl font-bold text-gray-900">
                Email Marketer
              </h1>
            </Link>
            <p className="text-sm text-gray-600">POS Platform</p>
          </div>
          
          <nav className="p-4 space-y-2">
            <a href="/dashboard" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <ChartBarIcon className="h-5 w-5" />
              <span>Dashboard</span>
            </a>
            <a href="/email-builder" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <EnvelopeIcon className="h-5 w-5" />
              <span>Email Builder</span>
            </a>
            <a href="/contacts" className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <UsersIcon className="h-5 w-5" />
              <span>Contacts</span>
            </a>
            <a href="/templates" className="flex items-center space-x-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
              <DocumentTextIcon className="h-5 w-5" />
              <span>Templates</span>
            </a>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-8 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
                <p className="text-gray-600">Choose from pre-built templates or create your own</p>
              </div>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <PlusIcon className="h-5 w-5" />
                <span>Create Template</span>
              </button>
            </div>
          </header>

          {/* Filters and Search */}
          <div className="p-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Search */}
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  {/* Thumbnail */}
                  <div className={`h-48 rounded-t-xl ${getThumbnailColor(template.thumbnail)} flex items-center justify-center`}>
                    <DocumentTextIcon className="h-12 w-12 text-white opacity-80" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">{template.name}</h3>
                        <p className="text-gray-600 text-sm">{template.description}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {template.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Created {template.createdAt.toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>Preview</span>
                      </button>
                      <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center space-x-1">
                        <DocumentDuplicateIcon className="h-4 w-4" />
                        <span>Use</span>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Add missing icons
function ChartBarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function EnvelopeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function DocumentChartBarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );
}