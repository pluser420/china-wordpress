'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inquirySchema, InquiryFormData } from '../lib/inquiry-schema';

// ---------------------------------------------------------------------------
// Augment the global Window type to include the grecaptcha object
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    grecaptcha?: {
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      ready: (cb: () => void) => void;
    };
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface InquiryFormProps {
  /** Pre-populate the "Product of Interest" field */
  defaultProductName?: string;
  /** Pre-populate the product category in the message or product field */
  defaultCategory?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InquiryForm({
  defaultProductName,
  defaultCategory,
}: InquiryFormProps) {
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      productOfInterest: defaultProductName || (defaultCategory ?? ''),
    },
  });

  // Pre-populate from props when they change
  useEffect(() => {
    if (defaultProductName) {
      setValue('productOfInterest', defaultProductName);
    } else if (defaultCategory) {
      setValue('productOfInterest', defaultCategory);
    }
  }, [defaultProductName, defaultCategory, setValue]);

  // ---------------------------------------------------------------------------
  // reCAPTCHA v3 helper
  // ---------------------------------------------------------------------------
  const executeRecaptcha = async (): Promise<string> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey || typeof window === 'undefined' || !window.grecaptcha) {
      // reCAPTCHA not configured — return an empty token (API will skip check)
      return '';
    }
    return new Promise((resolve) => {
      window.grecaptcha!.ready(async () => {
        try {
          const token = await window.grecaptcha!.execute(siteKey, {
            action: 'inquiry_submit',
          });
          resolve(token);
        } catch {
          resolve('');
        }
      });
    });
  };

  // ---------------------------------------------------------------------------
  // Submit handler
  // ---------------------------------------------------------------------------
  const onSubmit = async (data: InquiryFormData) => {
    setSubmitStatus('submitting');
    try {
      const recaptchaToken = await executeRecaptcha();
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, recaptchaToken }),
      });

      if (response.ok) {
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (submitStatus === 'success') {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="rounded-lg bg-green-50 border border-green-200 p-6 text-green-800"
      >
        <p className="font-semibold text-lg">Thank you for your inquiry!</p>
        <p className="mt-1 text-sm">We will contact you shortly.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Inquiry form"
      className="space-y-5"
    >
      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Full Name <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder="Enter your full name"
          aria-required="true"
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                     aria-invalid:border-red-500"
          aria-invalid={!!errors.fullName}
          {...register('fullName')}
        />
        {errors.fullName && (
          <p id="fullName-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Company Name (optional) */}
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
          Company Name
        </label>
        <input
          id="companyName"
          type="text"
          autoComplete="organization"
          placeholder="Enter your company name (optional)"
          aria-describedby={errors.companyName ? 'companyName-error' : undefined}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-invalid={!!errors.companyName}
          {...register('companyName')}
        />
        {errors.companyName && (
          <p id="companyName-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.companyName.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="your.email@example.com"
          aria-required="true"
          aria-describedby={errors.email ? 'email-error' : undefined}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Phone (optional) */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="Enter your phone number (optional)"
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-invalid={!!errors.phone}
          {...register('phone')}
        />
        {errors.phone && (
          <p id="phone-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Country */}
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
          Country <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="country"
          type="text"
          autoComplete="country-name"
          placeholder="Select your country"
          aria-required="true"
          aria-describedby={errors.country ? 'country-error' : undefined}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-invalid={!!errors.country}
          {...register('country')}
        />
        {errors.country && (
          <p id="country-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.country.message}
          </p>
        )}
      </div>

      {/* Product of Interest */}
      <div>
        <label
          htmlFor="productOfInterest"
          className="block text-sm font-medium text-gray-700"
        >
          Product of Interest <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="productOfInterest"
          type="text"
          placeholder="Enter product name or category"
          aria-required="true"
          aria-describedby={
            errors.productOfInterest ? 'productOfInterest-error' : undefined
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-invalid={!!errors.productOfInterest}
          {...register('productOfInterest')}
        />
        {errors.productOfInterest && (
          <p id="productOfInterest-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.productOfInterest.message}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Message <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder="Tell us about your requirements..."
          aria-required="true"
          aria-describedby={errors.message ? 'message-error' : undefined}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                     resize-y"
          aria-invalid={!!errors.message}
          {...register('message')}
        />
        {errors.message && (
          <p id="message-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* reCAPTCHA v3 placeholder — token is obtained programmatically on submit */}
      <input type="hidden" name="recaptchaToken" aria-hidden="true" />

      {/* Error banner */}
      {submitStatus === 'error' && (
        <div role="alert" className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">
            Failed to submit the form. Please try again.
          </p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting || submitStatus === 'submitting'}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white
                   hover:bg-blue-700 focus-visible:outline focus-visible:outline-2
                   focus-visible:outline-offset-2 focus-visible:outline-blue-600
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-150"
      >
        {isSubmitting || submitStatus === 'submitting'
          ? 'Submitting...'
          : 'Submit Inquiry'}
      </button>
    </form>
  );
}
