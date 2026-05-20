import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';

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
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const inputShake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!buscar) return;

    const consultarDDD = async () => {
      setLoading(true);
      setDados(null);
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(cardScale, { toValue: 0.9, duration: 200, useNativeDriver: true }),
      ]).start();

      try {
        const response = await fetch(`https://brasilapi.com.br/api/ddd/v1/${buscar}`);
        if (!response.ok) throw new Error("DDD inválido");
        const data: DDDResponse = await response.json();
        setDados(data);
        Animated.parallel([
          Animated.timing(cardOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.spring(cardScale, { toValue: 1, friction: 8, useNativeDriver: true }),
        ]).start();
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
    setBuscar(ddd.trim());
  };

  const handleDDDSuggestion = (code: string) => {
    setDdd(code);
    setTimeout(() => {
      handleBuscar();
    }, 100);
  };

  const handleChangeText = (text: string) => {
    const onlyNumbers = text.replace(/[^0-9]/g, '');
    if (onlyNumbers.length <= 2) {
      setDdd(onlyNumbers);
    }
  };

  const currentColors = dados?.state && stateColors[dados.state] 
    ? stateColors[dados.state] 
    : { primary: "#FF007F", secondary: "#7000FF", accent: "#00F0FF" };

  const ListHeader = () => (
    <>
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

      {dados && !loading && (
        <Animated.View style={[styles.resultCard, { opacity: cardOpacity, transform: [{ scale: cardScale }], marginTop: 10 }]}>
          <View style={[styles.stateBanner, { backgroundColor: currentColors.primary }]}>
            <FontAwesome6 name="flag-checkered" size={28} color="#FFF" />
            <Text style={styles.stateName}>{dados.state}</Text>
          </View>
          <View style={styles.counterContainer}>
            <FontAwesome5 name="building" size={16} color="#CCC" />
            <Text style={styles.counterLabel}>Cidades encontradas</Text>
            <Text style={[styles.counterValue, { color: currentColors.accent }]}>{dados.cities.length}</Text>
          </View>
        </Animated.View>
      )}
    </>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Animated.View style={[styles.bgGradient, { backgroundColor: currentColors.primary, opacity: 0.15 }]} />
        <Animated.View style={[styles.bgGradientSecondary, { backgroundColor: currentColors.secondary, opacity: 0.1 }]} />

        <SafeAreaView style={styles.safeArea}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={currentColors.accent} />
              <Text style={[styles.loadingText, { color: currentColors.accent }]}>Carregando cidades...</Text>
            </View>
          ) : (
            <FlatList
              data={dados?.cities || []}
              keyExtractor={(item, index) => item + index}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              ListHeaderComponent={ListHeader}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item, index }) => (
                <CityItem item={item} index={index} accentColor={currentColors.accent} />
              )}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B1A",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  cityIcon: {
    marginRight: 6,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 40,
    paddingVertical: 14,
    marginVertical: 10,
    shadowColor: "#FF007F",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 5,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "#1E1E2F",
    marginHorizontal: 6,
    marginBottom: 10,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 20,
  },
  counterValue: {
    fontSize: 28,
    fontWeight: "900",
    marginLeft: 8,
  },
  counterLabel: {
    color: "#CCC",
    fontSize: 12,
    letterSpacing: 1,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
    gap: 15,
  },
  emptyText: {
    color: "#AAA",
    fontSize: 16,
  },
  ledContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bgGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    borderRadius: 300,
    transform: [{ scale: 2 }],
  },
  bgGradientSecondary: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    borderRadius: 300,
    transform: [{ scale: 1.5 }],
  },
  safeArea: {
    flex: 1,
  },
  flatListContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginVertical: 20,
    alignItems: "center",
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
  subtitle: {
    fontSize: 14,
    color: "#AAA",
    marginTop: 5,
  },
  controlPanel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1E1E2F",
    borderRadius: 60,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  led: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    marginRight: 8,
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
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 20,
  },
  suggestionText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cityChip: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  cityText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  resultCard: {
    backgroundColor: "rgba(30,30,47,0.9)",
    borderRadius: 32,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  stateBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  stateIcon: {
    fontSize: 28,
  },
  stateName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
});