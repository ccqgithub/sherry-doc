title: 关于sherry-doc
tags: [help,about]
category: 无分类
date: 2011-04-28 18:44:00
# 这部分包括接下来的一行是文档的配置信息,采用YAML语法编写，如果删除，自动化扫描将扫描不到
=======CONFIG======


关于sherry-doc
===

> sherry-doc 是一个十分简单的便携式静态文档库，文档采用markdown存储，无需服务器和网络，随时随地查看，支持图片插入。

### 安装

* 安装 `node.js`
* 克隆 `项目目录` 至你的位置

### 配置

配置文件为目录下的 `config.json`

    {
        // 文章的配置信息和内容的分割字符串
        "confSplit": "=======CONFIG======",

        // 文档的名字
        "docName": "sherry-doc",
        
        // 文档列表
        "docList": [{
            // 文档的标题
            "title": "帮助文档",

            // 文档的目录
            "path": "posts/help"
        }, {
            "title": "文档一",
            "path": "posts/doc1"
        }, {
            "title": "文档二",
            "path": "posts/doc2"
        }]
    }

### 编写

所有文章为markdown文件，后缀名为 `md` ，存储在posts目录下，你只需要在下面添加自己的文件夹和文章，支持图片。 

### 扫描

命令行下，切换至目录，执行 `node scan.js`，会在 `./data/` 目录下生成配置文件：`./data/config.json` ，以及每一篇文档的文章列表json：`./data/articles-0.json` 等……

* `./data/config.json`  在 `./config.json` 的基础上会加上每一篇文档的文章列表数据 `json文件` 路径，以及文章数量等……
* `./data/articles-n.json` 文章配置列表，里面是一个文档的所有文章的配置，包括标题、标签、分类、作者、文件为准等……

### 查看

用浏览器打开根目录下的 `index.html` 查看即可

### 文章结构

文章分为‘配置’和‘内容’，通过 `config.json` 中的 `confSplit` 分割。

* 配置：YAML语法

        # Extensions
        ## Plugins: http://hexo.io/plugins/
        ## Themes: http://hexo.io/themes/
        theme: jacman
        stylus:
          compress: true

        # Deployment
        ## Docs: http://hexo.io/docs/deployment.html
        deploy:
          type: git
          repo: https://github.com/ccqgithub/ccqgithub.github.io.git
          branch: master
          message: 博客更新

* 内容： markdown语法，采用[marked](https://github.com/chjj/marked) 解析

### 自定义

你可以自己编写前端样式，只要掌握三个接口即可

* 获取配置文件: `./data/config.json`
* 获取文档的文章列表: `./data/articles-0.json`
* 获取文章类容：`./posts/**/*.md`