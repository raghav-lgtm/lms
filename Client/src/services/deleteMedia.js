import { axiosInstance } from "@/api/axiosInatance";

export const deleteMedia = async (publicId) => {
  if (!publicId) return;

  const res = await axiosInstance.delete(`/media/delete/${publicId}`);

  return res.data;
};
