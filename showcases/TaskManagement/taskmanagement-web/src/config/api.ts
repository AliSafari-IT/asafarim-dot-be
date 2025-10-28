import { isProduction } from "@asafarim/shared-ui-react";

export const API_BASE_URL = isProduction
  ? "https://taskmanagement.asafarim.be/api"
  : "http://taskmanagement.asafarim.local:5104/api";

export const IDENTITY_API_URL = isProduction
  ? "https://identity.asafarim.be"
  : "http://identity.asafarim.local:5101";
