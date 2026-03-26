const getCookieName = () => process.env.AUTH_COOKIE_NAME || "auth_token";

const isProduction = process.env.NODE_ENV === "production";

const getCookieSameSite = () => {
  if (process.env.COOKIE_SAME_SITE) {
    return process.env.COOKIE_SAME_SITE;
  }

  return isProduction ? "none" : "lax";
};

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true" || isProduction,
  sameSite: getCookieSameSite(),
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/"
});

module.exports = {
  getCookieName,
  getCookieOptions
};
