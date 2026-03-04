# -*- coding: utf-8 -*-
# @Time    : label
# @Author  : phylosopher
# @File    : 
# @Project : Workflow
# @Software: PyCharm
from src.element.element import Element


class Label(Element):
    def __init__(self, title='', value=''):
        super().__init__()
        self.title = ''
        self.value = ''