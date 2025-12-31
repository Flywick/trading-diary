// src/screens/TradeFormScreen.tsx
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "../context/SettingsContext";
import {
  Direction,
  Emotion,
  Quality,
  Trade,
  useTrades,
} from "../context/TradesContext";
import { useI18n } from "../i18n/useI18n";


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
  const { t } = useI18n();

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

  // ✅ Fallback compatible toutes versions (évite crash si MediaType n'existe pas)
  const IMAGE_MEDIA_TYPES =
    (ImagePicker as any).MediaType?.Images ??
    (ImagePicker as any).MediaTypeOptions?.Images ??
    "images";

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

  // 🧠 Émotions i18n
  const emotions: { key: Emotion; label: string }[] = [
    { key: "calm", label: t("tradeForm.emotionCalm") },
    { key: "stress", label: t("tradeForm.emotionStress") },
    { key: "fomo", label: t("tradeForm.emotionFomo") },
    { key: "revenge", label: t("tradeForm.emotionRevenge") },
    { key: "tired", label: t("tradeForm.emotionTired") },
    { key: "disciplined", label: t("tradeForm.emotionDisciplined") },
  ];

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
      setRr(existingTrade.rr !== undefined ? existingTrade.rr.toString() : "");
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
        t("tradeForm.missingRequiredFieldsTitle"),
        t("tradeForm.missingRequiredFieldsMessage")
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
      entryPrice: entryPrice ? parseFloat(entryPrice.replace(",", ".")) : undefined,
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
        t("tradeForm.permissionNeededTitle"),
        t("tradeForm.galleryPermissionMessage")
      );
      return false;
    }
    return true;
  };

  const askCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("tradeForm.permissionNeededTitle"),
        t("tradeForm.cameraPermissionMessage")
      );
      return false;
    }
    return true;
  };

  const handlePickImageFromGallery = async () => {
    const ok = await askMediaLibraryPermission();
    if (!ok) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: IMAGE_MEDIA_TYPES,
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
      mediaTypes: IMAGE_MEDIA_TYPES,
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
    <SafeAreaView style={{ flex: 1, backgroundColor: screenBg }} edges={["top"]}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: screenBg }]}
        contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 200 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, { color: labelColor }]}>
          {t("tradeForm.dateLabel")}
        </Text>
        <Text style={[styles.value, { color: valueColor }]}>{dateStr}</Text>

        <Text style={[styles.label, { color: labelColor, marginTop: 8 }]}>
          {isEdit ? t("tradeForm.editTradeTitle") : t("tradeForm.newTradeTitle")}
        </Text>

        <Text style={[styles.label, { color: labelColor }]}>
          {t("tradeForm.instrumentLabel")}
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
          placeholder={t("tradeForm.instrumentPlaceholder")}
          placeholderTextColor="#6b7280"
          value={instrument}
          onChangeText={setInstrument}
        />

        <Text style={[styles.label, { color: labelColor }]}>
          {t("tradeForm.directionLabel")}
        </Text>
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
                { color: direction === "BUY" ? "#f9fafb" : inputTextColor },
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
                { color: direction === "SELL" ? "#f9fafb" : inputTextColor },
              ]}
            >
              SELL
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: labelColor }]}>
          {t("tradeForm.resultLabelPrefix")} ({currency})
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
          placeholder={t("tradeForm.pnlExamplePlaceholder")}
          placeholderTextColor="#6b7280"
          value={pnl}
          onChangeText={setPnl}
        />

        <Text style={[styles.label, { color: labelColor }]}>
          {t("tradeForm.lotLabel")}
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
          placeholder={t("tradeForm.lotExamplePlaceholder")}
          placeholderTextColor="#6b7280"
          value={lotSize}
          onChangeText={setLotSize}
        />

        <Text style={[styles.label, { color: labelColor }]}>
          {t("tradeForm.priceLabel")}
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
          placeholder={t("tradeForm.entryPlaceholder")}
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
          placeholder={t("tradeForm.tpPlaceholder")}
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
          placeholder={t("tradeForm.slPlaceholder")}
          placeholderTextColor="#6b7280"
          value={slPrice}
          onChangeText={setSlPrice}
        />

        <Text style={[styles.label, { color: labelColor }]}>
          {t("tradeForm.rrLabel")}
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
          placeholder={t("tradeForm.rrExamplePlaceholder")}
          placeholderTextColor="#6b7280"
          value={rr}
          onChangeText={setRr}
        />

        <Text style={[styles.label, { color: labelColor }]}>
          {t("tradeForm.emotionLabel")}
        </Text>
        <View style={styles.rowWrap}>
          {emotions.map((e) => {
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
                  setEmotion((prev) => (prev === e.key ? undefined : e.key))
                }
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? "#f9fafb" : chipTextColor },
                  ]}
                >
                  {e.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { color: labelColor }]}>
          {t("tradeForm.qualityLabel")}
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
                onPress={() => setQuality((prev) => (prev === q ? undefined : q))}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? "#f9fafb" : chipTextColor },
                  ]}
                >
                  {q}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { color: labelColor }]}>
          {t("tradeForm.respectPlanLabel")}
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
                { color: respectPlan === true ? "#f9fafb" : chipTextColor },
              ]}
            >
              {t("tradeForm.respectPlanYes")}
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
                { color: respectPlan === false ? "#f9fafb" : chipTextColor },
              ]}
            >
              {t("tradeForm.respectPlanNo")}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: labelColor }]}>
          {t("tradeForm.commentLabel")}
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
          placeholder={t("tradeForm.commentPlaceholder")}
          placeholderTextColor="#6b7280"
          value={comment}
          onChangeText={setComment}
        />

        <Text style={[styles.label, { color: labelColor }]}>
          {t("tradeForm.screenshotLabel")}
        </Text>
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
            <Text style={[styles.imageButtonText, { color: chipTextColor }]}>
              {t("tradeForm.screenshotGallery")}
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
            <Text style={[styles.imageButtonText, { color: chipTextColor }]}>
              {t("tradeForm.screenshotCamera")}
            </Text>
          </TouchableOpacity>
        </View>

        {screenshotUri && (
          <View style={styles.screenshotPreviewContainer}>
            <TouchableOpacity onPress={openImageFullScreen}>
              <Image
                source={{ uri: screenshotUri }}
                style={[styles.screenshotPreview, { borderColor: inputBorder }]}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setScreenshotUri(undefined)}>
              <Text style={styles.removeScreenshotText}>
                {t("tradeForm.screenshotRemove")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {isEdit ? t("tradeForm.updateButton") : t("tradeForm.saveButton")}
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
    </SafeAreaView>
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
