import { useContext } from 'react';
import { AppDataContext } from '@/lib/app-data-context';

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData AppDataProvider ichida ishlatilishi kerak');
  return context;
}
