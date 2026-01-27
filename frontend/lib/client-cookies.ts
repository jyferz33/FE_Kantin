import Cookies from "js-cookie";

//untuk mendapatkan cookie
export const getCookie = (key: string) => {
   return Cookies.get(key)
}

//untuk menyimpan cookie
export const storeCookie = (key: string, plainText: string) => {
   Cookies.set(key, plainText, { expires: 1 })
}

//untuk menghapus cookie
export const removeCookie = (key: string) => {
   Cookies.remove(key)
}