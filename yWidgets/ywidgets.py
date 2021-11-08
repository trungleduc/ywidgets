#############################################################
# Created on Fri Nov 05 2021                                #
# Copyright (c) 2021 Duc Trung Le (leductrungxf@gmail.com)  #
# Distributed under the terms of the MIT License            #
#############################################################


from ipywidgets import Box
from traitlets import Unicode
from ._frontend import module_name, module_version


class YWidget(Box):

    _model_name = Unicode('YWidgetModel').tag(sync=True)
    _model_module = Unicode(module_name).tag(sync=True)
    _model_module_version = Unicode(module_version).tag(sync=True)
    _view_name = Unicode('YWidgetView').tag(sync=True)
    _view_module = Unicode(module_name).tag(sync=True)
    _view_module_version = Unicode(module_version).tag(sync=True)

    value = Unicode('YWidget').tag(sync=True)

    def __init__(self, children=(), **kwargs):
        print(children)
        super().__init__(children=children, **kwargs)