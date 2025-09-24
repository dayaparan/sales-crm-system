import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { redirect } from "next/navigation";

export default function handleError(error) {
  console.log(isAxiosError(error));

  if (isAxiosError(error)) {
    if (error.message === "canceled") return;

    if (error.response?.status === 403) {
      redirect("/dashboard/unauthorized");
      return;
    }

    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error(error.message);
    }
  } else {
    console.error("Error:", error);
  }
}
