'use strict';
//首先加载各个控制器以及路由控制器
var PhotoIndex = require('../Webservices/controllers/photo/photoIndex'),     
    PhotoDetail = require('../Webservices/controllers/photo/photoDetail'),
    PhotoUpload = require('../Webservices/controllers/photo/photoUpload'),     
    PersonSpace = require('../Webservices/controllers/photo/personSpace'),     
    User = require('../Webservices/controllers/user/user'),
    multiparty = require('multiparty');

//路由分配好路径归哪个controller管 ，之后controller来进行模块和视图的读取和展示
module.exports = function(app){
  // 用户登录处理
  //就是引入一个所谓的中间件，其实就是用来再实际请求发生之前hack req和res对象来实现一些功能，比如果最简单的logger就是在res的end事件上添加监听写入一条日志记录，express使用connect提供的中间件
  app.use(function(req,res,next){
    app.locals.user = req.session.user; // 将session中保存的用户名存储到本地变量中
    next();
  });

  /*============== 公共路由 ==============*/
  // 用户注册路由
  app.post('/signup',User.signup);
  app.get('/user/signup/',User.showSignup);
  // 用户登陆路由
  app.post('/signin',User.signin);
  app.get('/user/signin',User.showSignin);
  // 用户登出路由
  app.get('/logout',User.logout);
  // 验证码路由
  app.get('/captcha',User.captcha);
  //照片上传路由
  app.route('/space/upload')
       .get(User.signinRequired,PhotoUpload.show)
       .post(User.signinRequired,PhotoUpload.upload);
  
  /*============== 网站路由 ==============*/
  // 主页路由
  //TODO
  app.get('/',PhotoIndex.index);
  // // 搜索结果页
  // app.get('/movie/results',MovieIndex.search);

  // // 全屏页
  // app.get('/fullpage',MovieIndex.fullpage);
  
  // 相册组查询
  app.post('/space/upload/checkGroup',PhotoUpload.checkGroup);
  //选择封面
  // app.post('/upload/cover',PhotoUpload.cover);
  //             详细页面路由
  app.route('/detail/:id')
       .get(PhotoDetail.detail);
  //TODO
  // User.signinRequired 用户登录控制   User.adminRequired 用户权限控制

  //详情页面路由
  app.post('/detail',User.signinRequired,PhotoDetail.detail);

  // 个人空间路由
  app.route('/space')//对user表的增删改查
       .get(User.signinRequired,PersonSpace.space)
       // .post(User.signinRequired,PersonSpace.changeInfo);

  app.post('/space/changePwd',PersonSpace.changePwd);
  app.post('/space/changeInfo',PersonSpace.changeInfo);

  app.route('/space/uploadHeadImg')//对user表的增删改查
       .get(PersonSpace.uploadHeadImg)
       .post(PersonSpace.saveHeadImg);

// //测试跨域方法
//   app.get('/jsonp',User.jsonp);
};
