export const validateEnvironmentVariables = () => {
  const requiredVars = [
    "EXPO_PUBLIC_THIRDWEB_CLIENT_ID",
    "EXPO_PUBLIC_THIRDWEB_SECRET_KEY",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error("Missing required environment variables:", missingVars);
    return {
      isValid: false,
      missingVars,
      message: `Missing environment variables: ${missingVars.join(", ")}`,
    };
  }

  return {
    isValid: true,
    missingVars: [],
    message: null,
  };
};

export const getEnvironmentInfo = () => {
  return {
    nodeEnv: process.env.NODE_ENV,
    expoPublic: process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID ? "Set" : "Not Set",
    hasThirdwebClientId: !!process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID,
    hasThirdwebSecretKey: !!process.env.EXPO_PUBLIC_THIRDWEB_SECRET_KEY,
  };
};
