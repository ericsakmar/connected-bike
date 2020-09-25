import { useRef, useState } from "react";
import { throttleTime } from "rxjs/operators";
import { connect } from "./bikeDataService";

export const useBikeData = () => {
  const [bikeData, setBikeData] = useState();
  const bikeData$ = useRef();

  return {
    bikeData,
    connect() {
      bikeData$.current = connect();
      bikeData$.current.pipe(throttleTime(2000)).subscribe(setBikeData);
    },
  };
};
