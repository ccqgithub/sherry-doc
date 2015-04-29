// dom ready
$(function() {
    var $side = $('#side'),
        $content = $('#content'),
        getIndex = 0,
        config = null;

    // 侧边栏滚动
    $side.niceScroll();

    // 内容区滚动
    $content.niceScroll();

    $side.find('.item').click(function(event) {
        var $btn = $(this),
            post = $btn.data('post'),
            url = './posts/' + post,
            index = (++getIndex);

        $loading.show();
        $.ajax({
            url: url,
            type: 'get',
            dataType: 'text'
        })
        .done(function(res) {
            if (index != getIndex) return;
            
            var html, splitStr, arr, str;

            $loading.hide();
            // remove config str
            splitStr = '=======CONFIG======';
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
        url: './config.js',
        type: 'get',
        dataType: 'json'
    })
    .done(function(res) {
        hideLoading();
        config = res;
    })
    .fail(function() {
        //
        console.log(arguments);
    });

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