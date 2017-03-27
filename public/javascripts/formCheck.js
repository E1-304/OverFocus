'use strict';

$.support.cors = true; // 解决IE8/9 Ajax跨域请求问题

/* 表单验证 */
$(function() {
	var captchaValue = true; // 用来判断验证码是否输入正确
	/*
		用户登录及注册对象方法
	*/

	$.validator.addMethod("Mobile", function(value, element) {
		var length = value.length;
		// var mobile = /^(1(3[0-9]|4[57]|5[0-35-9]|7[01678]|8[0-9])+d{8})$/;
		return this.optional(element) || (length == 11);
	}, "请正确填写您的手机号码");
	$.validator.addMethod("Username", function(value, element) {
		return this.optional(element) || /^[a-zA-Z0-9]+$/.test(value);
	}, "只能由英文字母、数字组成");

	var signObject = {
		// 用户登录方法
		signIn: function(obj) {
			return $(obj).validate({
				rules: {},
				messages: {},
				submitHandler: function() {
					if ($('#signinName').val() == '' || $('#signinPwd').val() == '' || $('#signinCaptcha').val() == '') {
						if ($('#signinName').val() == '') {
							$(obj).find('.afterIcon:eq(0)').css('display', 'inline-block');
							$(obj).find('button:contains("登录")').css('cursor', 'not-allowed').attr({
								disabled: 'true',
								title: '表单验证失败！请重新正确填写'
							});
						}
						if ($('#signinPwd').val() == '') {
							$(obj).find('.afterIcon:eq(1)').css('display', 'inline-block');
							$(obj).find('button:contains("登录")').css('cursor', 'not-allowed').attr({
								disabled: 'true',
								title: '表单验证失败！请重新正确填写'
							});
						}
						if ($('#signinCaptcha').val() == '') {
							$(obj).find('.afterIcon:eq(2)').css('display', 'inline-block');
							$(obj).find('button:contains("登录")').css('cursor', 'not-allowed').attr({
								disabled: 'true',
								title: '表单验证失败！请重新正确填写'
							});
						}
					} else {

						$.ajax({
								url: '/signin',
								method: 'POST',
								data: {
									'user': $(obj).serialize()
								}
							})
							.done(function(results) {
								switch (results.data) {
									// 用户不存在
									case 0:
										if ($(obj).find('input:eq(0)').val().length > 1) {
											$(obj).find('.afterIcon:eq(0)').css('display', 'inline-block');
										}
										//给登录按钮添加样式及使其无效防止重复提交
										$(obj).find('button:contains("登录")').css('cursor', 'not-allowed').attr({
											disabled: 'true',
											title: '您已提交，请勿重复点击'
										});
										refrashImg();
										break;
										// 密码填写错误
									case 1:
										if ($(obj).find('input:eq(1)').val().length > 1) {
											$(obj).find('.afterIcon:eq(0)').css({
												background: 'url(images/ok.png)',
												backgroundRepeat: 'no-repeat',
												backgroundSize: 'cover',
												display: 'inline-block'
											});
											$(obj).find('.afterIcon:eq(1)').css('display', 'inline-block');
										}
										$(obj).find('button:contains("登录")').css('cursor', 'not-allowed').attr({
											disabled: 'true',
											title: '您已提交，请勿重复点击'
										});
										refrashImg();
										break;
										// 验证码填写错误
									case 2:
										if ($(obj).find('input:eq(2)') !== '') {
											$(obj).find('.afterIcon:eq(0)').css({
												background: 'url(images/ok.png)',
												backgroundRepeat: 'no-repeat',
												backgroundSize: 'cover',
												display: 'inline-block'
											});
											$(obj).find('.afterIcon:eq(1)').css({
												background: 'url(images/ok.png)',
												backgroundRepeat: 'no-repeat',
												backgroundSize: 'cover',
												display: 'inline-block'
											});
											$(obj).find('.afterIcon:eq(2)').css('display', 'inline-block');
										}
										$(obj).find('button:contains("登录")').css('cursor', 'not-allowed').attr({
											disabled: 'true',
											title: '您已提交，请勿重复点击'
										});
										refrashImg();
										break;
										//登录成功
									default:
										var d = dialog({
											id: 'login-sucess',
											title: '登录成功！',
											content: '先弹个框出来意思意思',
											zIndex: '1055'
										});
										d.show();
										setTimeout(function() {
											d.close().remove();
											$('#homepage')[0].click();// 登录成功 进入首页
										}, 2000);
								}
							});
					}
				},
				// 表单验证失败时执行的方法
				invalidHandler: function() {
					captchaValue = false; // 验证码输入正确时该标志位变量为true
					$(obj).find('button:contains("登录")').css('cursor', 'not-allowed').attr({
						disabled: 'true',
						title: '表单验证失败！请重新正确填写'
					});
				}
			});
		},
		// 用户注册方法
		signUp: function(obj) {
			return $(obj).validate({
				rules: {
					'username': {
						Username:[],
						required: true,
						minlength: 2,
						maxlength: 15
					},
					'password': {
						required: true,
						minlength: 2,
						maxlength: 15
					},
					'repassword': {
						equalTo: $(obj).find('input:eq(1)')
					},

					'sex': {
						required: true,
					},

					'tel': {
						Mobile:[]
					},

					'email': {
						email: true
					},

					'captcha': {
						required: true,
					},
				},
				messages: {
					'username': {
						required: '用户名不能为空',
						minlength: '用户名最小2位',
						maxlength: '用户名最大15位'
					},
					'password': {
						required: '密码不能为空',
						minlength: '密码最小2位',
						maxlength: '密码最大15位'
					},
					'repassword': {
						equalTo: '两次输入的密码不相同'
					},
					'sex': {
						required: '好歹选个性别吧'
					},
					'tel': {
					},
					'email': {
						email: '格式不正确'
					},
					'captcha': {
						required: '请填写验证码'
					}
				},
				submitHandler: function() {
					$.ajax({
							url: '/signup',
							method: 'POST',
							data: {
								'user': $(obj).serialize()
							}
						})
						.done(function(results) {
							switch (results.data) {
								case 0:
									// 用户名已存在
									if ($(obj).find('#signupName').val().length > 1) {
										$(obj).find('.afterIcon:eq(0)').css('display', 'inline-block');
										$(obj).find('#signupName-error').html('用户已存在').show();
									}
									$(obj).find('button:contains("注册")').css('cursor', 'not-allowed').attr({
										disabled: 'true',
										title: '请重新正确填写再提交'
									});
									refrashImg();
									break;
								case 1:
									if ($(obj).find('#signupcaptcha') !== '') {
										$(obj).find('.afterIcon').not('#CaptchaAfterIcon').css({
											background: 'url(images/ok.png)',
											backgroundRepeat: 'no-repeat',
											backgroundSize: 'cover',
											display: 'inline-block'
										});
										$(obj).find('#CaptchaAfterIcon').css('display', 'inline-block');
										$(obj).find('#signupcaptcha-error').html('验证码填写错误').show();
									}
									$(obj).find('button:contains("注册")').css('cursor', 'not-allowed').attr({
										disabled: 'true',
										title: '请重新正确填写再提交'
									});
									refrashImg();
									break;
								default:
									var d = dialog({
										id: 'login-sucess',
										title: '注册成功！',
										content: '1秒后转到登录界面',
										zIndex: '1055'
									});
									d.show();
									setTimeout(function() {
										d.close().remove();
										//注册成功 转到登录界面进行登录
										$('#showLogin').click();
									}, 1000);
							}
						});
				},
				invalidHandler: function() {
					captchaValue = false;
					$(obj).find('button:contains("注册")').css('cursor', 'not-allowed').attr({
						disabled: 'true',
						title: '请重新正确填写再提交'
					});
				}
			});
		}
	};


	/* 用户登录弹出框 */
	signObject.signIn('#signinForm');
	/* 用户注册弹出框 */
	$(".labelradio input[name='signType']").on('change', function() {
		if ($(".labelradio input[name='signType']:checked").val() == 0) {
			signObject.signUp('#signupForm');
			$("#tel").rules("remove", "required");
			$("#email").rules("remove", "required");
			$(".canChoose").css('display', 'none');
			$("#email-error").css('display', 'none');
			$("#tel-error").css('display', 'none');
		} else {
			$('#tel').rules("add", {
				required: true,
				messages: {
					required: "请填写手机号"
				}
			});
			$('#email').rules("add", {
				required: true,
				messages: {
					required: "请填写邮箱"
				}
			});
			$(".canChoose").css('display', 'inline');
		}
	}).trigger('change');

	$('#signinForm .modal-body input').on('input', function() {
		// 当输入框内容发生变化时删除登陆或注册按钮按时及使其有效
		$('#signinForm').find('button:contains("登录")').removeAttr('disabled').css('cursor', 'default');
	}).trigger('input');
	$('#signupForm .modal-body input').on('input', function() {
		// 当输入框内容发生变化时删除登陆或注册按钮按时及使其有效
		$('#signupForm').find('button:contains("注册")').removeAttr('disabled').css('cursor', 'default');
	}).trigger('input')
});