import dayjs from "dayjs";

export default function formatDate(value, format = "DD/MM/YYYY hh:mm:A") {
  return dayjs(value).format(format);
}
