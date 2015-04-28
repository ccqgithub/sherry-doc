var doc = {};

// 文档名
doc.title = '纯静态文档';

// 根路径
doc.baseUrl = './';

// 文章列表
doc.articles = [];

// 添加文章
doc.add = function(article) {
	doc.articles.push(article);
}

doc.add({
	title: '测试文章',
	path: 'test.md',
	description: '这是一篇测试文章'
});