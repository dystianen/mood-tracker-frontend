import axios from "./axios";

export const createMood = async (payload: any) => {
  const res = await axios.post("/mood/create", payload);
  return res.data;
};

export const updateMood = async (id: string, payload: any) => {
  const res = await axios.put(`/mood/update/${id}`, payload);
  return res.data;
};

export const getTodayMood = async () => {
  const res = await axios.get("/report/today");
  return res.data;
};

export const getWeeklyMood = async () => {
  const res = await axios.get("/report/weekly");
  return res.data;
};

export const getMonthlyMood = async (month: number, year: number) => {
  const res = await axios.get("/report/monthly", {
    params: {
      month,
      year,
    },
  });

  return res.data;
};
