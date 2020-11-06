import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { StyleSheet, Text, Button, TextInput, SafeAreaView } from "react-native";

import Amplify, { Auth, Storage } from "aws-amplify";
import config from "./aws-exports";
Amplify.configure(config);
// Logger.LOG_LEVEL = 'DEBUG';

const APP_STATE = {
  SIGN_UP: "SIGN_UP",
  CONFIRM_SIGNUP: "CONFIRM_SIGNUP",
  SIGN_IN: "SIGN_IN",
  FORGOT_PASSWORD: "FORGOT_PASSWORD",
  FORGOT_PASSWORD_SUBMIT: "FORGOT_PASSWORD_SUBMIT",
  SIGNED_IN: "SIGNED_IN",
};

const initialformData = {
  username: "",
  email: "",
  password: "",
  code: "",
};

export default function App() {
  const [formData, setformData] = useState(initialformData);
  const [appState, setAppState] = useState(APP_STATE.SIGN_IN);
  const onChangeText = (name) => {
    return (text) => {
      setformData({ ...formData, [name]: text });
    };
  };

  const signUp = async () => {
    const { username, email, password } = formData;
    await Auth.signUp({ username, password, attributes: { email } });
    setformData(initialformData);
    setAppState(APP_STATE.CONFIRM_SIGNUP);
  };

  const confirmSignUp = async () => {
    const { username, code } = formData;
    await Auth.confirmSignUp(username, code);
    setformData(initialformData);
    setAppState(APP_STATE.SIGN_IN);
  };

  const signIn = async () => {
    const { username, password } = formData;
    await Auth.signIn(username, password);
    setformData(initialformData);
    setAppState(APP_STATE.SIGNED_IN);
  };

  const signOut = async () => {
    await Auth.signOut();
    setformData(initialformData);
    setAppState(APP_STATE.SIGN_IN);
  };

  const forgotPassword = async () => {
    const { username } = formData;
    await Auth.forgotPassword(username);
    setformData(initialformData);
    setAppState(APP_STATE.FORGOT_PASSWORD_SUBMIT);
  };

  const forgotSubmitPassword = async () => {
    const { username, code, password } = formData;
    await Auth.forgotPasswordSubmit(username, code, password);
    setformData(initialformData);
    setAppState(APP_STATE.SIGN_IN);
  };

  const listFiles = async () => {
    Storage.list("").then(console.log).catch(console.error);
  };

  const uploadFile = async () => {
    Storage.put("test.txt", "Hello")
      .then((result) => console.log(result)) // {key: "test.txt"}
      .catch((err) => console.log(err));
  };

  const getFile = async () => {
    Storage.get("mlh.pdf").then(console.log).catch(console.error);
  };

  const backButton = () => {
    return (
      <Button
        title="Back"
        onPress={() => {
          setAppState(APP_STATE.SIGN_IN);
        }}
      />
    );
  };

  const inputJSX = () => {
    const username = (
      <TextInput
        key="username"
        style={styles.input}
        autoCapitalize="none"
        placeholder="username"
        name="username"
        onChangeText={onChangeText("username")}
      ></TextInput>
    );
    const email = (
      <TextInput
        key="email"
        style={styles.input}
        autoCapitalize="none"
        placeholder="email"
        name="email"
        onChangeText={onChangeText("email")}
      ></TextInput>
    );
    const password = (
      <TextInput
        key="password"
        style={styles.input}
        autoCapitalize="none"
        placeholder="password"
        name="password"
        secureTextEntry
        onChangeText={onChangeText("password")}
      ></TextInput>
    );
    const code = (
      <TextInput
        key="code"
        style={styles.input}
        autoCapitalize="none"
        placeholder="code"
        name="code"
        secureTextEntry
        onChangeText={onChangeText("code")}
      ></TextInput>
    );
    if (appState === APP_STATE.SIGN_IN) return [username, password];
    else if (appState === APP_STATE.SIGN_UP) return [username, email, password];
    else if (appState === APP_STATE.CONFIRM_SIGNUP) return [username, code];
    else if (appState === APP_STATE.FORGOT_PASSWORD) return [username];
    else if (appState === APP_STATE.FORGOT_PASSWORD_SUBMIT) return [username, password, code];
  };

  const signInJSX = () => {
    if (appState !== APP_STATE.SIGN_IN) return undefined;
    return (
      <>
        <Text style={styles.textHeader}>Sign In</Text>
        {inputJSX()}
        <Button title="Sign In" onPress={signIn} />
        <Text style={{ marginTop: 10, marginBottom: 10, color: "grey" }}>─────── Or ───────</Text>
        <Button
          title="Sign Up"
          onPress={() => {
            setAppState(APP_STATE.SIGN_UP);
          }}
        />
        <Button
          title="Forgot Password"
          onPress={() => {
            setAppState(APP_STATE.FORGOT_PASSWORD);
          }}
        />
      </>
    );
  };

  const signUpJSX = () => {
    if (appState !== APP_STATE.SIGN_UP) return undefined;
    return (
      <>
        <Text style={styles.textHeader}>Sign Up</Text>
        {inputJSX()}
        <Button title="Sign Up" onPress={() => signUp()} />
        {backButton()}
      </>
    );
  };

  const confirmSignUpJSX = () => {
    if (appState !== APP_STATE.CONFIRM_SIGNUP) return undefined;
    return (
      <>
        <Text style={styles.textHeader}>Confirm Sign Up</Text>
        <Text>Please enter the confirmation code sent to your email.</Text>
        {inputJSX()}
        <Button title="Sign Up" onPress={() => confirmSignUp()} />
        {backButton()}
      </>
    );
  };

  const signedInJSX = () => {
    if (appState !== APP_STATE.SIGNED_IN) return undefined;
    return (
      <>
        <Text>You are signed in!</Text>
        <Button title="List Files" onPress={listFiles}></Button>
        <Button title="Upload File" onPress={uploadFile}></Button>
        <Button title="Get File" onPress={getFile}></Button>
        <Text style={{ marginTop: 10, marginBottom: 10, color: "grey" }}>─────────────────</Text>
        <Button title="Sign Out" onPress={signOut} />
      </>
    );
  };

  const forgotPasswordJSX = () => {
    if (appState !== APP_STATE.FORGOT_PASSWORD) return undefined;
    return (
      <>
        <Text style={styles.textHeader}>Reset Password</Text>
        {inputJSX()}
        <Button title="Reset Password" onPress={() => forgotPassword()} />
        {backButton()}
      </>
    );
  };

  const forgotSubmitPasswordJSX = () => {
    if (appState !== APP_STATE.FORGOT_PASSWORD_SUBMIT) return undefined;
    return (
      <>
        <Text style={styles.textHeader}>Reset password </Text>
        <Text style={{ padding: 10 }}>Please enter a new password with the confirmation code sent to your email.</Text>
        {inputJSX()}
        <Button title="Change Password" onPress={() => forgotSubmitPassword()} />
        {backButton()}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {signInJSX()}
      {signUpJSX()}
      {confirmSignUpJSX()}
      {signedInJSX()}
      {forgotPasswordJSX()}
      {forgotSubmitPasswordJSX()}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textHeader: {
    fontSize: 25,
    marginBottom: 5,
  },
  input: {
    height: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
