import differenceInMinutes from "date-fns/differenceInMinutes";
import format from "date-fns/format";

export const toDataSetPoint = (d) => [
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
    value: [{ fpVal: d.power }],
  },
];

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
