// 确认提示
function tk_ts_showModal(bt, nr="") {
	wx.showModal({
		title: bt, //标题
		content: nr,
		showCancel: false,
		success: function() {}, //接口调用成功的回调函数
		fail: function() {}, //接口调用失败的回调函数
		complete: function() {}, //接口调用结束的回调函数
		confirm: function() {

		}
	})
}
// 延迟模态框
function tk_ts_showToast(bt, icon, duration) {
	wx.showToast({
		title: bt, //标题
		icon: icon,
		duration: duration,
		mask: true,
		success: function() {}, //接口调用成功的回调函数
		fail: function() {}, //接口调用失败的回调函数
		complete: function() {}, //接口调用结束的回调函数
		confirm: function() {

		}
	})
}
// 打电话
function kfdh(dh) {
	wx.makePhoneCall({
		phoneNumber: dh,
		fail: function() {
			wx.showToast({
				title: '无法跳转或权限不足!', //标题
				icon: 'loading', //图标，支持"success"、"loading"
				duration: 500, //提示的延迟时间，单位毫秒，默认：1500
				mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false
				success: function() {}, //接口调用成功的回调函数
				fail: function() {}, //接口调用失败的回调函数
				complete: function() {} //接口调用结束的回调函数
			})
		}
	})
}
// JS对象深度合并
function deepMerge(target = {}, source = {}) {
	target = deepClone(target);
	if (typeof target !== 'object' || typeof source !== 'object') return false;
	for (var prop in source) {
		if (!source.hasOwnProperty(prop)) continue;
		if (prop in target) {
			if (typeof target[prop] !== 'object') {
				target[prop] = source[prop];
			} else {
				if (typeof source[prop] !== 'object') {
					target[prop] = source[prop];
				} else {
					if (target[prop].concat && source[prop].concat) {
						target[prop] = target[prop].concat(source[prop]);
					} else {
						target[prop] = deepMerge(target[prop], source[prop]);
					}
				}
			}
		} else {
			target[prop] = source[prop];
		}
	}
	return target;
}
// 判断arr是否为一个数组，返回一个bool值
function isArray(arr) {
	return Object.prototype.toString.call(arr) === '[object Array]';
}
// 深度克隆
function deepClone(obj) {
	// 对常见的“非”值，直接返回原来值
	if ([null, undefined, NaN, false].includes(obj)) return obj;
	if (typeof obj !== "object" && typeof obj !== 'function') {
		//原始类型直接返回
		return obj;
	}
	var o = isArray(obj) ? [] : {};
	for (let i in obj) {
		if (obj.hasOwnProperty(i)) {
			o[i] = typeof obj[i] === "object" ? deepClone(obj[i]) : obj[i];
		}
	}
	return o;
}
// 封装请求方法
const http_GetPOst = (url, method = 'GET', param = {}, header = {}, showLoading = "") => {
	// 默认配置
	const config = {
		// 请求的本域名
		baseUrl: 'http://39.98.124.206:80/diancan',
		// 设置为json，返回后会对数据进行一次JSON.parse()
		dataType: 'json',
		// 是否显示请求中的loading
		showLoading: true,
		// 请求loading中的文字提示
		loadingText: '请求中...',
		// 在此时间内，请求还没回来的话，就显示加载中动画，单位ms
		loadingTime: 800,
		// 展示loading的时候，是否给一个透明的蒙层，防止触摸穿透
		loadingMask: true,
		// 配置请求头信息
		header: {
			'content-type': 'application/json;charset=UTF-8',
		},
	}

	// 请求拦截部分，如配置，每次请求前都会执行
	const LanJieQi_KaiShi = (config) => {
		console.log('请求开始拦截器:', config)
		// 取本地存储的Cookie,不为空就添上
		try {
			const Cookie = wx.getStorageSync('cookieKey');
			if (Cookie) config.header.Cookie = Cookie;
		} catch (e) {
			console.log("取出本地cookie错误:" + e);
		}

		// 返回false,拦截不发送请求
		return config;
	}

	// 响应拦截，如配置，每次请求结束都会执行本方法
	const LanJieQi_JieShu = (res) => {
		console.log('请求结束拦截器:', res)
		if (res.statusCode == 200) {
			try {
				if (res.header["Set-Cookie"]) wx.setStorageSync('cookieKey', res.header["Set-Cookie"]);
			} catch (e) {
				console.log("存储本地cookie错误:" + e);
			}
			

			// 判断是否正常请求到
			if (res.data.status == 200) return res;
			switch (parseInt(res.data.status)) {
				case 999:
					break;
				default:
					tk_ts_showToast(res.data.msg ? res.data.msg : '未定义错误信息', 'none', 1000)
					return false;
			}
		} else {
			switch (res.statusCode) {
				case 999:
					break;
				default:
					try{
						tk_ts_showToast(res.data.msg ? res.data.msg : '操作出错!', 'none', 1000)
					}catch(e){
						tk_ts_showToast('操作出错!', 'none', 1000)
					}
					return false;
			}
		}

		return false;
	}
	
	if (showLoading!=""){
		config.showLoading=showLoading
	}

	let ChuLiGuoDeConfig = {}
	ChuLiGuoDeConfig.url = config.baseUrl + url
	ChuLiGuoDeConfig.method = method
	ChuLiGuoDeConfig.header = Object.assign(config.header, header)
	ChuLiGuoDeConfig.data = param
	ChuLiGuoDeConfig.dataType = config.dataType
	ChuLiGuoDeConfig = LanJieQi_KaiShi(ChuLiGuoDeConfig)

	if (config.showLoading) {
		var Loading = false
		var setTimeoutID = setTimeout(() => {
			Loading = true
			wx.showLoading({
				title: config.loadingText,
				mask: config.loadingMask,
			})
		}, config.loadingTime)
	}
	return new Promise((resolve, reject) => {
		wx.request({
			url: ChuLiGuoDeConfig.url,
			method: ChuLiGuoDeConfig.method,
			header: ChuLiGuoDeConfig.header,
			data: ChuLiGuoDeConfig.data,
			success: (res) => {
				if (config.dataType == 'json') {
					try {
						res.data = JSON.parse(res.data)
					} catch (e) {}
				}
				res = LanJieQi_JieShu(res)
				if (res == false) {
					setTimeout(() => {
						reject(res)
					}, 1000)
				} else {
					resolve(res)
				}
			},
			fail: (err) => {
				err = LanJieQi_JieShu(err)
				if (err == false) {
					setTimeout(() => {
						reject(err)
					}, 1000)
				} else {
					resolve(err)
				}
			},
			complete: () => {
				if (config.showLoading) {
					if (setTimeoutID) {
						clearTimeout(setTimeoutID);
						if (Loading) {
							wx.hideLoading();
						}
					}
				}
			}
		})
	})
}
const app = getApp()
module.exports = {
	tk_ts_showModal: tk_ts_showModal,
	tk_ts_showToast: tk_ts_showToast,
	kfdh: kfdh,
	deepMerge: deepMerge,
	isArray: isArray,
	deepClone: deepClone,
	http_GetPOst: http_GetPOst,
};
