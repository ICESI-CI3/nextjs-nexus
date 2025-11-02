import toast from 'react-hot-toast';
import { TOAST_CONFIG } from './constants';

/**
 * Toast notification utilities
 */

export const showToast = {
  success: (message: string, duration?: number) => {
    toast.success(message, {
      duration: duration || TOAST_CONFIG.DURATION,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10b981',
      },
    });
  },

  error: (message: string, duration?: number) => {
    toast.error(message, {
      duration: duration || TOAST_CONFIG.DURATION,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#fff',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#ef4444',
      },
    });
  },

  warning: (message: string, duration?: number) => {
    toast(message, {
      icon: '⚠️',
      duration: duration || TOAST_CONFIG.DURATION,
      position: 'top-right',
      style: {
        background: '#f59e0b',
        color: '#fff',
      },
    });
  },

  info: (message: string, duration?: number) => {
    toast(message, {
      icon: 'ℹ️',
      duration: duration || TOAST_CONFIG.DURATION,
      position: 'top-right',
      style: {
        background: '#3b82f6',
        color: '#fff',
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6b7280',
        color: '#fff',
      },
    });
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        position: 'top-right',
        success: {
          style: {
            background: '#10b981',
            color: '#fff',
          },
        },
        error: {
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        },
      }
    );
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
};

export default showToast;
