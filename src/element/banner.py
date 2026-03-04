# -*- coding: utf-8 -*-
# @Time    : banner
# @Author  : phylosopher
# @File    : 
# @Project : Workflow
# @Software: PyCharm
from src.element.element import Element


class Banner(Element):
    def __init__(self, title=''):
        super().__init__()
        self.title = title