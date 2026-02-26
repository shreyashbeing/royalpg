import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // OWNER EMAIL
    pass: process.env.EMAIL_PASS, // APP PASSWORD
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"PG Management" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const sendEmail = async ({ to, subject, html }) => {
//   await resend.emails.send({
//     from: "PG Management <onboarding@resend.dev>",
//     to,
//     subject,
//     html,
//   });
// };
