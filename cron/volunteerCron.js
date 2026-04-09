import cron from "node-cron";
import { fetchAndSaveVolunteers } from "../services/publicAPI/publicAPIService.js";

// 매일 새벽 3시 봉사 데이터 수집
cron.schedule("0 3 * * *", async () => {
    console.log("봉사 데이터 수잡 시작");

    try {
        await fetchAndSaveVolunteers();
        console.log("봉사 데이터 수집 완료");
    } catch (err) {
        console.error("봉사 데이터 수집 실패", err);
    }
});

// 테스팅하려면 밑의 주석을 해제해주세요.
//fetchAndSaveVolunteers();
