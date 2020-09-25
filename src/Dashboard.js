import React from "react";
import "./Dashboard.css";

const Dashboard = ({ data }) => {
  return (
    <div className="dashboard">
      <Meter label="kmph" value={data.speed} />
      <Meter label="rpm" value={data.cadence} />
      <Meter label="watts" value={data.power} />
      <Meter label="bpm" value={data.heartRate} />
    </div>
  );
};

const Meter = ({ label, value }) => {
  return (
    <div className="meter">
      <div className="value">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
};

export default Dashboard;
