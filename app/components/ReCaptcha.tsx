'use client';

import { forwardRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaProps {
  onChange?: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal';
  className?: string;
}

const ReCaptcha = forwardRef<ReCAPTCHA, ReCaptchaProps>(function ReCaptcha(
  { onChange, onExpired, onError, theme = 'light', size = 'normal', className },
  ref
) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.error('NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not configured');
    return null;
  }

  return (
    <div className={className}>
      <ReCAPTCHA
        ref={ref}
        sitekey={siteKey}
        onChange={onChange}
        onExpired={onExpired}
        onError={onError}
        theme={theme}
        size={size}
      />
    </div>
  );
});

export default ReCaptcha;