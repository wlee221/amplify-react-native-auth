import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { StyleSheet, Text, Button, TextInput, SafeAreaView } from "react-native";

import { Amplify } from "@aws-amplify/core";
import { Auth } from "@aws-amplify/auth";
import { Storage } from "@aws-amplify/storage";

import config from "./aws-exports";
Amplify.configure(config);
Auth.configure(config);
Storage.configure(config);

const APP_STATE = {
  SIGN_UP: "SIGN_UP",
  CONFIRM_SIGNUP: "CONFIRM_SIGNUP",
  SIGN_IN: "SIGN_IN",
  SIGNED_IN: "SIGNED_IN",
};

const initialformData = {
  username: "",
  email: "",
  password: "",
  code: "",
};

const filename = "test.txt";

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

  const listFiles = async () => {
    Storage.list("").then(console.log).catch(console.error);
  };

  const uploadFile = async () => {
    Storage.put(filename, "Hello")
      .then((result) => console.log(result)) // {key: "test.txt"}
      .catch((err) => console.log(err));
  };

  const getFile = async () => {
    Storage.get(filename).then(console.log).catch(console.error);
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

  return (
    <SafeAreaView style={styles.container}>
      {signInJSX()}
      {signUpJSX()}
      {confirmSignUpJSX()}
      {signedInJSX()}
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
