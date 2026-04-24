import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { slugify } from '@/lib/utils/format';
import { platformService } from '@/services/platform-service';
import { storageService } from '@/services/storage-service';
import type { EventView, Profile } from '@/types';

const safePart = (value: string) => slugify(value).trim() || 'certificate';

const renderCertificatePdf = async (container: HTMLDivElement) => {
  const canvas = await html2canvas(container, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
  });

  const imageData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [canvas.width, canvas.height],
    compress: true,
  });

  pdf.addImage(imageData, 'PNG', 0, 0, canvas.width, canvas.height);
  return pdf;
};

export const certificateService = {
  buildFileName(studentName: string, eventSlug: string) {
    return `${safePart(studentName)}-${safePart(eventSlug)}-certificate.pdf`;
  },

  async issueCertificate({
    container,
    event,
    registrationId,
    profile,
    organizerName,
  }: {
    container: HTMLDivElement;
    event: EventView;
    registrationId: string;
    profile: Profile;
    organizerName: string;
  }) {
    const pdf = await renderCertificatePdf(container);
    const blob = pdf.output('blob');
    const pathOrUrl = await storageService.uploadPrivateAsset(blob, 'certificates', `${profile.id}/${event.id}`);
    const certificate = await platformService.upsertCertificateRecord(
      event.id,
      profile.id,
      registrationId,
      pathOrUrl,
    );

    return {
      certificate,
      pdf,
      pathOrUrl,
      fileName: this.buildFileName(profile.full_name, event.slug),
      organizerName,
    };
  },

  async downloadGeneratedCertificate(container: HTMLDivElement, fileName: string) {
    const pdf = await renderCertificatePdf(container);
    pdf.save(fileName);
    return pdf;
  },

  async downloadCertificate(pathOrUrl: string, fileName: string) {
    const resolvedUrl = await storageService.resolvePrivateAsset('certificates', pathOrUrl);
    try {
      const response = await fetch(resolvedUrl);
      if (!response.ok) {
        throw new Error('Unable to fetch certificate file.');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      const anchor = document.createElement('a');
      anchor.href = resolvedUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }
  },
};
