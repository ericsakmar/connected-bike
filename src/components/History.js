import React, { useEffect, useRef, useState } from "react";
import { toDisplay } from "../services/dataTransforms";
import { getHistory } from "../services/googleFitService";
import "./History.css";

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
    <div className="history">
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
    <table className="history-table">
      <thead>
        <tr>
          <th>Start</th>
          <th className="number">Length</th>
          <th className="number">Power</th>
          <th className="number">Heart Rate</th>
          <th className="number">Cadence</th>
        </tr>
      </thead>

      <tbody>
        {history.map((d) => (
          <tr key={d.startTime}>
            <td>{d.startTime}</td>
            <td className="number">{d.length}</td>
            <td className="number">{d.averagePower}</td>
            <td className="number">{d.averageHeartRate}</td>
            <td className="number">{d.averageCadence}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
