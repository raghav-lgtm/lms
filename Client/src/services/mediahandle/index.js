import { axiosInstance } from "@/api/axiosInatance";

export const deleteMedia = async (publicId) => {
  if (!publicId) return;

  const res = await axiosInstance.delete(`/media/delete/${publicId}`);

  return res.data;
};

export const uploadMedia = async (videoData) => {
  const res = await axiosInstance.post("/media/upload", videoData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  console.log(res, "response");
  return res.data;
};
