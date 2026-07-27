declare module '@react-native-community/datetimepicker' {
  import { Component } from 'react';

  export interface DateTimePickerEvent {
    type: 'set' | 'dismissed';
    nativeEvent: { timestamp?: number };
  }

  interface DateTimePickerProps {
    value: Date;
    mode?: 'date' | 'time' | 'datetime';
    display?: 'default' | 'spinner' | 'calendar' | 'clock' | 'inline' | 'compact';
    onChange?: (event: DateTimePickerEvent, date?: Date) => void;
    maximumDate?: Date;
    minimumDate?: Date;
  }

  export default class DateTimePicker extends Component<DateTimePickerProps> {}
  export { DateTimePickerEvent };
}
