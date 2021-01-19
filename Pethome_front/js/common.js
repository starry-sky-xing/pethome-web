Vue.prototype.$http=axios;
axios.defaults.baseURL="http://localhost";

/*axios前置拦截器， 只要你发送axios之前，都先执行此箭头函数*/
axios.interceptors.request.use(config=>{
    //携带token
    let token =  localStorage.getItem("token");
    if(token){
        //添加请求头信息
        config.headers['token']=token;
    }
    return config;
},error => {
    Promise.reject(error);
});

//aixos后置拦截器，在响应目标函数之前，先执行此箭头函数
axios.interceptors.response.use(result=>{

    let data = result.data;
    //console.debug(data);
    //如果没有登录或者过期
    if(!data.success&&data.msg==="noLogin"){
        //把token和登录用户删除掉
        localStorage.removeItem("token");
        //跳转到登录界面
        location.href="/login.html";
        return;
    }
    return result;
},error => {
    Promise.reject(error);
});

/**
 * js动态获取?后面的参数，并且封装成一个json对象
 * @returns {Object}
 */
function getParam(){
    var url=location.search;
    var param = new Object();
    if(url.indexOf("?")!=-1){
        var str = url.substr(1)
        strs = str.split("&");
        for(var i=0;i<strs.length;i++){
            param[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
        }
    }
    return param;
}