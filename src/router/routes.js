/**
 * Created by cjh95414 on 2016/5/6.
 */
import React from 'react';
import {Route, IndexRoute} from 'react-router';

import App from '../components/App/App';
import SignPage from '../components/SignPage';
import BookCardPage from '../components/BookCardPage';
import UserPage from '../components/UserPage';
import UserProfile from '../components/UserProfile';
import ProfileSettings from '../components/UserProfile/Settings';
import BookDetailPage from '../components/BookDetailPage';
import Share from '../components/Share';
import AppHeader from '../components/AppHeader';
import PageHeader from '../components/PageHeader';

import store from '../stores/Store';

/**
 * @description 如果用户没有登录则重定向到登录页面
 * @param nextState
 * @param replace
 */
function redirectToLogin(nextState, replace) {
  const token = store.getState().auth.get('token');
  if (!token) {
      // 重定向到登录页面
    replace({
      pathname: '/sign',
      state: {nextPathname: nextState.location.pathname},
    });
  }
}

/**
 * 必须指定参数 props，且在 <App /> 中写上 {...props} 不然路由时，children属性传递不到 <App />组件中
 * @param props
 * @constructor
 */
const AppIndex = (props) => (
  <App header={<AppHeader />} {...props} />
);

const AppPage = (props) => (
  <App header={<PageHeader />} {...props} />
);

export default ([
  <Route component={App}>
    <Route path="/sign" component={SignPage} />
  </Route>,

  <Route path="/" component={AppIndex}>
    <IndexRoute component={BookCardPage} />
    <Route path="user" component={UserPage} onEnter={redirectToLogin} />
  </Route>,

  <Route component={AppPage}>

    <Route path="share">
      <Route path="add" component={Share} />

      <Route path="book/:id" component={BookDetailPage} />
    </Route>

    <Route path="/user">
      <Route path="profile" component={UserProfile} />
      <Route path="settings" component={ProfileSettings} />
    </Route>

  </Route>,

]);
