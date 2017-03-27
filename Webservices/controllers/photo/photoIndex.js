'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Photo = mongoose.model('Photo');

//网站首页   
exports.index = function(req,res) {
  	//TODO
  	//渲染首页
  	//初始化图片
    // Photo
    // .find({})
    // .exec(function(err,photolist) {
    //     if(err){
    //       console.log(err);
    //     }
    //渲染界面
      res.render('pages/homepage',{
        title:'网站首页',
        user: req.session.user
      });    
};

//网站首页搜索
exports.search = function(req,res) {
	//TODO
    // 搜索功能
     Movie
      .find({title:new RegExp(q + '.*', 'i')})            // 通过正则匹配查询
      .exec(function(err, movies) {
        if (err) {
          console.log(err);
        }
        //TODO
        //对搜索结果进行解析
        //渲染搜索结果页面
      });
};

