import React, { useRef, useState } from "react";
import {
  map,
  scan,
  switchMap,
  takeWhile,
  throttleTime,
  toArray,
} from "rxjs/operators";
import { connect } from "./bikeDataService";
import Dashboard from "./Dashboard";
import "./App.css";
import { of, merge, zip } from "rxjs";
import { BluethoothIcon, PlayIcon, StopIcon } from "./Icons";

function App() {
  const [displayData, setDisplayData] = useState();
  const isRecording = useRef(false);
  const bikeData$ = useRef();

  const handleConnect = () => {
    bikeData$.current = connect();
    bikeData$.current.pipe(throttleTime(2000)).subscribe(setDisplayData);

    // averages
    bikeData$.current
      .pipe(
        map((d) => d.heartRate),
        scan(
          (acc, cur) => {
            const count = acc.count + 1;
            const sum = acc.sum + cur;
            const average = sum / count;
            return { count, sum, average };
          },
          {
            count: 0,
            sum: 0,
            average: 0,
          }
        ),
        map((d) => d.average)
      )
      .subscribe((d) => console.log(d));
  };

  const handleRecord = () => {
    isRecording.current = true;

    // to the back end
    bikeData$.current
      .pipe(
        takeWhile(() => isRecording.current),
        toArray()
      )
      .subscribe((d) => console.log(d));
  };

  const handleStop = () => (isRecording.current = false);

  return (
    <div className="app">
      <h1>connected bike</h1>

      <button onClick={handleConnect}>
        <BluethoothIcon />
      </button>

      <button onClick={handleRecord}>
        <PlayIcon />
      </button>

      <button onClick={handleStop}>
        <StopIcon />
      </button>

      {displayData && <Dashboard data={displayData} />}
    </div>
  );
}

export default App;
