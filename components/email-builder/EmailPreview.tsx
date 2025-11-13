import Link from "next/link";

interface EmailPreviewProps {
  html: string;
  onClose: () => void;
}

export default function EmailPreview({ html, onClose }: EmailPreviewProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-11/12 h-5/6 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Link href={"/"}>
              <h1 className="text-xl font-bold text-gray-900">
                Email Marketer
              </h1>
            </Link>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg">
            {/* Email Preview */}
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Send Test Email
          </button>
        </div>
      </div>
    </div>
  );
}

function XMarkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}