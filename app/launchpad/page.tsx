import React from 'react';
import type { Metadata } from 'next';
import LaunchpadClient from './LaunchpadClient';

export const metadata: Metadata = {
  title: 'GAD Launchpad',
  description: 'Participate in GAD token sale on BNB Chain.',
};

export default function Page() {
  return <LaunchpadClient />;
}
