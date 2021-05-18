import moment from "moment";

moment.locale("vi");

export function formatTextDate(value, format = "DD/MM/YYYY") {
  return moment(value).format(format);
}

export function formatTextDateTime(value, format = "DD/MM/YYYY HH:mm") {
  return moment(value).format(format);
}

export function formatTextTimeDate(value, format = "HH:mm DD/MM/YYYY") {
  return moment(value).format(format);
}

export function formatTextTime(value, format = "HH:mm") {
  return moment(value).format(format);
}

export function formatTextYear(value, format = "YYYY") {
  return moment(value).format(format);
}

export function formatTextTimeAgo(value) {
  return moment(value).fromNow();
}

export function displayDuration(from, to) {
  const result = moment.utc(Math.max(moment(to).diff(moment(from)), 60000));

  if (result.hours() === 0) {
    return result.format("m[ mins]");
  }

  return result.format("H[ hour(s) ]m[ mins]");
}
