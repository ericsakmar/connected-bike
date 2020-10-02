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
  return json.dataSource;
};

export const getDataSource = async (name) => {
  // check local cache
  const localDataSource = localStorage.getItem(name);
  if (localDataSource) {
    return JSON.parse(localDataSource);
  }

  // check if it already exists online
  const dataSources = await getDataSources();
  const remoteDataSource = dataSources.find(
    (d) => d.dataStreamName === POWER_DATA_SOURCE.dataStreamName
  );
  if (remoteDataSource) {
    localStorage.setItem(name, JSON.stringify(remoteDataSource));
    return remoteDataSource;
  }

  // it doesn't exist, so add it
  const newDataSource = await createDataSource(POWER_DATA_SOURCE);
  localStorage.setItem(name, JSON.stringify(remoteDataSource));
  return newDataSource;
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
  return json;
};

export const uploadDataSet = async (dataSet) => {
  const dataSource = await getDataSource(POWER_DATA_SOURCE.dataStreamName);
  const dataSetWithId = { ...dataSet, dataSourceId: dataSource.dataStreamId };
  const url = `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataSource.dataStreamId}/datasets/${dataSetWithId.minStartTimeNs}-${dataSetWithId.maxEndTimeNs}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify(dataSetWithId),
  });

  return res.ok;
};
