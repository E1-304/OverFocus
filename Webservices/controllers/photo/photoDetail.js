'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Photo = mongoose.model('Photo');

exports.detail = function(req,res) {
  var _id = req.params.id;                           // 获取URL中的电影ID
  // 用户访问统计，每次访问详情页，PV增加1
  // Photo.update({_id:_id},{$inc:{pv:1}},function(err) {
  //   if(err) {
  //     console.log(err);
  //   }
  // });
   Photo.findById(_id, function(err,_photo) {
    if(err) {
      console.log(err);
    }
  //该用户上传的全部图片
    User
      .find({username:_photo.author})
      .exec(function(err,photo){
        if(err) {
          console.log(err);
        }
        res.render('pages/detail', {
          title:'图片详情页',
          photolist: photo.photopath
        });
      });
	});
}
