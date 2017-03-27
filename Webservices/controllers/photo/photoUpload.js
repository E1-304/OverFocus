'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Photo = mongoose.model('Photo'),
  PhotoGroup = mongoose.model('PhotoGroup'),
  multiparty = require('multiparty'),
  util = require('util'),
  formidable = require("formidable"),
  async = require('async'),
  fs = require('fs');

var groupNameinput = ""; //TODO 不能是全局变量，不然会保存上一次的而导致下一次传的时候报错
var currentUser = "";

exports.show = function(req, res, next) {
  //Test
  groupNameinput = ""; //先清一次
  res.render('pages/upload', {
    title: '图片上传页',
    user: req.session.user
  });
};

exports.checkGroup = function(req, res, next) {
  //TODO input框失去焦点时就开始查询
  //TODO 由前端也需要判断不能为空
  if (req.body.groupName) {
    groupNameinput = req.body.groupName;
    //查Group中有没有重名的
    PhotoGroup.find({
      name: groupNameinput
    }, function(err, user) {
      if (err) {
        console.log(err);
      }
      // 如果groupName已存在
      if (user.length != 0) {
        return res.json({
          data: 0
        });
      } else {
        //取得当前登录的User信息
        var currentUser = req.session.user;
        //新建一个到Group
        var newGroup = new PhotoGroup({
          name: currentUser.username + "_" + groupNameinput,
          author: currentUser.username
        });
        newGroup.save(function(err, group) {
          if (err) {
            console.log(err);
          } else {
            //User要保存该组的GroupName
            console.log(group);
            User.findOne({
              username: currentUser.username
            }, function(err, user) {
              // var passphotoGroup = new Array();
              // passphotoGroup = {
              //   photoGroup: group._id
              // }多余了多余了
              user.photoGroup.push(group._id);
              user.save(function(err) {
                if (err) {
                  console.log(err);
                }
                console.log("photogroup insert user success");
                return res.json({
                  data: 1
                });
              });
            });
          }
        });
      }
    });
  }
};

exports.upload = function(req, res) {
    //TODO
    //上传图片
    //数据库的更新
    //在当前登录用户下user文档里面的
    //用户先上传若干数量的图片，上传成功之后再从其中挑选一张作为封面
    //生成multiparty对象，并配置上传目标路径
    // var form = new multiparty.Form();
    var form = new formidable.IncomingForm(); //避免EXDEV问题
    currentUser = req.session.user;
    //上传完成后处理
    form.parse(req, function(err, fields, files) {
      console.log("groupNameinput: " + groupNameinput);
      if (groupNameinput == "") {
        console.log("没选你要上传的相册名字兄弟");
        return;
      }
      var uploadedPath = files.file.path;
      var dstPath = './public/upload/' + currentUser.username + '/' + groupNameinput + '/' + files.file.name;
      var creatfile = './public/upload/' + currentUser.username + '/' + groupNameinput;
      var savePath = 'upload/' + currentUser.username + '/' + groupNameinput + '/' + files.file.name;
      //在数据库中添加记录
      //每张照片都要保存到Photo
      //每个Group的照片都要保存Photo的地址或者ID到Group
      fs.stat(creatfile, function(err, stat) {
        if (stat && stat.isDirectory()) {
          console.log("文件存在");
          var newPhoto = new Photo({
            name: currentUser.username + "_" + groupNameinput + "_" + files.file.name,
            author: currentUser.username,
            savePath: savePath,
            groupName: groupNameinput
          });
          newPhoto.save(function(err, newphoto) {
            if (err) {
              console.log(err);
            } else {
              if (groupNameinput != "") {
                PhotoGroup.findOne({
                  name: currentUser.username + "_" + groupNameinput,
                }, function(err, photo) {
                  if (err) {
                    console.log(err);
                  }
                  photo.group.push(newphoto._id);
                  photo.save(function(err) {
                    if (err) {
                      console.log(err);

                    } else {
                      console.log("photo insert photogroup success");

                    }
                  });
                })
              }
            }
          });
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
          fs.mkdir(creatfile, function(err) {
            if (err) {
              console.log(err);
              console.log("创建文件夹失败");
            } else {
              console.log("创建文件夹成功");
              var newPhoto = new Photo({
                name: currentUser.username + "_" + groupNameinput + "_" + files.file.name,
                author: currentUser.username,
                savePath: savePath,
                groupName: groupNameinput
              });
              newPhoto.save(function(err, newphoto) {
                if (err) {
                  console.log(err);
                } else {
                  if (groupNameinput != "") {
                    PhotoGroup.findOne({
                      name: currentUser.username + "_" + groupNameinput,
                    }, function(err, photo) {
                      if (err) {
                        console.log(err);
                      }
                      photo.group.push(newphoto._id);
                      photo.save(function(err) {
                        if (err) {
                          console.log(err);
                          return res.json({
                            error: {
                              "code": 102,
                              "message": "Failed to open output stream."
                            }
                          })
                        } else {
                          console.log("photo insert photogroup success");
                          return res.json({
                            result: null
                          });
                        }
                      });
                    })
                  }
                }
              });
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
        }
      });
    })
  }
  // var filesTmp = JSON.stringify(files, null, 2); // 用于转换结果的函数或数组 after 向返回值 JSON 文本添加缩进、空格和换行符以使其更易于读取。     
  // if (err) {
  //   console.log('parse error: ' + err);
  // } else {
  //   console.log('parse files: ' + filesTmp);
  //   var filesTmpObj = JSON.parse(filesTmp);
  //   var imageCount = filesTmpObj.file1.length;
  //   for (var i = 0; i < imageCount; i++) {
  //     console.log(imageCount);
  //     var flagToEnd=0;
  //     var inputFile = filesTmpObj.file1[i];
  //     var uploadedPath = inputFile.path;
  //     var dstPath = './public/upload/' + inputFile.originalFilename;



//重命名为真实文件名
//保存到服务器本地
//方法一：
// (function(aaa,bbb,ccc){
//   var newPhoto = new Photo({
//   name: aaa.originalFilename,
//   author: currentUser.username, 
//   savePath: bbb,
//   groupName: groupNameinput
// });
// console.log("newPhoto:" + JSON.stringify(newPhoto));
// newPhoto.save(function(err, newphoto) {
//   console.log("a");
//   console.log("newPhoto:" + JSON.stringify(newphoto));
//   if (err) {
//     console.log(err);
//   } else {
//     if (groupNameinput != "") {
//       PhotoGroup.findOne({
//         name: currentUser.username + "_" + groupNameinput,
//       }, function(err, photo) {
//         if (err) {
//           console.log(err);
//         }
//         photo.group.push(newphoto._id);
//       })
//     }
//   }
// });
// fs.rename(uploadedPath, dstPath, function(err) {
//   if (err) {
//     console.log('rename error: ' + err);
//   } else {
//     console.log('rename ok');
//   }
// });
// })(inputFile, uploadedPath, dstPath);//捕获
//方法二：
// async.series([
//循环
//   function() {
//     //在数据库中添加记录
//     //每张照片都要保存到Photo
//     //每个Group的照片都要保存Photo的地址或者ID到Group
//     var newPhoto = new Photo({
//       name: inputFile.originalFilename,
//       author: currentUser.username,
//       savePath: dstPath,
//       groupName: groupNameinput
//     });
//     newPhoto.save(function(err, newphoto) {
//       if (err) {
//         console.log(err);
//       } else {
//         if (groupNameinput != "") {
//           PhotoGroup.findOne({
//             name: currentUser.username + "_" + groupNameinput,
//           }, function(err, photo) {
//             if (err) {
//               console.log(err);
//             }
//             photo.group.push(newphoto._id);
//           })
//         }
//       }
//     });
//   },
//   function() {
//     fs.rename(uploadedPath, dstPath, function(err) {
//       if (err) {
//         console.log('rename error: ' + err);
//       } else {
//         console.log('rename ok');
//       }
//     })
//   }

// ]);
//方法三：

//在数据库中添加记录
//每张照片都要保存到Photo
//每个Group的照片都要保存Photo的地址或者ID到Group
//   var newPhoto = new Photo({
//     name: currentUser.username + "_" + groupNameinput+ "_" + inputFile.originalFilename,
//     author: currentUser.username, 
//     savePath: dstPath,
//     groupName: groupNameinput
//   });
//   newPhoto.save(function(err, newphoto) {
//     console.log(newphoto._id);
//     if (err) {
//       console.log(err);
//     } else {
//       if (groupNameinput != "") {
//         PhotoGroup.findOne({
//           name: currentUser.username + "_" + groupNameinput,
//         }, function(err, photo) {
//           if (err) {
//             console.log(err);
//           }
//           photo.group.push(newphoto._id);
//           photo.save(function(err) {
//             if (err) {
//               console.log(err);
//             }
//             if(flagToEnd<imageCount-1){
//               flagToEnd++;
//               console.log("photo insert photogroup success");
//             }else{
//               console.log("END!!!");
//               res.redirect('/upload/cover');
//             }
//           });
//         })
//       }
//     }
//   });
//   fs.rename(uploadedPath, dstPath, function(err) {
//     if (err) {
//       console.log('rename error: ' + err);
//     } else {
//       console.log('rename ok');
//     }
//   });
// }
//   }
// });
exports.cover = function(req, res) {
  //显示该组所有的图片
  //选择一张作为封面
  res.render('pages/upload', {
    title: '图片上传页',
    user: req.session.user
  });
};