import { useCookie } from "nuxt/app";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const cookieName = 'tirtoken' //config.cookieName;
    deleteCookie(event, cookieName, {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        secure: false//process.env.NODE_ENV === "production",
    });
    const test = setCookie(event, 'tirtest', "1234", {path: '/', sameSite: 'strict', secure: false})
    const findCookie = getCookie(event, 'current-user')
    console.log(findCookie)
    const token = getCookie(event, 'tirtoken')
    console.log(token)
    deleteCookie(event, 'tirtoken')
    // const woot = useCookie('test')
    // const rawToken = useCookie('tirtoken')
    // const rawToekn2 = useCookie('blah')
    
    // if(rawToken){
    //     rawToken.value = null;
    // }
    

    return {error: "false"};
});
