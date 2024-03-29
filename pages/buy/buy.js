const app = getApp();
const GG = require('../../public/public.js')

var sliderWidth = 190 // 需要设置slider的宽度，用于计算中间位置
// 最大行数
var max_row_height = 5;
// 行高
var food_row_height = 50;
// 底部栏偏移量
var cart_offset = 90;
//所有商品列表
let categories = []
//桌号
let tableNum = 1;
Page({
	data: {
	//	storeName: ["幸运手作"],
		tabs: ["今日菜单"],
		activeIndex: 0,
		sliderOffset: 0,
		sliderLeft: 0,
		sliderWidth: 0.5,
		// 左右两侧菜单的初始显示次序
		curNav: 0,
		// 右菜单
		menu_list: [],
		// 左菜单
		foodList: [], //展示菜品
		// 购物车
		cartList: [],
		hasList: false, // 列表是否有数据
		totalPrice: 0, // 总价，初始为0
		totalNum: 0, //总数，初始为0
		// 购物车动画
		animationData: {},
		animationMask: {},
		maskVisual: "hidden",
		maskFlag: true,
		number: [], //桌号
		// 加料
		checkIndex:null,
		toglAdd: true,
		checkInd:null,
		addList: [
			{index:0,name:'不加糖'},
			{index:1,name:'全糖'},
			{index:2,name:'七分糖'},
			{index:3,name:'五分糖'},
			{index:4,name:'三分糖'},
		],
		temperaList: [
			{ind:0,name:"热的"},
			{ind:1,name:"冰的"},
			{ind:2,name:"常温"}
		],
		_inx:null,
		addFood:[]
	},
	// 生命周期
	onLoad: function(options) {
		if(options.scene) {
			let num = decodeURIComponent(options.scene)
			this.setData ({
				number:num
			})
		}
		// 上传桌号
		wx.setStorageSync('zhuohao', this.data.number)
		// 存储店名
		GG.http_GetPOst("/loginGetSession","POST").then(res=> {
			console.log(res)
		})
		wx.setStorageSync('storeName', this.data.storeName)
		// 获取加料数据
		// GG.http_GetPOst("/productTypeList","POST").then(res => {
		// 	this.setData({
		// 		addList:res.data.data
		// 	})
		// })
		// 加载异步方法
		this.onLoadTongBu(options);
		return;
	},
	// 打开加料弹窗
	toggleAdd: function(e) {
		var that = this;
		var tAdd = that.data.toglAdd;
		if(tAdd == true) {
			that.setData ({
				toglAdd: false
			})
		}
	},
	// 关闭加料弹窗
	shutAdd: function(e) {
		var that = this;
		var sAdd = that.data.toglAdd;
		if(sAdd == false) {
			that.setData ({
				toglAdd: true
			})
		}
	},
	// 选择甜度
	checkedFood: function(e) {
		let i = e.currentTarget.dataset.index;
		var value = e.currentTarget.dataset.value;
		wx.setStorageSync('value', value)
		this.setData ({
			checkIndex: i
		})
	},
	// 选择温度
	inTempera: function(e) {
		var val = e.currentTarget.dataset.val;
		wx.setStorageSync('val', val)
		let checkInd = e.currentTarget.dataset.ind;
		this.setData ({
			checkInd:checkInd
		})
	},
	// 添加小料
	// foodsChe: function(e) {
	// 	console.log(e)
	// 	var values = e.currentTarget.dataset.values;
	// 	var productPrice = e.currentTarget.dataset.prices;
	// 	wx.setStorage({
	// 	  data: {
	// 		productName: values,
	// 		productPrice: productPrice
	// 	  },
	// 	  key: '',
	// 	})
	// 	wx.setStorageSync('values', values)
	// 	let _inx = e.currentTarget.dataset.inx;
	// 	this.setData ({
	// 		_inx:_inx
	// 	})
	// },
	// 确认
	foodBtn: function(e) {
		var that = this;
		var pepper = wx.getStorageSync('value')
		var garnishFood = wx.getStorageSync('val')
		that.setData({
			addFood:pepper+','+garnishFood
		})
		// 关闭加料弹窗
		var sAdd = that.data.toglAdd;
		if(sAdd == false) {
			that.setData ({
				toglAdd: true,
				checkIndex: null,
				checkInd: null,
				_inx: null
			})
		}
	},
	// 重置
	Replace: function(e) {
		var checkIndex = this.data.checkIndex;
		var _inx = this.data._inx;
		if(checkIndex != null || checkInd != null || _inx != null){
			this.setData({
				checkIndex: null,
				_inx: null,
				checkInd:null
			})
		}
	},
 	// onLoad异步执行同步方法
	async onLoadTongBu(options) {
		// 获取购物车缓存数据
		var arr = wx.getStorageSync('cart') || [];
		// 左分类菜单
		var menu_list = this.data.menu_list;

		// 右菜品菜单
		var foodList = this.data.foodList;


		// 获取左侧分类菜单数据
		categories = []
		// 获取右侧菜品列表数据
		var resFood = []
		try {
			let ret = await GG.http_GetPOst("/categoryList", 'POST');
			let dataList = ret.data.data;
			this.setData({
				menu_list: dataList
			})
		
			if (dataList[0].categoryType) {
				this.HuoQuCaiPin(0, dataList[0].categoryType)
			}
			// if (dataList[0].categoryId) {
			// 	this.HuoQuCaiPin(0, dataList[0].categoryId)
			// }
		} catch (e) {
			this.setData({
				list: []
			})
			wx.showLoading({
				title: '数据为空',
			})
		}
		wx.getSystemInfo({
			success: (res) => {
				this.setData({
					sliderLeft: (res.windowWidth / this.data.tabs.length - res.windowWidth / 2) / 2,
					sliderOffset: res.windowWidth / this.data.tabs.length * this.data.activeIndex,
				});
			}
		});
	},


	// 点击切换顶部tab
	tabClick: function(e) {
		this.setData({
			sliderOffset: e.currentTarget.offsetLeft,
			activeIndex: e.currentTarget.id
		});
	},

	// categoryId修改为categoryType
	// 点击切换右侧数据
	changeRightMenu: function(e) {
		var categoryId = e.target.dataset.item.categoryType; // 获取点击项的id
		var index = e.target.dataset.index;

		this.HuoQuCaiPin(index, categoryId)
	},
	
	// 获取菜品
	HuoQuCaiPin: function(index, categoryId) {
		// 判断是否已经存在
		let on=false
		for (let key in this.data.YouCeLan_list) {
			if (key==categoryId) {
				on=true
				break
			}
		}
		if (on) {
			this.setData({
				// 右侧菜单当前显示第curNav项
				curNav: index,
				categoryId: categoryId
			})
			return
		}
		
		GG.http_GetPOst("/queryProductBycategory", 'POST', {
			categoryType: categoryId
		}).then((ret) => {
			ret.data.data.map((mapi) => {
				mapi.quantity = 0
			})
			this.setData({
				// 右侧菜单当前显示第curNav项
				curNav: index,
				categoryId: categoryId,
				["YouCeLan_list." + categoryId]: ret.data.data
			})
		})
	},
	

	// 购物车增加数量
	addCount: function(e) {
		this.SetGouWuCheShuLiang(0, e,this.data.YouCeLan_list)
		return

		var id = e.currentTarget.dataset.id;
		var arr = wx.getStorageSync('cart') || [];
		var f = false;
		for (var i in this.data.foodList) { // 遍历菜单找到被点击的菜品，数量加1
			if (this.data.foodList[i].id == id) {
				this.data.foodList[i].quantity += 1;
				if (arr.length > 0) {
					for (var j in arr) { // 遍历购物车找到被点击的菜品，数量加1
						if (arr[j].id == id) {
							arr[j].quantity += 1;
							f = true;
							try {
								wx.setStorageSync('cart', arr)
							} catch (e) {
								console.log(e)
							}
							break;
						}
					}
					if (!f) {
						arr.push(this.data.foodList[i]);
					}
				} else {
					arr.push(this.data.foodList[i]);
				}
				try {
					wx.setStorageSync('cart', arr)
				} catch (e) {
					console.log(e)
				}
				break;
			}
		}

		this.setData({
			cartList: arr,
			foodList: this.data.foodList
		})
		this.getTotalPrice();
	},
	// 定义根据id删除数组的方法
	removeByValue: function(array, val) {
		for (var i = 0; i < array.length; i++) {
			if (array[i].id == val) {
				array.splice(i, 1);
				break;
			}
		}
	},

	SetGouWuCheShuLiang: function(bool, e,e2) {
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
		e2=YouCeLan_list;
		this.setData({
			YouCeLan_list: e2,
			totalNum: this.data.totalNum, //因为上面只改变了值，没有渲染到页面，需要重新渲染
			totalPrice: this.data.totalPrice
		})
	},


	// 购物车减少数量
	minusCount: function(e) {
		this.SetGouWuCheShuLiang(1, e,this.data.YouCeLan_list)
		return

		var id = e.currentTarget.dataset.id;
		var arr = wx.getStorageSync('cart') || [];
		for (var i in this.data.foodList) {
			if (this.data.foodList[i].id == id) {
				this.data.foodList[i].quantity -= 1;
				if (this.data.foodList[i].quantity <= 0) {
					this.data.foodList[i].quantity = 0;
				}
				if (arr.length > 0) {
					for (var j in arr) {
						if (arr[j].id == id) {
							arr[j].quantity -= 1;
							if (arr[j].quantity <= 0) {
								this.removeByValue(arr, id)
							}
							if (arr.length <= 0) {
								this.setData({
									foodList: this.data.foodList,
									cartList: [],
									totalNum: 0,
									totalPrice: 0,
								})
								this.cascadeDismiss()
							}
							try {
								wx.setStorageSync('cart', arr)
							} catch (e) {
								console.log(e)
							}
						}
					}
				}
			}
		}
		this.setData({
			cartList: arr,
			foodList: this.data.foodList
		})
		this.getTotalPrice();
	},
	// 获取购物车总价、总数
	getTotalPrice: function() {
		var cartList = this.data.cartList; // 获取购物车列表
		var totalP = 0;
		var totalN = 0
		for (var i in cartList) { // 循环列表得到每个数据
			totalP += cartList[i].quantity * cartList[i].price; // 所有价格加起来     
			totalN += cartList[i].quantity
		}
		this.setData({ // 最后赋值到data中渲染到页面
			cartList: cartList,
			totalNum: totalN,
			totalPrice: totalP.toFixed(2)
		});
	},
	// 打开购物车方法
	cascadePopup: function() {
		var that = this;
		// 购物车打开动画
		var animation = wx.createAnimation({
			duration: 200,
			timingFunction: 'ease-in-out',
			delay: 0
		});
		that.animation = animation;
		animation.translate(0, -285).step();
		that.setData({
			animationData: that.animation.export(),
		});
		// 遮罩渐变动画
		var animationMask = wx.createAnimation({
			duration: 200,
			timingFunction: 'linear',
		});
		that.animationMask = animationMask;
		animationMask.opacity(0.8).step();
		that.setData({
			animationMask: that.animationMask.export(),
			maskVisual: "show",
			maskFlag: false,
		});
	},
	// 关闭购物车方法
	cascadeDismiss: function() {
		var that = this
		// 购物车关闭动画
		that.animation.translate(0, 285).step();
		that.setData({
			animationData: that.animation.export()
		});
		// 遮罩渐变动画
		that.animationMask.opacity(0).step();
		that.setData({
			animationMask: that.animationMask.export(),
		});
		// 隐藏遮罩层
		that.setData({
			maskVisual: "hidden",
			maskFlag: true
		});
	},
	// 清空购物车
	cleanList: function(e) {
		this.SetGouWuCheShuLiang(3, e,this.data.YouCeLan_list)
		for (var i in this.data.foodList) {
			this.data.foodList[i].quantity = 0;
		}
		try {
			wx.setStorageSync('cart', "")
		} catch (e) {
			console.log(e)
		}
		this.setData({
			foodList: this.data.foodList,
			cartList: [],
			cartFlag: false,
			totalNum: 0,
			totalPrice: 0,
		})
		return

		this.cascadeDismiss()
	},
	//删除购物车单项
	deleteOne: function(e) {
		this.SetGouWuCheShuLiang(2, e,this.data.YouCeLan_list)
		return
		var id = e.currentTarget.dataset.id;
		var index = e.currentTarget.dataset.index;
		var arr = wx.getStorageSync('cart')
		for (var i in this.data.foodList) {
			if (this.data.foodList[i].id == id) {
				this.data.foodList[i].quantity = 0;
			}
		}
		arr.splice(index, 1);
		if (arr.length <= 0) {
			this.setData({
				foodList: this.data.foodList,
				cartList: [],
				cartFlag: false,
				totalNum: 0,
				totalPrice: 0,
			})
			this.cascadeDismiss()
		}
		try {
			wx.setStorageSync('cart', arr)
		} catch (e) {
			console.log(e)
		}


		this.setData({
			cartList: arr,
			foodList: this.data.foodList
		})
		this.getTotalPrice()
	},
	//切换购物车开与关
	cascadeToggle: function() {
		var that = this;
		var arr = this.data.cartList
		if (that.data.maskVisual == "hidden") {
			that.cascadePopup()
		} else {
			that.cascadeDismiss()
		}

	},
	// 跳转确认订单页面
	gotoOrder: function() {
		// 购物车为空
		// var arr = wx.getStorageSync('cart') || [];
		// console.log("arr", arr)
		if (!this.data.totalNum) {
			wx.showModal({
				title: '提示',
				content: '请选择菜品',
				showCancel: false
			})
			return;
		}

		wx.navigateTo({
			url: '../confirmOrder/confirmOrder',
			events: {},
			success: (res) => {
				//  通过eventChannel向被打开页面传送数据
				res.eventChannel.emit('setConfirmOrder', {
					totalNum: this.data.totalNum,
					totalPrice: this.data.totalPrice,
					YouCeLan_list: this.data.YouCeLan_list,
					Remarks: this.data.addFood
				})
			}
		})
	},
	GetQueryString: function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) return unescape(r[2]);
		return null;
	}
})

// 垃圾代码

		// 购物车总量、总价
		// var totalPrice = this.data.totalPrice
		// var totalNum = this.data.totalNum
		// console.log("存储购物车", arr)
		// // 进入页面后判断购物车是否有数据，如果有，将菜单与购物车quantity数据统一
		// if (arr.length > 0) {
		// 	for (var i in arr) {
		// 		for (var j in resFood) {
		// 			if (resFood[j].id == arr[i].id) {
		// 				resFood[j].quantity = arr[i].quantity;
		// 			}
		// 		}
		// 	}
		// 	// 进入页面计算购物车总价、总数
		// 	for (var i in arr) {
		// 		totalPrice += arr[i].price * arr[i].quantity;
		// 		totalNum += Number(arr[i].quantity);
		// 	}
		// }

		// 赋值数据
		// this.setData({
		// 	hasList: true,
		// 	cartList: arr,
		// 	// payFlag: this.data.payFlag,
		// 	// totalPrice: totalPrice.toFixed(2),
		// 	// totalNum: totalNum
		// })
		// let userInfo = app.globalData.userInfo;
		// if (!userInfo || !userInfo.nickName) {
		// 	wx.showModal({
		// 		title: '请登录',
		// 		content: '请到个人中心登录',
		// 		showCancel: false, //去掉取消按钮
		// 		success: function(res) {
		// 			if (res.confirm) {
		// 				wx.switchTab({
		// 					url: '../me/me',
		// 				})
		// 			}
		// 		}
		// 	})
		// 	return;
		// }
