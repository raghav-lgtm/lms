import React from "react";
import { axiosInstance } from "@/api/axiosInatance";

export const loginServices = async (formData) => {
  const response = await axiosInstance.post("/auth/login", {
    userEmail: formData.userEmail,
    password: formData.password,
  });

  return response.data;
};
