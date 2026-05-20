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
      <View style={styles.header}>
        <Text style={styles.titulo}>Consulta de DDD</Text>
        <Text style={styles.subtituloHeader}>
          Descubra estado e cidades pelo código DDD
        </Text>
      </View>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Digite o DDD (ex: 11)"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          maxLength={2}
          value={ddd}
          onChangeText={setDdd}
        />

        <View style={styles.botaoContainer}>
          <Button color={'#0B8F44'} title="Buscar DDD" onPress={handleBuscar} />
        </View>
      </View>

      {loading && (
        <ActivityIndicator size="large" color={"#0B8F44"} style={{ marginTop: 25}} />
      )}

      {dados && !loading && (
        <View style={styles.resultado}>
          <Text style={styles.estado}>Estado: {dados.state}</Text>

          <Text style={styles.subtitulo}>Cidades:</Text>

          <FlatList
            data={dados.cities}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <Text style={styles.cidade}>{item}</Text>
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
    backgroundColor: "#eaf6f0", 
    padding: 20,
  },

  header: {
    marginTop: 20,
    marginBottom: 20,
  },

  titulo: {
    fontSize: 32,
    fontWeight: "900",
    color: "#075E54",
    textAlign: "center",
  },

  subtituloHeader: {
    textAlign: "center",
    color: "#128C7E",
    marginTop: 6,
    fontSize: 14,
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d8f3e6",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  input: {
    borderWidth: 1,
    borderColor: "#25D366",
    backgroundColor: "#f3fffa",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    color: "#075E54",
  },

  botaoContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#25D366",
  },

  resultado: {
    marginTop: 25,
    flex: 1,
    backgroundColor: "#0B8F44",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d8f3e6",
  },

  estado: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
    color: "#fff",
  },

  subtitulo: {
    fontSize: 16,
    marginBottom: 10,
    color: "#fff",
    fontWeight: "600",
  },

 
  itemContainer: {
    marginBottom: 10,
  },

  cidade: {
    fontSize: 14,
    marginBottom: 5,
    color: "#fff",
    fontWeight: "bold"
  },

  linha: {
    height: 1,
    backgroundColor: "#cdeee0",
    marginTop: 5,
  },
});