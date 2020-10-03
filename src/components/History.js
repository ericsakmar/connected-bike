import React, { useEffect, useRef, useState } from "react";
import { getHistory } from "../services/googleFitService";

export const History = ({ user }) => {
  const [message, setMessage] = useState();
  const [data, setData] = useState();

  useEffect(() => {
    const load = async () => {
      setMessage("Loading...");
      const history = await getHistory();
      console.log(history);
      setMessage(null);
    };

    if (user && user.haslogin) {
      load();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return <div>{message && <div>{message}</div>}</div>;
};
