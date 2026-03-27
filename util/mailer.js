const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // 또는 smtp 직접 설정 가능
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 앱 비밀번호
  },
});

const sendMail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"MyApp" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = {
  sendMail,
};
