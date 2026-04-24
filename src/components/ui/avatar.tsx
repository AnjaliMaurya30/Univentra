import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { initials } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

export const Avatar = ({
  src,
  alt,
  name,
  className,
}: {
  src?: string | null;
  alt?: string;
  name?: string | null;
  className?: string;
}) => (
  <AvatarPrimitive.Root
    className={cn(
      'inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-pop text-sm font-semibold text-white',
      className,
    )}
  >
    {src ? <AvatarPrimitive.Image className="h-full w-full object-cover" src={src} alt={alt ?? name ?? 'Avatar'} /> : null}
    <AvatarPrimitive.Fallback>{initials(name)}</AvatarPrimitive.Fallback>
  </AvatarPrimitive.Root>
);
