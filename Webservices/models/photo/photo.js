'use strict';

var mongoose = require('mongoose'),
    PhotoSchema = require('../../schemas/photo/photo.js');

//使用mongoose的模型方法编译生成模型
var Photo = mongoose.model('Photo',PhotoSchema);

//将模型构造函数导出
module.exports = Photo;
