import React, { Component } from 'react';
var Icon = require('react-native-vector-icons/Ionicons');
import {
  StyleSheet,
  Text,
  AsyncStorage,
  View
} from 'react-native';

var Account = React.createClass({
  getInitialState : function () {
    return {
      user : {
        nickname:'老四',
        times:0
      }
    }
  },

  componentDidMount() {
    var that = this

    // user.times++
    // var userData = JSON.stringify(user)
    // AsyncStorage
    //   .setItem('user',userData)
    //   .catch(function(err){
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       console.log('ok');
    //     }
    //   })
    //   .then(function(data) {
    //     console.log(data);
    //     console.log('save ok');
    //   })

    AsyncStorage
      .getItem('user')
      .catch(function(err){
        if (err) {
          console.log(err);
        } else {
          console.log('ok');
        }
        var user = this.state.user
        user.times++
        var userData = JSON.stringify(user)
        AsyncStorage
          .setItem('user',userData)
          .catch(function(err){
            if (err) {
              console.log(err);
            } else {
              console.log('ok');
            }
          })
          .then(function(data) {
            console.log(data);
            console.log('save ok');
          })
      })
      .then(function(data) {

        console.log(data);
        data = JSON.parse(data);
        that.setState({
          user:data
        },function() {
          data.times++
          var userData = JSON.stringify(data)
          AsyncStorage
            .setItem('user',userData)
            .catch(function(err){
              if (err) {
                console.log(err);
              } else {
                console.log('ok');
              }
            })
            .then(function(data) {
              console.log(data);
              console.log('save ok');
            })
        })
      })
  },

  render : function() {
    return (
      <View style={styles.container}>
        <Text style={styles.item}>{this.state.user.nickname}不爽了{this.state.user.times}次</Text>
      </View>
    )
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:'center',
    backgroundColor:'#334500'
  },
})

module.exports = Account;
