import React, { Component } from 'react';
import {
  Text,
  View
} from 'react-native';

var CountDown = React.createClass({
  getInitialState() {
    return {
      iTime: this.props.time
    }
  },

  componentDidMount() {
    var that = this
    timer = setInterval(function(){
      if (that.state.iTime > 1) {
        var tmp = that.state.iTime;
        that.setState({
          iTime: --tmp
        })

      } else {
        clearInterval(timer);
        that.props.afterEnd();
      }
    },1000)
  },

  // 组件注销前
  componentWillUnmount() {
    clearInterval(timer)
  },

  render () {
    return (
        <Text style={this.props.style}>{'重新发送('+this.state.iTime+')'}</Text>
    )
  }
})

module.exports = CountDown;
