import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 앱 비밀번호
  },
});

export const sendMail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"MyApp" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
