import axios from "axios"
import * as SecureStore from 'expo-secure-store';
// root url should updated as per ip address of host machine unless  server is hosted on static address
const rootUrl = "http://10.12.163.226:8888/api/v1"


const fetchProcessor = async ({ method, url, data, token, isPrivate }) => {
    const headers = {}
    if (isPrivate) {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }
    }
    try {
        const res = await axios({
            method,
            url,
            data,
            headers

        })
        return res

    } catch (error) {
        if (error.response) {
            return {
                status: error.response.status,
                message: error.response.data.detail || "Unknown error occurred",
            };
        } else {
            return {
                status: 500,
                message: "network error",
            };
        }
    }
}




export const loginUser = async (loginData) => {
    const url = rootUrl + "/login/access-token"
    const obj = {
        method: 'post',
        url,
        data: loginData,
        // isPrivate:true

    }
    return fetchProcessor(obj)

}


export const registerNewUser = async (data) => {
    const url = rootUrl + "/signup"
    const obj = {
        method: "post",
        url,
        data,
    }
    return fetchProcessor(obj)
}


export const RecoverPassword = async (email) => {
    const encodedEmail = encodeURIComponent(email);
    const url = `${rootUrl}/recover-password/${encodedEmail}`;
    const obj = {
        method: 'post',
        url
    }
    return fetchProcessor(obj)

}

export const resetPassword = async (data) => {
    const url = rootUrl + "/reset-password";
    const obj = {
        method: "post",
        url,
        data,
    };

    return fetchProcessor(obj);
};



export const verifyEmail = async (email, code) => {
    const params = new URLSearchParams({ email, code }).toString();
    const url = `${rootUrl}/signup/verify-email?${params}`;
    const obj = {
        method: "post",
        url,
        data: {}
    }

    return fetchProcessor(obj);

}

