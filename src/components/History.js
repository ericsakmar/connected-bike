import React, { useEffect, useState } from "react";
import { toDisplay } from "../services/dataTransforms";
import { getHistory } from "../services/googleFitService";
import "./History.css";
import { Session } from "./Session";

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

  if (!user || !history) {
    return null;
  }

  const sessions = history.map((session) => (
    <Session session={session} key={session.name} />
  ));

  return (
    <div className="history">
      {message && <div>{message}</div>}
      {history && sessions}
    </div>
  );
};
