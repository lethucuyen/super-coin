import moment from "moment";
import _isString from "lodash/isString";
import _isDate from "lodash/isDate";

export function isURL(str) {
  if (!str) {
    return false;
  }

  if (str.startsWith && str.startsWith("/")) {
    return true;
  }

  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator

  return !!pattern.test(str);
}

export function isDate(str) {
  const valid = _isString(str) || _isDate(str);
  if (!valid) {
    return false;
  }

  return moment(str).isValid();
}

export function replaceAll(text, find, replaceWith) {
  const escaped = find.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "g");

  return text.replace(regex, replaceWith);
}

export function addSpaceCamelCase(text) {
  return text.replace(/([A-Z])/g, " $1").trim();
}
