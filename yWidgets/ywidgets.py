#############################################################
# Created on Fri Nov 05 2021                                #
# Copyright (c) 2021 Duc Trung Le (leductrungxf@gmail.com)  #
# Distributed under the terms of the MIT License            #
#############################################################


from ipywidgets import Box
from ipywidgets.widgets import Widget
from traitlets import Unicode
from ._frontend import module_name, module_version
from typing import Iterable, Union, List
import copy


class YWidget(Box):

    _model_name = Unicode("YWidgetModel").tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode("YWidgetView").tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    value = Unicode("YWidget").tag(sync=True)

    def __init__(
        self, inp_children: Union[Widget, Iterable[Widget]] = [], **kwargs
    ):
        if isinstance(inp_children, Widget):
            children = [inp_children]
        else:
            children = inp_children

        super().__init__(children=children, **kwargs)
        all_children = copy.copy(children)

        def get_child_recursively(widget: Widget, all: List[Widget]):
            try:
                inner_children = getattr(widget, "children")
            except Exception:
                inner_children = []

            all.extend(inner_children)
            for inner_child in inner_children:
                get_child_recursively(inner_child, all)

        for item in children:
            get_child_recursively(item, all_children)

        for child in all_children:

            def handler(change, model_id=child.model_id):
                name = change["name"]
                value = change["new"]
                if name != "_property_lock":
                    msg = {
                        "method": "ywidget_sync",
                        "child_id": model_id,
                        "trait": name,
                        "value": value,
                    }
                    self.send(
                        msg,
                    )

            child.observe(handler=handler)
