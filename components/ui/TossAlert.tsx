import { TossColors, TossRadius, TossSpacing } from '@/constants/toss-design-system';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { TossButton } from './TossButton';
import { TossText } from './TossText';

interface AlertConfig {
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
}

let showAlertFn: ((config: AlertConfig) => void) | null = null;

export function TossAlert() {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig>({
    title: '',
    message: '',
    confirmText: '확인',
  });

  const handleConfirm = () => {
    setVisible(false);
    if (config.onConfirm) {
      config.onConfirm();
    }
  };

  // 글로벌 접근을 위한 함수 등록
  React.useEffect(() => {
    showAlertFn = (newConfig: AlertConfig) => {
      setConfig(newConfig);
      setVisible(true);
    };
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleConfirm}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TossText variant="title3" style={styles.title}>
            {config.title}
          </TossText>
          
          <TossText variant="body2" color="textSecondary" style={styles.message}>
            {config.message}
          </TossText>
          
          <TouchableOpacity onPress={handleConfirm} style={styles.buttonContainer}>
            <TossButton
              title={config.confirmText || '확인'}
              variant="primary"
              size="large"
              onPress={handleConfirm}
              style={styles.button}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// 외부에서 호출 가능한 함수
export function showTossAlert(config: AlertConfig) {
  if (showAlertFn) {
    showAlertFn(config);
  } else {
    // 컴포넌트가 마운트되기 전인 경우 로그 출력
    console.warn('TossAlert is not mounted yet');
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: TossColors.white,
    borderRadius: TossRadius.lg,
    padding: TossSpacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    marginBottom: TossSpacing.md,
    textAlign: 'center',
  },
  message: {
    marginBottom: TossSpacing.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: TossSpacing.sm,
  },
  button: {
    width: '100%',
  },
});



