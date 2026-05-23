import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

interface DDDResponse {
  state: string;
  cities: string[];
}

const CityItem = ({ item, index, accentColor }: { item: string; index: number; accentColor: string }) => {
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 40;
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 300, delay, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.cityChip, { transform: [{ translateY }], opacity, borderColor: accentColor }]}>
      <FontAwesome5 name="city" size={14} color={accentColor} style={styles.cityIcon} />
      <Text style={[styles.cityText, { color: accentColor }]}>{item}</Text>
    </Animated.View>
  );
};

export default function App() {
  const [ddd, setDdd] = useState("");
  const [dados, setDados] = useState<DDDResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [buscar, setBuscar] = useState("");

  const inputRef = useRef<TextInput>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const inputShake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!buscar) return;

    const consultarDDD = async () => {
      setLoading(true);
      setDados(null);
      try {
        const response = await fetch(`https://brasilapi.com.br/api/ddd/v1/${buscar}`);
        if (!response.ok) throw new Error("DDD inválido");
        const data: DDDResponse = await response.json();
        setDados(data);
      } catch (error) {
        alert("DDD não encontrado ou erro na API");
        animateShake();
      } finally {
        setLoading(false);
      }
    };
    consultarDDD();
  }, [buscar]);

  const animateShake = () => {
    Animated.sequence([
      Animated.timing(inputShake, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(inputShake, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(inputShake, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(inputShake, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(inputShake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleBuscar = () => {
    if (ddd.length !== 2) {
      animateShake();
      alert("Digite um DDD válido (2 dígitos)");
      return;
    }
    Keyboard.dismiss();
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    setBuscar(ddd);
  };

  const handleChangeText = (text: string) => {
    const onlyNumbers = text.replace(/[^0-9]/g, "");
    if (onlyNumbers.length <= 2) {
      setDdd(onlyNumbers);
    }
  };

  const currentColors = { primary: "#FF007F", accent: "#00F0FF" };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <FontAwesome6 name="satellite-dish" size={32} color="#FFF" />
          <Text style={styles.title}>Consulta de DDD</Text>
        </View>
      </View>

      <Animated.View style={[styles.controlPanel, { transform: [{ translateX: inputShake }] }]}>
        <View style={styles.ledContainer}>
          <View style={[styles.led, { backgroundColor: ddd.length === 2 ? "#39FF14" : "#FF4444" }]} />
          <Text style={styles.ledLabel}>DDD</Text>
        </View>
        <TextInput
          ref={inputRef}
          style={styles.dddInput}
          placeholder="--"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={ddd}
          onChangeText={handleChangeText}
          textAlign="center"
          selectionColor={currentColors.accent}
          autoFocus={true}
          contextMenuHidden={true}
          autoCorrect={false}
          spellCheck={false}
          blurOnSubmit={false}
        />
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity activeOpacity={0.8} onPress={handleBuscar}>
          <View style={[styles.button, { backgroundColor: currentColors.primary }]}>
            <FontAwesome5 name="search" size={18} color="#FFF" />
            <Text style={styles.buttonText}>Buscar</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentColors.accent} />
          <Text style={[styles.loadingText, { color: currentColors.accent }]}>Carregando cidades...</Text>
        </View>
      )}

      {dados && !loading && (
        <View style={styles.resultsWrapper}>
          <View style={[styles.stateBanner, { backgroundColor: currentColors.primary }]}>
            <FontAwesome6 name="flag-checkered" size={28} color="#FFF" />
            <Text style={styles.stateName}>{dados.state}</Text>
          </View>
          
          <Text style={styles.counterLabel}>
            <FontAwesome5 name="building" size={14} color="#CCC" /> {dados.cities.length} cidades encontradas
          </Text>

          <FlatList
            data={dados.cities}
            keyExtractor={(item, index) => `${item}-${index}`}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            renderItem={({ item, index }) => (
              <CityItem item={item} index={index} accentColor={currentColors.accent} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B1A",
    paddingHorizontal: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 2,
    textShadowColor: "rgba(0,255,255,0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  controlPanel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1E1E2F",
    borderRadius: 60,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  ledContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  led: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  ledLabel: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  dddInput: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFF",
    width: 100,
    textAlign: "center",
    fontFamily: "monospace",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 40,
    paddingVertical: 14,
    marginBottom: 20,
    shadowColor: "#FF007F",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  resultsWrapper: {
    flex: 1,
    marginTop: 10,
  },
  stateBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 32,
    marginBottom: 15,
    gap: 8,
  },
  stateName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  counterLabel: {
    color: "#CCC",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cityChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  cityIcon: {
    marginRight: 6,
  },
  cityText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});