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
    this._onSharedModelChanged = this._onSharedModelChanged.bind(this);
    this._sharedModel = WidgetsModel.create();
    if (!this._provider) {
      console.log('creating new provider');

      this._provider = YWidgetModel.docProviderFactory({
        path: 'model-ui',
        contentType: 'ipywidgets',
        ymodel: this._sharedModel,
      });
    }
    this._id = (Math.random() + 1).toString(36).substring(7);
    console.log('called', this._id);

    this._sharedModel.changed.connect(this._onSharedModelChanged);
    const children: Array<BoxModel> = this.get('children');
    children.forEach((child, idx) => {
      child.on('change:value', (model, change) => {
        this._sharedModel.transact(() => {
          this._sharedModel.setContent('value', {
            change,
            id: this._id,
            index: idx,
          });
          console.log('done transact', change);
        });
      });
    });
  }

  _onSharedModelChanged(sender: WidgetsModel, changes: WidgetsChange): void {
    console.log('model changed', changes);
    if (changes.value['id'] !== this._id) {
      console.log('updating', this._id);

      const { change, index } = changes.value;
      const child: BoxModel = this.get('children')[index];
      child.set('value', change);
      child.save_changes();
    }
  }

  static model_name = 'YWidgetModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'YWidgetView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
  static docProviderFactory: IDocumentProviderFactory;

  private _sharedModel: WidgetsModel;
  private _id: string;
  private _provider: IDocumentProvider;
}

export class YWidgetView extends BoxView {}
