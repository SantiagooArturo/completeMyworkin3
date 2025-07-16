// Tipo para los eventos de GA4
type GAEventParams = {
  action: string;
  category: string;
  label: string;
  value?: number;
};

// Función para enviar eventos a GA4
export const trackEvent = ({ action, category, label, value }: GAEventParams) => {
  // Verificar que window y gtag estén disponibles (solo en el cliente)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    // Enviar evento a GA4
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
};

// Eventos predefinidos para botones
export const trackButtonClick = (buttonName: string) => {
  trackEvent({
    action: 'click',
    category: 'Button',
    label: buttonName
  });
};

// Eventos específicos
export const trackApplicationStart = (jobTitle: string) => {
  trackEvent({
    action: 'start_application',
    category: 'Job Application',
    label: jobTitle
  });
};

export const trackCVOptimization = () => {
  trackEvent({
    action: 'start_cv_optimization',
    category: 'CV Tools',
    label: 'CV Optimization'
  });
};

export const trackBotInteraction = (botName: string) => {
  trackEvent({
    action: 'start_bot_interaction',
    category: 'Bot Interaction',
    label: botName
  });
};

// Eventos específicos para el sistema de CV
export const trackCVReviewStart = (reviewType: 'free' | 'paid') => {
  trackEvent({
    action: 'start_cv_review',
    category: 'CV Review',
    label: reviewType
  });
};

export const trackCVReviewCompleted = (score: number, reviewType: 'free' | 'paid') => {
  trackEvent({
    action: 'complete_cv_review',
    category: 'CV Review',
    label: reviewType,
    value: score
  });
};

export const trackCVPackagePurchase = (packageType: string, price: number) => {
  trackEvent({
    action: 'purchase_cv_package',
    category: 'CV Review',
    label: packageType,
    value: price
  });
};

export const trackCVHistoryView = () => {
  trackEvent({
    action: 'view_cv_history',
    category: 'CV Review',
    label: 'History Page'
  });
};

export const trackDashboardView = () => {
  trackEvent({
    action: 'view_dashboard',
    category: 'Navigation',
    label: 'Dashboard'
  });
};

export const trackTestDataCreation = () => {
  trackEvent({
    action: 'create_test_data',
    category: 'Development',
    label: 'CV Test Data'
  });
};