'use strict';

var mongoose = require('mongoose'),
		bcrypt = require('bcrypt'),     // 用于密码加密
		Schema = mongoose.Schema,
		ObjectId = Schema.Types.ObjectId;
// 电影数据类型
var UserSchema = new Schema({
	username: {
		unique: true,
		type: String
	},
	password: String,
	headImage:String,
	realname: String,
	sex: String,
	tel: String,
	email: String,
	qq: String,
	wechat: String,
	photoGroup: [{
		type: ObjectId,
		ref: 'PhotoGroup'
	}],       
	/*
		0:nomal user
		1:verified user  邮件激活后的用户
		2:prefessional user
		>10: admin
		>50:super admin
	*/
	role:{
		type: Number,
		default: 0
	},
  meta: {
  	createAt: {
    	type: Date,
    	default: Date.now()
  	},
	  updateAt: {
	    type: Date,
	    default: Date.now()
	  }
	}
});

// 模式保存前执行下面函数,如果当前数据是新创建，则创建时间和更新时间都是当前时间，否则更新时间是当前时间
UserSchema.pre('save',function(next) {
	var user = this;
	if(this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now();
	}else {
		this.meta.updateAt = Date.now();
	}
	next();
});

// 实例方法，通过实例可以调用
UserSchema.methods = {
	//$2a$10$9QBGOCG7Pdp37iuFtL/ZvOxgXPvwukIFgUnfxgw6AEhXb0U10pfz6
	//$2a$10$WohsPdoGFCpqqmBTmWHtvuhzNiDWjLQlTv6YwosarfQJ0SxbDX1z6
	comparePassword : function(password,cb) {
		// 使用bcrypt的compare方法对用户输入的密码和数据库中保存的密码进行比对
		console.log(password);
		console.log(this.password);
		bcrypt.compare(password,this.password,function(err,isMatch) {
			if(err) {
				return cb(err);
			}
			console.log(isMatch);
			cb(null,isMatch);
		});
		// if(password==this.password){
		// 	cb(null,true);
		// }else{
		// 	return cb(err);
		// }
	}
};

// 给模型添加静态方法 
UserSchema.statics = {
	fetch: function(cb) {
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

module.exports = UserSchema;
