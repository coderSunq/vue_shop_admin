import request from './request'

export function getUsersList (){
    request.get('users',{})
}