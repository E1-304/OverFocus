'use strict';

var mongoose = require('mongoose'),//引入mongoose模块
	Schema = mongoose.Schema,
	ObjectId = Schema.Types.ObjectId;

var PhotoGroupSchema = new Schema({//相当于创建了一张数据表
	name: {//唯一									//照片组名
		type: String
	}, 										
	group: [{
		type: ObjectId,
		ref: 'Photo'
	}],          										// 存储照片的数组
	first: String,// 每组照片的封面
	summary: String,// 每组照片的简介 												
	author:String,
	pv:{													// 每组照片的浏览量
		type:Number,
		default:0
	},
  meta: {
  	createAt: {												// 创建时间
    	type: Date,
    	default: Date.now()
  	},
	  updateAt: {												// 更新时间
	    type: Date,
	    default: Date.now()
	  }
	}
});

// 模式保存前执行下面函数,如果当前数据是新创建，则创建时间和更新时间都是当前时间，否则更新时间是当前时间
PhotoGroupSchema.pre('save',function(next) {//每次调用之前都执行这个方法
	if(this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now();
	}else{
		this.meta.updateAt = Date.now();
	}
	next();
});
// 定义查询静态方法
// 静态方法不会与数据库直接交互，需要经过模型编译实例化后才会具有该方法
// TODO
// 多次重复的代码可以抽出去
PhotoGroupSchema.statics = {//经过model实例化以后才会有这个方法
	fetch: function(cb) {//取出数据库里面的所有数据
		return this
			.find({})
			.sort('meta.updateAt')
			.exec(cb);
	},
	findById: function(id,cb) {
		return this
			.findOne({_id: id})
			.exec(cb);
	}
};

module.exports = PhotoGroupSchema;
