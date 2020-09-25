import React, { useRef, useState } from "react";
import { takeWhile, throttleTime, toArray } from "rxjs/operators";
import { connect } from "./bikeDataService";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
  const [displayData, setDisplayData] = useState();
  const isRecording = useRef(false);
  const bikeData$ = useRef();

  const handleConnect = () => {
    bikeData$.current = connect();
    bikeData$.current.pipe(throttleTime(2000)).subscribe(setDisplayData);
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
      <h1>hello world</h1>
      <button onClick={handleConnect}>connect</button>
      <button onClick={handleRecord}>record</button>
      <button onClick={handleStop} className="secondary">
        stop
      </button>

      {displayData && <Dashboard data={displayData} />}
    </div>
  );
}

export default App;
