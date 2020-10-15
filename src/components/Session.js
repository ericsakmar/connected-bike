import React from "react";
import { MultiChart } from "./MultiChart";
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

      <div className="stats">
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
