import {
    getAll
} from "../../model/volunteerModel.js";

export const getList = async (req, res) => {
    try {
        const results = await getAll();
        return res.json(results);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "봉사활동 목록 조회 실패" });
    }
};