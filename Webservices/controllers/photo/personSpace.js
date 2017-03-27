'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Photo = mongoose.model('Photo'),
  formidable = require("formidable"),
   bcrypt = require('bcrypt'),     // 用于密码加密
    SALT_WORK_FACTOR = 10,      // 计算强度
  async = require('async'),
  fs = require('fs');

//个人空间页面
//TODO
//对个人信息（User）的增删改查
//对个人上传的照片的增删改查   
exports.space = function(req, res) {
  console.log(req.session.user);
  res.render('pages/space', {
    title: '个人空间',
    user: req.session.user
  });
};

exports.uploadHeadImg = function(req, res) {
  res.render('pages/uploadHeadImg', {
    title: '个人空间',
    user: req.session.user
  });
};

exports.saveHeadImg = function(req, res) {
  //TODO
  //保存图片
  //前端头像图片
  var form = new formidable.IncomingForm(); //避免EXDEV问题
  // //上传完成后处理
  form.parse(req, function(err, fields, files) {
    var uploadedPath = files.file.path;
    var dstPath = './public/upload/' + req.session.user.username + '/' + 'HeadImage/' + files.file.name;
    var saveHeadImagePath = 'upload/' + req.session.user.username + '/' + 'HeadImage/' + files.file.name;
    // 在数据库中添加记录
    //  每张照片都要保存到Photo
    //  每个Group的照片都要保存Photo的地址或者ID到Group
    User.findOne({
      username: req.session.user.username,
    }, function(err, user) {
      if (err) {
        console.log(err);
      }
      user.headImage = saveHeadImagePath;
      user.save(function(err, user) {
        if (err) {
          console.log(err);
        } else {
          req.session.user = user;
          req.session.save();
          console.log("req.session.user: " + req.session.user);
          console.log("headImage change success");
        }
      });
    })
    var creat = './public/upload/' + req.session.user.username;
    var creat1 = './public/upload/' + req.session.user.username + '/' + 'HeadImage';
    fs.stat(creat, function(err, stat) {
      if (stat && stat.isDirectory()) {
        console.log("文件存在");
        fs.rename(uploadedPath, dstPath, function(err) {
          if (err) {
            console.log('rename error: ' + err);
            return res.json({
              error: {
                "code": 102,
                "message": "Failed to open output stream."
              }
            })
          } else {
            console.log('rename ok');
            return res.json({
              result: null
            });
          }
        });
      } else {
        console.log('文件不存在或不是标准文件');
        fs.mkdirSync(creat);
        fs.mkdirSync(creat1);

        fs.rename(uploadedPath, dstPath, function(err) {
          if (err) {
            console.log('rename error: ' + err);
            return res.json({
              error: {
                "code": 102,
                "message": "Failed to open output stream."
              }
            })
          } else {
            console.log('rename ok');
            return res.json({
              result: null
            });
          }
        });
      }
    })

  });
}

//TODO
//把上传的代码迁移到这里
exports.upload = function(req, res) {
  res.render('photo/photo_index', {
    title: '网站首页',
    Photo: Photo
  });
};

exports.changeInfo = function(req, res) {
  var _user = new Array();
  _user["username"] = req.body.username;
  //TODO
  //头像图片
  // _user["headImage"] = "../../images/default.png";

  _user["sex"] = req.body.sex || '';
  _user["tel"] = req.body.tel || '';
  _user["email"] = req.body.email || '';

  // var conditions = {username : _user.username};

  // var update = {$set : { realname : _user.realname,
  //                         sex : _user.sex,
  //                         tel : _user.tel,
  //                         email : _user.email,
  //                         qq : _user.qq,
  //                         wechat : _user.wechat,
  //                        }};

  // User.update(conditions, update, function(error){
  // if(error) {
  // console.log(error);
  // } else {
  // console.log('Update success!');
  // }
  // });
  User.findOne({
    username: _user.username
  }, function(err, user) {
    if (err) {
      console.log(err);
    }
    // 如果用户名存在
    if (user) {
      user.sex = _user.sex;
      user.tel = _user.tel;
      user.email = _user.email;
      user.save(function(err) {
        if (err) {
          console.log(err);
        } else {
          req.session.user = user;
          console.log("change userinfo success");
         res.json({success:1});  
        }
      });
    } else {
     res.json({success:0});  
    }
  });
}

exports.changePwd = function(req, res) {
  console.log(req.body.oldpwd);
  var oldpwd = req.body.oldpwd,
    newpwd = req.body.newpwd,
    repwd = req.body.repwd;
  if (newpwd == repwd) { //密码和确认密码首先得要一致
    User.findOne({
      username: req.session.user.username
    }, function(err, user) {
      if (err) {
        console.log(err);
      }
      if (!user) {
        return res.json({
          success: 0
        }); // 用户不存在
      }

      // 使用user实例方法对用户名密码进行比较
      user.comparePassword(oldpwd, function(err, isMatch) {
        if (err) {
          console.log(err);
          
      }
        // 密码匹配
        if (isMatch) {
          //更改密码
          console.log("newpwd:" + newpwd);
           bcrypt.genSalt(SALT_WORK_FACTOR,function(err,salt) {
    if(err) {
      return next(err);
    }
    bcrypt.hash(newpwd,salt,function(err,hash) {
      if(err) {
        return next(err);
      }
          user.password = hash;
          user.save(function(err, user) {
            if (err) {
              console.log(err);
            }
            delete req.session.user;
              return res.json({
                success: 1
              });
          });
        })
      })
         } else {
          // 账户名和密码不匹
          return res.json({
            success: 2
          });
        }
      });
    });
  } else {
    return res.json({
      success: 3
    });
  }
};