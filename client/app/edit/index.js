import React, { Component } from 'react';
import ImagePickerManager from 'react-native-image-picker' // 需要rnpm link
import _ from 'lodash'
import {AudioRecorder, AudioUtils} from 'react-native-audio'
import config from '../common/config'
import request from '../common/request'

var CountDown = require('../common/countdown.js')
var Icon = require('react-native-vector-icons/Ionicons');
var Video = require('react-native-video').default

import {
  StyleSheet,
  Text,
  Image,
  Dimensions,
  AlertIOS,
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

var defaultState ={
  previewVideo: null,
  // video upload
  video: null,
  videoUploaded:false,
  videoUploading:false,
  videoUploadedProgress:0.01, // 上传进度
  // video load
  videoProgress:0.01, // 播放进度
  videoTotal:0,
  currentTime:0,
  // audio
  audioName:'gougou.aac',
  audioPlaying:false,
  recordDone: false,
  // count down
  counting: false,
  recording: false,
  // video player
  muted:true,
  resizeMode:'contain',
  repeat:false,
  rate:1
}

var Edit = React.createClass({
  getInitialState : function () {
    var user = this.props.user || {}
    var state = _.clone(defaultState)
    state.user = user
    return state
  },

  _getQiniuToken() {
    var accessToken = this.state.user.accessToken
    var signatureURL = config.api.base + config.api.signature
    return request.post(signatureURL,{
        accessToken:accessToken,
        type:'video',
        cloud: 'qiniu'
      })
      .catch(e => {
        console.log(e)
      })
  },

  _initAudio() {
    var audioPath = AudioUtils.DocumentDirectoryPath + '/' + this.state.audioName;

    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: "High",
      AudioEncoding: "aac"
    })
    AudioRecorder.onProgress = (data) => {
      this.setState({currentTime: Math.floor(data.currentTime)});
    }
    AudioRecorder.onFinished = (data) => {
      console.log(data)
      this.setState({finished: data.finished});
      console.log(`Finished recording: ${data.finished}`);
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

    this._initAudio()
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
          // 告诉我们自己的服务器
          var videoURL = config.api.base + config.api.video
          var accessToken = this.state.user.accessToken
          request.post(videoURL,{
            accessToken: accessToken,
            video: response
          })
          .catch(err => {
            console.log(err)
            AlertIOS.alert('视频同步出错，请重新上传')
          })
          .then(data => {
            console.log(data)
            if (!data || !data.success) {
              AlertIOS.alert('视频同步出错，请重新上传')
            }
          })
      }
    }

    // 进度条
    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          var percent = Number((event.loaded / event.total).toFixed(2))
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
    ImagePickerManager.showImagePicker(videoOptions, (res) => {
      if (res.didCancel) {
        return
      }
      // 重置状态
      var state = _.clone(defaultState)
      state.previewVideo = res.uri
      state.user = this.state.user
      var  uri = res.uri
      that.setState(state)

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
    this.setState({
      videoTotal:duration,
      currentTime:Number(data.currentTime.toFixed(2)),
      videoProgress:percent
    })
  },
  _onEnd() {
    // 当我们在录音时
    if (this.state.recording) {
      // 结束音频录制
      AudioRecorder.stopRecording()
      this.setState({
        recording: false,
        videoProgress:1,
        recordDone: true
      })
    }
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

  // 开始录音
  _record() {
    this.setState({
      videoProgress:0,
      counting:false,
      recordDone: false,
      recording:true
    })
    // 录音时从头播放视频
    this.refs.videoPlayer.seek(0)
    // 启动音频录制
    AudioRecorder.startRecording()
  },

  _counting() {
    // 没有倒计时，没有录制，没有预览时可以开始倒计时
    if (!this.state.couting && !this.state.recording && !this.state.audioPlaying) {
      this.setState({
        counting: true
      })
      this.refs.videoPlayer.seek(this.state.videoTotal - 0.01)
    }
  },

  // 预览录音
  _preview() {
    if (this.state.audioPlaying) {
      AudioRecorder.stopPlaying()
    }
    this.setState({
      videoProgress:0,
      audioPlaying:true
    })
    AudioRecorder.playRecording()
    this.refs.videoPlayer.seek(0)
  },

  render : function() {
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>
          { this.state.previewVideo ? '点击按钮配音' : '理解狗狗，从配音开始'}
          </Text>
          {
            (this.state.previewVideo && this.state.videoUploaded) ?
            <Text style={styles.toolbarEdit} onPress={this._pickVideo}>更换视频</Text>
            : null
          }
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
                  </View>: null
                }
                {
                  this.state.recording || this.state.audioPlaying ?
                  <View style={styles.progressTipBox}>
                    <ProgressViewIOS style={styles.progressBar} progressTintColor='#ee735c' progress={this.state.videoProgress} />
                    {
                      this.state.recording ?
                      <Text style={styles.progressTip}>录制声音中</Text>:
                      null
                    }
                  </View> : null
                }
                {
                  this.state.recordDone ?
                  <View style={styles.previewBox}>
                    <Icon name="ios-play" style={styles.previewIcon} />
                    <Text style={styles.previewText} onPress={this._preview}>
                      预览
                    </Text>
                  </View>:null
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
          {
            this.state.videoUploaded ?
            <View style={styles.recordBox}>
              <View style={[styles.recordIconBox,(this.state.recording || this.state.audioPlaying)&& styles.recordOn]}>
              {
                this.state.counting && !this.state.recording ?
                <CountDown
                  text=''
                  style={styles.countBtn}
                  time={3}
                  afterEnd={this._record}
                /> :
                <TouchableOpacity onPress={this._counting}>
                  <Icon name="ios-microphone" style={styles.recordIcon}/>
                </TouchableOpacity>
              }
              </View>
            </View> :
            null
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
  },
  recordBox:{
    width:width,
    height:60,
    alignItems:'center'
  },
  recordIconBox : {
    width:68,
    height:68,
    marginTop:-30,
    borderRadius:34,
    backgroundColor:'#ee735c',
    borderWidth:1,
    borderColor:'#fff',
    alignItems:'center',
    justifyContent:'center'
  },
  recordIcon:{
    fontSize:58,
    backgroundColor:'transparent',
    color:'#fff'
  },
  countBtn:{
    fontSize:32,
    fontWeight:'600',
    color:'#fff'
  },
  recordOn:{
    backgroundColor:'#ccc'
  },
  previewBox:{
    width: 80,
    height: 30,
    position: 'absolute',
    right:10,
    bottom:10,
    borderWidth:1,
    borderColor:'#ee735c',
    borderRadius:3,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'
  },
  previewIcon:{
    marginRight:5,
    fontSize:20,
    color:'#ee735c'
  },
  previewText:{
    fontSize:20,
    color:'#ee735c'
  }
});

module.exports = Edit;
