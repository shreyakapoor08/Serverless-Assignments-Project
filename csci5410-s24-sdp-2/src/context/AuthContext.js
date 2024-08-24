import React, { createContext, useEffect, useState } from "react";
import {
  CognitoUserPool,
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import axios from "axios";
import { clientId, userPoolId } from "../config";
import { USER_SIGNUP, VERIFY_USER, NOTIFICATIONS_API_URL } from "../API_URL";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [authCompleted, setAuthCompleted] = useState(false);

  const poolData = {
    UserPoolId: userPoolId,
    ClientId: clientId,
  };

  const userPool = new CognitoUserPool(poolData);

  useEffect(() => {
    const userPresent = localStorage.getItem("user");
    if (userPresent) {
      setUser(JSON.parse(userPresent));
      setAuthCompleted(JSON.parse(userPresent)?.authCompleted);
    }
  }, []);

  const loginUserCred = async (userData) => {
    setLoading(true);
    setError(null);

    const authenticationDetails = new AuthenticationDetails({
      Username: userData.email,
      Password: userData.password,
    });

    const cognitoUser = new CognitoUser({
      Username: userData.email,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: async (result) => {
        const accessToken = result.getAccessToken().getJwtToken();
        const idToken = result.getIdToken().getJwtToken();

        const base64Url = idToken.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedData = JSON.parse(atob(base64));
        const userId = decodedData.sub;

        const loggedInUser = {
          email: userData.email,
          userId: userId,
          token: accessToken,
          authCompleted: false,
        };
        setUser(loggedInUser);
        setAuthCompleted(true);
        localStorage.setItem("user", JSON.stringify(loggedInUser));

        // First API call
        const firstApiResponse = await axios.get(
          `https://6f27mgdglhu5putnpshmitx46m0cyyny.lambda-url.us-east-1.on.aws?id=${userId}`
        );
        console.log("First API Response:", firstApiResponse.data); // Log the response data

        const userRole = firstApiResponse.data?.user_role;
        if (userRole) {
          // Save the userRole in local storage
          localStorage.setItem("userRole", userRole);
          console.log("User Role saved to local storage:", userRole);
        } else {
          // Save an empty string if userRole does not exist
          localStorage.setItem("userRole", "");
          console.log(
            "User Role not found, saved empty string to local storage"
          );
        }
        if (userRole && userRole !== "property_agent") {
          const secondApiResponse = await axios.post(
            "https://us-central1-csci5410-427115.cloudfunctions.net/logUserLogin",
            { userId }
          );
          console.log("Second API Response:", secondApiResponse.data); // Log the response data
        }

        setSuccessMessage("Login Successful...Redirecting");
        setTimeout(() => {
          setSuccessMessage(false);
        }, 3000);
      },
      onFailure: (err) => {
        setError("Invalid Username or Password");
        setTimeout(() => setError(null), 5000);
      },
    });

    setLoading(false);
  };

  const signUp = async (formData) => {
    setLoading(true);

    try {
      const attributeList = [
        new CognitoUserAttribute({ Name: "email", Value: formData.email }),
      ];
      userPool.signUp(
        formData.email,
        formData.password,
        attributeList,
        null,
        async (err, result) => {
          if (err) {
            setError(err.message || JSON.stringify(err));
            setTimeout(() => setError(null), 5000);
            return;
          }

          const userId = result.userSub;

          const response = await axios.post(USER_SIGNUP, {
            userId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            securityQuestions: formData.securityQuestions.map(
              (question, index) => ({
                question: question,
                answer: formData.securityAnswers[index],
              })
            ),
            user_role: formData.user_role,
          });

          if (response.status === 200) {
            setSuccessMessage("User Registered Successfully");
            sendRegistrationNotification({
              userId: userId,
              email: formData.email,
            });
            setTimeout(() => {
              setSuccessMessage(false);
            }, 1000);
            await axios.post(VERIFY_USER, { email: formData.email });
          }
        }
      );
    } catch (error) {
      setError("Error registering user");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const sendRegistrationNotification = async (currentUser) => {
    const data = { userId: currentUser.userId, email: currentUser.email };
    await axios.post(`${NOTIFICATIONS_API_URL}/registration`, data);
  };

  const logout = () => {
    setUser(null);
    setAuthCompleted(false);
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
  };

  return (
    <AuthContext.Provider
      value={{
        authCompleted,
        setAuthCompleted,
        setUser,
        user,
        loginUserCred,
        logout,
        signUp,
        error,
        loading,
        successMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
