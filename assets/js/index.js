$.fn.role = function(role) {
    return this.find('[data-role~="'+ role +'"]');
}

// dom ready
$(function() {
    var $side = $('#side'),
        $content = $('#content'),
        getIndex = 0,
        config = null,
        doclist = [],
        curDoc = null,
        curArticles = [];

    // 侧边栏滚动
    $side.niceScroll();

    // 内容区滚动
    $content.niceScroll();

    $side.on('click', '[data-role="item"]', function(event) {
        var $btn = $(this),
            i = $btn.data('i'),
            art = curArticles[i],
            url = art.file.replace(/\\/g, '/'),
            index = (++getIndex);

        showLoading('加载中……');
        $.ajax({
            url: url,
            type: 'get',
            dataType: 'text'
        })
        .done(function(res) {
            if (index != getIndex) return;
            
            var html, splitStr, arr, str;

            hideLoading();
            // remove config str
            splitStr = config.confSplit;
            arr = res.split(splitStr, 2);
            str = arr.length > 1 ? arr[1] : arr[0];

            // markdown to html
            html = marked(str);
           
            // optimize content
            html = optimizeContent(html);

            // show content
            $content.find('.in').html(html);

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
        })
        .fail(function(res) {
            //
            console.log(arguments);
        });
        
    });

    // 初始化背景
    initBg();

    showLoading('正在加载配置文件……');
    $.ajax({
        url: './data/config.json',
        type: 'get',
        dataType: 'json'
    })
    .done(function(res) {
        hideLoading();
        config = res;
        doclist = config.doclist || [];
        initDoc();
    })
    .fail(function() {
        //
        console.log(arguments);
    });

    function initDoc() {
        var $nav = $side.role('nav'),
            li = '';

        $.each(doclist, function(index, val) {
            val.index = index;
            li += '<li data-i="'+ index +'">'+ val.title +'</li>';
        });

        $nav.role('drop').html(li);

        $nav.role('drop').children('li').click(function(event) {
            var i = $(this).data('i'),
                text = $(this).text();

            $nav.role('show').text(text);
            curDoc = doclist[i];
            refreshDoc();
        }).eq(0).trigger('click');
    }

    function refreshDoc() {
        var index = curDoc.index,
            url = curDoc.articles.replace(/\\/g, '/');

        showLoading('正在获取文章列表……');
        $.ajax({
            url: url,
            type: 'get',
            dataType: 'json'
        })
        .done(function(res) {
            hideLoading();
            curArticles = res;
            refreshSide();
        })
        .fail(function() {
            //
            console.log(arguments);
        });

    }

    function refreshSide() {
        var categories = {},
            $list = $side.role('navlist'),
            str = '';

        $.each(curArticles, function(index, val) {
            var cat = val.category || '未分类';

            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(val);
        });

        $.each(categories, function(cat, val) {
            str += '<li class="nav-li"> <h3> <i class="fa fa-leaf"></i> <span>'+ cat +'</span> </h3><ul class="nav2">';

            $.each(val, function(i, v) {
                str += '<li class="nav2-li"> <a href="javascript:;" data-role="item" data-i="'+ i +'">'+ v.title +'</a> </li>';
            });

            str += '</ul></li>';
        });

        $list.html(str);
    }
});

function showLoading(msg) {
    var $loading = $('#loading');

    $loading.find('span').text(msg);
    $loading.css('width', 'auto');
    $loading.css('marginLeft', 0 - $loading.width() / 2);
    $loading.show();
}

function hideLoading() {
    $('#loading').hide();
}
    
// 优化文档内容
function optimizeContent(content) {
    return content;
}

// 节流
function debounce(fn, delay, prepose) {
    var timer, last_exec = 0;

    return function() {
        var timer, 
            last_exec = 0;
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
}

// 背景
function initBg() {
    var $bg = $('#bg'),
        $win = $(window),
        isLoaded = false,
        size = {},
        image;
    image = new Image();
    image.onload = function() {
        isloaded = true;
        size.w = image.width;
        size.h = image.height;
        _pos();
    }
    image.src = $bg.attr('src');

    $win.resize(_pos);

     _pos();

    function _pos() {
        var w = $win.width(),
            h = $win.height(),
            scale;
        scale = Math.max(w / size.w, h / size.h);
        $bg.css({
            width: size.w * scale,
            height: size.h * scale,
            top: 0 - (size.h * scale - h) / 2,
            left: 0 - (size.w * scale - w) / 2
        });
    }
}