import React, { Component } from "react";
import { connect } from "react-redux";
import { socialAuthUser } from "../redux/users";
import { getCookie } from "../helper";

class SocialAuthRedirect extends Component {
  componentWillMount() {
    const { dispatch, history } = this.props;
    dispatch(
      socialAuthUser(getCookie("auth"), () => {
        document.cookie =
          "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        history.push("/");
      })
    );
  }

  render() {
    return <div />;
  }
}

SocialAuthRedirect = connect()(SocialAuthRedirect);

export default SocialAuthRedirect;