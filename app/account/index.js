import React, { Component } from 'react';
var Icon = require('react-native-vector-icons/Ionicons');
import ImagePickerManager from 'react-native-image-picker'
import {
  StyleSheet,
  Text,
  Dimensions,
  AsyncStorage,
  Image,
  TouchableOpacity,
  View
} from 'react-native';

var width = Dimensions.get('window').width

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

var Account = React.createClass({
  getInitialState () {
    var user = this.props.user || {}
    return {
      user:user
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
      var user = that.state.user
      user.avatar = avatarData
      that.setState({
        user:user
      })
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

  render () {
    var user = this.state.user
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toobarTitle}>我的账户</Text>
        </View>
        {
          user.avatar
          ?
          <TouchableOpacity onPress={this._pickPhoto}>
            <Image source={{uri:user.avatar}} style={styles.avatarContainer}>
              <View style={styles.avatarBox}>
                <Image
                  source={{uri:user.avatar}}
                  style={styles.avatar}/>
              </View>
              <Text style={styles.avatarTip}>戳这里换头像</Text>
            </Image>
          </TouchableOpacity>
          :
          <TouchableOpacity onPress={this._pickPhoto} style={styles.avatarContainer}>
            <Text style={styles.avatarTip}>添加头像</Text>
            <View style={styles.avatarBox}>
              <Icon
                name='ios-cloud-upload-outline'
                style={styles.plusIcon}/>
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
  toobarTitle: {
    flex:1,
    fontSize:16,
    color:'#fff',
    textAlign:'center',
    fontWeight:'600',
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
