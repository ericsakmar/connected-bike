import React, { useState } from "react";
import { from, fromEvent } from "rxjs";
import { map, switchMap, throttleTime } from "rxjs/operators";
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

  const start = () => {
    const bikeData$ = watchBikeData();

    // to live display
    bikeData$.pipe(throttleTime(2000)).subscribe(setBikeData);

    // to back end (takewhile and toarray)
    // bikeData$.subscribe((d) => console.log("two", d));
  };

  return (
    <div className="app">
      <h1>hello world</h1>
      <button onClick={start}>connect</button>
      <button onClick={start}>record</button>
      <button className="secondary">stop</button>

      {bikeData && <div>{JSON.stringify(bikeData)}</div>}
    </div>
  );
}

export default App;
