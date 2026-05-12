import { DashboardShell } from '../../components/layout/DashboardShell';
import { DocumentCenter } from '../../components/documents/DocumentCenter';

export function DocumentsPage() {
  return (
    <DashboardShell>
      <div className="max-w-4xl max-auto">
        <DocumentCenter />
      </div>
    </DashboardShell>
  );
}
