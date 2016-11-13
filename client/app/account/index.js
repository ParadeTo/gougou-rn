import React, { Component } from 'react';
var Icon = require('react-native-vector-icons/Ionicons');
import ImagePickerManager from 'react-native-image-picker' // 需要rnpm link
import sha1 from 'sha1'
import * as Progress from 'react-native-progress' // 需要手动添加libraries

import request from '../common/request'
import config from '../common/config'

import {
  StyleSheet,
  Text,
  Dimensions,
  AsyncStorage,
  Image,
  AlertIOS,
  TouchableOpacity,
  View
} from 'react-native';

var width = Dimensions.get('window').width

// 选取图片的参数
var photoOptions = {
  title: '选择头像',
  cancelButtonTitle: '取消',
  takePhotoButtonTitle:'拍照',
  chooseFromLibraryButtonTitle:'选择相册',
  quality:0.8,
  allowsEditing:true,
  noData:false, // 设置成false，图片转成base
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

// CLOUDINARY
var CLOUDINARY = {
  'cloud_name': 'dis869jhd',
  'api_key': '541635888437885',
  'api_secret': 'g6rM2H_GFBiL1-IRpX82NyD8uc8',
  'base':	'http://res.cloudinary.com/dis869jhd ',
  'image': 'https://api.cloudinary.com/v1_1/dis869jhd/image/upload',
  'video':	 'https://api.cloudinary.com/v1_1/dis869jhd/video/upload',
  'audio':	 'https://api.cloudinary.com/v1_1/dis869jhd/raw/upload'
}

function avatar(id,type) {
  if (id.indexOf('http') > -1) {
    return id
  }
  if (id.indexOf('data:image') > -1) {
    return id
  }
  return CLOUDINARY.base + '/' + type + '/upload/' + id
}

var Account = React.createClass({
  getInitialState () {
    var user = this.props.user || {}
    return {
      user:user,
      avatarProgress:0,
      avatarUploading:false
    }
  },

  // 选取图片
  _pickPhoto() {
    var that = this
    // ios10 需要在info.plist中增加NSPhotoLibraryUsageDescription和NSCameraUsageDescription
    ImagePickerManager.showImagePicker(photoOptions, (res) => {
      if (res.didCancel) {
        return
      }
      var avatarData = 'data:image/jpeg;base64,' + res.data
      // var user = that.state.user
      // user.avatar = avatarData
      // that.setState({
      //   user:user
      // })

      // 上传图片
      var timestamp = Date.now()
      var tags = 'app,avatar'
      var folder = 'avatar'
      var signatureURL = config.api.base + config.api.signature
      var accessToken = this.state.user.accessToken
      // 模拟后台生成签名值
      request.post(signatureURL,{
        accessToken:accessToken,
        timestamp: timestamp,
        type: 'avatar'
      })
      .then(data => {
        if (data && data.success) {
          //data.data
          var signature = 'folder=' + folder + '&tags=' + tags +'&timestamp=' + timestamp + CLOUDINARY.api_secret
          // 这个签名应该是后端生成的
          signature = sha1(signature)

          var body = new FormData()
          body.append('folder',folder)
          body.append('signature',signature)
          body.append('tags',tags)
          body.append('api_key',CLOUDINARY.api_key)
          body.append('resource_type','image')
          body.append('file',avatarData)
          body.append('timestamp',timestamp)
          that._upload(body)
        }
      })
      .catch(e => {
        console.log(e)
      })
    })
  },

  // 上传图片到cloudinary
  _upload(body) {
    var that = this
    var xhr = new XMLHttpRequest()
    var url = CLOUDINARY.image

    that.setState({
      avatarUploading:true
    })

    xhr.open('POST',url)
    xhr.onload = () => {
      // 请求失败
      if (xhr.status !== 200) {
        AlertIOS.alert('上传失败，请重试')
        console.log(xhr.responseText)
        return
      }

      if (!xhr.responseText) {
        AlertIOS.alert('上传失败，请重试')
        return
      }

      var response
      try {
        response = JSON.parse(xhr.response)
      } catch (e) {
        console.log(e)
        console.log("parse fails")
      }

      if (response && response.public_id) {
        var user = this.state.user
        console.log(response)
        user.avatar = response.public_id
        that.setState({
          user: user, // 这个貌似可以去掉
          avatarProgress: 0,
          avatarUploading: false
        })
        // 上传到服务器
        that._asyncUser(true)
      }
    }

    // 进度条
    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          var percent = Number((event.loaded / event.total).toFixed(2))
          console.log(percent)
          that.setState({
            avatarProgress: percent
          })
        }
      }
    }

    xhr.send(body)
  },

  // 同步缓存
  _asyncUser(isAvatar) {
    var that = this
    var user = this.state.user

    if (user && user.accessToken) {
      var url = config.api.base + config.api.update

      request.post(url,user)
        .then(data=>{
          if (data && data.success) {
            var user = data.data
            if (isAvatar) {
              AlertIOS.alert('头像更新成功')
            }
            that.setState({
              user:user
            },function() {
              AsyncStorage.setItem('user',JSON.stringify(user))
            })
          }
        })
    }
  },

  componentDidMount() {
    var that = this
    AsyncStorage.getItem('user')
      .then((data) => {
        var user
        if (data) {
          user = JSON.parse(data)
        }
        if (user && user.accessToken) {
          that.setState({
            user:user
          })
        }
      })
  },

  render () {
    var user = this.state.user
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>我的账户</Text>
          <Text style={styles.toolbarEdit}>编辑</Text>
        </View>
        {
          user.avatar
          ?
          <TouchableOpacity onPress={this._pickPhoto}>
            <Image source={{uri: avatar(user.avatar,'image')}} style={styles.avatarContainer}>
              <View style={styles.avatarBox}>
                {
                  this.state.avatarUploading ?
                  <Progress.Circle
                    showsText={true}
                    color={'#ee735c'}
                    size={75}
                    progress={this.state.avatarProgress} />
                    :
                  <Image
                    source={{uri:avatar(user.avatar,'image')}}
                    style={styles.avatar}/>
                }
              </View>
              <Text style={styles.avatarTip}>戳这里换头像</Text>
            </Image>
          </TouchableOpacity>
          :
          <TouchableOpacity onPress={this._pickPhoto} style={styles.avatarContainer}>
            <Text style={styles.avatarTip}>添加头像</Text>
            <View style={styles.avatarBox}>
              {
                this.state.avatarUploading ?
                <Progress.Circle
                  showsText={true}
                  color={'#ee735c'}
                  size={75}
                  progress={this.state.avatarProgress} />
                :
                <Icon
                    name='ios-cloud-upload-outline'
                    style={styles.plusIcon}/>
              }
            </View>
          </TouchableOpacity>
        }
      </View>
    )
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  toolbar: {
    flexDirection:'row',
    paddingTop:25,
    paddingBottom:12,
    backgroundColor:'#ee735c'
  },
  toolbarTitle: {
    flex:1,
    fontSize:16,
    color:'#fff',
    textAlign:'center',
    fontWeight:'600',
  },
  toolbarEdit:{
    position:'absolute',
    right:10,
    top:26,
    color:'#fff',
    textAlign:'right',
    fontWeight:'600',
    fontSize:14
  },
  avatarContainer:{
    width:width,
    height:140,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#666'
  },
  avatarBox: {
    marginTop:15,
    alignItems:'center',
    justifyContent:'center'
  },
  plusIcon:{
    padding:20,
    paddingLeft:25,
    paddingRight:25,
    color:'#999',
    fontSize:20,
    backgroundColor:'#fff',
    borderRadius:8
  },
  avatarTip: {
    color:'#fff',
    backgroundColor:'transparent',
    fontSize:14
  },
  avatar:{
    marginBottom:15,
    width:width*0.2,
    height:width*0.2,
    resizeMode:'cover',
    borderRadius:width*0.1,
    borderWidth:1,
    borderColor:'#ccc',
  }
})

module.exports = Account;
