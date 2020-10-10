import differenceInMinutes from "date-fns/differenceInMinutes";
import format from "date-fns/format";
import {
  CADENCE,
  CALORIES,
  HEART_POINTS,
  HEART_RATE,
  MOVE_MINUTES,
  POWER,
} from "./googleFitService";

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

  // TODO add bmr
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

export const toDataSetPoints = (d) => [
  // https://developers.google.com/fit/datatypes/activity#power
  {
    dataTypeName: POWER,
    originDataSourceId: "", // ???
    startTimeNanos: d.startTimeNanos,
    endTimeNanos: d.endTimeNanos,
    value: [{ fpVal: d.power }],
  },

  // https://developers.google.com/fit/datatypes/body#heart_rate
  {
    dataTypeName: HEART_RATE,
    originDataSourceId: "", // ???
    startTimeNanos: d.startTimeNanos,
    endTimeNanos: d.endTimeNanos,
    value: [{ fpVal: d.heartRate }],
  },

  // https://developers.google.com/fit/datatypes/activity#cycling_pedaling_cadence
  {
    dataTypeName: CADENCE,
    originDataSourceId: "", // ???
    startTimeNanos: d.startTimeNanos,
    endTimeNanos: d.endTimeNanos,
    value: [{ fpVal: d.cadence }],
  },

  {
    dataTypeName: MOVE_MINUTES,
    originDataSourceId: "",
    startTimeNanos: d.startTimeNanos,
    endTimeNanos: d.endTimeNanos,
    value: [{ intVal: getMoveMinutes(d) }],
  },

  {
    dataTypeName: HEART_POINTS,
    originDataSourceId: "",
    startTimeNanos: d.startTimeNanos,
    endTimeNanos: d.endTimeNanos,
    value: [{ fpVal: getHeartPoints(d) }],
  },

  {
    dataTypeName: CALORIES,
    originDataSourceId: "",
    startTimeNanos: d.startTimeNanos,
    endTimeNanos: d.endTimeNanos,
    value: [{ fpVal: getCalories(d) }],
  },
];

export const toDataSets = (points) => {
  const power = points.find((p) => p[0].dataTypeName === POWER);
  const heartRate = points.find((p) => p[0].dataTypeName === HEART_RATE);
  const cadence = points.find((p) => p[0].dataTypeName === CADENCE);
  const moveMinutes = points.find((p) => p[0].dataTypeName === MOVE_MINUTES);
  const heartPoints = points.find((p) => p[0].dataTypeName === HEART_POINTS);
  const calories = points.find((p) => p[0].dataTypeName === CALORIES);

  const minStartTimeNs = power[0].startTimeNanos;
  const maxEndTimeNs = power[power.length - 1].endTimeNanos;

  return [
    {
      dataSourceId: "TODO",
      maxEndTimeNs,
      minStartTimeNs,
      point: power,
    },

    {
      dataSourceId: "TODO",
      maxEndTimeNs,
      minStartTimeNs,
      point: heartRate,
    },

    {
      dataSourceId: "TODO",
      maxEndTimeNs,
      minStartTimeNs,
      point: cadence,
    },

    {
      dataSourceId: "TODO",
      maxEndTimeNs,
      minStartTimeNs,
      point: moveMinutes,
    },

    {
      dataSourceId: "TODO",
      maxEndTimeNs,
      minStartTimeNs,
      point: heartPoints,
    },

    {
      dataSourceId: "TODO",
      maxEndTimeNs,
      minStartTimeNs,
      point: calories,
    },
  ];
};

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
