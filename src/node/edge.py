# -*- coding: utf-8 -*-
# @Time    : e0
# @Author  : phylosopher
# @File    : 
# @Project : Workflow
# @Software: PyCharm

import time


class Edge:
    '''
    单向边，从一个结点的锚点到另一个结点的锚点
    '''
    def __init__(self, start, end):
        self.id = str(time.time())
        # 起始锚点
        self.start = start
        # 结束锚点
        self.end = end