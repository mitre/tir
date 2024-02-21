export default defineNuxtRouteMiddleware(async (to, from) => {

  try{ 
    if (to.path !== '/'){
      const {data: user} = await useFetch('/api/auth/currentUser', {method: 'GET'});
      if(user.value.statusCode !== 401){
        if(to.fullPath.startsWith("/administration")){
          if(!user.value.UserRole.name.toUpperCase().includes("ADMIN")){
            return abortNavigation("Insufficient permisions.")
          }
        }
        if(to.fullPath.startsWith("/logout")){
          const token = useCookie('tirtoken');
          token.value = null;
          return navigateTo('/')
        }
      }else{
        return navigateTo('/')
      }
    }
  }catch(error){
    console.log("ERROR AUTH:", error)
  }

})