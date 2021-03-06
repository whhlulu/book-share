/**
 * Created by cjh95414 on 2016/5/21.
 */
import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';

import {Card, CardActions, CardHeader, CardTitle, CardText} from 'material-ui/Card';
import FontIcon from 'material-ui/FontIcon';
import Divider from 'material-ui/Divider';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';

import withStyles from 'isomorphic-style-loader/lib/withStyles';

import s from './UserPage.scss';

import {connect} from 'react-redux';

class UserPage extends Component {

  static propTypes = {
    username: PropTypes.string,
    avatar: PropTypes.string,
    signature: PropTypes.string,
  };

  static defaultProps = {
    avatar: 'http://lorempixel.com/100/100/nature/',
  };

  render() {
    const style = {
      textStyle: {
        display: 'inline-block',
        width: '50%',
        margin: 0,
        padding: '16px 0',
        textAlign: 'center',
      },
      iconStyle: {
        position: 'absolute',
        top: '16px',
        right: '16px',
      },
    };

    const {username, avatar, profile} = this.props;

    return (
      <div className={s.root}>
        <Card >
          <CardHeader
            title={username}
            subtitle={profile.get('signature')}
            avatar={avatar}
          >
            <Link to="/user/profile">
              <IconButton style={style.iconStyle}>
                <ChevronRight color="#AAAAAA" />
              </IconButton>
            </Link>
          </CardHeader>

          <Divider />

          <CardText style={style.textStyle}>书籍 12</CardText>
          <CardText style={style.textStyle}>书单 5</CardText>
        </Card>

        <Paper className={s.iconContainer}>
          <FlatButton
            className={s.iconButton}
            label="书籍"
            labelPosition="after"
            icon={ <FontIcon className="material-icons">book</FontIcon> }
          />

          <FlatButton
            className={s.iconButton}
            label="书单"
            labelPosition="after"
            icon={ <FontIcon className="material-icons" color="rgba(50,100,250,0.87)">view_list</FontIcon> }
          />

          <FlatButton
            className={s.iconButton}
            label="分享"
            labelPosition="after"
            icon={ <FontIcon className="material-icons">home</FontIcon> }
          />

        </Paper>
      </div>
    );
  }
}

export default connect(state => ({
  profile: state.auth.get('profile'),
  username: state.auth.get('username'),
}))(withStyles(s)(UserPage));

export class User extends Component {
  render() {
    return (
      <div>
        {/* if at "/users/123" this will be <Profile> */}
        {/* UsersSidebar will also get <Profile> as this.props.children.
            You can pick where it renders */}
        {this.props.children}
      </div>
    )
  }
}
