import 'dotenv/config';
import { RequestHandler } from 'express';
import nodemailer from 'nodemailer';
import Twilio from 'twilio';

/**
 * POST /api/notify
 * Body: { emailTo?: string, smsTo?: string, subject?: string, text: string }
 *
 * Sends email (if emailTo provided) and/or SMS (if smsTo provided).
 * Uses environment variables defined in .env (see .env.example).
 */

export const handleNotify: RequestHandler = async (req, res) => {
	// ...basic input validation...
	const { emailTo, smsTo, subject = 'Notification', text } = req.body ?? {};

	if (!text) {
		return res.status(400).json({ error: 'Missing text in request body' });
	}

	const results: Record<string, unknown> = {};

	// Send email if requested
	if (emailTo) {
		try {
			const port = Number(process.env.SMTP_PORT || 587);
			const transporter = nodemailer.createTransport({
				host: process.env.SMTP_HOST,
				port,
				secure: (process.env.SMTP_SECURE === 'true') || port === 465,
				auth: {
					user: process.env.SMTP_MAIL,
					pass: process.env.SMTP_PASSWORD,
				},
			});

			// Do not log secrets; only return message id on success
			const info = await transporter.sendMail({
				from: process.env.SMTP_MAIL,
				to: emailTo,
				subject,
				text,
			});

			results.email = { ok: true, messageId: info.messageId };
		} catch (err: any) {
			// Return non-sensitive error info
			results.email = { ok: false, message: err?.message ?? 'unknown error' };
		}
	}

	// Send SMS if requested
	if (smsTo) {
		try {
			const sid = process.env.TWILIO_ACCOUNT_SID;
			const token = process.env.TWILIO_AUTH_TOKEN;
			const from = process.env.TWILIO_PHONE;

			if (!sid || !token || !from) {
				throw new Error('Twilio config missing (see .env)');
			}

			const client = Twilio(sid, token);
			const msg = await client.messages.create({
				body: text,
				from,
				to: smsTo,
			});

			results.sms = { ok: true, sid: msg.sid };
		} catch (err: any) {
			results.sms = { ok: false, message: err?.message ?? 'unknown error' };
		}
	}

	if (!emailTo && !smsTo) {
		return res.status(400).json({ error: 'Provide at least emailTo or smsTo' });
	}

	return res.json({ ok: true, results });
};
