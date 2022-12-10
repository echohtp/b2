import dynamic from 'next/dynamic';

const StepperComponent = dynamic(() => import('./CustomStepper'), {
  ssr: false,
});