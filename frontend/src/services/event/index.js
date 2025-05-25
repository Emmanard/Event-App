import { post, get, del, put } from "services/http";
const root = process.env.REACT_APP_EVENT_WAVE_ROOT_URL;


export const addEvent = (body) => {
    return post(`${root}/api/v1/event/add`, body);
};
export const getMyEvents = () => {
    return get(`${root}/api/v1/event/getMyEvents`);
};
export const delEvent = (id) => {
    return del(`${root}/api/v1/event?id=${id}`);
};
export const getEditEvent = (id) => {
    return get(`${root}/api/v1/event?id=${id}`);
};
export const getEvent = (id) => {
    return get(`${root}/api/v1/event?id=${id}`);
};
export const updateEvent = (id, body) => {
    return put(`${root}/api/v1/event?id=${id}`, body);
};

export const getPopularEvents = (type) => {
    return get(`${root}/api/v1/event/popular/${type}`);
};
export const addView = (id) => {
    return put(`${root}/api/v1/event/addView?id=${id}`);
};
export const addLike = (id) => {
    return put(`${root}/api/v1/event/addLike?id=${id}`);
};
export const addComment = (id, body) => {
    return post(`${root}/api/v1/event/comment?id=${id}`, body);
};
export const getComments = (id, page) => {
    return get(`${root}/api/v1/event/comment?id=${id}&limit=10&page=${page}`);
};
export const deleteComment = (id) => {
    return del(`${root}/api/v1/event/comment?id=${id}`);
};