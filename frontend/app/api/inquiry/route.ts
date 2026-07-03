import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { inquirySchema } from '../../../lib/inquiry-schema';
import logger from '../../../lib/logger';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RecaptchaVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    // reCAPTCHA not configured — skip verification
    logger.warn('reCAPTCHA secret key not configured; skipping verification');
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: secretKey, response: token }).toString(),
    });

    const data: RecaptchaVerifyResponse = await res.json();

    if (!data.success) {
      logger.warn({ errorCodes: data['error-codes'] }, 'reCAPTCHA verification failed');
      return false;
    }

    // For v3, also check the score (0.5 is a reasonable threshold)
    if (typeof data.score === 'number' && data.score < 0.5) {
      logger.warn({ score: data.score }, 'reCAPTCHA score too low');
      return false;
    }

    return true;
  } catch (err) {
    logger.error({ err }, 'reCAPTCHA siteverify request failed');
    return false;
  }
}

// ---------------------------------------------------------------------------
// POST /api/inquiry
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch (err) {
    logger.error({ err }, 'Inquiry API: failed to parse JSON body');
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { recaptchaToken, ...formData } = body;

  // -------------------------------------------------------------------------
  // 1. Validate reCAPTCHA token
  // -------------------------------------------------------------------------
  const recaptchaValid = await verifyRecaptcha(
    typeof recaptchaToken === 'string' ? recaptchaToken : '',
  );

  if (!recaptchaValid) {
    return NextResponse.json(
      { error: 'Submission could not be verified. Please try again.' },
      { status: 400 },
    );
  }

  // -------------------------------------------------------------------------
  // 2. Re-validate form data with Zod schema (server-side)
  // -------------------------------------------------------------------------
  const parseResult = inquirySchema.safeParse(formData);

  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    logger.warn({ fieldErrors }, 'Inquiry API: validation failed');
    return NextResponse.json(
      { error: 'Validation failed', fieldErrors },
      { status: 422 },
    );
  }

  const data = parseResult.data;

  // -------------------------------------------------------------------------
  // 3. Send email via Nodemailer
  // -------------------------------------------------------------------------
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    });

    const recipient = process.env.INQUIRY_RECIPIENT || process.env.SMTP_USER || '';

    const emailSubject = `New Inquiry from ${data.fullName}${data.companyName ? ` (${data.companyName})` : ''}`;

    const emailBody = `
New inquiry received from the JIAYI Tools website.

--- Contact Details ---
Full Name:       ${data.fullName}
Company Name:    ${data.companyName || '(not provided)'}
Email:           ${data.email}
Phone:           ${data.phone || '(not provided)'}
Country:         ${data.country}

--- Inquiry Details ---
Product of Interest: ${data.productOfInterest}

Message:
${data.message}

---
Submitted via https://jiayitools.com
    `.trim();

    await transporter.sendMail({
      from: process.env.SMTP_USER || `noreply@jiayitools.com`,
      to: recipient,
      replyTo: data.email,
      subject: emailSubject,
      text: emailBody,
    });

    logger.info(
      { from: data.email, product: data.productOfInterest },
      'Inquiry API: email sent successfully',
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    logger.error({ err }, 'Inquiry API: SMTP send failed');
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 },
    );
  }
}
