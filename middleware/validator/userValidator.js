import { body } from "express-validator";

export const registerValidator = [
  body("username")
    .notEmpty()
    .withMessage("username은 필수입니다.")
    .isLength({ min: 2, max: 30 })
    .withMessage("username은 2~30자"),

  body("nickname")
    .optional()
    .isLength({ max: 30 })
    .withMessage("nickname은 30자 이하"),

  body("email")
    .notEmpty()
    .withMessage("email은 필수입니다.")
    .isEmail()
    .withMessage("올바른 이메일 형식이 아닙니다."),

  body("password")
    .notEmpty()
    .withMessage("password는 필수입니다.")
    .isLength({ min: 6 })
    .withMessage("비밀번호는 최소 6자"),

  body("region_code").notEmpty().withMessage("region_code는 필수입니다."),
];
