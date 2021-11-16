#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Duc Trung Le.
# Distributed under the terms of the Modified BSD License.

from .ywidgets import YWidget
from ._version import __version__, version_info


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

