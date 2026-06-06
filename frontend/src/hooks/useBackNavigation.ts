import { useNavigate } from "react-router-dom";

type UseBackNavigationParams = {
  onBack?: () => void;
  fallbackPath?: string;
};

export const useBackNavigation = ({
  onBack,
  fallbackPath = "/",
}: UseBackNavigationParams = {}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate(fallbackPath);
  };

  return { handleBack };
};
