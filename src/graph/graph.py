# -*- coding: utf-8 -*-
# @Time    : Graph
# @Author  : phylosopher
# @File    : 
# @Project : Workflow
# @Software: PyCharm
import time


class Graph:
    def __init__(self):
        self.id = int(time.time())
        self.nodes = []
        self.edges = []

    def add_node(self, node):
        self.nodes.append(node)

    def add_edge(self, edge):
        self.edges.append(edge)