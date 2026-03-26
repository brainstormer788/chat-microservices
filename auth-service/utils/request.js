const parseCookies = (cookieHeader = "") =>
  cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf("=");
      if (separatorIndex === -1) {
        return cookies;
      }

      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();

      if (key) {
        cookies[key] = decodeURIComponent(value);
      }

      return cookies;
    }, {});

const getTokenFromRequest = (req) => {
  const cookieName = process.env.AUTH_COOKIE_NAME || "auth_token";
  const cookies = parseCookies(req.headers.cookie || "");

  if (cookies[cookieName]) {
    return cookies[cookieName];
  }

  const headerToken = req.headers.authorization || "";
  if (headerToken.startsWith("Bearer ")) {
    return headerToken.slice(7);
  }

  return headerToken || null;
};

module.exports = {
  parseCookies,
  getTokenFromRequest
};
