import React, { Component } from 'react';
var Icon = require('react-native-vector-icons/Ionicons');
var Button = require('react-native-button').default
var CountDown = require('react-native-sk-countdown').CountDownText
var config = require('../common/config.js')
var request = require('../common/request.js')

import {
  StyleSheet,
  Text,
  TextInput,
  AlertIOS,
  View
} from 'react-native';

var Account = React.createClass({
  getInitialState : function () {
    return {
      codeSent:false,
      phoneNumber:'',
      countingDone: false,
      verifyCode:''
    }
  },

  _submit() {

  },

  _showVerifyCode() {
    this.setState({
      codeSent:true
    })
  },

  _countingDone() {
    this.setState({
      countingDone:true
    })
  },

  _sendVerifyCode() {
    var that = this;
    var phoneNumber = this.state.phoneNumber
    if (!phoneNumber) {
      return AlertIOS.alert('手机号不能为空')
    }
    var body = {
      phoneNumber: phoneNumber
    }

    var signupUrl = config.api.base + config.api.signup
    request.post(signupUrl, body)
      .then((data) => {
        if (data && data.success) {
          that._showVerifyCode();
        }
        else {
          AlertIOS.alert('获取验证码失败，请检查手机号是否正确')
        }
      })
      .catch((err) => {
        AlertIOS.alert('获取验证码失败，请检查网络是否良好')
      })
  },

  render : function() {
    return (
      <View style={styles.container}>
        <View style={styles.signupBox}>
          <Text style={styles.title}>快速登录</Text>
          <TextInput
            placeholder="输入手机号"
            autoCapitalize={'none'}
            autoCorrect={false}
            keyboardType={"number-pad"}
            style={styles.inputField}
            onChangeText={(text) => {
              this.setState({
                phoneNumber:text
              })
            }}/>
            {
              this.state.codeSent
              ?
              <View style={styles.verifyCodeBox}>
                <TextInput
                  placeholder="输入验证码"
                  autoCapitalize={'none'}
                  autoCorrect={false}
                  keyboardType={"number-pad"}
                  style={styles.inputField}
                  onChangeText={(text) => {
                    this.setState({
                      verifyCode:text
                    })
                  }}/>
                  {
                    this.state.countingDone
                    ?
                    <Button style={styles.countBtn}
                      onPress={this._sendVerifyCode}>获取验证码</Button>
                    :
                    <CountDown
                      style={styles.countBtn}
                      countType='seconds' // 计时类型：seconds / date
                      auto={true} // 自动开始
                      afterEnd={this._countingDone} // 结束回调
                      timeLeft={60} // 正向计时 时间起点为0秒
                      step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
                      startText='获取验证码' // 开始的文本
                      endText='获取验证码' // 结束的文本
                      intervalText={(sec) => sec + '秒重新获取'} // 定时的文本回调
                      />
                  }
              </View>
              : null
            }
            {
              this.state.codeSent
              ?
              <Button
                style={styles.btn}
                onPress={this._submit}>登录</Button>
              :
              <Button
                style={styles.btn}
                onPress={this._sendVerifyCode}>获取验证码</Button>
            }
        </View>
      </View>
    )
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:10,
    backgroundColor:'#f9f9f9'
  },
  signupBox : {
    marginTop:30
  },
  title:{
    marginBottom:20,
    color:'#333',
    fontSize:20,
    textAlign:'center'
  },
  inputField:{
    marginTop:5,
    flex:1,
    height:40,
    padding:5,
    color:'#666',
    fontSize:16,
    backgroundColor:'#fff',
    borderRadius:4,
    borderWidth:1,
    borderColor:'#CCC'
  },
  verifyCodeBox:{
    marginTop:10,
    flexDirection:'row',
    justifyContent:'space-between'
  },
  countBtn: {
    width:110,
    height:40,
    padding:10,
    marginLeft:8,
    backgroundColor:'transparent',
    borderColor:'#ee735c',
    textAlign:'left',
    fontWeight:'600',
    fontSize:15,
    borderRadius:2
  },
  btn:{
    marginTop:10,
    padding:10,
    backgroundColor:'transparent',
    borderColor:'#EE735C',
    borderWidth:1,
    borderRadius:4,
    color:'#ee735c'
  }
})

module.exports = Account;
