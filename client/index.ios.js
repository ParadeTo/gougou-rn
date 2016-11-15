/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Navigator,
  AsyncStorage,
  TabBarIOS
} from 'react-native';

var Icon = require('react-native-vector-icons/Ionicons');

var List = require('./app/creation/index');
var Edit = require('./app/edit/index');
var Account = require('./app/account/index');
var Login = require('./app/account/login');

var rnDemo = React.createClass({
  getInitialState () {
    return {
      user: null,
      selectedTab: 'account',
      logined: false
    }
  },

  // 读取用户状态
  _asyncAppStatus() {
    var that = this
    AsyncStorage.getItem('user')
      .then((data) => {
        var user
        var newState = {}

        if (data) {
          user = JSON.parse(data)
        }

        if (user && user.accessToken) {
          newState.user = user
          newState.logined = true
        }
        else {
          newState.logined = false
        }

        that.setState(newState)
      })
  },

  // 登录成功后回调函数
  _afterLogin(user) {
    var that = this
    user = JSON.stringify(user)
    AsyncStorage.setItem('user',user)
      .then(() => {
        that.setState({
          logined:true,
          user:user
        })
      })
  },

  componentDidMount() {
    this._asyncAppStatus()
  },

  _logout() {
    AsyncStorage.removeItem('user')
    this.setState({
      logined:false,
      user:null
    })
  },

  render () {
    // 会先跳登录，然后跳列表页，待优化
    if (!this.state.logined) {
      return <Login afterLogin={this._afterLogin}/>
    }

    return (
      <TabBarIOS
        tintColor="#ee735c"
        >
        <Icon.TabBarItem
          iconName='ios-videocam-outline'
          selectedIconName='ios-videocam'
          selected={this.state.selectedTab === 'list'}
          onPress={() => {
            this.setState({
              selectedTab: 'list',
            });
          }}>
            <Navigator
            initialRoute={{
              name:'list',
              component:List
            }}
            configureScene={(route) => {
              return Navigator.SceneConfigs.FloatFromRight
            }}
            renderScene={(route, navigator) => {
              // 初始时，这里的Component就是List, navigator 会传递给他
              var Component = route.component
              // params是传递的参数
              return <Component {...route.params} navigator={navigator} />
            }}
          />
        </Icon.TabBarItem>
        <Icon.TabBarItem
          iconName='ios-recording-outline'
          selectedIconName='ios-recording'
          selected={this.state.selectedTab === 'edit'}
          onPress={() => {
            this.setState({
              selectedTab: 'edit',
              notifCount: this.state.notifCount + 1,
            });
          }}>
          <Edit/>
        </Icon.TabBarItem>
        <Icon.TabBarItem
          iconName='ios-more-outline'
          selectedIconName='ios-more'
          selected={this.state.selectedTab === 'account'}
          onPress={() => {
            this.setState({
              selectedTab: 'account',
              presses: this.state.presses + 1
            });
          }}>
          <Account user={this.state.user} logout={this._logout}/>
          </Icon.TabBarItem>
      </TabBarIOS>
    );
  }
});

const styles = StyleSheet.create({
  tabBorder: {
    borderWidth:5,
    borderStyle:'solid',
    borderColor:'#333',
    backgroundColor:'red'
  },
  bottomBorder:{
    borderBottomWidth:1,
    borderStyle:'solid',
    borderColor:'#333',
    backgroundColor:'red'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('rnDemo', () => rnDemo);
