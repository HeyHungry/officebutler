import { createContext, useContext, useState, ReactNode } from 'react';

type OrderModalStep = 'none' | 'step1' | 'step2';

interface OrderModalContextType {
  step: OrderModalStep;
  openStep1: () => void;
  openStep2: () => void;
  closeModal: () => void;
}

const OrderModalContext = createContext<OrderModalContextType | undefined>(undefined);

export function OrderModalProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<OrderModalStep>('none');

  const openStep1 = () => setStep('step1');
  const openStep2 = () => setStep('step2');
  const closeModal = () => setStep('none');

  return (
    <OrderModalContext.Provider value={{ step, openStep1, openStep2, closeModal }}>
      {children}
    </OrderModalContext.Provider>
  );
}

export function useOrderModal() {
  const context = useContext(OrderModalContext);
  if (context === undefined) {
    throw new Error('useOrderModal must be used within an OrderModalProvider');
  }
  return context;
}
