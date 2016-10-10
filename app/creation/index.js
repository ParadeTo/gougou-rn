import React, { Component } from 'react';
var Icon = require('react-native-vector-icons/Ionicons');
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  Dimensions,
  ListView
} from 'react-native';

var width = Dimensions.get('window').width;

var List = React.createClass({
  getInitialState : function () {
    // 比对两条数据是否完全一样
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      dataSource: ds.cloneWithRows([    {
        "_id":"710000199912267145","thumb":"http://dummyimage.com/200/e9a3dd)","title":"测试内容j471","video":"http://v2.mukewang.com/72ccfdad-1321-485f-a7e3-fa6e0cd4c884/L.mp4?auth_key=1476115964-0-0-f7705d0f817a0d8be37092538b0a9246"
    }
    ,
    {
        "_id":"110000197407163280","thumb":"http://dummyimage.com/200/cfab73)","title":"测试内容j471","video":"http://v2.mukewang.com/72ccfdad-1321-485f-a7e3-fa6e0cd4c884/L.mp4?auth_key=1476115964-0-0-f7705d0f817a0d8be37092538b0a9246"
    }
    ,
    {
        "_id":"330000200108267026","thumb":"http://dummyimage.com/200/c914af)","title":"测试内容j471","video":"http://v2.mukewang.com/72ccfdad-1321-485f-a7e3-fa6e0cd4c884/L.mp4?auth_key=1476115964-0-0-f7705d0f817a0d8be37092538b0a9246"
    }
    ,
    {
        "_id":"650000197805288279","thumb":"http://dummyimage.com/200/943fb6)","title":"测试内容j471","video":"http://v2.mukewang.com/72ccfdad-1321-485f-a7e3-fa6e0cd4c884/L.mp4?auth_key=1476115964-0-0-f7705d0f817a0d8be37092538b0a9246"
    }
    ,
    {
        "_id":"360000199201184823","thumb":"http://dummyimage.com/200/c592ea)","title":"测试内容j471","video":"http://v2.mukewang.com/72ccfdad-1321-485f-a7e3-fa6e0cd4c884/L.mp4?auth_key=1476115964-0-0-f7705d0f817a0d8be37092538b0a9246"
    }
    ,
    {
        "_id":"650000201501314991","thumb":"http://dummyimage.com/200/9a9fac)","title":"测试内容j471","video":"http://v2.mukewang.com/72ccfdad-1321-485f-a7e3-fa6e0cd4c884/L.mp4?auth_key=1476115964-0-0-f7705d0f817a0d8be37092538b0a9246"
    }
    ,
    {
        "_id":"650000201512071753","thumb":"http://dummyimage.com/200/0d6d15)","title":"测试内容j471","video":"http://v2.mukewang.com/72ccfdad-1321-485f-a7e3-fa6e0cd4c884/L.mp4?auth_key=1476115964-0-0-f7705d0f817a0d8be37092538b0a9246"
    }]),
    };
  },

  // 每个列表项
  renderRow : function (row) {
    return (
      <TouchableHighlight>
        <View style={styles.item}>
          <Text style={styles.title}>{row.title}</Text>
          <Image
            source={{uri: row.thumb}}
            style={styles.thumb}>
            <Icon
              name="ios-play"
              size={28}
              style={styles.play}
            />
          </Image>
          <View style={styles.itemFooter}>
            <View style={styles.handleBox}>
              <Icon
                name="ios-heart-outline"
                size={28}
                style={styles.up}
              />
              <Text style={styles.handleText}>喜欢</Text>
            </View>
            <View style={styles.handleBox}>
              <Icon
                name="ios-chatbox-outline"
                size={28}
                style={styles.commentIcon}
              />
              <Text style={styles.handleText}>评论</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  },

  render : function() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>列表页面</Text>
        </View>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}
          enableEmptySections={true}
          automaticallyAdjustContentInsets={false}
        />
      </View>
    )
  }
});


const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  header : {
    paddingTop:25,
    paddingBottom:12,
    backgroundColor:'#EE735C'
  },
  headerTitle : {
    color:"#fff",
    fontSize:16,
    textAlign:'center',
    fontWeight:'600'
  },
  item : {
    width:width,
    marginBottom:10,
    backgroundColor:'#fff'
  },
  thumb : {
    width: width,
    height: width * 0.5,
    resizeMode:'cover'
  },
  title : {
    padding:10,
    fontSize:18,
    color:'#333'
  },
  itemFooter : {
    flexDirection:'row',
    justifyContent:'space-between',
    backgroundColor:'#eee'
  },
  handleBox : {
    padding:10,
    flexDirection:'row',
    width:width / 2 - 0.5,
    justifyContent:'center',
    backgroundColor:'#fff'
  },
  play : {
    position:'absolute',
    bottom:14,
    right:14,
    width:46,
    height:46,
    paddingTop:9,
    paddingLeft:18,
    backgroundColor:'transparent',
    borderColor:'#fff',
    borderWidth:1,
    borderRadius:23,
    color:'#ed7b66'
  },
  handleText : {
    paddingLeft:12,
    fontSize:18,
    color:'#333'
  },
  up:{
    fontSize:22,
    color:'#333'
  },
  commentIcon:{
    fontSize:22,
    color:'#333'
  }
});

module.exports = List;
