import request from "./request"

export function userLogin (userInfo) {
    return request.post('login',userInfo)
}