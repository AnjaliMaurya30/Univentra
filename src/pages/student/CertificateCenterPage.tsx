import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { CertificatePreview } from '@/components/certificates/certificate-preview';
import { EmptyState } from '@/components/common/empty-state';
import { LoadingScreen } from '@/components/common/loading-screen';
import { PageHeader } from '@/components/common/page-header';
import { Badge, Button, Card } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/lib/utils/format';
import { certificateService } from '@/services/certificate-service';
import { platformService } from '@/services/platform-service';

export const CertificateCenterPage = () => {
  const { profile } = useAuth();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const previewRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const certificatesQuery = useQuery({
    queryKey: ['certificates', profile?.id],
    queryFn: () => platformService.getEligibleCertificates(profile!.id),
    enabled: Boolean(profile?.id),
  });

  if (certificatesQuery.isLoading) {
    return <LoadingScreen message="Collecting your certificates..." />;
  }

  const certificates = certificatesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Certificate center"
        title="Issued certificates"
        description="Every eligible certificate you earn appears here for quick viewing and download."
      />
      <div className="grid gap-4">
        {certificates.length === 0 ? (
          <EmptyState
            description="Certificates will appear here after you attend completed certificate-enabled events."
            title="No certificates yet"
          />
        ) : (
          certificates.map((certificate) => (
            <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" key={certificate.id}>
              <div>
                <Badge variant={certificate.certificate_url ? 'success' : 'blue'}>
                  {certificate.certificate_url ? 'Issued' : 'Ready to download'}
                </Badge>
                <h3 className="mt-3 font-display text-2xl font-semibold text-ink">{certificate.event?.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">Certificate no. {certificate.certificate_number}</p>
                <p className="mt-1 text-sm text-ink-soft">Issued on {formatDate(certificate.issued_at)}</p>
              </div>
              <Button
                disabled={downloadingId === certificate.id}
                onClick={async () => {
                  const fileName = certificateService.buildFileName(
                    profile?.full_name ?? 'student',
                    certificate.event?.slug ?? 'univentra',
                  );

                  try {
                    setDownloadingId(certificate.id);

                    if (certificate.certificate_url) {
                      await certificateService.downloadCertificate(
                        certificate.certificate_url,
                        fileName,
                      );
                    } else {
                      const previewNode = previewRefs.current[certificate.id];
                      if (!previewNode) {
                        throw new Error('Certificate preview is not ready yet.');
                      }

                      await certificateService.downloadGeneratedCertificate(previewNode, fileName);
                    }
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : 'Unable to download certificate.',
                    );
                  } finally {
                    setDownloadingId(null);
                  }
                }}
              >
                {downloadingId === certificate.id
                  ? 'Preparing...'
                  : certificate.certificate_url
                    ? 'Download PDF'
                    : 'Generate PDF'}
              </Button>
            </Card>
          ))
        )}
      </div>

      <div className="pointer-events-none fixed -left-[10000px] top-0 opacity-0">
        {certificates.map((certificate) => {
          if (!certificate.event) return null;

          const organizerName =
            certificate.event.organizerClub?.name ??
            certificate.event.organizerProfile?.full_name ??
            'Univentra';

          return (
            <CertificatePreview
              certificateNumber={certificate.certificate_number}
              eventTitle={certificate.event.title}
              issueDate={certificate.issued_at}
              key={certificate.id}
              organizerName={organizerName}
              ref={(node) => {
                previewRefs.current[certificate.id] = node;
              }}
              studentName={profile?.full_name ?? certificate.profile?.full_name ?? 'Student'}
            />
          );
        })}
      </div>
    </div>
  );
};
