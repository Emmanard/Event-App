import { post, get, del, put } from "services/http";
const root = process.env.REACT_APP_EVENT_WAVE_ROOT_URL;


export const registerUser = (body) => {
    return post(`${root}/api/v1/auth/register`, body);
};
export const loginUser = (body) => {
    return post(`${root}/api/v1/auth/login`, body);
};
export const verifyOTP = (body) => {
    return post(`${root}/api/v1/auth/verifyOTP`, body);
};
export const resendOTP = (body) => {
    return post(`${root}/api/v1/auth/resendOTP`, body);
};
export const forgotPassword = (email) => {
    return post(`${root}/api/v1/auth/forgotPassword`, email);
};
export const resetPassword = (token, body) => {
    return put(`${root}/api/v1/auth/resetPassword?token=${token}`, body);
};


// user
export const getUser = () => {
    return get(`${root}/api/v1/auth/getUser`);
};
export const updateUser = (id, body) => {
    return put(`${root}/api/v1/auth/updateUser?id=${id}`, body);
};
export const updateUserPassword = (id, oldPassword, password) => {
    return put(`${root}/api/v1/auth/updateUserPassword?id=${id}&oldPassword=${oldPassword}&password=${password}`);
};
export const uploadImage = (body) => {
    return post(`${root}/api/v1/auth/uploadImage`, body);
};