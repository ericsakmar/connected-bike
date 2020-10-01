import Cookies from "universal-cookie";
const cookies = new Cookies();

const USER_FIELDS = [
  "accessToken",
  "email",
  "givenName",
  "familyName",
  "imageUrl",
  "name",
  "googleId",
];

export const setUserCookie = (userData) => {
  const option = { maxAge: 3600 };
  for (const [key, value] of Object.entries(userData)) {
    cookies.set(key, value, option);
  }
};

export const getUserCookie = () => {
  const obj = {
    haslogin: false,
  };

  if (cookies.get("accessToken")) {
    obj.haslogin = true;
    USER_FIELDS.forEach((field) => {
      obj[field] = cookies.get(field) || "lorem ipsum";
    });
  }

  return obj;
};

export const deleteUserCookie = () => {
  USER_FIELDS.forEach((field) => {
    cookies.remove(field);
  });
};
