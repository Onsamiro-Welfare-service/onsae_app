type AlertCallback = (config: AlertConfig) => void;

interface AlertConfig {
  title: string;
  message: string;
  confirmText?: string;
}

class AlertService {
  private listeners: AlertCallback[] = [];

  show(config: AlertConfig) {
    this.listeners.forEach(listener => listener(config));
  }

  subscribe(listener: AlertCallback) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export const alertService = new AlertService();
export type { AlertConfig };

