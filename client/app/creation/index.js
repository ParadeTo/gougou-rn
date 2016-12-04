import React, { Component } from 'react';
var Icon = require('react-native-vector-icons/Ionicons');
var request = require('../common/request.js')
var config = require('../common/config.js')
var util = require('../common/util.js')
var Detail = require('./detail')

import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  AlertIOS,
  AsyncStorage,
  ListView
} from 'react-native';

var width = Dimensions.get('window').width;

var cachedResults = {
  nextPage:1,
  items:[],
  total:0
}

var Item = React.createClass({
  getInitialState() {
    var row = this.props.row
    return {
      up: row.voted,
      row:row
    }
  },

  _up() {
    var that = this;
    var up = !this.state.up
    var row = this.state.row
    var url = config.api.base + config.api.up

    var body = {
      id: row._id,
      up: up ? 'yes' : 'no',
      accessToken: this.props.user.accessToken
    }

    console.log(row._id);
    request.post(url,body)
      .then((data) => {
        console.log(data);
        if (data && data.success) {
            that.setState({
              up:up
            })
        }
        else {
          AlertIOS.alert('点赞失败，稍后重试')
        }
      })
      .catch((err) => {
        console.log(err);
        AlertIOS.alert('点赞失败，稍后重试')
      })
  },

  render() {
    var row = this.state.row
    return (
      <TouchableHighlight onPress={this.props.onSelect}>
        <View style={styles.item}>
          <Text style={styles.title}>{row.title}</Text>
          <Image
            source={{uri: util.thumb(config.debug ? row.thumb : row.qiniu_thumb)}}
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
                name={this.state.up ? "ios-heart" : "ios-heart-outline"}
                size={28}
                style={[styles.up,this.state.up ? null : styles.down]}
                onPress={this._up}
              />
              <Text style={styles.handleText} onPress={this._up}>喜欢</Text>
            </View>
            <View style={styles.handleBox}>
              <Icon
                name="ios-chatboxes-outline"
                size={28}
                style={styles.commentIcon}
              />
              <Text style={styles.handleText}>评论</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  }
})

var List = React.createClass({
  getInitialState : function () {
    // 比对两条数据是否完全一样
    // {
    //        "_id":"710000199912267145","thumb":"http://dummyimage.com/200/e9a3dd)","title":"测试内容j471","video":"http://v2.mukewang.com/72ccfdad-1321-485f-a7e3-fa6e0cd4c884/L.mp4?auth_key=1476115964-0-0-f7705d0f817a0d8be37092538b0a9246"
    //    }
    //    ,
    //    {
    //        "_id":"110000197407163280","thumb":"http://dummyimage.com/200/cfab73)","title":"测试内容j471","video":"http://v2.mukewang.com/72ccfdad-1321-485f-a7e3-fa6e0cd4c884/L.mp4?auth_key=1476115964-0-0-f7705d0f817a0d8be37092538b0a9246"
    //    }
    //    ,
    //    {
    //        "_id":"330000200108267026","thumb":"http://dummyimage.com/200/c914af)","title":"测试内容j471","video":"http://v2.mukewang.com/72ccfdad-1321-485f-a7e3-fa6e0cd4c884/L.mp4?auth_key=1476115964-0-0-f7705d0f817a0d8be37092538b0a9246"
    //    }
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      user: null,
      dataSource: ds.cloneWithRows([]),
      isLoadingTail:false,
      isRefreshing:false
    };
  },

  // 每个列表项
  _renderRow : function (row) {
    console.log(row);
    return (
      <Item
        user={this.state.user}
        key={row._id}
        row={row}
        onSelect={() => this._loadPage(row) }
      />
    )
  },

  componentDidMount : function() {
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
          }, function() {
            that._fetchData(1);
          })
        }
      })
  },

  _fetchData(page) {

    if (page !== 0) {
      this.setState({
        isLoadingTail:true
      })
    } else {
      this.setState({
        isRefreshing: true
      })
    }

    var user = this.state.user;
    request.get(config.api.base+config.api.creations,{
      accessToken: user.accessToken,
      page:page
    })
     .then((data) => {
       if (data && data.success) {
         if (data.data.length > 0) {
           // 判断当前用户是否对某一个视频点过赞
           data.data = data.data.map(function(item) {
             var votes = item.votes || [];
             if (votes.indexOf(user._id) > -1) {
               item.voted = true;
             }
             else {
               item.voted = false;
             }
             return item;
           });

           var items = cachedResults.items.slice()
           if (page !== 0) {
             items = items.concat(data.data);
             cachedResults.nextPage += 1;
           } else {
             items =  data.data.concat(items);
           }
           cachedResults.items = items;
           cachedResults.total = data.total;

           if (page !== 0) {
             this.setState({
               isLoadingTail:false,
               dataSource : this.state.dataSource.cloneWithRows(cachedResults.items)
             })
           } else {
             this.setState({
               isRefreshing:false,
               dataSource : this.state.dataSource.cloneWithRows(cachedResults.items)
             })
           }
         }
       }
     })
     .catch((error) => {
       if (page !== 0) {
         this.setState({
           isLoadingTail:false
         })
       } else {
         this.setState({
           isRefreshing:false
         })
       }
       console.error(error);
     });
  },

  _hasMore() {
    return cachedResults.items.length !== cachedResults.total;
  },

  _fetchMoreData() {
    if (!this._hasMore() || this.state.isLoadingTail) {
      return
    }
    var page = cachedResults.nextPage;
    this._fetchData(page);
  },

  // 列表底部
  _renderFooter() {
    if (!this._hasMore() && cachedResults.total !==0 ) {
      return (
        <View style={styles.loadingMore}>
          <Text style={styles.loadingText}>
            没有更多了
          </Text>
        </View>
      )
    }

    if (!this.state.isLoadingTail) {
      return (<View style={styles.loadingMore}></View>);
    }

    return (
      <ActivityIndicator
          style={styles.loadingMore}
        />
    )
  },

  // 下拉刷新
  _onRefresh () {
    if (!this._hasMore() || this.state.isRefreshing) {
      return;
    }
    this._fetchData(0)
  },

  // 跳转到详情页
  _loadPage(row) {
    this.props.navigator.push({
      name:'detail',
      component: Detail,
      // 传递参数
      params:{
        data: row
      }
    })
  },

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>列表页面</Text>
        </View>
        <ListView
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this._onRefresh}
              tintColor='#ff6600'
              title='拼命加载中...'
            />
          }
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          renderFooter={this._renderFooter}
          onEndReached={this._fetchMoreData}
          onEndReachedThreshold={20}
          enableEmptySections={true}
          showsVerticalScrollIndicator={false}
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
  loadingMore: {
    marginVertical:20
  },
  loadingText: {
    color:'#777',
    textAlign:'center'
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
    color:'#ed7b66'
  },
  dowm:{
    fontSize:22,
    color:'#333'
  },
  commentIcon:{
    fontSize:22,
    color:'#333'
  }
});

module.exports = List;
