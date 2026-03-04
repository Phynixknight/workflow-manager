# -*- coding: utf-8 -*-
# @Time    : element
# @Author  : phylosopher
# @File    : 
# @Project : Workflow
# @Software: PyCharm
import time


class Element:
    '''
    对应node内部的html标签
    '''
    def __init__(self):
        self.id = int(time.time())
        self.attribute = {}

    def register_attr(self, attr_name, attr_value):
        self.attribute[attr_name] = attr_value