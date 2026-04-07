import axios from "axios";
import { insertVolunteer } from "../../model/publicAPI/publicAPIModel.js";
import { parseDate, parseHour } from "../../utils/dateUtils.js";
import { findRegionCodeBy1365Code } from "../../model/region/externalRegionMappingModel.js";

const BASE_URL = process.env.V1365_API_BASE_URL;
const LIST_PATH = process.env.VOLUNTEER_LIST_PATH;
const DETAIL_PATH = process.env.VOLUNTEER_DETAIL_PATH;
const SERVICE_KEY = process.env.V1365_API_KEY;

// 봉사활동 목록 삽입
export const fetchAndSaveVolunteers = async () => {
  try {
    // 목록 조회 (ID 추출용)
    const listRes = await axios.get(`${BASE_URL}${LIST_PATH}`, {
      params: {
        serviceKey: SERVICE_KEY,
        _type: "json",
        numOfRows: 50,
      },
    });

    const items = listRes.data.response.body.items.item;

    if (!items) return;

    for (const item of Array.isArray(items) ? items : [items]) {
      try {
        // 상세 정보 조회 (progrmCn 등 상세 정보 가져오기 위함)
        const detailRes = await axios.get(`${BASE_URL}${DETAIL_PATH}`, {
          params: {
            serviceKey: SERVICE_KEY,
            progrmRegistNo: item.progrmRegistNo,
          },
        });

        const d = detailRes.data.response.body.items.item;

        // 모집 상태 매핑
        const statusMap = {
          1: "CLOSED", // 모집 대기
          2: "RECRUITING", // 모집중
          3: "FINISHED", // 모집 완료
        };

        const externalRegionCode = String(d.gugunCd || d.sidoCd || "").trim();

        const regionCode = externalRegionCode
          ? await findRegionCodeBy1365Code(externalRegionCode)
          : null;

        // 데이터 객체 생성
        const volunteer = {
          title: d.progrmSj || "",
          description: d.progrmCn || "",
          volunteer_type: d.srvcClCode || "",
          organization_name: d.mnnstNm || "",
          region_code: regionCode,
          place: d.actPlace || "",
          recruit_start_at: parseDate(d.noticeBgnde),
          recruit_end_at: parseDate(d.noticeEndde),
          start_date: parseDate(d.progrmBgnde),
          end_date: parseDate(d.progrmEndde),
          act_begin_time: parseHour(d.actBeginTm),
          act_end_time: parseHour(d.actEndTm),
          recruit_count: d.rcritNmpr || 0,
          status: statusMap[d.progrmSttusSe] || "FINISHED",
          external_url: d.url || "",
          external_id: String(d.progrmRegistNo),
        };

        await insertVolunteer(volunteer);
        console.log(`저장 완료: ${volunteer.title}`);
      } catch (err) {
        console.error(
          `상세 데이터 처리 중 오류 (ID: ${item.progrmRegistNo}):`,
          err.message,
        );
      }
    }
  } catch (err) {
    console.error("API 호출 중 치명적 오류: ", err.message);
  }
};
