import _get from "lodash/get";
import { buildFormData } from "./helper";
import axios from "@/axios";

// axios.defaults.withCredentials = true

export function get({ url, params }) {
  return createRequest({ method: "get", url, params });
}

export function post({ url, data, params }) {
  return createRequest({ method: "post", url, data, params });
}

export function postFile({ url, data, params }) {
  return createRequest({
    method: "post",
    url,
    data: buildFormData(data),
    params,
    headers: { "Content-Type": "multipart/form-data" }
  });
}

async function createRequest({ method, url, headers, data, params }) {
  // Set Bearer
  const token = localStorage.getItem("accessToken");

  if (token) axios.defaults.headers.common["Authorization"] = "Bearer " + token;

  const requestConfig = {
    method,
    url,
    baseURL: process.env.VUE_APP_ENV_API_URL,
    headers,
    data,
    params
  };

  try {
    const res = await axios(requestConfig);

    const { succeeded, message, result } = res.data;

    if (!succeeded) throw { response: res };

    const data = {
      message: message,
      result: result
    };

    return data;
  } catch (error) {
    throw {
      message: _get(error, "response.data.message", "Máy chủ không phản hồi.")
    };
  }
}
