import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMail = async (to, subject, html) => {
  await resend.emails.send({
    from: "onboarding@resend.dev", // 도메인 없어도 이걸로 그냥 됨
    to,
    subject,
    html,
  });
};
