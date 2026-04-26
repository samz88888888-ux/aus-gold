当前项目是一个react项目 我在当前项目分目录复制了一个旧项目vue代码
我现在需要实现的功能是 从old-project的旧页面复制大概10个页面过来 直接尽量完整复制过来样式包括图片资源这些
尽量保持页面的还原程度 一些数据通过接口请求 如果没有可以通过mock生成静态页面
old-project这里面有一些底部弹窗组件 先看当前项目是否有支付或者类似的 没有的话也可以复制过来

复制到当前工作目录可以在侧边菜单栏新增对应的菜单 这样我们点击即可进入查看检查了
因为现在服务端还没有请求接口 所以我们复制过来构建静态页面即可 等后续接口完善再来请求API接口
需要复制的页面有 分别对应url path
算力页面:
    /#/ming
    /#/mingLog=>该页面左上角有一个搜索
    /#/destoryList 我的矿机页面
商城页面:
    #/shop banner URL=>https://file.naaidepin.com/upload/images/c6135c4990ab6e4f1506d78c4eaa0ed8.png
    我的订单 /#/shop/orderList?group_id=1
    待释放记录 /#/shop/orderRelease?group_id=1
    商品详情页 /#/shop/detail/16=>这里有判定是否购买过 未购买过需要弹窗协议展示 复制过来都是静态默认点击展示协议
    下单页面 /#/shop/orderConfirm 也是需要是否发货
    待支付订单 #/orders

邀请页面
    /#/user

