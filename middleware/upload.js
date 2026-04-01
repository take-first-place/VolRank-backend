import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads", "certificates"); // 저장 경로 설정

// 디렉토리 유무 확인 및 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 서버 하드디스크에 저장
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname); // 확장자 추출
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName); // 중복되지 않는 파일명 생성, 시간-랜덤숫자.확장자
  },
});

// 파일 필터링
function fileFilter(req, file, cb) {
  // 허용할 확장자 및 MIME 타입 정규식
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;

  // 파일명 확장자 테스트
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );

  // MIME 타입 테스트
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("허용되지 않는 파일 형식입니다. (jpg, png, gif, pdf만 가능)"));
  }
}

export const certificateUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 크기 5MB 제한
  },
});
