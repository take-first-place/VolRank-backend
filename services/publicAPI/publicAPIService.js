import axios from "axios";
import { insertVolunteer } from "../../model/publicAPI/publicAPIModel.js";
import { parseDate } from "../../utils/publicAPIUtil.js";

const BASE_URL = process.env.VOLUNTEER_API_BASE_URL;
const LIST_PATH = process.env.VOLUNTEER_LIST_PATH;
const SERVICE_KEY = process.env.VOLUNTEER_API_KEY;

// 봉사활동 목록 삽입
export const fetchAndSaveVolunteers = async () => {
    const url = `${BASE_URL}${LIST_PATH}`;

    const res = await axios.get(url, {
        params: {
            serviceKey: SERVICE_KEY,
            _type: 'json',
            numOfRows: 50
        }
    });

    const items = res.data.response.body.items.item;

    for (const v of items) {
        const volunteer = {
            title: v.progrmSj || "",
            description: v.progrmCn || "",
            organization_name: v.nanmmbyNm || "",
            place: v.actPlace || "",
            recruit_start_at: parseDate(v.noticeBgnde),
            recruit_end_at: parseDate(v.noticeEndde),
            start_date: parseDate(String(v.progrmBgnde).concat(String(v.actBeginTm))),
            end_date: parseDate(String(v.progrmEndde).concat(String(v.actEndTm))),
            recruit_count: v.rcruitNmpr
        };

        await insertVolunteer(volunteer);
    }

    console.log("봉사 데이터 저장 완료");
};

