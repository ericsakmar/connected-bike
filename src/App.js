import React, { useRef, useState } from "react";
import { takeWhile, throttleTime, toArray } from "rxjs/operators";
import { connect } from "./bikeDataService";
import Dashboard from "./Dashboard";
import { BluethoothIcon, PlayIcon, StopIcon } from "./Icons";
import "./App.css";

const DISCONNECTED = "disconnected";
const CONNECTED = "connected";
const RECORDING = "recording";
const STOPPED = "stopped";

function App() {
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

  return (
    <div className="app">
      <h1>connected bike</h1>

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
