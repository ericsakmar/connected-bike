import React, { useRef, useState } from "react";
import {
  groupBy,
  map,
  mergeMap,
  pairwise,
  takeWhile,
  throttleTime,
  toArray,
} from "rxjs/operators";
import { connect } from "./services/bikeDataService";
import Dashboard from "./Dashboard";
import { BluethoothIcon, PlayIcon, StopIcon } from "./Icons";
import "./App.css";
import { AccountControls } from "./components/AccountControls";
import { nowNs, uploadSession } from "./services/googleFitService";
import { toDataSetPoints, toDataSets } from "./services/dataTransforms";
import { History } from "./components/History";

const DISCONNECTED = "disconnected";
const CONNECTED = "connected";
const RECORDING = "recording";
const STOPPED = "stopped";

function App() {
  const [user, setUser] = useState();
  const [activityState, setActivityState] = useState(DISCONNECTED);
  const [displayData, setDisplayData] = useState();
  // TODO find a way to not duplicate this flag
  const isRecording = useRef(false);
  const bikeData$ = useRef();
  const [message, setMessage] = useState();

  const handleConnect = () => {
    bikeData$.current = connect();
    setActivityState(CONNECTED);
    bikeData$.current.pipe(throttleTime(2000)).subscribe(setDisplayData);
  };

  const handleUpload = async (dataSets) => {
    // TODO only upload if logged in? save local otherwise?
    // TODO some kind of error handling?
    setMessage("Uploading...");
    await uploadSession(dataSets);
    setMessage("Upload complete!");
  };

  const handleRecord = () => {
    setActivityState(RECORDING);
    isRecording.current = true;

    // to the back end
    bikeData$.current
      .pipe(
        throttleTime(5000),
        map((d) => ({ ...d, startTimeNanos: nowNs() })),
        pairwise(),
        map(([p, c]) => {
          const timeDiff = c.startTimeNanos - p.startTimeNanos;
          return { ...p, endTimeNanos: p.startTimeNanos + timeDiff };
        }),
        mergeMap((d) => toDataSetPoints(d)),
        takeWhile(() => isRecording.current),
        // TODO maybe filter out zeroes here??
        groupBy((d) => d.dataTypeName),
        mergeMap((d) => d.pipe(toArray())),
        toArray(),
        map((points) => toDataSets(points))
      )
      .subscribe(handleUpload);
  };

  const handleStop = () => {
    setActivityState(STOPPED);
    isRecording.current = false;
  };

  return (
    <div className="app">
      <h1>connected bike</h1>
      {message && (
        <div>
          <span className="message">{message}</span>
        </div>
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

      <History user={user} />

      <div className="account-controls">
        <AccountControls onUserLoaded={setUser} />
      </div>
    </div>
  );
}

export default App;
