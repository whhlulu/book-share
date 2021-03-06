/**
 * Created by cjh95414 on 2016/5/21.
 */
import React, {Component} from 'react';
import {Link} from 'react-router';

import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import FontIcon from 'material-ui/FontIcon';
import Divider from 'material-ui/Divider';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import {grey300, grey400} from 'material-ui/styles/colors';
import {Tabs, Tab} from 'material-ui/Tabs';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as accountsActions from '../../actions/Accounts';

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './UserProfile.scss';
import LoadingOverlay from '../common/LoadingOverlay';

import avatar from '../../public/img/avatar.png';

const iconButtonElement = (
  <IconButton
    touch
    tooltip="more"
    tooltipPosition="bottom-left"
  >
    <MoreVertIcon color={grey400} />
  </IconButton>
);

const rightIconMenu = (
  <IconMenu iconButtonElement={iconButtonElement}>
    <MenuItem>删除</MenuItem>
  </IconMenu>
);

class UserProfile extends Component {

  constructor(props) {
    super(props);

    this.state = {
      tab: 0,
    };
  }

  componentDidMount() {
    const {actions, username, books} = this.props;

    if (!books.size) {
      actions.fetchUserBooks(username);
    }
  }

  handleTabChange = (value) => {
    this.setState({
      tab: value,
    });
  };

  render() {
    const {books, isLoading, profile} = this.props;

    const bookList = books.map((book, index) => {
      const shareTitle = book.get('shareTitle');
      const bookTitle = book.get('bookTitle');
      const shareContent = book.get('shareContent');

      const primaryText = (
        <p className={s.shareTitle}>
          <Link to={{pathname: `/share/book/${book.get('_id')}`, state: {book}}}>{shareTitle}</Link>
          <span style={{color: grey300, fontSize: '0.5rem'}}> - {bookTitle}</span>
        </p>
      );

      const secondaryText = (
        <p>
          {shareContent ? shareContent.substr(0, 50) : '加载中...'}
        </p>
      );
      return [(
        <ListItem
          key={index}
          secondaryTextLines={1}
          leftIcon={<FontIcon className="material-icons">book</FontIcon>}
          rightIconButton={rightIconMenu}
          primaryText={primaryText}
          secondaryText={secondaryText}
        />
      ),
        <Divider inset />,
      ];
    }).toJS();

    return (
      <div className={s.root}>

        <div className={s.avatarContainer}>

          <div className={s.avatar}>
            <img src={avatar} alt="avatar" />
          </div>

          <div className={s.textContainer}>
            <p className={s.text}>{profile.get('signature')}</p>
          </div>

          <div className={s.editButton}>
            <Link to="/user/settings">
              <RaisedButton
                label="编辑"
                labelPosition="before"
                primary
              />
            </Link>
          </div>

        </div>

        <Tabs
          value={this.state.tab}
          onChange={this.handleTabChange}
        >
          <Tab
            value={0}
            icon={<FontIcon className="material-icons">share</FontIcon>}
          >
            <List>
              <Subheader>{books.size} 个分享</Subheader>
              {bookList}
            </List>
          </Tab>

          <Tab
            value={1}
            icon={<FontIcon className="material-icons">favorite</FontIcon>}
          >
            {null}
          </Tab>
        </Tabs>

        <LoadingOverlay show={isLoading} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isLoading: state.accounts.getIn(['books', 'isLoading']),
    books: state.accounts.getIn(['books', 'data']),
    profile: state.auth.get('profile'),
    username: state.auth.get('username'),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Object.assign({}, accountsActions), dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(s)(UserProfile));
