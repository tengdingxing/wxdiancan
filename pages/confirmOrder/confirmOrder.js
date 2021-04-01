const app = getApp();
const GG = require('../../public/public.js');
Page({
	//页面的初始数据
	data: {
		// 店名
		storeName: [],
		tableNum: "",
		confirmOrder: [],
		// 用餐人数输入框获取焦点
		diner_numF: false,
		// 备注信息
		remarks: "",
		// 购物车数据
		YouCeLan_list: [],
		totalPrice: 0,
		totalNum: [],
		// 遮罩
		maskFlag: true,
		// 桌号
		zhNum: [],
	//	SongDaDiZhi:'请填写收货地址',
	//	ShouJiHao:'请填写收货人姓名',
		// 收货地址列表
	//	ShouHuoDiZhiList:[],
	//	ShouHuoDiZhiListIndex:-1,
		// 要显示模态框的name
		modalName:'bottomModal'
	},
	// 生命周期函数--监听页面加载
	onLoad: function(Options) {
		// 获取店名
		var storeName = wx.getStorageSync('storeName')
		// 获取桌号
		var nmb = wx.getStorageSync('zhuohao')
		this.setData({
			storeName: storeName,
			zhNum: nmb
		})
		const eventChannel = this.getOpenerEventChannel()
		eventChannel.on('setConfirmOrder', (data) => {
			this.setData({
				totalNum: data.totalNum,
				YouCeLan_list: data.YouCeLan_list,
				totalPrice: data.totalPrice,
				remarks: data.Remarks
			})
		})
	},
	onShow: function() {
		// 生命周期函数--监听页面显示
		this.setData({
			ShouHuoDiZhiList:app.globalData.ShouHuoDiZhiList
		})
	},
	onReady: function() {
		// 生命周期函数--监听页面初次渲染完成
		try{
			GG.loadFiles('ShouHuoDiZhiList.json').then((res)=>{
				let JsonRes=JSON.parse(res)
				app.globalData.ShouHuoDiZhiList=JsonRes
				this.setData({
					ShouHuoDiZhiList:JsonRes
				})
			})
		}catch(e){
			//TODO handle the exception
		}
	},
	SetGouWuCheShuLiang: function(bool, e, e2) {
		// 改变购物车数量
		if (bool == 3) {
			tableNum = 0
		}
		let YouCeLan_list = GG.deepClone(e2) //深度克隆防止下面改变data里面的值
		for (let key in YouCeLan_list) {
			YouCeLan_list[key].map((mapi) => {
				if (bool == 3) {
					// 清空处理
					mapi.quantity = 0
					return
				}
				if (mapi.productId == e.currentTarget.dataset.item.productId) {
					// 增减处理
					switch (bool) {
						case 0:
							mapi.quantity++
							this.data.totalNum++
							this.data.totalPrice += mapi.productPrice
							break;
						case 1:
							mapi.quantity--
							this.data.totalNum--
							this.data.totalPrice -= mapi.productPrice
							break;
						case 2:
							mapi.quantity = 0
							this.data.totalNum -= mapi.quantity
							this.data.totalPrice -= mapi.productPrice * mapi.quantity
							break;
						default:
					}
				}
			})
		}
		// 因为上面的克隆，map改变的是 克隆出来的let YouCeLan_list,不会直接改变data的YouCeLan_list,所以需要重新渲染到页面
		e2 = YouCeLan_list;
		this.setData({
			YouCeLan_list: YouCeLan_list,
			totalNum: this.data.totalNum, //因为上面只改变了值，没有渲染到页面，需要重新渲染
			totalPrice: this.data.totalPrice
		})
	},
	// 加减菜单
	Subtract(e) {
		this.SetGouWuCheShuLiang(1, e, this.data.YouCeLan_list)
	},
	getAdd(e) {
		this.SetGouWuCheShuLiang(0, e, this.data.YouCeLan_list)
	},
	// 点击数字，输入框出现对应数字
	getDinnerNUM: function(e) {
		var dinnerNum = e.currentTarget.dataset.num;
		var diner_num = this.data.diner_num;
		// 点击“输”，获取焦点，
		if (dinnerNum == 0) {
			this.setData({
				diner_numF: true,
				diner_num: 0
			})
			// this.getDinerNum();

		} else {
			this.setData({
				diner_num: dinnerNum
			});
		}
	},
	// 获取输入的用餐人数
	getDinerNum: function(e) {
		var diner_num = this.data.diner_num;
		this.setData({
			diner_num: diner_num
		})
	},
	// 获取备注信息
	getRemark: function(e) {
		var remarks = this.data.remarks;
		this.setData({
			remarks: e.detail.value
		})
	},
	getCode: function(e) {
		// 获取用户信息 (参考 https://blog.csdn.net/guochanof/article/details/80189935)
		wx.login({
			success(res) {
				var code = res.code; // 登录凭证
				if (code) {
					wx.setStorageSync('code', code)
				}
			},
			fail: function() {
				console.log('登录失败')
			}
		})
		// 获取手机型号
		wx.getSystemInfo({
			success: (result) => {
				wx.setStorageSync('body', result.model)
			}
		})
	},
	getDetails: function(e) {
		var that = this;
		var tableNum = this.data.zhNum;
		var arr = wx.getStorageSync('cart') || [];
		var goods_arr = [];
		arr.forEach(order => {
			console.log(order);
			var goods = new Object();
			goods.productId = order.id;
			goods.productQuantity = order.quantity;
			goods_arr.push(goods)
		})
		var goods_josn = JSON.stringify(goods_arr);
		// console.log(goods_josn)
	//	var diner_num = this.data.diner_num; //用餐人数
		// var dinerNum;
		// var remarks = this.data.remarks; //备注信息
		// var payId = e.currentTarget.dataset.id;
		// var rd_session = wx.getStorageSync('rd_session') || [];
		if (diner_num == 0) {
			that.setData({
				diner_num: 1
			})
		}
		var peoples = this.data.diner_num
		// console.log("用餐人数：" + peoples)
		// console.log("备注：" + remarks)
		// console.log("桌号：" + tableNum)
		// 统计订单
		let YouCeLan_list = GG.deepClone(this.data.YouCeLan_list) //深度克隆防止下面改变data里面的值
		let items = []
		for (let key in YouCeLan_list) {
			YouCeLan_list[key].map((mapi) => {
				if (mapi.quantity > 0) {
					items.push(mapi)
				}
			})
		}
		wx.setStorageSync('items', items)
	},
	// 支付
	goPay: function(e) {
		this.getCode();
		this.getDetails();
		// 获取code
		var code = wx.getStorageSync('code');
		var that = this;
		// 价格并转为String
		var lmoney = [];
		var money = [];
		var fee = [];
		var totalFee = []
		lmoney = that.data.totalPrice;
		money = lmoney.toString()
		fee = that.data.totalPrice * 100; // 以分为单位所以乘以百
		totalFee = fee.toString();
		// 桌号
		// var theTable = this.data.zhNum
		var remarks = that.data.remarks;
		if (remarks == "") {
			remarks = "无备注信息"
		}
		// 手机型号
		var body = wx.getStorageSync('body');
		var list = [];
		var new_data = [];
		list = wx.getStorageSync('items');
		for (var i = 0; i < list.length; i++) {
			if (list[i]['quantity'] != 0) {
				new_data[i] = list[i];
				console.log(list[i])
			}
		}
		GG.http_GetPOst("/order/weChatPay", "POST", {
			"code": code,
			"money": money,
			"body": body,
			"total_fee": totalFee,
			"remarks": remarks,
			"theTable": 1,
			"data": JSON.stringify(new_data)
		}).then(res => {
			var pay = res.data;
			var orderId = pay.orderId
			wx.requestPayment({
				nonceStr: pay.nonceStr,
				package: pay.package,
				paySign: pay.paySign,
				timeStamp: pay.timeStamp,
				signType: pay.signType,
				success(res) {
					wx.showToast({
						title: '支付成功',
						icon: 'success'
					})
					console.log(res.errMsg)
				},
				// fail(err) {
				// 	wx.showToast({
				// 		title: '取消支付',
				// 		icon:'search'
				// 	 })
				// 	 console.log(err.errMsg)
				// }
			})
		})
	},
	hideModal:function(){
		this.setData({
			modalName:''
		})
	},
	DiBuModal:function(){
		this.setData({
			modalName:'bottomModal'
		})
	},
	DiBuModalBindtap:function(e){
		this.setData({
			ShouHuoDiZhiListIndex:e.currentTarget.dataset.index,
			SongDaDiZhi:e.currentTarget.dataset.item.ShouHuoDiZhi+' '+e.currentTarget.dataset.item.XiangXiDiZhi,
			ShouJiHao:e.currentTarget.dataset.item.ShouJiHao,
			modalName:''
		})
	},
	DiBuModalCatchtap:function(e){
		console.log(this.data.ShouHuoDiZhiList)
		this.data.ShouHuoDiZhiList.splice(e.currentTarget.dataset.index,1); 
		app.globalData.ShouHuoDiZhiList=this.data.ShouHuoDiZhiList
		this.setData({
			ShouHuoDiZhiList:this.data.ShouHuoDiZhiList
		})
		const FileSystemManager = wx.getFileSystemManager()
		FileSystemManager.writeFile({
			filePath: wx.env.USER_DATA_PATH+'/ShouHuoDiZhiList.json',
			encoding: 'utf8',
			data: JSON.stringify(this.data.ShouHuoDiZhiList),
			success: (res) => {
				console.log('保存本地成功', res)
			},
			fail: (err) => {
				console.log('保存本地失败', err)
			}
		})
	}
})
// 用不到的代码
//支付方式列表
// payWayList: [{
// 	"id": 1,
// 	"package": "微信支付",
// 	"money": 100
// }],
//打开支付方式弹窗
// choosePayWay: function() {
// 	var payWayList = this.data.payWayList
// 	var that = this;
// 	var rd_session = wx.getStorageSync('rd_session') || [];

// 	// 支付方式打开动画
// 	var animation = wx.createAnimation({
// 		duration: 200,
// 		timingFunction: 'ease-in-out',
// 		delay: 0
// 	});
// 	that.animation = animation;
// 	animation.translate(0, -285).step();
// 	that.setData({
// 		animationData: that.animation.export(),
// 	});
// 	that.setData({
// 		maskFlag: false,
// 	});
// 	//提交订单
// 	if(app.globalData.openid){
// 		var openid=app.globalData.openid
// 	}else{
// 		var openid=''
// 	}
// 	if(app.globalData.nickName){
// 		var nickName=app.globalData.userInfo.nickName
// 	}else{
// 		var nickName=''
// 	}
// },
// // 支付方式关闭方法
// closePayWay: function() {
// 	var that = this
// 	// 支付方式关闭动画
// 	that.animation.translate(0, 285).step();
// 	that.setData({
// 		animationData: that.animation.export()
// 	});
// 	that.setData({
// 		maskFlag: true
// 	});
// },

// 测试支付接口代码
// wx.request({ 
// 	url: 'http://192.168.128.101:8080/order/weChatPay?',
// 	method: 'POST',
// 	data:{
// 		    "code":code,
// 		    "money":"100",
// 		    "body":"手机",
// 		    "total_fee":"1000",
// 		    "data":[
// 		    {
// 		        "productId":"1001",
// 		        "productName":"东坡肉",
// 		        "num":"2",
// 		        "productPrice":"200"
// 		    },
// 		    {
// 		        "productId":"1003",
// 		        "productName":"梅菜扣肉",
// 		        "num":"2",
// 		        "productPrice":"200"
// 		    }
// 		]
// 		},
// 	success(res) {
// 		var pay = res.data
// 		var nonceStr = pay.nonceStr;
// 		var package = pay.package;
// 		var paySign = pay.paySign;
// 		var signType = pay.signType;
// 		var timeStamp = pay.timeStamp;
// 		wx.requestPayment({
// 		  nonceStr: nonceStr,
// 		  package: package,
// 		  paySign: paySign,
// 		  timeStamp: timeStamp,
// 		  signType:signType,
// 		  success: (res) => {
// 			console.log(res.errMsg)
// 		  },
// 		  fail: (err) => {
// 			console.log(err.errMsg)
// 		  }
// 		})
// 	}
// })
//    GG.http_GetPOst("/hello","GET",{
// 		orderId:orderId
//    }).then(res => {
// 		console.log('ok')	
//    })
