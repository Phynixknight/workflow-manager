# -*- coding: utf-8 -*-
# @Time    : n0
# @Author  : phylosopher
# @File    : 
# @Project : Workflow
# @Software: PyCharm

import time
from _md5 import md5


class Node:
    '''
    结点的超类，所有的结点继承于此
    '''
    def __init__(self, title=''):
        self.id = int(time.time())
        # node节点名称
        self.title = title
        # node节点的锚点，egde需要依附
        self.anchors = []
        # node节点样式
        self.type = 'default'
        self.hash = md5(self.title.encode('utf-8')).hexdigest()

    def register_anchor(self, anchor):
        self.anchors.append(anchor)