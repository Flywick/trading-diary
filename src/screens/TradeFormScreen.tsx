import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSettings } from "../context/SettingsContext";
import {
  Direction,
  Emotion,
  Quality,
  Trade,
  useTrades,
} from "../context/TradesContext";

const TradeFormScreen: React.FC = () => {
  const { date, tradeId } = useLocalSearchParams<{
    date?: string;
    tradeId?: string;
  }>();
  const dateStr = typeof date === "string" ? date : "";
  const tradeIdStr = typeof tradeId === "string" ? tradeId : undefined;

  const { trades, addTrade, updateTrade } = useTrades();
  const { currency, theme } = useSettings();
  const router = useRouter();

  const isDark = theme === "dark";

  // Couleurs dépendant du thème
  const screenBg = isDark ? "#020617" : "#f1f5f9";
  const labelColor = isDark ? "#e5e7eb" : "#0f172a";
  const valueColor = isDark ? "#e5e7eb" : "#0f172a";
  const inputBg = isDark ? "#020617" : "#ffffff";
  const inputBorder = isDark ? "#111827" : "#d1d5db";
  const inputTextColor = isDark ? "#e5e7eb" : "#0f172a";
  const chipBorder = isDark ? "#4b5563" : "#cbd5e1";
  const chipBg = isDark ? "#020617" : "#ffffff";
  const chipTextColor = labelColor;
  const directionBorder = chipBorder;
  const directionBg = chipBg;

  const existingTrade: Trade | undefined = tradeIdStr
    ? trades.find((t) => t.id === tradeIdStr)
    : undefined;
  const isEdit = !!existingTrade;

  const [instrument, setInstrument] = useState("");
  const [direction, setDirection] = useState<Direction>("BUY");
  const [pnl, setPnl] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [tpPrice, setTpPrice] = useState("");
  const [slPrice, setSlPrice] = useState("");
  const [rr, setRr] = useState("");
  const [emotion, setEmotion] = useState<Emotion | undefined>();
  const [quality, setQuality] = useState<Quality | undefined>();
  const [respectPlan, setRespectPlan] = useState<boolean | undefined>();
  const [comment, setComment] = useState("");
  const [screenshotUri, setScreenshotUri] = useState<string | undefined>(
    undefined
  );
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  // Pré-remplissage en mode édition
  useEffect(() => {
    if (existingTrade) {
      setInstrument(existingTrade.instrument);
      setDirection(existingTrade.direction);
      setPnl(existingTrade.pnl.toString());
      setLotSize(
        existingTrade.lotSize !== undefined
          ? existingTrade.lotSize.toString()
          : ""
      );
      setEntryPrice(
        existingTrade.entryPrice !== undefined
          ? existingTrade.entryPrice.toString()
          : ""
      );
      setTpPrice(
        existingTrade.tpPrice !== undefined
          ? existingTrade.tpPrice.toString()
          : ""
      );
      setSlPrice(
        existingTrade.slPrice !== undefined
          ? existingTrade.slPrice.toString()
          : ""
      );
      setRr(
        existingTrade.rr !== undefined ? existingTrade.rr.toString() : ""
      );
      setEmotion(existingTrade.emotion);
      setQuality(existingTrade.quality);
      setRespectPlan(existingTrade.respectPlan);
      setComment(existingTrade.comment ?? "");
      setScreenshotUri(existingTrade.screenshotUri);
    }
  }, [existingTrade]);

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  const handleSave = () => {
    const numericPnl = parseFloat(pnl.replace(",", "."));
    if (!instrument || isNaN(numericPnl) || !dateStr) {
      Alert.alert(
        "Champs manquants",
        "Actif / paire, date et résultat sont obligatoires."
      );
      return;
    }

    const tradeRr = rr ? parseFloat(rr.replace(",", ".")) : undefined;

    const payload = {
      date: dateStr,
      time: existingTrade ? existingTrade.time : timeStr,
      instrument,
      direction,
      pnl: numericPnl,
      lotSize: lotSize ? parseFloat(lotSize.replace(",", ".")) : undefined,
      entryPrice: entryPrice
        ? parseFloat(entryPrice.replace(",", "."))
        : undefined,
      tpPrice: tpPrice ? parseFloat(tpPrice.replace(",", ".")) : undefined,
      slPrice: slPrice ? parseFloat(slPrice.replace(",", ".")) : undefined,
      rr: tradeRr,
      emotion,
      quality,
      respectPlan,
      comment,
      screenshotUri,
    };

    if (isEdit && tradeIdStr) {
      updateTrade(tradeIdStr, payload);
    } else {
      addTrade(payload);
    }

    router.back();
  };

  const askMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission nécessaire",
        "Autorise l'accès à la galerie pour ajouter un screenshot."
      );
      return false;
    }
    return true;
  };

  const askCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission nécessaire",
        "Autorise l'accès à la caméra pour prendre une photo."
      );
      return false;
    }
    return true;
  };

  const handlePickImageFromGallery = async () => {
    const ok = await askMediaLibraryPermission();
    if (!ok) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setScreenshotUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const ok = await askCameraPermission();
    if (!ok) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setScreenshotUri(result.assets[0].uri);
    }
  };

  const openImageFullScreen = () => {
    if (!screenshotUri) return;
    setIsImageModalVisible(true);
  };

  const closeImageFullScreen = () => {
    setIsImageModalVisible(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: screenBg }]}
        contentContainerStyle={{ padding: 16, paddingBottom: 200 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, { color: labelColor }]}>Date</Text>
        <Text style={[styles.value, { color: valueColor }]}>{dateStr}</Text>

        <Text style={[styles.label, { color: labelColor, marginTop: 8 }]}>
          {isEdit ? "Modifier le trade" : "Nouveau trade"}
        </Text>

        <Text style={[styles.label, { color: labelColor }]}>
          Actif / Paire
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              borderColor: inputBorder,
              color: inputTextColor,
            },
          ]}
          placeholder="EUR/USD, XAU/USD."
          placeholderTextColor="#6b7280"
          value={instrument}
          onChangeText={setInstrument}
        />

        <Text style={[styles.label, { color: labelColor }]}>Direction</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.directionButton,
              {
                borderColor: directionBorder,
                backgroundColor: directionBg,
              },
              direction === "BUY" && {
                backgroundColor: "#16a34a",
                borderColor: "#22c55e",
              },
            ]}
            onPress={() => setDirection("BUY")}
          >
            <Text
              style={[
                styles.directionText,
                {
                  color:
                    direction === "BUY"
                      ? "#f9fafb"
                      : inputTextColor,
                },
              ]}
            >
              BUY
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.directionButton,
              {
                borderColor: directionBorder,
                backgroundColor: directionBg,
              },
              direction === "SELL" && {
                backgroundColor: "#dc2626",
                borderColor: "#ef4444",
              },
            ]}
            onPress={() => setDirection("SELL")}
          >
            <Text
              style={[
                styles.directionText,
                {
                  color:
                    direction === "SELL"
                      ? "#f9fafb"
                      : inputTextColor,
                },
              ]}
            >
              SELL
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: labelColor }]}>
          Résultat ({currency})
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              borderColor: inputBorder,
              color: inputTextColor,
            },
          ]}
          keyboardType="numeric"
          placeholder="Ex : 25.50"
          placeholderTextColor="#6b7280"
          value={pnl}
          onChangeText={setPnl}
        />

        <Text style={[styles.label, { color: labelColor }]}>
          Lot (optionnel)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              borderColor: inputBorder,
              color: inputTextColor,
            },
          ]}
          keyboardType="numeric"
          placeholder="Ex : 0.25"
          placeholderTextColor="#6b7280"
          value={lotSize}
          onChangeText={setLotSize}
        />

        <Text style={[styles.label, { color: labelColor }]}>
          Prix (optionnel)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              borderColor: inputBorder,
              color: inputTextColor,
            },
          ]}
          keyboardType="numeric"
          placeholder="Prix d'entrée"
          placeholderTextColor="#6b7280"
          value={entryPrice}
          onChangeText={setEntryPrice}
        />
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              borderColor: inputBorder,
              color: inputTextColor,
            },
          ]}
          keyboardType="numeric"
          placeholder="TP"
          placeholderTextColor="#6b7280"
          value={tpPrice}
          onChangeText={setTpPrice}
        />
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              borderColor: inputBorder,
              color: inputTextColor,
            },
          ]}
          keyboardType="numeric"
          placeholder="SL"
          placeholderTextColor="#6b7280"
          value={slPrice}
          onChangeText={setSlPrice}
        />

        <Text style={[styles.label, { color: labelColor }]}>
          RR (optionnel)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBg,
              borderColor: inputBorder,
              color: inputTextColor,
            },
          ]}
          keyboardType="numeric"
          placeholder="Ex : 2.35"
          placeholderTextColor="#6b7280"
          value={rr}
          onChangeText={setRr}
        />

        <Text style={[styles.label, { color: labelColor }]}>Émotion</Text>
        <View style={styles.rowWrap}>
          {[
            { key: "calm", label: "😌 calme" },
            { key: "stress", label: "😰 stress" },
            { key: "fomo", label: "🤯 FOMO" },
            { key: "revenge", label: "😡 revenge" },
            { key: "tired", label: "😴 fatigué" },
            { key: "disciplined", label: "✅ discipliné" },
          ].map((e) => {
            const active = emotion === e.key;
            return (
              <TouchableOpacity
                key={e.key}
                style={[
                  styles.chip,
                  {
                    borderColor: chipBorder,
                    backgroundColor: chipBg,
                  },
                  active && {
                    backgroundColor: "#1d4ed8",
                    borderColor: "#60a5fa",
                  },
                ]}
                onPress={() =>
                  setEmotion((prev) =>
                    prev === e.key ? undefined : (e.key as any)
                  )
                }
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: active ? "#f9fafb" : chipTextColor,
                    },
                  ]}
                >
                  {e.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { color: labelColor }]}>
          Qualité du trade
        </Text>
        <View style={styles.row}>
          {(["A", "B", "C"] as Quality[]).map((q) => {
            const active = quality === q;
            return (
              <TouchableOpacity
                key={q}
                style={[
                  styles.chip,
                  {
                    borderColor: chipBorder,
                    backgroundColor: chipBg,
                  },
                  active && {
                    backgroundColor: "#1d4ed8",
                    borderColor: "#60a5fa",
                  },
                ]}
                onPress={() =>
                  setQuality((prev) => (prev === q ? undefined : q))
                }
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: active ? "#f9fafb" : chipTextColor,
                    },
                  ]}
                >
                  {q}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { color: labelColor }]}>
          Respect du plan
        </Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.chip,
              {
                borderColor: chipBorder,
                backgroundColor: chipBg,
              },
              respectPlan === true && {
                backgroundColor: "#16a34a",
                borderColor: "#22c55e",
              },
            ]}
            onPress={() => setRespectPlan(true)}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color:
                    respectPlan === true ? "#f9fafb" : chipTextColor,
                },
              ]}
            >
              Oui
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chip,
              {
                borderColor: chipBorder,
                backgroundColor: chipBg,
              },
              respectPlan === false && {
                backgroundColor: "#dc2626",
                borderColor: "#ef4444",
              },
            ]}
            onPress={() => setRespectPlan(false)}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color:
                    respectPlan === false ? "#f9fafb" : chipTextColor,
                },
              ]}
            >
              Non
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: labelColor }]}>
          Commentaire
        </Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            {
              backgroundColor: inputBg,
              borderColor: inputBorder,
              color: inputTextColor,
            },
          ]}
          multiline
          numberOfLines={4}
          placeholder="Notes sur le trade, contexte, erreurs, etc."
          placeholderTextColor="#6b7280"
          value={comment}
          onChangeText={setComment}
        />

        <Text style={[styles.label, { color: labelColor }]}>Screenshot</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.imageButton,
              {
                borderColor: chipBorder,
                backgroundColor: chipBg,
              },
            ]}
            onPress={handlePickImageFromGallery}
          >
            <Text
              style={[
                styles.imageButtonText,
                { color: chipTextColor },
              ]}
            >
              Galerie
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.imageButton,
              {
                borderColor: chipBorder,
                backgroundColor: chipBg,
              },
            ]}
            onPress={handleTakePhoto}
          >
            <Text
              style={[
                styles.imageButtonText,
                { color: chipTextColor },
              ]}
            >
              Caméra
            </Text>
          </TouchableOpacity>
        </View>

        {screenshotUri && (
          <View style={styles.screenshotPreviewContainer}>
            <TouchableOpacity onPress={openImageFullScreen}>
              <Image
                source={{ uri: screenshotUri }}
                style={[
                  styles.screenshotPreview,
                  { borderColor: inputBorder },
                ]}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setScreenshotUri(undefined)}>
              <Text style={styles.removeScreenshotText}>
                Retirer le screenshot
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {isEdit ? "Mettre à jour le trade" : "Enregistrer le trade"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL PLEIN ÉCRAN POUR LE SCREENSHOT */}
      <Modal
        visible={isImageModalVisible && !!screenshotUri}
        transparent
        animationType="fade"
        onRequestClose={closeImageFullScreen}
      >
        <Pressable style={styles.modalOverlay} onPress={closeImageFullScreen}>
          {screenshotUri && (
            <Image
              source={{ uri: screenshotUri }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: 13,
  },
  value: {
    fontSize: 14,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  directionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  directionText: {
    fontWeight: "600",
    fontSize: 13,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    marginTop: 4,
  },
  chipText: {
    fontSize: 12,
  },
  imageButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  imageButtonText: {
    fontSize: 13,
  },
  screenshotPreviewContainer: {
    marginTop: 8,
    alignItems: "flex-start",
  },
  screenshotPreview: {
    width: 140,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  removeScreenshotText: {
    color: "#f97316",
    fontSize: 12,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#022c22",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: "90%",
    height: "80%",
  },
});

export default TradeFormScreen;
