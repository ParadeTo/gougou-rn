import React, { Component } from 'react';
var Icon = require('react-native-vector-icons/Ionicons');
var Button = require('react-native-button').default
import ImagePickerManager from 'react-native-image-picker' // 需要rnpm link
import sha1 from 'sha1'
import * as Progress from 'react-native-progress' // 需要手动添加libraries
import request from '../common/request'
import config from '../common/config'

import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
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

function avatar(id,type) {
  if (id.indexOf('http') > -1) {
    return id
  }
  if (id.indexOf('data:image') > -1) {
    return id
  }
  return config.CLOUDINARY.base + '/' + type + '/upload/' + id
}

function avatarQiniu(key) {
  return config.qiniu.url + key;
}

var Account = React.createClass({
  getInitialState () {
    var user = this.props.user || {}
    return {
      modalVisible:false,
      user:user,
      avatarProgress:0,
      avatarUploading:false
    }
  },

  // 点击编辑按钮
  _edit() {
    this.setState({
      modalVisible:true
    })
  },

  // 关闭浮窗
  _closeModal() {
    this.setState({
      modalVisible:false
    })
  },

  _getQiniuToken() {
    var accessToken = this.state.user.accessToken
    var signatureURL = config.api.base + config.api.signature
    return request.post(signatureURL,{
        accessToken:accessToken,
        type: 'avatar',
        cloud: 'qiniu'
      })
      .catch(e => {
        console.log(e)
      })
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

      //  生成七牛签名并上传图片
      var  uri = res.uri
      that._getQiniuToken()
        .then(data => {
          console.log(data)
          if (data && data.success) {
            var token = data.data.token
            var key = data.data.key
            var body = new FormData()

            body.append('token',token)
            body.append('key',key)
            body.append('file',{
              type:'image/jpeg',
              uri:uri,
              name:key
            })
            that._upload(body)
          }
      })
    })
  },

  // 上传图片到七牛
  _upload(body) {
    console.log(body)
    var that = this
    var xhr = new XMLHttpRequest()
    var url = config.qiniu.upload

    that.setState({
      avatarUploading:true,
      avatarProgress:0
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
        console.log(xhr.response)
        response = JSON.parse(xhr.response)
      } catch (e) {
        console.log(e)
        console.log("parse fails")
      }

      if (response ) {
        // 来自七牛
        if (response.key) {
          var user = this.state.user
          user.avatar = response.key
          that.setState({
            user: user, // 这个貌似可以去掉
            avatarProgress: 0,
            avatarUploading: false
          })
          // 上传到自己的服务器
          that._asyncUser(true)
        }

        // 来自cloudinary
        // if (response.public_id) {
        //   var user = this.state.user
        //   user.avatar = response.public_id
        //   that.setState({
        //     user: user, // 这个貌似可以去掉
        //     avatarProgress: 0,
        //     avatarUploading: false
        //   })
        //   // 上传到服务器
        //   that._asyncUser(true)
        // }
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

  // 同步用户资料
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
              that._closeModal()
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

  _changeUserState(key,value) {
    var user = this.state.user
    user[key] = value
    this.setState({
      user:user
    })
  },

  //  保存用户资料
  _submit() {
    this._asyncUser()
  },


  render () {
    var user = this.state.user
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>我的账户</Text>
          <Text style={styles.toolbarEdit} onPress={this._edit}>编辑</Text>
        </View>
        {
          user.avatar
          ?
          <TouchableOpacity onPress={this._pickPhoto}>
            <Image source={{uri: avatarQiniu(user.avatar)}} style={styles.avatarContainer}>
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
                    source={{uri:avatarQiniu(user.avatar)}}
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
        <Modal
          visible={this.state.modalVisible}>
          <View style={styles.modalContainer}>
            <Icon
              onPress={this._closeModal}
              name='ios-close-outline'
              style={styles.closeIcon}/>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>昵称</Text>
              <TextInput
                placeholder={'狗狗的昵称'}
                style={styles.inputField}
                autoCapitalize={'none'}
                autoCorrect={false}
                defaultValue={user.nickname}
                onChangeText={(text) => {
                  this._changeUserState('nickname',text)
                }}/>
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>品种</Text>
              <TextInput
                placeholder={'狗狗的品种'}
                style={styles.inputField}
                autoCapitalize={'none'}
                autoCorrect={false}
                defaultValue={user.breed}
                onChangeText={(text) => {
                  this._changeUserState('breed',text)
                }}/>
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>年龄</Text>
              <TextInput
                placeholder={'狗狗的年龄'}
                style={styles.inputField}
                autoCapitalize={'none'}
                autoCorrect={false}
                defaultValue={user.age}
                onChangeText={(text) => {
                  this._changeUserState('age',text)
                }}/>
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>性别</Text>
              <Icon.Button
                onPress={() => {
                  this._changeUserState('gender','male')
                }}
                style={[styles.gender,
                  user.gender==='male' && styles.genderChecked]}
                name='ios-paw-outline'>男</Icon.Button>
              <Icon.Button
                onPress={() => {
                  this._changeUserState('gender','female')
                }}
                style={[styles.gender,
                  user.gender==='female' && styles.genderChecked]}
                name='ios-paw'>女</Icon.Button>
            </View>
            <Button style={styles.btn}
              onPress={this._submit}>保存</Button>
          </View>
        </Modal>
        <Button style={styles.btn}
          onPress={this.props.logout}>退出登录</Button>
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
  },
  modalContainer:{
    flex:1,
    paddingTop:50,
    backgroundColor:'#fff'
  },
  fieldItem:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    height:50,
    paddingLeft:15,
    paddingRight:15,
    borderColor:'#eee',
    borderBottomWidth:1,
  },
  label:{
    color:'#ccc',
    marginRight:10,
  },
  inputField:{
    height:50,
    flex:1,
    color:'#666',
    fontSize:14
  },
  closeIcon:{
    position:'absolute',
    width:40,
    height:40,
    fontSize:32,
    right:10,
    top:30,
    color:'#ee735c'
  },
  gender:{
    backgroundColor:'#ccc'
  },
  genderChecked:{
    backgroundColor:'#ee735c'
  },
  btn:{
    marginTop:25,
    padding:10,
    marginLeft:10,
    marginRight:10,
    backgroundColor:'transparent',
    borderColor:'#EE735C',
    borderWidth:1,
    borderRadius:4,
    color:'#ee735c'
  }
})

module.exports = Account;
