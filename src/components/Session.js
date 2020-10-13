import React from "react";
import { LineChart } from "./LineChart";
import "./Session.css";

const Emoji = ({ symbol }) => (
  <span className="emoji" role="img" aria-hidden="true">
    {symbol}
  </span>
);

export const Session = ({ session }) => {
  const heartRateChartData = session.heartRate.filter((_d, i) => i % 10 === 0);
  const powerChartData = session.power.filter((_d, i) => i % 10 === 0);
  const cadenceChartData = session.cadence.filter((_d, i) => i % 10 === 0);

  return (
    <div className="session">
      <h2>{session.startTime}</h2>

      <div className="totals">
        <div className="total">
          <Emoji symbol="🔥" />
          {session.totalCalories}
          <span className="label"> kcal</span>
        </div>

        <div className="total">
          <Emoji symbol="⏰" />
          {session.totalMoveMinutes}
          <span className="label"> minutes</span>
        </div>

        <div className="total">
          <Emoji symbol="❤" />️{session.totalHeartPoints}
          <span className="label"> points</span>
        </div>

        <div className="total">
          <Emoji symbol="💓️" />
          {session.averageHeartRate}
          <span className="label"> bpm</span>
        </div>

        <div className="total">
          <Emoji symbol="⚡" />️{session.averagePower}
          <span className="label"> watts</span>
        </div>

        <div className="total">
          <Emoji symbol="🔄️" />
          {session.averageCadence}
          <span className="label"> rpm</span>
        </div>
      </div>

      <div className="charts">
        <div className="chart">
          <h3>Heart Rate</h3>
          <LineChart data={heartRateChartData} color="red" />
        </div>

        <div className="chart">
          <h3>Power</h3>
          <LineChart data={powerChartData} color="green" />
        </div>

        <div className="chart">
          <h3>Cadence</h3>
          <LineChart data={cadenceChartData} color="yellow" />
        </div>
      </div>
    </div>
  );
};
