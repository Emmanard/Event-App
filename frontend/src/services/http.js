import axios from "axios";
// import { apiKey } from "./config.json";
const apiKey = process.env.REACT_APP_APIKEY;



axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.put["Content-Type"] = "application/json";
let jwtoken = localStorage.getItem("jwtoken");
if (jwtoken) axios.defaults.headers.common["jwtoken"] = jwtoken;
axios.defaults.headers.common["apikey"] = apiKey;

export const sendImagesConfig = {
    "Content-Type": "multipart/form-data",
    jwtoken: jwtoken,
    apikey: apiKey,
};

export const cancel = axios.CancelToken.source();
export const post = axios.post;
export const put = axios.put;
export const del = axios.delete;
export const get = axios.get;


// "root": "https://daktaryabapi.xyz",daktaryabapi.xyz
