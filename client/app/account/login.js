import React, { Component } from 'react';
var Button = require('react-native-button').default
var CountDown = require('../common/countdown.js')
var config = require('../common/config.js')
var request = require('../common/request.js')

import {
  StyleSheet,
  Text,
  TextInput,
  AlertIOS,
  View
} from 'react-native';

var Login = React.createClass({
  getInitialState : function () {
    return {
      codeSent:false,
      phoneNumber:'',
      countingDone: false,
      verifyCode:''
    }
  },

  // 验证用户，即登录
  _submit() {
    var that = this;
    var phoneNumber = this.state.phoneNumber
    var verifyCode = this.state.verifyCode
    if (!phoneNumber || !verifyCode) {
      return AlertIOS.alert('手机号或验证码不能为空')
    }
    var body = {
      phoneNumber: phoneNumber,
      verifyCode: verifyCode
    }

    var verifyUrl = config.api.base + config.api.verify
    request.post(verifyUrl, body)
      .then((data) => {
        if (data && data.success) {
          that.props.afterLogin(data.data)
        }
        else {
          AlertIOS.alert('登录失败')
        }
      })
      .catch((err) => {
        AlertIOS.alert('登录失败')
      })
  },

  // 显示验证码输入框
  _showVerifyCode() {
    this.setState({
      codeSent:true
    })
  },

  // 结束倒计时，传递给countdown去调用
  _countingDone() {
    this.setState({
      countingDone:true
    })
  },

  _sendVerifyCode() {
    // 开始倒计时
    if(this.state.countingDone) {
      this.setState({
        countingDone:false
      })
    }

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
          // 显示验证码输入框
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
                  text='重新发送'
                  style={styles.countBtn}
                  time={60}
                  afterEnd={this._countingDone}
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
    // marginTop:5,
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
    alignItems:'center',
    justifyContent:'space-between'
  },
  countBtn: {
    width:110,
    height:40,
    paddingTop:10,
    paddingBottom:10,
    marginLeft:8,
    backgroundColor:'#ee735c',
    color:'#fff',
    borderColor:'#ee735c',
    textAlign:'center',
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

module.exports = Login;
