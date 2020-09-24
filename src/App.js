import React, { useEffect, useRef, useState } from "react";
import { from, fromEvent } from "rxjs";
import {
  map,
  switchMap,
  takeWhile,
  throttleTime,
  toArray,
} from "rxjs/operators";
import "./App.css";

const observe = async (serviceId, characteristicId) => {
  let options = {
    filters: [{ services: [serviceId] }],
  };

  const device = await navigator.bluetooth.requestDevice(options);
  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(serviceId);
  const characteristic = await service.getCharacteristic(characteristicId);

  await characteristic.startNotifications();
  return fromEvent(characteristic, "characteristicvaluechanged");
};

const parseBikeData = (value) => {
  const result = {};

  result.flags = value.getUint16(0, true).toString(2);
  result.speed = value.getUint16(2, true) / 100;
  result.cadence = value.getUint16(4, true) / 2;
  result.power = value.getInt16(6, true);
  result.heartRate = value.getUint8(8, true);

  return result;
};

const watchBikeData = () => {
  return from(observe("fitness_machine", "indoor_bike_data")).pipe(
    switchMap((sub) => sub),
    map((e) => e.target.value),
    map((raw) => parseBikeData(raw))
  );
};

function App() {
  const [bikeData, setBikeData] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const bikeData$ = useRef();

  const connect = () => {
    bikeData$.current = watchBikeData();

    // to live display
    bikeData$.current.pipe(throttleTime(2000)).subscribe(setBikeData);
  };

  const record = () => setIsRecording(true);
  const stop = () => setIsRecording(false);

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
