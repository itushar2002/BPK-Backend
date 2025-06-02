import { auth } from "express-oauth2-jwt-bearer";

const jwtCheck = auth({
  audience: "https://api.bhopalpropertyking.com",  // <-- Update this to your new API Identifier
  issuerBaseURL: "https://dev-0zoy7it3pf1rqnr4.us.auth0.com",
  tokenSigningAlg: "RS256",
});

export default jwtCheck;
