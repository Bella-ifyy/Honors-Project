import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

type AlertType = 'error' | 'danger' | 'success' | 'info' | string;

class Alert {
  static alert(title: AlertType, message?: string) {
    const titleString = typeof title === 'string' ? title : String(title);
    const messageString = typeof message === 'string' ? message : (message ? String(message) : undefined);

    const toastConfig: {
      type: ALERT_TYPE;
      title: string;
      textBody?: string;
    } = {
      type: Alert.getType(titleString, messageString),
      title: titleString,
    };

    if (messageString) {
      toastConfig.textBody = messageString;
    }

    Toast.show(toastConfig);
  }

  private static getType(title: AlertType, message?: string): ALERT_TYPE {
    const errorKeywords = ['error', 'danger'];
    const isError = (text: string) =>
      errorKeywords.some(keyword => text.toLowerCase().includes(keyword));

    if (isError(title) || (message && isError(message))) {
      return ALERT_TYPE.DANGER;
    } else {
      return ALERT_TYPE.SUCCESS;
    }
  }
}

export default Alert;
