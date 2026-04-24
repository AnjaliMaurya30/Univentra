import { forwardRef } from 'react';

import { formatDate } from '@/lib/utils/format';

const certificateTemplateSrc = encodeURI('/certificate/certify.png');

export const CertificatePreview = forwardRef<
  HTMLDivElement,
  {
    studentName: string;
    eventTitle: string;
    organizerName: string;
    issueDate: string;
    certificateNumber: string;
  }
>(({ studentName, eventTitle, organizerName, issueDate, certificateNumber }, ref) => (
  <div
    ref={ref}
    className="relative overflow-hidden rounded-[36px] bg-white text-[#333333] shadow-soft"
    style={{ width: 2000, height: 1414 }}
  >
    <img
      alt="Certificate template"
      className="absolute inset-0 h-full w-full object-cover"
      src={certificateTemplateSrc}
    />

    <div className="absolute left-1/2 top-[41.6%] flex h-[11.2%] w-[74%] -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-white text-center">
      <p
        className="mx-auto inline-block bg-white px-12 py-2 text-[80px] italic leading-none text-[#111111]"
        style={{ fontFamily: '"Brush Script MT", "Lucida Handwriting", "Segoe Script", cursive' }}
      >
        {studentName}
      </p>
    </div>

    <div className="absolute left-1/2 top-[63.2%] w-[60%] -translate-x-1/2 text-center">
      <p className="text-[28px] font-medium leading-[1.6] text-[#2B2B2B]">
        In recognition of participation in <span className="font-semibold text-[#111111]">{eventTitle}</span>
      </p>
      <p className="mt-4 text-[22px] leading-none tracking-[0.2em] text-[#7A4DFF] uppercase">
        Organized by {organizerName}
      </p>
    </div>

    <div className="absolute bottom-[11.6%] left-1/2 w-[58%] -translate-x-1/2 rounded-[34px] border border-[#e7e7e7] bg-white/94 px-12 py-7 shadow-[0_16px_36px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-3 gap-6 text-center">
        <div>
          <p className="text-[14px] font-semibold uppercase tracking-[0.28em] text-[#9b7c1f]">Issue date</p>
          <p className="mt-3 text-[24px] text-[#333333]">{formatDate(issueDate)}</p>
        </div>
        <div>
          <p className="text-[14px] font-semibold uppercase tracking-[0.28em] text-[#9b7c1f]">Certificate no.</p>
          <p className="mt-3 text-[24px] text-[#333333]">{certificateNumber}</p>
        </div>
        <div>
          <p className="text-[14px] font-semibold uppercase tracking-[0.28em] text-[#9b7c1f]">Issued via</p>
          <p className="mt-3 text-[24px] text-[#333333]">Univentra</p>
        </div>
      </div>
    </div>
  </div>
));

CertificatePreview.displayName = 'CertificatePreview';
