import React from "react";
import { axiosInstance } from "@/api/axiosInatance";

export const loginServices = async (formData) => {
  const response = await axiosInstance.post("/auth/login", {
    userEmail: formData.userEmail,
    password: formData.password,
  });

  return response.data;
};

export const registrationServices = async (formData) => {
  const data = await axiosInstance.post("auth/register", {
    ...formData,
    role: "user",
  });

  return data;
};
