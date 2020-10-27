import React from "react";
import format from "date-fns/format";
import { MultiChart } from "./MultiChart";
import "./Session.css";

const Emoji = ({ symbol }) => (
  <span className="emoji" role="img" aria-hidden="true">
    {symbol}
  </span>
);

export const Session = ({ session }) => {
  const day = format(session.startTime, "EEEE");
  const dateAndTime = format(session.startTime, "MMMM d 'at' h:mm aaaa");

  const heartRateChartData = session.heartRate.filter((_d, i) => i % 10 === 0);
  const powerChartData = session.power.filter((_d, i) => i % 10 === 0);
  const cadenceChartData = session.cadence.filter((_d, i) => i % 10 === 0);

  return (
    <div className="session">
      <div className="session-header-container">
        <h2 className="session-header">{day}</h2>
        <h3 className="session-subheader label">{dateAndTime}</h3>
      </div>

      <div className="stats">
        <div className="totals">
          <div className="total">
            <Emoji symbol="⏰" />
            {session.length}
            <span className="label"> min</span>
          </div>

          <div className="total">
            <Emoji symbol="🔥" />
            {session.totalCalories}
            <span className="label"> cal</span>
          </div>

          <div className="total">
            <Emoji symbol="😅" />️{session.totalHeartPoints}
            <span className="label"> heart pts</span>
          </div>

          <div className="total">
            <Emoji symbol="❤️" />
            {session.averageHeartRate}
            <span className="label"> avg bpm</span>
          </div>

          <div className="total">
            <Emoji symbol="⚡" />️{session.averagePower}
            <span className="label"> avg watts</span>
          </div>

          <div className="total">
            <Emoji symbol="🔄️" />
            {session.averageCadence}
            <span className="label"> avg rpm</span>
          </div>
        </div>

        <div className="charts">
          <div className="chart">
            <MultiChart
              heartRate={heartRateChartData}
              power={powerChartData}
              cadence={cadenceChartData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
