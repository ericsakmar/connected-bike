import React, { useEffect, useState } from "react";
import GoogleLogin from "react-google-login";
import { getUserCookie, setUserCookie } from "../services/cookieService";

const CLIENT_ID =
  "820607331638-nlfao9asjhioq5uvtumes90brq5akpd0.apps.googleusercontent.com";

export const AccountControls = ({ onUserLoaded }) => {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = (response) => {
    if (response.wc.access_token) {
      onUserLoaded({
        ...response.profileObj,
        haslogin: true,
        accessToken: response.wc.access_token,
      });
      setLoggedIn(true);
    }

    setUserCookie({
      ...response.profileObj,
      accessToken: response.wc.access_token,
    });
  };

  const handleLoginFailure = (response) => console.log(response);

  // checks for user info in cookies
  useEffect(() => {
    const userCookie = getUserCookie();

    if (userCookie.haslogin) {
      onUserLoaded({
        ...userCookie,
      });
      setLoggedIn(true);
    }
  }, [onUserLoaded]);

  if (loggedIn) {
    return <div> LOG OUT</div>;
  }

  return (
    <GoogleLogin
      clientId={CLIENT_ID}
      buttonText="Login"
      onSuccess={handleLogin}
      onFailure={handleLoginFailure}
      cookiePolicy="single_host_origin"
      responseType="code,token"
      scope="https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.activity.write"
    />
  );
};
