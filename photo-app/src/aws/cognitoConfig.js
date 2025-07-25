import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "", // 👈 ton UserPool ID
  ClientId: "", // 👈 ton App Client ID
};

export default new CognitoUserPool(poolData);
