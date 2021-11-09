// Copyright (c) Duc Trung Le
// Distributed under the terms of the Modified BSD License.

import { BoxModel, BoxView } from '@jupyter-widgets/controls';
import { SharedWidgetModel, WidgetsChange } from './shared_model';
import { MODULE_NAME, MODULE_VERSION } from './version';
import {
  IDocumentProviderFactory,
  IDocumentProvider,
} from '@jupyterlab/docprovider';
// Import the CSS
import '../css/widget.css';
import { uuid, WidgetModel } from '@jupyter-widgets/base';

export class YWidgetModel extends BoxModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: YWidgetModel.model_name,
      _model_module: YWidgetModel.model_module,
      _model_module_version: YWidgetModel.model_module_version,
      _view_name: YWidgetModel.view_name,
      _view_module: YWidgetModel.view_module,
      _view_module_version: YWidgetModel.view_module_version,
      value: 'YWidget',
    };
  }

  initialize(
    attributes: any,
    options: {
      model_id: string;
      comm?: any;
      widget_manager: any;
    }
  ): void {
    super.initialize(attributes, options);
    this._childStateLock = new WeakMap<WidgetModel, boolean>();
    this._clientId = uuid();
    this._onSharedModelChanged = this._onSharedModelChanged.bind(this);
    if (!YWidgetModel._provider) {
      YWidgetModel._sharedModel = SharedWidgetModel.create();

      YWidgetModel._provider = YWidgetModel.docProviderFactory({
        path: 'shared-model',
        contentType: 'ipywidgets',
        ymodel: YWidgetModel._sharedModel,
      });
    }

    YWidgetModel._sharedModel.changed.connect(this._onSharedModelChanged);
    const children: Array<WidgetModel> = this.get('children');
    children.forEach((child) => {
      child.on('change:value', (model, change) => {
        const lock = this._childStateLock.get(child);
        if (lock) {
          this._childStateLock.set(child, false);
        } else {
          YWidgetModel._sharedModel.transact(() => {
            YWidgetModel._sharedModel.setContent(
              `${this._clientId}@${child.comm.comm_id}`,
              change
            );
          });
        }
      });
    });
  }

  _onSharedModelChanged(sender: SharedWidgetModel, data: WidgetsChange): void {
    const changes = data.value;
    for (const key in changes) {
      const commIds = key.split('@');
      const parentClientId = commIds[0];
      const childCommId = commIds[1];
      if (this._clientId !== parentClientId) {
        const childChanges = changes[key];
        const children: Array<BoxModel> = this.get('children');

        children.forEach((child) => {
          if (child.comm.comm_id === childCommId) {
            this._childStateLock.set(child, true);
            child.set('value', childChanges);
            child.save_changes();
          }
        });
      }
    }
  }

  static model_name = 'YWidgetModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'YWidgetView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
  static docProviderFactory: IDocumentProviderFactory;
  static _provider: IDocumentProvider;
  static _sharedModel: SharedWidgetModel;

  private _childStateLock: WeakMap<WidgetModel, boolean>;
  private _clientId: string;
}

export class YWidgetView extends BoxView {}
