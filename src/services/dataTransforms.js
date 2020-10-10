import differenceInMinutes from "date-fns/differenceInMinutes";
import format from "date-fns/format";

export const toDataSetPoints = (d) => [
  // https://developers.google.com/fit/datatypes/activity#power
  {
    dataTypeName: "com.google.power.sample",
    originDataSourceId: "", // ???
    startTimeNanos: d.startTimeNanos,
    endTimeNanos: d.endTimeNanos,
    value: [{ fpVal: d.power }],
  },

  // https://developers.google.com/fit/datatypes/body#heart_rate
  {
    dataTypeName: "com.google.heart_rate.bpm",
    originDataSourceId: "", // ???
    startTimeNanos: d.startTimeNanos,
    endTimeNanos: d.endTimeNanos,
    value: [{ fpVal: d.heartRate }],
  },

  // https://developers.google.com/fit/datatypes/activity#cycling_pedaling_cadence
  {
    dataTypeName: "com.google.cycling.pedaling.cadence",
    originDataSourceId: "", // ???
    startTimeNanos: d.startTimeNanos,
    endTimeNanos: d.endTimeNanos,
    value: [{ fpVal: d.cadence }],
  },

  {
    dataTypeName: "com.google.active_minutes",
    originDataSourceId: "",
    startTimeNanos: d.startTimeNanos,
    endTimeNanos: d.endTimeNanos,
    value: [{ intVal: getMoveMinutes(d) }],
  },

  {
    dataTypeName: "com.google.heart_minutes",
    originDataSourceId: "",
    startTimeNanos: d.startTimeNanos,
    endTimeNanos: d.endTimeNanos,
    value: [{ fpVal: getHeartPoints(d) }],
  },

  {
    dataTypeName: "com.google.calories.expended",
    originDataSourceId: "",
    startTimeNanos: d.startTimeNanos,
    endTimeNanos: d.endTimeNanos,
    value: [{ fpVal: getCalories(d) }],
  },
];

const getCalories = (d) => {
  // // https://www.youtube.com/watch?v=U_ox319Z8og
  // const watts = d.power;
  // const kw = watts / 1000;
  // const hours = (d.endTimeNanos - d.startTimeNanos) / 3600000000000;
  // const kwh = kw * hours;
  // const kcal = kwh * 860;
  // return kcal;

  // https://gearandgrit.com/convert-watts-calories-burned-cycling/
  const hours = (d.endTimeNanos - d.startTimeNanos) / 3600000000000;
  return d.power * hours * 3.6;
};

// Fit calls this "minutes", but it's really milliseconds
const getMoveMinutes = (d) => {
  if (d.cadence === 0) {
    return 0;
  }

  const ms = Math.round((d.endTimeNanos - d.startTimeNanos) / 1000000);

  return ms;
};

const getHeartPoints = (d) => {
  // TODO get from Fit???
  const age = 36;

  // https://www.cdc.gov/physicalactivity/basics/measuring/heartrate.htm
  const maxHeartRate = 220 - age;

  // https://developers.google.com/fit/datatypes/activity#heart_points
  const isHighIntensity = d.heartRate > maxHeartRate * 0.7;
  const isMidIntensity = d.heartRate > maxHeartRate * 0.5;

  const heartPointsPerMinute = isHighIntensity ? 2 : isMidIntensity ? 1 : 0;
  const minutes = (d.endTimeNanos - d.startTimeNanos) / 60000000000;
  const heartPoints = heartPointsPerMinute * minutes;

  return heartPoints;
};

export const toDataSource = ([powerPoints, heartRatePoints, cadencePoints]) => {
  const minStartTimeNs = powerPoints[0].startTimeNanos;
  const maxEndTimeNs = powerPoints[powerPoints.length - 1].endTimeNanos;

  return [
    {
      dataSourceId: "TODO",
      maxEndTimeNs,
      minStartTimeNs,
      point: powerPoints,
    },

    {
      dataSourceId: "TODO",
      maxEndTimeNs,
      minStartTimeNs,
      point: heartRatePoints,
    },

    {
      dataSourceId: "TODO",
      maxEndTimeNs,
      minStartTimeNs,
      point: cadencePoints,
    },
  ];
};

const sortPoint = (a, b) => a.startTimeNanos - b.startTimeNanos;
const toDisplayPoint = (p) => ({
  startTime: Math.round(p.startTimeNanos / 1000000),
  endTime: Math.round(p.endTimeNanos / 1000000),
  value: p.value[0].fpVal,
});
const average = (arr) =>
  arr.length
    ? Math.round(arr.reduce((acc, d) => acc + d.value, 0) / arr.length)
    : 0;

export const toDisplay = (sessions) => {
  return sessions.map((session) => {
    const startTime = new Date(parseInt(session.session.startTimeMillis, 10));
    const endTime = new Date(parseInt(session.session.endTimeMillis, 10));
    const length = differenceInMinutes(endTime, startTime);

    const power = session.dataSets.power.point
      .sort(sortPoint)
      .map(toDisplayPoint);

    const heartRate = session.dataSets.heartRate.point
      .sort(sortPoint)
      .map(toDisplayPoint);

    const cadence = session.dataSets.cadence.point
      .sort(sortPoint)
      .map(toDisplayPoint);

    const averagePower = average(power);
    const averageHeartRate = average(heartRate);
    const averageCadence = average(cadence);

    return {
      averageCadence,
      averageHeartRate,
      averagePower,
      cadence,
      heartRate,
      length,
      power,
      name: session.session.name,
      startTime: format(startTime, "EEE, MMM d 'at' h:mm aaaa"),
    };
  });
};
