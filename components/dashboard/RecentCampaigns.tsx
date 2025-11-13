import { Campaign } from '@/types';
import { formatDate, getCampaignStatusColor } from '@/utils';

interface RecentCampaignsProps {
  campaigns: Campaign[];
  onViewCampaign?: (campaign: Campaign) => void;
  onEditCampaign?: (campaign: Campaign) => void;
}

export function RecentCampaigns({ campaigns, onViewCampaign, onEditCampaign }: RecentCampaignsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Campaigns</h3>
        <p className="text-sm text-gray-600 mt-1">Your latest email campaigns</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Campaign</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Recipients</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Open Rate</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Click Rate</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Last Updated</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{campaign.name}</p>
                    <p className="text-sm text-gray-500">{campaign.subject}</p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCampaignStatusColor(campaign.status)}`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  {campaign.recipientCount.toLocaleString()}
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  {campaign.openRate ? `${campaign.openRate}%` : '-'}
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  {campaign.clickRate ? `${campaign.clickRate}%` : '-'}
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  {formatDate(campaign.updatedAt)}
                </td>
                <td className="py-4 px-6">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewCampaign?.(campaign)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View
                    </button>
                    {campaign.status === 'draft' && (
                      <button
                        onClick={() => onEditCampaign?.(campaign)}
                        className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {campaigns.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <EnvelopeIcon className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500 mb-2">No campaigns yet</p>
            <p className="text-sm text-gray-400">
              Create your first campaign to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function EnvelopeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}