import React, { useEffect, useRef, useState } from "react";
import { takeWhile, toArray } from "rxjs/operators";
import "./App.css";
import { useBikeData } from "./useBikeData";

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const { bikeData, connect } = useBikeData();

  const record = () => setIsRecording(true);
  const stop = () => setIsRecording(false);

  /*
  useEffect(() => {
    if (!isRecording) {
      return;
    }

    // to the back end
    bikeData$.current
      .pipe(
        takeWhile(() => isRecording),
        toArray()
      )
      .subscribe((d) => console.log(d));
  }, [isRecording]);
  */

  return (
    <div className="app">
      <h1>hello world</h1>
      <button onClick={connect}>connect</button>
      <button onClick={record}>record</button>
      <button onClick={stop} className="secondary">
        stop
      </button>

      {bikeData && <div>{JSON.stringify(bikeData)}</div>}
    </div>
  );
}

export default App;
