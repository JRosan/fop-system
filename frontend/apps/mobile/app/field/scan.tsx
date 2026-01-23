import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Vibration } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { X, Flashlight, FlashlightOff, CheckCircle, XCircle } from 'lucide-react-native';
import { useFieldOperations } from '../../hooks';
import { VerificationResult } from '../../stores';

// BVI Sovereign colors
const COLORS = {
  atlantic: '#002D56',
  turquoise: '#00A3B1',
  sand: '#F9FBFB',
  granite: '#4A5568',
  gold: '#C5A059',
};

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    result: VerificationResult;
    message: string;
  } | null>(null);

  const { verifyPermit, isVerifying } = useFieldOperations();

  const borderAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate scan border
    Animated.loop(
      Animated.sequence([
        Animated.timing(borderAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(borderAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanned || isVerifying) return;

    setScanned(true);
    Vibration.vibrate(100);

    const result = await verifyPermit(data);

    // Flash animation
    const flashColor = result.success ? COLORS.turquoise : '#ef4444';
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setScanResult({
      success: result.success,
      result: result.result,
      message: result.success
        ? `Valid permit: ${result.permitNumber}`
        : result.failureReason || 'Verification failed',
    });

    // Navigate to result screen after brief delay
    setTimeout(() => {
      router.push({
        pathname: '/field/verify-result',
        params: {
          success: result.success ? '1' : '0',
          result: result.result,
          permitNumber: result.permitNumber || '',
          operatorName: result.operatorName || '',
          aircraftRegistration: result.aircraftRegistration || '',
          validFrom: result.validFrom || '',
          validUntil: result.validUntil || '',
          failureReason: result.failureReason || '',
        },
      });
    }, 1000);
  };

  const resetScan = () => {
    setScanned(false);
    setScanResult(null);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera access is required to scan permits</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const borderOpacity = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Flash overlay */}
        <Animated.View
          style={[
            styles.flashOverlay,
            {
              opacity: flashAnim,
              backgroundColor: scanResult?.success ? COLORS.turquoise : '#ef4444',
            },
          ]}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Permit QR</Text>
          <TouchableOpacity style={styles.torchButton} onPress={() => setTorch(!torch)}>
            {torch ? (
              <FlashlightOff size={24} color="#fff" />
            ) : (
              <Flashlight size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Scan frame */}
        <View style={styles.scanFrameContainer}>
          <Animated.View style={[styles.scanFrame, { opacity: borderOpacity }]}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </Animated.View>

          {/* Scan result indicator */}
          {scanResult && (
            <View style={styles.resultIndicator}>
              {scanResult.success ? (
                <CheckCircle size={64} color={COLORS.turquoise} />
              ) : (
                <XCircle size={64} color="#ef4444" />
              )}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {isVerifying ? (
            <Text style={styles.statusText}>Verifying permit...</Text>
          ) : scanResult ? (
            <View style={styles.resultContainer}>
              <Text
                style={[
                  styles.resultText,
                  { color: scanResult.success ? COLORS.turquoise : '#ef4444' },
                ]}
              >
                {scanResult.message}
              </Text>
              {!scanResult.success && (
                <TouchableOpacity style={styles.retryButton} onPress={resetScan}>
                  <Text style={styles.retryButtonText}>Scan Again</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Text style={styles.instructionText}>
              Position the QR code within the frame to scan
            </Text>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  torchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: COLORS.turquoise,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  resultIndicator: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    paddingBottom: 60,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  statusText: {
    fontSize: 16,
    color: COLORS.turquoise,
    fontWeight: '500',
  },
  resultContainer: {
    alignItems: 'center',
    gap: 16,
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  permissionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  permissionButton: {
    backgroundColor: COLORS.turquoise,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
