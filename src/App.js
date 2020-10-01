import React, { useEffect, useRef, useState } from "react";
import {
  groupBy,
  map,
  mergeMap,
  scan,
  switchMap,
  takeWhile,
  throttleTime,
  toArray,
} from "rxjs/operators";
import { connect } from "./services/bikeDataService";
import Dashboard from "./Dashboard";
import { BluethoothIcon, PlayIcon, StopIcon } from "./Icons";
import "./App.css";
import { AccountControls } from "./components/AccountControls";
import { of, zip } from "rxjs";
import { nowNs } from "./services/googleFitService";

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
        // adds startTime
        map((d) => ({ ...d, startTimeNanos: nowNs() })),

        // to points
        mergeMap((d) => [
          // https://developers.google.com/fit/datatypes/activity#power
          {
            dataTypeName: "com.google.power.sample",
            startTimeNanos: d.startTimeNanos,
            value: [{ fpVal: d.power }],
          },

          // https://developers.google.com/fit/datatypes/body#heart_rate
          {
            dataTypeName: "com.google.heart_rate.bpm",
            startTimeNanos: d.startTimeNanos,
            value: [{ intVal: d.heartRate }],
          },

          // https://developers.google.com/fit/datatypes/activity#cycling_pedaling_cadence
          {
            dataTypeName: "com.google.cycling.pedaling.cadence",
            startTimeNanos: d.startTimeNanos,
            value: [{ fpVal: d.power }],
          },
        ]),

        // stop
        takeWhile(() => isRecording.current),
        // groupBy((d) => d.dataTypeName),
        // switchMap((d) => d.pipe(toArray())),
        toArray()
      )
      .subscribe((d) => console.log(d));
  };

  const handleStop = () => {
    setActivityState(STOPPED);
    isRecording.current = false;
  };

  // TODO fetch data when we have a user
  useEffect(() => {
    if (user) {
      // TODO
    }
  }, [user]);

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

      <div className="account-controls">
        <AccountControls onUserLoaded={setUser} />
      </div>
    </div>
  );
}

export default App;
