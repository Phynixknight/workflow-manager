# -*- coding: utf-8 -*-
# @Time    : n1
# @Author  : phylosopher
# @File    : 
# @Project : Workflow
# @Software: PyCharm
from src.node.anchor import Anchor
from src.node.node import Node


class Node4anchors(Node):
    '''
    4锚点的结点
    '''
    def __init__(self, title=''):
        super().__init__(title)
        anchor_north = Anchor()
        anchor_south = Anchor()
        anchor_east = Anchor()
        anchor_west = Anchor()
        self.register_anchor(anchor_north)
        self.register_anchor(anchor_south)
        self.register_anchor(anchor_east)
        self.register_anchor(anchor_west)