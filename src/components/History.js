import React, { useEffect, useRef, useState } from "react";
import { toDisplay } from "../services/dataTransforms";
import { getHistory } from "../services/googleFitService";

export const History = ({ user }) => {
  const [message, setMessage] = useState();
  const [history, setHistory] = useState();

  useEffect(() => {
    const load = async () => {
      setMessage("Loading...");
      const data = await getHistory();
      const displayData = toDisplay(data);
      setHistory(displayData);
      setMessage(null);
    };

    if (user && user.haslogin) {
      load();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div>
      {message && <div>{message}</div>}
      {history && <HistoryTable history={history} />}
    </div>
  );
};

export const HistoryTable = ({ history }) => {
  console.log(history);

  if (!history) {
    return;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Start</th>
          <th>Length</th>
          <th>Power</th>
          <th>Heart Rate</th>
          <th>Cadence</th>
        </tr>
      </thead>

      <tbody>
        {history.map((d) => (
          <tr key={d.startTime}>
            <td>{d.startTime}</td>
            <td>{d.length}</td>
            <td>{d.averagePower}</td>
            <td>{d.averageHeartRate}</td>
            <td>{d.averageCadence}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
