var page = {};

page.debounce = function(fn, delay, prepose) {
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
page.bg = function() {
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

page.refreshWall = function() {
	$('.card').(array/object, function(index, val) {
		 /* iterate through array or object */
	});
}




page.bg();
page.refreshWall();