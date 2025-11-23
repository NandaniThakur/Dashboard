import api from "./api";

export const signUp = async (email, password) => {  
    const { data } =  await api.post('/auth/signup', { email, password });
    return data;
};
export const logIn = async (email, password) => {  
    const { data } =  await api.post('/auth/login', { email, password });
    return data;
};
export const logOut = async () => {  
    const { data } =  await api.post('/auth/logout');
    return data;
};

export const getCurrentUser = async () => {  
    const { data } =  await api.get('/auth/current-user');
    return data;
};
