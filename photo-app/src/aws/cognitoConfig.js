import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "us-east-2_ATTuZs7Ih", // 👈 ton UserPool ID
  ClientId: "3vd2uoaui3bs2igm7cha9uvhc0", // 👈 ton App Client ID
};

export default new CognitoUserPool(poolData);
