import { Resend } from "resend";
import { prisma } from "@/lib/db";
import crypto from "crypto";

const OTP_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;

// Initialize Resend client
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set, email sending disabled");
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Generate a secure OTP code
 */
function generateOTP(): string {
  // Generate cryptographically secure random digits
  const buffer = crypto.randomBytes(4);
  const num = buffer.readUInt32BE(0) % Math.pow(10, OTP_LENGTH);
  return num.toString().padStart(OTP_LENGTH, "0");
}

/**
 * Generate and send OTP to email
 */
export async function sendOTP(email: string): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Check for existing unexpired OTP (rate limiting)
  const existingOTP = await prisma.oTPCode.findFirst({
    where: {
      email: normalizedEmail,
      expiresAt: { gt: new Date() },
      usedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  // If there's a recent OTP (less than 1 minute old), don't send a new one
  if (existingOTP) {
    const ageSeconds = (Date.now() - existingOTP.createdAt.getTime()) / 1000;
    if (ageSeconds < 60) {
      return {
        success: false,
        error: "Please wait before requesting a new code"
      };
    }
  }

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        role: "CONSUMER",
      },
    });
  }

  // Generate OTP
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Store OTP in database
  await prisma.oTPCode.create({
    data: {
      userId: user.id,
      email: normalizedEmail,
      code,
      expiresAt,
    },
  });

  // Send email
  const resend = getResendClient();
  if (!resend) {
    // Development mode - log OTP to console
    console.log(`[DEV] OTP for ${normalizedEmail}: ${code}`);
    return { success: true };
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "VLink <noreply@vlink.veritwin.com>",
      to: normalizedEmail,
      subject: "Your VLink verification code",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #6366f1; font-size: 28px; margin: 0;">VLink</h1>
              <p style="color: #666; margin-top: 8px;">Stablecoin Payments</p>
            </div>

            <div style="background: #f8fafc; border-radius: 12px; padding: 32px; text-align: center;">
              <p style="margin: 0 0 16px; color: #666;">Your verification code is:</p>
              <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a; font-family: monospace;">
                ${code}
              </div>
              <p style="margin: 24px 0 0; color: #999; font-size: 14px;">
                This code expires in ${OTP_EXPIRY_MINUTES} minutes.
              </p>
            </div>

            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
              If you didn't request this code, you can safely ignore this email.
            </p>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return { success: false, error: "Failed to send verification email" };
  }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(
  email: string,
  code: string
): Promise<{
  success: boolean;
  userId?: string;
  error?: string
}> {
  const normalizedEmail = email.toLowerCase().trim();

  // Find valid OTP
  const otpRecord = await prisma.oTPCode.findFirst({
    where: {
      email: normalizedEmail,
      code,
      expiresAt: { gt: new Date() },
      usedAt: null,
    },
    include: { user: true },
  });

  if (!otpRecord) {
    return { success: false, error: "Invalid or expired code" };
  }

  // Mark OTP as used
  await prisma.oTPCode.update({
    where: { id: otpRecord.id },
    data: { usedAt: new Date() },
  });

  // Mark email as verified if not already
  if (!otpRecord.user.emailVerified) {
    await prisma.user.update({
      where: { id: otpRecord.user.id },
      data: { emailVerified: new Date() },
    });
  }

  return { success: true, userId: otpRecord.user.id };
}

/**
 * Clean up expired OTP codes
 */
export async function cleanupExpiredOTPs(): Promise<number> {
  const result = await prisma.oTPCode.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { usedAt: { not: null } },
      ],
    },
  });
  return result.count;
}
