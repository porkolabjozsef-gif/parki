import React from 'react';
import {
  FlexWidget,
  TextWidget,
  ImageWidget,
} from 'react-native-android-widget';

interface ParkiWidgetProps {
  appName?: string;
  elapsedStr?: string;
  isActive?: boolean;
}

export function ParkiWidget({ appName, elapsedStr, isActive }: ParkiWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
        borderRadius: 16,
      }}
    >
      {isActive ? (
        <>
          <TextWidget
            text="🅿️"
            style={{ fontSize: 28 }}
          />
          <TextWidget
            text={appName || 'Parkolás'}
            style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 'bold', marginTop: 4 }}
          />
          <TextWidget
            text={elapsedStr || '0:00'}
            style={{ fontSize: 22, color: '#FFB020', fontWeight: 'bold', marginTop: 4 }}
          />
        </>
      ) : (
        <>
          <TextWidget
            text="🅿️"
            style={{ fontSize: 28 }}
          />
          <TextWidget
            text="Parki"
            style={{ fontSize: 16, color: '#00E5A0', fontWeight: 'bold', marginTop: 4 }}
          />
          <TextWidget
            text="Nincs aktív parkolás"
            style={{ fontSize: 11, color: '#666666', marginTop: 2 }}
          />
        </>
      )}
    </FlexWidget>
  );
}
