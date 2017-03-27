"use strict";

var express = require('express');
var path = require('path');
var http = require('http');
var favicon = require('serve-favicon');
var fs = require('fs');        
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');                // session依赖cookie模块
var mongoose = require('mongoose'); 
var mongoStore = require('connect-mongo')(session);     // 对session进行持久化--存数据库
var bodyParser = require('body-parser');
var async = require('async');//介绍：http://blog.csdn.net/marujunyy/article/details/8695205


var settings = require('./settings');
var app = express();

var dbUrl = 'mongodb://localhost/seeEsee';               // 连接本地数据库及数据库名称
//首先连接本地数据库(基本必须模块加载完毕)
mongoose.connect(dbUrl);                   
app.set('port',3000);
// view engine setup
app.set('views', path.join(__dirname, 'Webservices/views'));
app.set('view engine', 'ejs');
app.locals.moment = require('moment');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));//返回的对象是一个键值对，当extended为false的时候，键值对中的值就为'String'或'Array'形式，为true的时候，则可为任何数据类型。
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// models loading
var models_path = __dirname + '/Webservices/models';            // 模型所在路径

// 路径加载函数，加载各模型的路径,所以可以直接通过mongoose.model加载各模型 这样即使模型路径改变也无需更改路径
var walk = function(path) {
  fs 
    .readdirSync(path)  //同步版的返回文件名数组，其中不包括 '.' 和 '..' 目录.readdir 读取 path 路径所在目录的内容。 回调函数 (callback) 接受两个参数 (err, files) 其中 files 是一个存储目录中所包含的文件名称的数组，数组中不包括 '.' 和 '..'。
    .forEach(function(file) {//参数file是哪里来的？readdirSync的返回值？有点猛啊
      var newPath = path + '/' + file;
      var stat = fs.statSync(newPath);//同步版的,回调函数（callback） 接收两个参数： (err, stats) ，其中 stats 是一个 fs.Stats 对象。 详情请参考 fs.Stats
      // 如果是文件
      if (stat.isFile()) {
        if (/(.*)\.(js)/.test(file)) {
          require(newPath);
        }
      // 如果是文件夹则继续遍历
      }else if (stat.isDirectory()) {
        walk(newPath);
      }
    });
};
walk(models_path);   
var routes = require('./routes/routes');
app.use(session({
  secret:'seeEsee',                          // 设置的secret字符串，来计算hash值并放在cookie中
  resave: false,                                    // session变化才进行存储
  saveUninitialized: true,
  // 使用mongo对session进行持久化，将session存储进数据库中
  store: new mongoStore({
    url: dbUrl,                                     // 本地数据库地址
    collection: 'sessions'                          // 存储到mongodb中的字段名
  })
}));
//加载路由
async.waterfall([//与seires相似，按顺序依次执行多个函数。不同之处，每一个函数产生的值，都将传给下一个函数
  function(callback){
    routes(app);
    callback(null);
  },
  function(){
    app.use(function(req, res, next) {//没报错就不会有参数传到这里
      var err = new Error('Not Found');
      err.status = 404;
      next(err);//传给后面判断是否显示具体的报错信息
    });
    var env = process.env.NODE_ENV || 'development';  
    if (app.get('env') === 'development') {
      app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('pages/error', {
          message: err.message,
          error: err
        });
      });
    }

    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('pages/error', {
        message: err.message,
        error: {}
      });
    });
  }
]);


var server = http.createServer(app);
server.listen(app.get('port'));

server.on('listening', function(){
  console.log('----------listening on port: ' + app.get('port') +'----------------------');
});

server.on('error', function(error){
  switch (error.code) {
    case 'EACCES':
      console.error(bind + '需要权限许可');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + '端口已被占用');
      process.exit(1);
      break;
    default:
      throw error;
  }
});
