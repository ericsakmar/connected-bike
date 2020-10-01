// https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=2020-09-01T00:00:00.000Z&endTime=2020-09-30T23:59:59.999Z
export const nowNs = () =>
  (window.performance.now() + window.performance.timeOrigin) * 1000000;

export const getDataSources = async (accessToken) => {
  // https://www.googleapis.com/fitness/v1/users/me/dataSources

  const res = await fetch(
    "https://www.googleapis.com/fitness/v1/users/me/dataSources",
    {
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${accessToken}`,
      }),
    }
  );

  const json = await res.json();
  console.log(json);

  return json;
};
