    //JS
    const app = getApp()
    const GG = require('../../public/public')
    let orderStatus = 1; //0"新订单，未支付;1"新订单，已支付";2, "已取消"；3"待评价"；4“已完成”
    Page({
        // 下拉刷新
        onPullDownRefresh () {
            wx.showNavigationBarLoading()
            this.getData()
            setTimeout(function(){
                wx.hideNavigationBarLoading()
                wx.stopPullDownRefresh()
            },1500)
        },
        data: {
            // isShowComment: false, //是否显示评论框
            orderList: [],
            storeName: [],
            // code:[]
        },
    onLoad: function(Options) {
        // var code = wx.getStorageSync('code')
        // this.setData({
        //     code:code
        // })
        // this.getData();
    },
    getData:function() {
        wx.login({
            success(res) {
                wx.setStorageSync('code', res.code)
            }
        })
        var code = wx.getStorageSync('code')
        GG.http_GetPOst("/getListByOpenid","POST",{
            code:code
        }).then(res => {
            var that = this;
            var orderList = res.data.data;
            that.setData ({
                orderList:orderList
            })
        })
        var storeName = wx.getStorageSync('storeName')
        this.setData({
            storeName:storeName
        })
    },
    onShow: function() {
        this.getData()
        // this.getMyOrderList();
    }
})





// 垃圾代码
    // getMyOrderList() {
    //     let that = this;
    //     let openid = app._checkOpenid();
    //     if (!openid) {
    //         return;
    //     }
    // //请求自己后台获取用户openid
    //     wx.request({
    //         url: app.globalData.baseUrl + '/buyer/order/listByStatus',
    //         data: {
    //             openid: openid,
    //             orderStatus: orderStatus
    //     },
    //     success: function(res) {
    //         console.log(res);
    //         if (res && res.data && res.data.data && res.data.data.length > 0) {
    //             let dataList = res.data.data;
    //             console.log(dataList)
    //         that.setData({
    //             list: dataList
    //         })
    //         } else {
    //             that.setData({
    //                 list: []
    //                 })
    //             }
    //         }
    //     })
    // },
    // //弹起评论框
    // goComment(event) {
    //     let orderId = event.currentTarget.dataset.orderid;
    //     this.setData({
    //         isShowComment: true,
    //         orderId: orderId
    //     })
    // },
    // //隐藏评论框
    // cancelComment() {
    //     this.setData({
    //         isShowComment: false
    //     })
    // },
    // //获取评论内容
    // setValue(input) {
    //     this.setData({
    //         comment: input.detail.value
    //     })
    // },
    // //提交评论
    // submitComment() {
    //     let that = this;
    //     that.cancelComment();
    //     let content = that.data.comment;
    //     let orderId = that.data.orderId;
    // if (!content) {
    // wx.showToast({
    //     title: '评论内容为空',
    // })
    //     return;
    // }
    //     let openid = app._checkOpenid();
    // if (!openid) {
    //     return;
    // }

    // wx.request({
    //     url: app.globalData.baseUrl + '/comment',
    //     method: "POST",
    //     header: {
    //         "Content-Type": "application/x-www-form-urlencoded"
    //     },
    //     data: {
    //         orderId: orderId,
    //         openid: openid,
    //         name: app.globalData.userInfo.nickName,
    //         avatarUrl: app.globalData.userInfo.avatarUrl,
    //         content: content
    //     },
    //     success: function(res) {
    //         that.getMyOrderList();
    //         wx.showToast({
    //         title: '评论成功',
    //         })
    //     }
    // })
    // },

    // //催单
    // clickSure(event) {
    // let that = this;
    // let orderId = event.currentTarget.dataset.orderid;
    // wx.showToast({
    // title: '催单成功',
    // })
    // },
    // clickGoPay(event) {
    // let that = this;
    // let orderId = event.currentTarget.dataset.orderid;
    // wx.showModal({
    // title: '模拟支付',
    // content: '确定去支付吗？',
    // success(res) {
    //     if (res.confirm) {
    //     that.goPay(orderId)
    //     } else if (res.cancel) {
    //     console.log('用户点击取消')
    //     }
    // }
    // })
    // },
    // //去支付
    // goPay(orderId) {
    // let that = this;
    // let openid = app._checkOpenid();
    // if (!openid) {
    // return;
    // }

    // //请求自己后台获取用户openid
    // wx.request({
    //     url: app.globalData.baseUrl + '/pay/goPay',
    //     data: {
    //         orderId: orderId
    //     },
    //     success: function(res) {
    //         console.log(res);
    //         if (res && res.data && res.data.data) {
    //         let dataList = res.data.data;
    //         that.getMyOrderList();
    //         wx.showToast({
    //             title: '支付成功',
    //             })
    //         } else {
    //         wx.showToast({
    //             title: '支付失败',
    //             })
    //         }
    //     }
    // })
    // },
    // //取消订单
    // cancleOrder(event) {
    //     let that = this;
    //     let openid = app._checkOpenid();
    //     if (!openid) {
    //     return;
    //     }

    //     let orderId = event.currentTarget.dataset.orderid;
    //     wx.request({
    //         url: app.globalData.baseUrl + '/buyer/order/cancel',
    //         method: "POST",
    //         header: {
    //             "Content-Type": "application/x-www-form-urlencoded"
    //         },
    //         data: {
    //             openid: "" + openid,
    //             orderId: orderId
    //         },
    //         success: function(res) {
    //             console.log({
    //             res
    //             });
    //             that.getMyOrderList();
    //         }
    //     })
    // }
    // })
    