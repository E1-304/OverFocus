'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),                // 用户数据模型
    ccap = require('ccap')(),                     // 加载验证码模块
    bcrypt = require('bcrypt'),     // 用于密码加密
    SALT_WORK_FACTOR = 10,      // 计算强度
    captcha;                                     // 申明验证码变量

/* 用户注册及登录框中验证码生成器控制器 */
exports.captcha = function(req,res) {
  if(req.url === '/favicon.ico') {
    return res.end('');
  }
  var ary = ccap.get();
  captcha = ary[0];//文字
  var buf = ary[1];//图片                        // 生成验证码
  console.log(captcha);
  res.end(buf);
};

/* 用户注册控制器 */
//req.param获取pathinfo中参数 /api/users/{id}
//req.query获取查询参数 /api/users?name=wwx
//req.body获取form提交参数
exports.signup = function(req,res) {
  var userdata = req.body.user,                       // 获取post请求中的用户数据
      _user = {};
  userdata = userdata.split('&');
  for(var i = 0; i < userdata.length; i++) {
    var p = userdata[i].indexOf('='),
        name = userdata[i].substring(0,p),
        value = userdata[i].substring(p+1);
    _user[name] = value;
  }

  var data = new Array();
      data["username"] = _user.username;
      data["repassword"] = _user.repassword;
      data["captcha"] = _user.captcha;
      //先给一张默认的头像图片
      data["headImage"] = "../../images/default.png";
      data["sex"] = _user.sex;
      data["tel"] = _user.tel || '';
      data["email"] = _user.email.replace(/%40/, "@") || '';
      // 生成随机的盐，和密码混合后再进行加密
    bcrypt.genSalt(SALT_WORK_FACTOR,function(err,salt) {
    if(err) {
      return next(err);
    }
    bcrypt.hash(_user.password,salt,function(err,hash) {
      if(err) {
        return next(err);
      }
      data["password"] = hash;
      // 使用findOne对数据库中user进行查找
      User.findOne({username:data.username},function(err,user) {
        if(err) {
          console.log(err);
        }
        // 如果用户名已存在
        if(user) {
          return res.json({data:0});
        }else{
          // 验证码存在
          if (data.captcha) {
            console.log(data.captcha);
            console.log(captcha);
            if(data.captcha.toLowerCase() !== captcha.toLowerCase()) {
              res.json({data:1});                // 输入的验证码不相等
            }else {
              // 数据库中没有该用户名，将其数据生成新的用户数据并保存至数据库
              user = new User(data);            // 生成用户数据
              user.save(function(err,user) {
                if(err){
                  console.log(err);
                }
                req.session.user = user;        // 将当前登录用户名保存到session中
                return res.json({data:2});       // 注册成功
              });
            }
          }
        }
      });
    });
  });
};

/* 用户注册页面渲染控制器 */
exports.showSignup = function(req,res) {
  res.render('pages/reg', {
    title:'注册页面'
  });
};

/* 用户登陆控制器 */
exports.signin = function(req,res) {
  //TODO
  //前端验证不能提交空的
  //后台也必须验证一次
  var userdata = req.body.user,                       // 获取post请求中的用户数据
      _user = {};
  userdata = userdata.split('&');
  for(var i = 0; i < userdata.length; i++) {
    var p = userdata[i].indexOf('='),
        name = userdata[i].substring(0,p),
        value = userdata[i].substring(p+1);
    _user[name] = value;
  }

  var username = _user.username,
      password = _user.password,
      _captcha = _user.captcha;
  //简单验证不能为空
  if(username==''||password==''||_captcha==''){
    return res.json({data:0}); 
  }
  
  User.findOne({username:username},function(err,user) {
    if(err){
      console.log(err);
    }
    if(!user) {
      return res.json({data:0});                  // 用户不存在
    }
    // 使用user实例方法对用户名密码进行比较
    user.comparePassword(password,function(err,isMatch) {
      if(err) {
        console.log(err);
      }
      // 密码匹配
      if(isMatch) {
        // 验证码存在
        if (captcha) {
          if(_captcha.toLowerCase() !== captcha.toLowerCase()) {
            res.json({data:2});                     // 输入的验证码不相等
          }else {
            req.session.user = user;                // 将当前登录用户名保存到session中
            return res.json({data:3});              // 登录成功
          }
        }
      }else {
        // 账户名和密码不匹
        return res.json({data:1});
      }
    });
  });
};

/* 用户登录页面渲染控制器 */
exports.showSignin = function(req,res)  {
  res.render('pages/login',{
    title:'登录页面',
    user: req.session.user
  });
};

/* 用户登出控制器 */
exports.logout = function(req,res) {
  console.log("123");
  delete req.session.user;
  res.redirect('/');
};

exports.del = function(req,res) {
  // 获取客户端Ajax发送的URL值中的id值
  var id  = req.query.id;
  if(id) {
    // 如果id存在则服务器中将该条数据删除并返回删除成功的json数据
    User.remove({_id:id},function(err) {
      if(err){
        console.log(err);
      }
      res.json({success:1});              // 删除成功
    });
  }
};
/* 用户是否登陆判断中间件 */
exports.signinRequired = function(req,res,next) {
  var _user = req.session.user;
  if(!_user) {
    return res.redirect('/user/signin');
  }
  next();
};

/* 用户权限中间件 */
exports.adminRequired = function(req,res,next) {
  var _user = req.session.user;
  if(_user && _user.role <= 10){
    return res.redirect('/user/signin');
  }
    next();
};
// /* 测试Jsonp */
// exports.jsonp = function(req,res) {
//   var call = req.query.callback;
//   console.log(call);
//   return res.jsonp(123);   
// };
