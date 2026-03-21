import { createContext } from 'react';
import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const NavigationContext = createContext<{ currentRoute: string }>({ currentRoute: 'Home' });

