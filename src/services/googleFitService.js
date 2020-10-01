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
