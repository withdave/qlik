import "dotenv/config";
import { auth } from "@qlik/api";

const { TENANT_HOST, CLIENT_ID, CLIENT_SECRET } = process.env;

if (!TENANT_HOST || !CLIENT_ID || !CLIENT_SECRET) {
  throw new Error("Missing TENANT_HOST, CLIENT_ID or CLIENT_SECRET - copy .env.example to .env and fill it in");
}

auth.setDefaultHostConfig({
  host: TENANT_HOST,
  authType: "oauth2",
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});
