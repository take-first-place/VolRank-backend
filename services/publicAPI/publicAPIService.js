import axios from "axios";
import { insertVolunteer } from "../../model/publicAPI/publicAPIModel.js";
import { parseDate } from "../../utils/publicAPIDateParse.js";

const BASE_URL = process.env.VOLUNTEER_API_BASE_URL;
const LIST_PATH = process.env.VOLUNTEER_LIST_PATH;
const SERVICE_KEY = process.env.VOLUNTEER_API_KEY;

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
            organization_name: v.nanmmbyNm || "",
            place: v.actPlace || "",
            start_date: parseDate(v.progrmBgnde),
            end_date: parseDate(v.progrmEndde),
            external_id: v.progrmRegistNo
        };

        await insertVolunteer(volunteer);
    }

    console.log("봉사 데이터 저장 완료");
};

