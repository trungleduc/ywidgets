import { YDocument, MapChange } from '@jupyterlab/shared-models';
import * as Y from 'yjs';

export type WidgetsChange = {
  contextChange?: MapChange;
  contentChange?: string;
  value?: any;
};

export class WidgetsModel extends YDocument<WidgetsChange> {
  constructor() {
    super();
    // Creating a new shared object and listen to its changes
    this._content = this.ydoc.getMap('content');
    this._content.observe(this._contentObserver);
  }

  /**
   * Dispose of the resources.
   */
  dispose(): void {
    this._content.unobserve(this._contentObserver);
  }

  /**
   * Static method to create instances on the sharedModel
   *
   * @returns The sharedModel instance
   */
  public static create(): WidgetsModel {
    return new WidgetsModel();
  }

  /**
   * Returns an the requested object.
   *
   * @param key The key of the object.
   * @returns The content
   */
  public getContent(key: string): any {
    return this._content.get(key);
  }

  /**
   * Adds new data.
   *
   * @param key The key of the object.
   * @param value New object.
   */
  public setContent(key: string, value: any): void {
    this._content.set(key, value);
  }

  /**
   * Handle a change.
   *
   * @param event Model event
   */
  private _contentObserver = (event: Y.YMapEvent<any>): void => {
    const changes: WidgetsChange = {};
    const value: { [key: string]: any } = {};
    event.keysChanged.forEach((key) => {
      value[key] = this._content.get(key);
    });
    changes.value = value;

    this._changed.emit(changes);
  };

  private _content: Y.Map<any>;
}
