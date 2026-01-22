import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export function ApplicationDetails() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/applications"
          className="p-2 rounded-lg hover:bg-neutral-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Application Details
          </h1>
          <p className="text-neutral-500">ID: {id}</p>
        </div>
      </div>

      <div className="card p-8 text-center">
        <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
        <h3 className="text-lg font-medium text-neutral-900">
          Application not found
        </h3>
        <p className="text-neutral-500 mt-1">
          The application you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/applications" className="btn-primary mt-4">
          Back to Applications
        </Link>
      </div>
    </div>
  );
}
