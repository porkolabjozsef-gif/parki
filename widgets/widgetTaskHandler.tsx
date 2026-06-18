import { WidgetTaskHandlerProps } from 'react-native-android-widget';
import AsyncStorage from '@react-native-async-storage/async-storage';

const nameToWidget = {
  ParkiWidget: require('./ParkiWidget').ParkiWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const Widget = nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      try {
        const raw = await AsyncStorage.getItem('parki_active_parking');
        const parking = raw ? JSON.parse(raw) : null;

        if (parking) {
          const elapsed = Math.floor((Date.now() - parking.startedAt) / 1000);
          const mins = Math.floor(elapsed / 60);
          const secs = elapsed % 60;
          const elapsedStr = `${mins}:${secs.toString().padStart(2, '0')}`;

          props.renderWidget(
            <Widget
              isActive={true}
              appName={parking.appName}
              elapsedStr={elapsedStr}
            />
          );
        } else {
          props.renderWidget(<Widget isActive={false} />);
        }
      } catch {
        props.renderWidget(<Widget isActive={false} />);
      }
      break;
    }

    case 'WIDGET_DELETED':
      break;

    default:
      break;
  }
}
