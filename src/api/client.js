const gateway = "http://localhost:8090/api/";

//change this to use rxjs as new api soon
async function requestApi(endpoint, type, { data, urlParams, ...customConfig } = {}) { //replace later with RTK
    try {
        const response = await fetch(`${gateway}${endpoint}${Object.keys(urlParams).length !== 0 ? "?" + new URLSearchParams(urlParams) : ""}`, 
            {
            ...customConfig,
            method: type,
            headers: {
                ...customConfig.headers,
                "Accept": "application/json"
            },
            body: data ? JSON.stringify(data) : undefined
        })
        console.log(response);
        try { //temp
            var resJson = await response.json();
        } catch (error) {
            var resJson = {};
        }

        if (!response.ok) {
            console.log("activating")
            //throw new Error(response.status.toString());
            throw {message : resJson.error, status : response.status}
        }
        return Promise.resolve(resJson)
    } catch (error) {
        console.log("bad", error)
        return Promise.reject({...error});
    }
}

//export { postSignup, getLogin };
const postApi = (endpoint, body, customConfig = {}) => requestApi(
    endpoint, "POST", { ...customConfig, data: body, urlParams: {}});
const getApi = (endpoint, urlBody, customConfig = {}) => requestApi(
    endpoint, "GET", { ...customConfig, urlParams: urlBody });
const deleteApi = (endpoint, body, customConfig = {}) => requestApi(
    endpoint, "DELETE", { ...customConfig, data: body, urlParams: {} });
const putApi = (endpoint, body, customConfig = {}) => requestApi(
    endpoint, "PUT", { ...customConfig, data: body, urlParams : {} });

export { postApi, getApi, deleteApi, putApi };