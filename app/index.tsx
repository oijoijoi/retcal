import { useAppLoading } from '@/contexts/app-loading-context';
import { loadBirthDate } from '@/lib/birth-date';
import { loadGridArrays } from '@/lib/grid-arrays';
import { type Href, Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function Index() {
  const { markAppReady } = useAppLoading();
  const [target, setTarget] = useState<'/(tabs)' | '/onboarding' | null>(null);

  useEffect(() => {
    void Promise.all([loadBirthDate(), loadGridArrays()]).then(
      ([date, grid]) => {
        setTarget(date || grid ? '/(tabs)' : '/onboarding');
        markAppReady();
      }
    );
  }, [markAppReady]);

  if (!target) {
    return <View style={{ flex: 1 }} />;
  }

  return <Redirect href={target as Href} />;
};
