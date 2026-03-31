import {
    getAll,
    findPage,
    search
} from "../../model/volunteer/volunteerModel.js";

import { success, fail } from "../../utils/response.js";

// 기본 전체 조회
export const getList = async (req, res) => {
    try {
        const results = await getAll();
        return success(res, results, "기본 조회 성공", 200)
    } catch (err) {
        console.error("조회 실패: ", err);
        return fail(res, err.message || "기본 조회 실패", err.status || 500);
    }
};

// 페이징
export const getListPage = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const size = Math.min(50, Number(req.query.size) || 5);
        const results = await findPage(page, size);
        return success(res, results, "페이징 성공", 200);
    } catch (err) {
        console.error("페이징 실패: ", err);
        return fail(res, err.message || "페이징 실패", err.status || 500);
    }
};

// 검색
export const getListSearch = async (req, res) => {
    try {
        const results = await search(req.query);
        return success(res, results, "검색 성공", 200);
    } catch (err) {
        console.error("검색 실패: ", err);
        return fail(res, err.message || "검색 실패", err.status || 500);
    }
};
