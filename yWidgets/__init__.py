#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Duc Trung Le.
# Distributed under the terms of the Modified BSD License.

from .example import ExampleWidget
from ._version import __version__, version_info
from .handlers import setup_handlers


def _jupyter_labextension_paths():
    return [
        {
            "src": "labextension",
            "dest": "yWidgets",
        }
    ]


def _jupyter_nbextension_paths():
    return [
        {
            "section": "notebook",
            "src": "nbextension",
            "dest": "yWidgets",
            "require": "yWidgets/extension",
        }
    ]


def _jupyter_server_extension_points():
    return [{"module": "yWidgets"}]


def _load_jupyter_server_extension(server_app):
    url_path = "ywidgets"
    setup_handlers(server_app.web_app, url_path)
    server_app.log.info(
        f"Registered yWidgets extension at URL path /{url_path}"
    )
