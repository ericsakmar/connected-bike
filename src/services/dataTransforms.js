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
    value: [{ intVal: d.heartRate }],
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
