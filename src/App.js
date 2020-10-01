import React, { useEffect, useRef, useState } from "react";
import { takeWhile, throttleTime, toArray } from "rxjs/operators";
import { connect } from "./bikeDataService";
import Dashboard from "./Dashboard";
import { BluethoothIcon, PlayIcon, StopIcon } from "./Icons";
import "./App.css";
import GoogleLogin from "react-google-login";
import { getUserCookie, setUserCookie } from "./cookieService";

const DISCONNECTED = "disconnected";
const CONNECTED = "connected";
const RECORDING = "recording";
const STOPPED = "stopped";

const CLIENT_ID =
  "820607331638-nlfao9asjhioq5uvtumes90brq5akpd0.apps.googleusercontent.com";

function App() {
  const [user, setUser] = useState();
  const [activityState, setActivityState] = useState(DISCONNECTED);
  const [displayData, setDisplayData] = useState();
  // TODO find a way to not duplicate this flag
  const isRecording = useRef(false);
  const bikeData$ = useRef();

  const handleConnect = () => {
    bikeData$.current = connect();
    setActivityState(CONNECTED);
    bikeData$.current.pipe(throttleTime(2000)).subscribe(setDisplayData);
  };

  const handleRecord = () => {
    setActivityState(RECORDING);
    isRecording.current = true;

    // to the back end
    bikeData$.current
      .pipe(
        takeWhile(() => isRecording.current),
        toArray()
      )
      .subscribe((d) => console.log(d));
  };

  const handleStop = () => {
    setActivityState(STOPPED);
    isRecording.current = false;
  };

  const handleLogin = (response) => {
    if (response.wc.access_token) {
      setUser({
        ...response.profileObj,
        haslogin: true,
        accessToken: response.wc.access_token,
      });
    }

    setUserCookie({
      ...response.profileObj,
      accessToken: response.wc.access_token,
    });
  };

  const handleLoginFailure = (response) => console.log(response);

  useEffect(() => {
    const userCookie = getUserCookie();

    if (userCookie.haslogin) {
      setUser({
        ...userCookie,
      });
    }
  }, []);

  const loggedIn = user && user.haslogin;

  return (
    <div className="app">
      <h1>connected bike</h1>

      {!loggedIn && (
        <GoogleLogin
          clientId={CLIENT_ID}
          buttonText="Login"
          onSuccess={handleLogin}
          onFailure={handleLoginFailure}
          cookiePolicy="single_host_origin"
          responseType="code,token"
          scope="https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.activity.write"
        />
      )}

      {activityState === DISCONNECTED && (
        <button onClick={handleConnect}>
          <BluethoothIcon />
        </button>
      )}

      {(activityState === CONNECTED || activityState === STOPPED) && (
        <button onClick={handleRecord}>
          <PlayIcon />
        </button>
      )}

      {activityState === RECORDING && (
        <button onClick={handleStop}>
          <StopIcon />
        </button>
      )}

      {displayData && <Dashboard data={displayData} />}
    </div>
  );
}

export default App;
