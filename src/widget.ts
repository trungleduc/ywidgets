// Copyright (c) Duc Trung Le
// Distributed under the terms of the Modified BSD License.

import { BoxModel, BoxView } from '@jupyter-widgets/controls';
import { WidgetsModel, WidgetsChange } from './shared_model';
import { MODULE_NAME, MODULE_VERSION } from './version';
import {
  IDocumentProviderFactory,
  IDocumentProvider,
} from '@jupyterlab/docprovider';
// Import the CSS
import '../css/widget.css';

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
    console.log('this.id', this.comm.comm_id);

    this._onSharedModelChanged = this._onSharedModelChanged.bind(this);
    if (!YWidgetModel._provider) {
      console.log('creating new provider');
      YWidgetModel._sharedModel = WidgetsModel.create();

      YWidgetModel._provider = YWidgetModel.docProviderFactory({
        path: 'model-ui',
        contentType: 'ipywidgets',
        ymodel: YWidgetModel._sharedModel,
      });
    }

    YWidgetModel._sharedModel.changed.connect(this._onSharedModelChanged);
    const children: Array<BoxModel> = this.get('children');
    children.forEach((child, idx) => {
      child.on('change:value', (model, change) => {
        YWidgetModel._sharedModel.transact(() => {
          YWidgetModel._sharedModel.setContent(
            `${this.comm.comm_id}@${child.comm.comm_id}`,
            change
          );
        });
      });
    });
  }

  _onSharedModelChanged(sender: WidgetsModel, data: WidgetsChange): void {
    const changes = data.value;
    console.log('model changed', changes);
    for (const key in changes) {
      const commIds = key.split('@');
      if (this.comm.comm_id === commIds[0]) {
        const childChanges = changes[key];
        const children: Array<BoxModel> = this.get('children');
        children.forEach((child) => {
          const childCommId = child.comm.comm_id;
          if (childCommId === commIds[1]) {
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
  static _sharedModel: WidgetsModel;
}

export class YWidgetView extends BoxView {
  remove() {
    if (this.model.comm) {
      this.model.close(false);
    }
  }
}
