import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface DDDResponse {
  state: string;
  cities: string[];
}

export default function App() {
  const [ddd, setDdd] = useState("");
  const [dados, setDados] = useState<DDDResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [buscar, setBuscar] = useState("");

  useEffect(() => {
    if (!buscar) return;

async function consultarDDD() {
  try {
    setLoading(true);
    setDados(null);

    const response = await fetch(
      `https://brasilapi.com.br/api/ddd/v1/${buscar}`
    );

    if (!response.ok) {
      alert("DDD não encontrado");
      return;
    }

    const data: DDDResponse = await response.json();

    setDados(data);
  } catch (error) {
    alert("Erro ao consultar API");
    console.log(error);
  } finally {
    setLoading(false);
  }
}

    consultarDDD();
  }, [buscar]);

  function handleBuscar() {
  if (ddd.length !== 2) {
    alert("Digite um DDD válido");
    return;
  }

  setBuscar(ddd.trim());
}

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Consulta de DDD</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o DDD"
        keyboardType="numeric"
        maxLength={2}
        value={ddd}
        onChangeText={setDdd}
      />

      <Button title="Buscar" onPress={handleBuscar} />

      {loading && (
        <ActivityIndicator
          size="large"
          style={{ marginTop: 20 }}
        />
      )}

      {dados && !loading && (
        <View style={styles.resultado}>
          <Text style={styles.estado}>
            Estado: {dados.state}
          </Text>

          <Text style={styles.subtitulo}>
            Cidades:
          </Text>

          <FlatList
            data={dados.cities}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
             <View style={styles.itemContainer}>
    <Text style={styles.cidade}>
      {item}
    </Text>

    <View style={styles.linha} />
  </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#999",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },

  resultado: {
    marginTop: 30,
    flex: 1,
  },

  estado: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },

  subtitulo: {
    fontSize: 18,
    marginBottom: 10,
  },

  cidade: {
    fontSize: 16,
    marginBottom: 5,
  },
  itemContainer: {
  marginBottom: 10,
},

linha: {
  height: 1,
  backgroundColor: "#ccc",
  marginTop: 5,
},
});