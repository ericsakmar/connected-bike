// https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=2020-10-01T00:00:00.000Z&endTime=2020-10-30T23:59:59.999Z

import { getUserCookie } from "./cookieService";

const APPLICATION = {
  detailsUrl: "https://github.com/ericsakmar/connected-bike",
  name: "Connected Bike",
  version: "1",
};

const POWER_DATA_SOURCE = {
  dataStreamName: "Connected Bike - Power",
  type: "raw",
  application: APPLICATION,
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

export const getDataSource = async (baseDataSource) => {
  const name = baseDataSource.dataStreamName;

  // check local cache
  const localDataSource = localStorage.getItem(name);
  if (localDataSource) {
    return JSON.parse(localDataSource);
  }

  // check if it already exists online
  const dataSources = await getDataSources();
  const remoteDataSource = dataSources.find((d) => d.dataStreamName === name);
  if (remoteDataSource) {
    localStorage.setItem(name, JSON.stringify(remoteDataSource));
    return remoteDataSource;
  }

  // it doesn't exist, so add it
  const newDataSource = await createDataSource(baseDataSource);
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

export const uploadDataSet = async (baseDataSource, dataSet) => {
  const dataSource = await getDataSource(baseDataSource);
  const dataSetWithId = { ...dataSet, dataSourceId: dataSource.dataStreamId };
  const url = `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dataSource.dataStreamId}/datasets/${dataSetWithId.minStartTimeNs}-${dataSetWithId.maxEndTimeNs}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify(dataSetWithId),
  });

  return res.ok;
};

export const uploadSession = async (powerData) => {
  await uploadDataSet(POWER_DATA_SOURCE, powerData);

  const startTimeMillis = Math.round(powerData.minStartTimeNs / 1000000);
  const endTimeMillis = Math.round(powerData.maxEndTimeNs / 1000000);
  const id = `${startTimeMillis}-${endTimeMillis}`;

  const session = {
    id,
    startTimeMillis,
    endTimeMillis,
    name: "Connected Bike Ride",
    description: "Connected Bike Ride",
    application: APPLICATION,
    activityType: 17, // spinning
  };

  const url = `https://www.googleapis.com/fitness/v1/users/me/sessions/${id}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: buildHeaders(),
    body: JSON.stringify(session),
  });

  return res.ok;
};
