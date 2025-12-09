import axios from "./axios";

export const login = async (payload: { email: string; password: string }) => {
  const res = await axios.post("/login", payload);
  return res.data;
};

export const registerApi = async (payload: any) => {
  const res = await axios.post("/register", payload);
  return res.data;
};
