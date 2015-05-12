/**
 * index.js
 * @author season.chen
 */

// jQuery.fn.role
$.fn.role = function(role) {
    return this.find('[data-role~="'+ role +'"]');
}

// 节流
var debounce = function(fn, delay, prepose) {
    var timer, last_exec = 0;

    return function() {
        var that = this,
            args = arguments,
            diff, curr,
            exec = function() {
                last_exec = +new Date();
                fn.apply(that, args);
            };
        timer && clearTimeout(timer);
        if (prepose) {
            diff = delay - (+new Date() - last_exec);
            diff <= 0 && exec();
        } else {
            timer = setTimeout(exec, delay);
        }
    }
}

var DocAPI = {
    init: function() {
        var that = this,
            $articleNav = $('#side').role('articleNav'),
            $content = $('#content');

        this.config = null;
        this.curDoc = null;
        this.curArticleList = null;
        this.curShowArticleList = null;
        this.curArticle = null;
        this.curArticleContent = null;
        this.getConfig();

        // 侧边栏滚动
        $articleNav.niceScroll();

        // 内容区滚动
        $content.niceScroll();

        $articleNav.on('click', '[data-role="navCat"]', function() {
            $(this).next('ul').slideToggle(function() {
                $articleNav.getNiceScroll().resize();
            });
        });

        $articleNav.on('click', '[data-role="item"]', function() {
            var $item = $(this),
                i = $item.data('i'),
                url;

            $articleNav.role('item').removeClass('active');
            $articleNav.role('navi').removeClass('active');
            $item.closest('[data-role="navi"]').addClass('active');
            $item.addClass('active');

            that.curArticle = that.curShowArticleList[i];
            url = that.fixUrl(that.curArticle.file);
            that.ajax(url, 'text', function(res) {
                that.curArticleContent = res;
                that.refreshArticleContent();
            });
        });

        // 搜索
        $('#searchIns').on('keyup focus mouseup change', debounce(function() {
            if (!that.curArticleList) return;
            that.refreshArticleNav();
        }, 200));
    },
    showLoading: function(msg) {
        var $loading = $('#loading');

        $loading.find('span').text(msg);
        $loading.css('width', 'auto');
        $loading.css('marginLeft', 0 - $loading.width() / 2);
        $loading.show();
    },
    hideLoading: function() {
        $('#loading').hide();
    },
    ajax: function(url, dataType, callback) {
        var that = this,
            version;

        version = (that.config && that.config.version) ? that.config.version : new Date() * 1;

        if (url.indexOf('?') == -1) {
            url += '?_v=' + version;
        } else {
            url += '&_v=' + version;
        }

        that.showLoading('正在获取数据……');
        $.ajax({
            url: url,
            type: 'get',
            dataType: dataType
        })
        .done(function(res) {
            that.hideLoading();
            callback(res);
        })
        .fail(function() {
            that.hideLoading();
            alert('获取数据失败！');
        });
    },
    fixUrl: function(url) {
        return url.replace(/\\/g, '/');
    },
    // 获取配置
    getConfig: function() {
        var that = this,
            configUrl = './data/config.json';

        that.ajax(configUrl, 'json', function(res) {
            that.config = res;
            that.initDocList();
            document.title = that.config.docName;
        });
    },
    // 初始化文档列表
    initDocList: function() {
        var that = this,
            $nav = $('#side').role('docNav'),
            li = '';

        that.docList = that.config.docList;
       
        $.each(that.docList, function(index, val) {
            val.index = index;
            li += '<li data-i="'+ index +'">'+ val.title +'</li>';
        });

        $nav.role('drop').html(li);

        $nav.role('drop').children('li').click(function(event) {
            var i = $(this).data('i'),
                text = $(this).text();

            $nav.role('show').text(text);
            that.curDoc = that.docList[i];
            that.getArticleList();
        }).eq(0).trigger('click');
    },
    // 获取当前文档的文章列表
    getArticleList: function() {
        var that = this,
            articlesUrl = that.curDoc.articles;

        articlesUrl = that.fixUrl(articlesUrl);
        that.ajax(articlesUrl, 'json', function(list) {
            that.curArticleList = list;
            that.refreshArticleNav();
        });
    },
    // 刷新导航
    refreshArticleNav: function() {
        var that = this,
            categories = {},
            articleList = [],
            $nav = $('#side').role('articleNav'),
            str = '',
            search = $.trim($('#searchIns').val());

        if (search != '') {
            $.each(that.curArticleList, function(index, val) {console.log(val);
                search = search.toLowerCase();
                if ( (val.title && val.title.toLowerCase().indexOf(search) != -1) 
                || (val.author && val.author.toLowerCase().indexOf(search) != -1) 
                || (val.category && val.category.toLowerCase().indexOf(search) != -1) 
                || (val.description && val.description.toLowerCase().indexOf(search) != -1) ) {
                    articleList.push(val);
                }
            });
        } else {
            articleList = that.curArticleList;
        }

        that.curShowArticleList = articleList;
        $.each(articleList, function(index, val) {
            var cat = val.category || '未分类';

            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(val);
        });

        $.each(categories, function(cat, val) {
            str += '<li class="nav-li" data-role="navi"> <h3 data-role="navCat"> <i class="fa fa-leaf"></i> <span>' + cat + '</span> </h3><ul class="nav2">';

            $.each(val, function(i, v) {
                str += '<li class="nav2-li"> <a href="javascript:;" data-role="item" data-i="' + i + '">' + v.title + '</a> </li>';
            });

            str += '</ul></li>';
        });

        $nav.html(str);

        if ($nav.role('navi').length) {
            $nav.role('navi').eq(0).trigger('click');
        }

        if ($nav.role('item').length) {
            $nav.role('item').eq(0).trigger('click');
        }
    },
    optimizeContent: function(content) {
        return content;
    },
    // 显示文章
    refreshArticleContent: function() {
        var that = this,
            $content = $('#content'),
            $article = $('#article'),
            index, str;

        // remove config str
        index = that.curArticleContent.indexOf(that.config.confSplit);
        if (index > 0) {
            str = that.curArticleContent.substr(index + that.config.confSplit.length);
        }

        // markdown to html
        html = marked(str);
       
        // optimize content
        html = that.optimizeContent(html);

        // show content
        $article.html(html);

        // resize nicescroll
        $content.getNiceScroll().resize();
        
        // img face box 
        $content.find('img').wrap('<a class="fancybox"></a>');
        $content.find('.fancybox').each(function(index, el) {
            $(el).attr('rel', 'fancybox')
            .attr('href', $(this).find('img').attr('src'));
        });
        $content.find('.fancybox').fancybox({
            prevEffect  : 'fade',
            nextEffect  : 'fade',
            aspectRatio: true,
            helpers: {
                title: {
                    type: 'outside'
                },
                thumbs: {
                    width: 50,
                    height: 50
                }
            }
        });
    }
}

DocAPI.init();
