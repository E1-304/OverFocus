'use strict';

var mongoose = require('mongoose'),
    photoGroupSchema = require('../../schemas/photo/photoGroup.js');

//使用mongoose的模型方法编译生成模型
var PhotoGroup = mongoose.model('PhotoGroup',photoGroupSchema);

//将模型构造函数导出
module.exports = PhotoGroup;
