declare module 'expo-image-picker' {
  export interface ImagePickerAsset {
    uri: string;
    width: number;
    height: number;
    type?: string;
    fileName?: string;
  }

  export interface ImagePickerResult {
    canceled: boolean;
    assets: ImagePickerAsset[] | null;
  }

  export interface ImagePickerOptions {
    mediaTypes?: string[];
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }

  export function launchImageLibraryAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
  export function requestMediaLibraryPermissionsAsync(): Promise<{ granted: boolean }>;
}
