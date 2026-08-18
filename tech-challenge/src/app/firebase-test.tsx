import { Text, View } from "react-native";
import { getFirebaseApp } from "@/firebase/config";

export default function FirebaseTest() {
  let status = "";

  try {
    const app = getFirebaseApp();
    status = `Firebase conectado!\nProjeto: ${app.options.projectId}`;
  } catch (error) {
    status = `Erro no Firebase:\n${error instanceof Error ? error.message : String(error)}`;
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{status}</Text>
    </View>
  );
}