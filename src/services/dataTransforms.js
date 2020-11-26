import differenceInMinutes from "date-fns/differenceInMinutes";
import {
  CADENCE,
  CALORIES,
  HEART_POINTS,
  HEART_RATE,
  MOVE_MINUTES,
  POWER,
} from "./googleFitService";

const nsToMinutes = (ns) => ns / 60000000000;
const minutesToNs = (minutes) => minutes * 60000000000;
const roundNsToNearestMinute = (ns) => minutesToNs(Math.round(nsToMinutes(ns)));

const getCalories = (d) => {
  // https://gearandgrit.com/convert-watts-calories-burned-cycling/
  const hours = (d.endTimeNanos - d.startTimeNanos) / 3600000000000;
  const fromWatts = d.power * hours * 3.6;

  // https://www.verywellfit.com/what-is-bmr-or-basal-metabolic-rate-3495380
  // 88.362 + (13.397 x weight in kg) + (4.799 x height in cm) - (5.677 x age in years)
  // TODO maybe get weight/height/age from Fit???
  const dailyBmr = 88.362 + 13.397 * 77.1107 + 4.799 * 190.5 - 5.677 * 36;
  const hourlyBmr = dailyBmr / 24;
  const bmr = hourlyBmr * hours;

  return fromWatts + bmr;
};

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

const getValue = (point) => {
  if (point.value[0].fpVal !== undefined) {
    return point.value[0].fpVal;
  }

  if (point.value[0].intVal !== undefined) {
    return point.value[0].intVal;
  }

  return undefined;
};

const toDisplayPoint = (p) => ({
  startTime: Math.round(p.startTimeNanos / 1000000),
  endTime: Math.round(p.endTimeNanos / 1000000),
  value: getValue(p),
});

const average = (arr) => sum(arr) / arr.length;

const sum = (arr) =>
  arr.length ? arr.reduce((acc, d) => acc + d.value, 0) : 0;

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

export const rollUp = (acc, d) => {
  const accVal = acc.value[0];
  const dVal = d.value[0];
  const value =
    accVal.fpVal === undefined
      ? [{ intVal: accVal.intVal + dVal.intVal }]
      : [{ fpVal: accVal.fpVal + dVal.fpVal }];

  return {
    ...acc,
    value,
    endTimeNanos: d.endTimeNanos,
  };
};

export const roundTimestamps = (d) => ({
  ...d,
  startTimeNanos: roundNsToNearestMinute(d.startTimeNanos),
  endTimeNanos: roundNsToNearestMinute(d.endTimeNanos),
});

// TODO consider making `points` an object instead of an array
export const toDataSets = (points) => {
  const power = points.find((p) => p[0].dataTypeName === POWER);
  const heartRate = points.find((p) => p[0].dataTypeName === HEART_RATE);
  const cadence = points.find((p) => p[0].dataTypeName === CADENCE);
  const moveMinutes = points.find((p) => p[0].dataTypeName === MOVE_MINUTES);
  const heartPoints = points.find((p) => p[0].dataTypeName === HEART_POINTS);
  const calories = points.find((p) => p[0].dataTypeName === CALORIES);

  // const minStartTimeNs = power[0].startTimeNanos;
  // const maxEndTimeNs = power[power.length - 1].endTimeNanos;

  return [
    {
      dataSourceId: "TODO",
      minStartTimeNs: power[0].startTimeNanos,
      maxEndTimeNs: power[power.length - 1].endTimeNanos,
      point: power,
    },

    {
      dataSourceId: "TODO",
      minStartTimeNs: heartRate[0].startTimeNanos,
      maxEndTimeNs: heartRate[heartRate.length - 1].endTimeNanos,
      point: heartRate,
    },

    {
      dataSourceId: "TODO",
      minStartTimeNs: cadence[0].startTimeNanos,
      maxEndTimeNs: cadence[cadence.length - 1].endTimeNanos,
      point: cadence,
    },

    {
      dataSourceId: "TODO",
      minStartTimeNs: moveMinutes[0].startTimeNanos,
      maxEndTimeNs: moveMinutes[moveMinutes.length - 1].endTimeNanos,
      point: moveMinutes,
    },

    {
      dataSourceId: "TODO",
      minStartTimeNs: heartPoints[0].startTimeNanos,
      maxEndTimeNs: heartPoints[heartPoints.length - 1].endTimeNanos,
      point: heartPoints,
    },

    {
      dataSourceId: "TODO",
      minStartTimeNs: calories[0].startTimeNanos,
      maxEndTimeNs: calories[calories.length - 1].endTimeNanos,
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

    const moveMinutes = session.dataSets.moveMinutes.point
      .sort(sortPoint)
      .map(toDisplayPoint);

    const heartPoints = session.dataSets.heartPoints.point
      .sort(sortPoint)
      .map(toDisplayPoint);

    const calories = session.dataSets.calories.point
      .sort(sortPoint)
      .map(toDisplayPoint);

    const averagePower = Math.round(average(power));
    const averageHeartRate = Math.round(average(heartRate));
    const averageCadence = Math.round(average(cadence));
    const totalMoveMinutes = Math.round(sum(moveMinutes) / 60000);
    const totalHeartPoints = Math.round(sum(heartPoints));
    const totalCalories = Math.round(sum(calories));

    return {
      averageCadence,
      averageHeartRate,
      averagePower,
      cadence,
      heartRate,
      length,
      power,
      startTime,
      totalCalories,
      totalHeartPoints,
      totalMoveMinutes,
      name: session.session.name,
    };
  });
};
