import React, { Component } from 'react';
import ImagePickerManager from 'react-native-image-picker' // 需要rnpm link
import config from '../common/config'

var Icon = require('react-native-vector-icons/Ionicons');
var Video = require('react-native-video').default

import {
  StyleSheet,
  Text,
  Image,
  Dimensions,
  AsyncStorage,
  ProgressViewIOS,
  TouchableOpacity,
  View
} from 'react-native';

var width = Dimensions.get('window').width
var height = Dimensions.get('window').height

// 选取图片的参数
var videoOptions = {
  title: '选择视频',
  cancelButtonTitle: '取消',
  takePhotoButtonTitle:'录制10秒',
  chooseFromLibraryButtonTitle:'选择已有视频',
  videoQuality: 'medium',
  mediaType:'video',
  durationLimit:10,
  noData:false, // 设置成false，图片转成base
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

var Edit = React.createClass({
  getInitialState : function () {
    var user = this.props.user || {}
    return {
      user: user,
      previewVideo: null,
      // video load
      videoOk:true,
      videoLoaded:false,
      videoUploaded:false,
      videoUploading:false,
      playing:false,
      paused:false,
      videoUploadedProgress:0.01, // 上传进度
      videoProgress:0.01, // 播放进度
      videoTotal:0,
      currentTime:0,
      data:data,
      // video player
      muted:true,
      resizeMode:'contain',
      repeat:false,
      rate:1
    }
  },

  _getQiniuToken() {
    var accessToken = this.state.user.accessToken
    var signatureURL = config.api.base + config.api.signature
    return request.post(signatureURL,{
        accessToken:accessToken,
        type:'avatar',
        cloud: 'qiniu'
      })
      .catch(e => {
        console.log(e)
      })
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

   // 上传图片到七牛
  _upload(body) {

    var that = this
    var xhr = new XMLHttpRequest()
    var url = config.qiniu.upload

    that.setState({
      videoUploadedProgress:0,
      videoUploading:true,
      videoUploaded: false,
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

      if (response ) {
          that.setState({
            video:response,
            videoUploaded: true,
            videoUploading: false
          })
      }
    }

    // 进度条
    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          var percent = Number((event.loaded / event.total).toFixed(2))
          console.log(percent)
          that.setState({
            videoUploadedProgress: percent
          })
        }
      }
    }

    xhr.send(body)
  },

  _pickVideo() {
    var that = this
    // ios10 需要在info.plist中增加NSPhotoLibraryUsageDescription和NSCameraUsageDescription
    ImagePickerManager.showImagePicker(photoOptions, (res) => {
      if (res.didCancel) {
        return
      }

      var  uri = res.uri
      that.setState({
        previewVideo: uri
      })

      that._getQiniuToken()
        .then(data => {
          if (data && data.success) {
            var token = data.data.token
            var key = data.data.key
            var body = new FormData()

            body.append('token',token)
            body.append('key',key)
            body.append('file',{
              type:'video/mp4',
              uri:uri,
              name:key
            })
            that._upload(body)
          }
      })
    })
  },

_onLoadStart() {
    console.log('start')
  },
  _onLoad() {
    console.log('load')
  },
  _onProgress(data){
    var duration = data.playableDuration
    var currentTime = data.currentTime
    var percent = Number((currentTime / duration).toFixed(2))
    var newState = {
      videoTotal:duration,
      currentTime:Number(data.currentTime.toFixed(2)),
      videoProgress:percent
    }
    if (!this.state.videoLoaded) {
      newState.videoLoaded = true
    }
    if (!this.state.playing) {
      newState.playing = true
    }
    this.setState(newState)
  },
  _onEnd() {
    this.setState({
      playing: false,
      videoProgress:1
    })
  },
  _onError(err) {
    console.log(err)
    console.log('error')
  },

  _rePlay() {
    this.refs.videoPlayer.seek(0);
  },

  _pause() {
    if (!this.state.paused) {
      this.setState({
        paused:true
      })
    }
  },

  _resume() {
    if (this.state.paused) {
      this.setState({
        paused:false
      })
    }
  },

  _onError() {
    this.setState({
      videoOk:false
    })
  },

  render : function() {
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>
          { this.state.previewVideo ? '点击按钮配音' : '理解狗狗，从配音开始'}
          </Text>
          <Text style={styles.toolbarEdit} onPress={this._pickVideo}>更换视频</Text>
        </View>
        <View style={styles.page}>
          {
            this.state.previewVideo
            ?
            <View style={styles.videoContainer}>
              <View style={styles.videoBox}>
                 <Video
                    ref="videoPlayer"
                    source={{uri:this.state.previewVideo}}
                    style={styles.video}
                    volumn={5}
                    paused={this.state.paused}
                    rate={this.state.rate}
                    muted={this.state.muted}
                    resizeMode={this.state.resizeMode}
                    repeat={this.state.repeat}
                    onLoadStart={this._onLoadStart}
                    onLoad={this._onLoad}
                    onProgress={this._onProgress}
                    onEnd={this._onEnd}
                    onError={this._onError}
                  />
                {
                  !this.state.videoUploaded && this.state.videoUploading ?
                  <View style={styles.progressTipBox}>
                    <ProgressViewIOS style={styles.progressBar} progressTintColor='#ee735c' progress={this.state.videoUploadedProgress} />
                    <Text style={styles.progressTip}>正在生成静音视频，已完成{(this.state.videoUploadedProgress*100).toFixed(1)+'%'}</Text>
                  </View>
                }
              </View>
            </View>
            :
            <TouchableOpacity style={styles.uploadContainer} onPress={this._pickVideo}>
              <View style={styles.uploadBox}>
                <Image source={require('../assets/images/record.png')} style={styles.uploadIcon} />
                <Text style={styles.uploadTitle}>点我上传视频</Text>
                <Text style={styles.uploadDesc}>建议时长不超过10s</Text>
              </View>
            </TouchableOpacity>
          }
        </View>
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
  page:{
    flex:1,
    alignItems:'center'
  },
  uploadContainer:{
    marginTop:90,
    backgroundColor:'#fff',
    width: width - 40,
    paddingBottom:10,
    borderWidth:1,
    borderColor:'#ee735c',
    justifyContent:'center',
    borderRadius:6
  },
  uploadBox:{
    flex:1,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center'
  },
  uploadTitle:{
    textAlign:'center',
    fontSize:16,
    marginBottom:10,
    color:'#000'
  },
  uploadDesc:{
    color:'#999',
    textAlign:'center',
    fontSize:12
  },
  uploadIcon:{
    width:110,
    resizeMode:'contain'
  },
  videoContainer:{
    width: width,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  videoBox: {
    width:width,
    height: height*0.6
  },
  video: {
    width:width,
    height:height*0.6,
    backgroundColor:'#333'
  },
  progressTipBox:{
    position:'absolute',
    left:0,
    bottom:0,
    width:width,
    height:30,
    backgroundColor:'rgba(244,244,244,0.65)'
  },
  progressTip:{
    color:'#333',
    width:width -10,
    padding:5
  },
  progressBar:{
    width:width
  }
});

module.exports = Edit;
