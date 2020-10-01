// https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=2020-09-01T00:00:00.000Z&endTime=2020-09-30T23:59:59.999Z

import { getUserCookie } from "./cookieService";

const POWER_DATA_SOURCE = {
  dataStreamName: "Connected Bike - Power",
  type: "raw",
  application: {
    detailsUrl: "https://github.com/ericsakmar/connected-bike",
    name: "Connected Bike",
    version: "1",
  },
  dataType: {
    name: "com.google.power.sample",
  },
  device: {
    manufacturer: "Eric Sakmar",
    model: "Web App",
    type: "unknown",
    uid: "2112",
    version: "1.0",
  },
};

const buildHeaders = () => {
  const user = getUserCookie();

  return new Headers({
    Authorization: `Bearer ${user.accessToken}`,
  });
};

export const nowNs = () =>
  (window.performance.now() + window.performance.timeOrigin) * 1000000;

export const getDataSources = async () => {
  const res = await fetch(
    "https://www.googleapis.com/fitness/v1/users/me/dataSources",
    {
      method: "GET",
      headers: buildHeaders(),
    }
  );

  const json = await res.json();
  console.log(json);

  return json.dataSource;
};

export const getDataSource = async (name) => {
  // check if it already exists
  const dataSources = await getDataSources();
  const dataSource = dataSources.find(
    (d) => d.dataStreamName === POWER_DATA_SOURCE.dataStreamName
  );

  if (dataSource) {
    console.log("exists");
    return dataSource;
  }

  // it doesn't exist, so add it
  console.log("creating");
  return await createDataSource(POWER_DATA_SOURCE);
};

export const uploadDataSet = async (dataSet) => {
  const dataSource = await getDataSource(POWER_DATA_SOURCE.dataStreamName);
  console.log(dataSource);
};

export const createDataSource = async (dataSource) => {
  const res = await fetch(
    "https://www.googleapis.com/fitness/v1/users/me/dataSources",
    {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(dataSource),
    }
  );

  const json = await res.json();
  console.log(json);
  return json;
};
