export const createQrPayload = (eventId: string, qrValue: string) =>
  JSON.stringify({
    scope: 'univentra.attendance',
    eventId,
    qrValue,
  });

export const parseQrPayload = (value: string) => {
  try {
    const parsed = JSON.parse(value);

    if (
      parsed &&
      typeof parsed === 'object' &&
      parsed.scope === 'univentra.attendance' &&
      typeof parsed.eventId === 'string' &&
      typeof parsed.qrValue === 'string'
    ) {
      return parsed as { scope: string; eventId: string; qrValue: string };
    }
  } catch {
    return null;
  }

  return null;
};

export const generateCertificateNumber = (eventId: string, userId: string) =>
  `UV-${eventId.slice(0, 4).toUpperCase()}-${userId.slice(0, 4).toUpperCase()}-${Date.now()
    .toString()
    .slice(-6)}`;
