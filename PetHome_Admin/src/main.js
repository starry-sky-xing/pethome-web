import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
//import './assets/theme/theme-green/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
//导入axios
import axios from 'axios'
//添加$http 属性
Vue.prototype.$http=axios;
axios.defaults.baseURL = "/api";

import routes from './routes'

import 'font-awesome/css/font-awesome.min.css'

Vue.use(ElementUI);
Vue.use(VueRouter);
Vue.use(Vuex);

//NProgress.configure({ showSpinner: false });

const router = new VueRouter({
  routes
});

// 路由拦截器
router.beforeEach((to, from, next) => {
  //登录和商家入驻放行
  if (to.path=="/login" || to.path=="/shopReg") {
    next()
  } else {
      //获取token的值
      var token = localStorage.getItem("token");
      //如果token有值，证明是登录状态
      if(token){
          //就应该是放行状态
          next();
      }else{
          //否则就应该跳转到登录界面
          next({path: '/login'});
      }
  }
})

//router.afterEach(transition => {
//NProgress.done();
//});
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
        router.push("/login");
        return;
    }
    return result;
},error => {
    Promise.reject(error);
});
new Vue({
  //el: '#app',
  //template: '<App/>',
  router,
  store,
  //components: { App }
  render: h => h(App)
}).$mount('#app');

