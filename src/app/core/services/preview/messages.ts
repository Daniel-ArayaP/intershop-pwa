export interface StorefrontEditingMessage {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

export interface SetPreviewContextMessage extends StorefrontEditingMessage {
  payload?: {
    previewContextID: string;
  };
}
