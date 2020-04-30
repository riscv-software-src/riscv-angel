import { useState } from 'react';
import useInterval from './use-interval';

function useCPU() {
  const [cpu, setCpu] = useState(null);

  useInterval(() => {
    if (window.myWorker) {
      window.myWorker.postMessage('fetchCpu');
    }
    setCpu(window.myCpu);
  }, 1000);

  if (!cpu) {
    return null;
  }

  return cpu;
}

export {
  useCPU,
  useState,
};
