# -*- coding: utf-8 -*-
# @Time    : anchor
# @Author  : phylosopher
# @File    : 
# @Project : Workflow
# @Software: PyCharm
import uuid


class Anchor:
    def __init__(self, title=''):
        self.id = str(uuid.uuid4())
        self.title = title