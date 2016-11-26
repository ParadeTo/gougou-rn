# 项目说明
项目基于[慕课网－react native贯穿全栈开发app](http://www.imooc.com/)
## client
客户端项目，mac环境下开发，ios版本
## server
服务器项目，基于nodejs、koa、mongodb开发

# 项目启动
## client
* 搭建mac下react native开发环境，[官方文档](http://facebook.github.io/react-native/docs/getting-started.html#content)
* ``npm install``，也可使用[淘宝镜像](http://npm.taobao.org/)
* ``npm -g install rnpm`` ``rnpm link react-native-image-picker`` ``rnpm link react-native-audio``
* 由于使用了react-native-progress，需要手动添加libraries到工程，步骤如下
  1. xcode打开ios下的project
  2. 右键工程下的Libraries，选择add files to， 加入 node_modules/react-native/libraries/ART/ART.xcodeproj
  3. 单击项目，选择build phases->link binary with libraries 点击＋号 将libART.a 添加进去
* ``react-native run-ios``

## server
* 安装mongodb并启动
* ``node app``

# demo
## 视频
### 视频列表
视频列表暂时使用阿里的rap接口假数据，包括的功能：
* 下拉更新
* 上拉加载更多
* 点赞
* 点击视频进入详情

![](https://github.com/ParadeTo/gougou-rn/blob/master/img/list/list.png)

### 视频详情

* 播放视频
* 点击评论框进入评论
* 评论列表

![](https://github.com/ParadeTo/gougou-rn/blob/master/img/list/detail.png)

### 评论
![](https://github.com/ParadeTo/gougou-rn/blob/master/img/list/comment.png)

## 创作
创作目前没有做完，大概的思路如下：
* 视频上传到七牛，利用七牛api生成静音视频，同步到服务器并上传到cloudinary
* 音频上传到cloudinary
* 利用cloudinary的api将视频和音频进行合并

![](https://github.com/ParadeTo/gougou-rn/blob/master/img/creation/edit-1.gif)
![](https://github.com/ParadeTo/gougou-rn/blob/master/img/creation/edit-2.gif)

## 我

### 首页
![](https://github.com/ParadeTo/gougou-rn/blob/master/img/account/index.png)

### 注册
![](https://github.com/ParadeTo/gougou-rn/blob/master/img/account/register.png)

### 修改资料
![](https://github.com/ParadeTo/gougou-rn/blob/master/img/account/edit.png)
