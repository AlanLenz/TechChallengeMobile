import { useState } from "react";
import { Button, Text, View } from "react-native";
import { signUp, signIn, logout } from "@/firebase/auth";

export default function FirebaseAuthTest() {
  const [message, setMessage] = useState("Aguardando teste...");

  async function handleSignUp() {
    try {
      const result = await signUp(
        "teste@bytebank.com",
        "Teste123!"
      );

      setMessage(
        `Usuário criado!\nUID: ${result.user.uid}`
      );
    } catch (error) {
      setMessage(
        `Erro ao cadastrar:\n${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async function handleSignIn() {
    try {
      const result = await signIn(
        "teste@bytebank.com",
        "Teste123!"
      );

      setMessage(
        `Login realizado!\nUID: ${result.user.uid}`
      );
    } catch (error) {
      setMessage(
        `Erro no login:\n${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async function handleLogout() {
    try {
      await logout();
      setMessage("Logout realizado!");
    } catch (error) {
      setMessage(
        `Erro no logout:\n${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
      }}
    >
      <Text>{message}</Text>

      <Button title="Criar usuário" onPress={handleSignUp} />
      <Button title="Fazer login" onPress={handleSignIn} />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}