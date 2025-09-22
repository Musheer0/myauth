import * as nodemailer from 'nodemailer';
import { sendEmailPayload } from '../types';

export const SendEmail = async ({ html, to, title }: sendEmailPayload) => {
  const transpoter = nodemailer?.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: `MyAuth <${process.env.EMAIL}>`,
    to,
    subject: title,
    html,
  };
  await transpoter.sendMail(mailOptions);
};
