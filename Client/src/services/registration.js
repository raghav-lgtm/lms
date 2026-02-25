import React from "react";
import { axiosInstance } from "@/api/axiosInatance";

export const registrationServices = async (formData) => {
  const data = await axiosInstance.post("auth/register", {
    ...formData,
    role: "user",
  });

  return data;
};
