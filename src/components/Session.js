import React from "react";
import "./Session.css";

export const Session = ({ session }) => {
  return (
    <div className="session">
      <h2>{session.startTime}</h2>

      <div className="totals">
        <div className="total">{session.totalCalories} calories</div>
        <div className="total">{session.totalMoveMinutes} move minutes</div>
        <div className="total">{session.totalHeartPoints} heart points</div>
      </div>

      <div className="charts">
        <div className="chart">{session.averageHeartRate}</div>
        <div className="chart">{session.averagePower}</div>
        <div className="chart">{session.averageCadence}</div>
      </div>
    </div>
  );
};
