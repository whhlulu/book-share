/**
 * Created by cjh95414 on 2016/6/11.
 */
import log4js from 'log4js';
const logger = log4js.getLogger('Model [Book]');

import {ObjectId} from 'mongodb';
import connect from '../database/db';

/* eslint-disable no-unused-expressions */
class Book {
  /**
   *
   * @param share 将要插入的数据
   * @param callback(result) 成功插入数据以后需要执行的操作,参数为插入到mongodb后返回的结果
   */
  static addShareBook(share, callback) {
    connect.then(db => {
      // 为分享默认添加一个空的评论数组
      const insertObject = Object.assign({}, share, {comments: []});

      db.collection('share_book').insertOne(insertObject, (err, result) => {
        if (err) {
          logger.error('Insert a share book into db failed.', err);
        }
        callback && callback(result);
      });
    });
  }

  /**
   * 根据页码返回对应的分页数据
   * @param page 页码 [默认为 10]
   * @param limit 一次返回的数据的个数 [默认为 10]
   * @param callback 回调函数
   */
  static getSharedBooksWithAll({page = 1, limit = 10} = {}, callback) {
    // 获得需要跳过的 documents 的个数
    const skip = page > 0 ? (page - 1) * limit : 0;
    connect.then((db) => {
      db.collection('share_book').aggregate([
        {
          $project: {
            username: true,
            bookId: true,
            bookTitle: true,
            shareTitle: true,
            shareContent: true,
            commentsCount: {$size: '$comments'},
          },
        },
      ])
      .skip(skip).limit(limit).toArray((err, documents) => {
        if (err) {
          logger.error(`Query shared books with {page: ${page}, limit: ${limit}} failed.`, err);
        }
        callback && callback(documents);
      });
    });
  }


  static getSharedBookByShareId(id, callback) {
    connect.then((db) => {
      db.collection('share_book').find({_id: new ObjectId(id)}).limit(1).next((err, book) => {
        if (err) {
          logger.error(`Query one share book with {id: ${id}} failed.`, err);
        }
        callback && callback(book);
      });
    });
  }

  static getShareBookSByUsername(username, callback) {
    connect.then((db) => {
      db.collection('share_book').find({username}).toArray((err, documents) => {
        if (err) {
          logger.error(`Query share books by "${username}" failed.`, err);
        }
        callback && callback(documents);
      });
    });
  }


  /**
   * @method
   * @description 给指定的 share 添加一条评论
   * @param shareId
   * @param commentObject 评论数据对象
   * @param callback
   */
  static addComment(shareId, commentObject, callback) {
    const comment = Object.assign({}, commentObject, {date: new Date()});
    connect.then((db) => {
      db.collection('share_book').updateOne(
        {
          _id: new ObjectId(shareId),
        },
        {
          $push: {
            comments: comment,
          },
        },
        {
          upsert: true,
        }, (err, result) => {
          if (err) {
            logger.error(`Insert a comment into {share book: ${shareId}} failed.`, err);
          }
          callback && callback(result);
        }
      );
    });
  }

}

export default Book;
