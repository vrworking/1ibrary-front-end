import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native'
import BookCollect from '../components/BookCollect'
import CommonNav from '../components/CommonNav'
import HttpUtils from '../network/HttpUtils'
import { LISTS } from '../network/Urls'
import { HEIGHT } from '../common/styles'
import Toast from 'antd-mobile/lib/toast'
import fetchData from '../common/loading'

const URL_SHOW = LISTS.show_detail
const URL_RM_BOOK = LISTS.update_list

export default class BookListPage extends Component {
  
  state = {
    book_list: [],
    book_id_list: ''
  }

  componentDidMount() {
    fetchData(this.fetchList.bind(this, this.props.item.list_id))
  }

  fetchList = async (list_id) => {
    const params = { list_id }
    const response = await HttpUtils.post(URL_SHOW, params)

    if (response.status !== 0) {
      Toast.fail('获取数据异常', 1)
      return
    }

    const data = response.data
    this.setState({ book_list: data })
  }

  async onDelete(item) {
    this.state.book_list.some(async (book, i) => {
      if (book.book_id == item.book_id) {
        let list = this.props.item
        let book_id_list = this.state.book_id_list.split(',').slice(0)
        let index = book_id_list.indexOf(book.book_id + '')
        book_id_list.splice(index, 1)
        let params = {
          book_list: book_id_list.join(',') || '[]',
          list_id: list.list_id
        }
        let response = (await HttpUtils.post(URL_RM_BOOK, params)) || {}
        if (response.status === 0) {
          Toast.success('删除图书成功!', 0.5)
          this.fetchList(params.list_id)
        } else {
          Toast.offline(response.msg, 1)
        }
        return true
      }
    })
  }

  onConfirm(item) {
    Alert.alert('确认删除', '您真的要删除这本书吗?', [
      { text: '确认', onPress: this.onDelete.bind(this, item) },
      { text: '取消' }
    ])
  }

  render() {
    return (
      <View style={styles.container}>
        <CommonNav
          title={this.props.item.list_name ? this.props.item.list_name : '书单'}
        />
        <ScrollView style={styles.item_container}>
          {this.state.book_list.map((item, i) => {
            return (
              <BookCollect
                key={i}
                item={item}
                onDelete={this.onConfirm.bind(this, item)}
              />
            )
          })}
        </ScrollView>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    height: HEIGHT,
    backgroundColor: 'rgb(242,246,250)'
  },
  item_container: {
    marginTop: 8
  }
})
