// Copyright (c) Duc Trung Le
// Distributed under the terms of the Modified BSD License.

import { BoxModel, BoxView } from '@jupyter-widgets/controls';

import { MODULE_NAME, MODULE_VERSION } from './version';
// Import the CSS
import '../css/widget.css';
import { WidgetModel } from '@jupyter-widgets/base';

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
    const allChildren = this.getChildrenRecursively();

    this.on(
      'msg:custom',
      (msg, buffers) => {
        const { method, child_id, trait, value } = msg;
        if (method !== 'ywidget_sync') {
          return;
        }

        for (const child of allChildren) {
          if (child_id === child.model_id) {
            const lock = this._childStateLock.get(child);

            if (!lock) {
              child.set(trait, value);
            } else {
              this._childStateLock.set(child, false);
            }
            break;
          }
        }
      },
      this
    );
    const children: Array<WidgetModel> = this.get('children');
    children.forEach((child) => {
      child.on('change', (model, change) => {
        if (Object.keys(change).length > 0) {
          this._childStateLock.set(model, true);
        } else {
          this._childStateLock.set(model, false);
        }
      });
    });
  }

  getChildrenRecursively(): Array<WidgetModel> {
    const all: Array<WidgetModel> = [...this.get('children')];
    const inner = (model: WidgetModel, arr: Array<WidgetModel>): void => {
      const innerChildren: Array<WidgetModel> = model.get('children');
      if (innerChildren) {
        arr.push(...innerChildren);
        innerChildren.forEach((innerChild) => inner(innerChild, arr));
      }
    };
    for (const item of this.get('children')) {
      inner(item, all);
    }
    return all;
  }

  static model_name = 'YWidgetModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'YWidgetView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;

  private _childStateLock: WeakMap<WidgetModel, boolean>;
}

export class YWidgetView extends BoxView {}
