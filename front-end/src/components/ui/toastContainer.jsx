import { useToastStore } from "../../store/toastStore";
import { CheckCircle, XCircle, Info } from "lucide-react";
import { useEffect } from "react";

const icons = {
  success: <CheckCircle className="text-green-600" />,
  error: <XCircle className="text-red-600" />,
  info: <Info className="text-blue-600" />,
};

const formatToastMessage = (message) => {
  if (typeof message === "string") return message;
  try {
    return JSON.stringify(message);
  } catch {
    return String(message);
  }
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    toasts.forEach((toast) => {
      setTimeout(() => {
        removeToast(toast.id);
      }, 4000);
    });
  }, [toasts]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 bg-white border rounded-lg px-4 py-3 shadow animate-scale-in"
        >
          {icons[toast.type]}
          <p className="text-sm text-neutral-700">
            {formatToastMessage(toast.message)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
