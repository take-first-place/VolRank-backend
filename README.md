# 🚀 Backend (Express)

## 📌 프로젝트 소개

이 프로젝트는 Express 기반의 백엔드 서버입니다.  
회원 인증, API 제공, 데이터 관리 등을 담당합니다.

---

## 🛠️ 기술 스택

- Node.js
- Express
- MySQL / PostgreSQL
- JWT (인증)
- dotenv (환경 변수)

---

## 📂 폴더 구조

src/<br>
├── controllers/ # 요청 처리<br>
├── services/ # 비즈니스 로직<br>
├── routes/ # 라우터<br>
├── middlewares/ # 인증, 에러 처리<br>
├── models/ # DB 관련<br>
└── config/ # 설정<br>

---

## ⚙️ 실행 방법

### 1️⃣ 패키지 설치
```bash
npm install
```

### 2️⃣ 환경 변수 설정

`.env` 파일 생성
```text
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
JWT_SECRET=your_secret_key
```
---

### 3️⃣ 실행
```bash
npm run dev
```
---

## 📡 API 구조

### 🔐 인증

- `POST /auth/email/send` → 이메일 인증 코드 발송
- `POST /auth/email/verify` → 인증 코드 확인
- `POST /auth/signup` → 회원가입
- `POST /auth/login` → 로그인

---

## 🌳 브랜치 전략

- main → 배포
- develop → 개발 통합
- feature/\* → 기능 개발

---

## 🔄 작업 흐름

1. develop 최신화
   git checkout develop
   git pull origin develop

2. feature 브랜치 생성
   git checkout -b feature/기능명

3. 작업 후 push
   git push origin feature/기능명

4. PR 생성 (develop 대상)

---

## ⚠️ 규칙

- main 직접 수정 ❌
- develop 직접 push ❌
- PR 필수
- 커밋 메시지 규칙 준수

---

## ✨ 커밋 메시지 규칙

feat: 기능 추가
fix: 버그 수정
refactor: 리팩토링
docs: 문서 수정

## 💡 기타

- 환경 변수는 절대 커밋 금지 (.env)
- API 변경 시 팀원에게 공유 필수
