/**
 * @version v2.1.0
 * @link https://github.com/sutras/motion#readme
 * @license MIT
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.motion = factory());
}(this, (function () { 'use strict';

    var unified, animation, animationend;

    var EVENT_SCROLL = 'scroll';
    var EVENT_RESIZE = 'resize';
    var ATTR_DATA_MOTION = 'data-motion';
    var PROP_CLASS = 'class';

    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    function isSupported() {
        return !!( window.AnimationEvent || window.WebKitAnimationEvent );
    }

    function extend( target ) {
        var i = 1, option, key;

        if ( arguments.length > 1 ) {
            while ( ( option = arguments[i++] ) ) {
                for ( key in option ) {
                    target[ key ] = option[ key ];
                }
            }
        }
        return target;
    }

    function throttle( fn, threshold ) {
        var timer = null,
            first = true;

        return function() {
            var args = arguments;

            // 第一次执行
            if ( first ) {
                fn.apply( this, args );
                first = false;
            } else {
                if ( timer ) {
                    return;
                }

                timer = setTimeout(function() {
                    clearTimeout( timer );
                    timer = null;
                    fn.apply( this, args );
                }.bind(this), threshold || 150);
            }
        };
    }

    function unifyAnimation() {
        if ( unified ) {
            return;
        }
        unified = true;

        animation = 'animation';
        if ( !(animation in document.body.style) ) {
            animation = window.WebKitAnimationEvent ? '-webkit-animation' : '-moz-animation';
        }

        animationend = window.AnimationEvent ? 'animationend' : 'webkitAnimationEnd';
    }

    // 给指定元素发射事件
    function emit( elem, type, args ) {
        var ev = document.createEvent("HTMLEvents");
        ev.initEvent( type, true, true );

        if ( args ) {
            for ( var i in args ) {
                ev[i] = args[i];
            }
        }

        elem.dispatchEvent( ev );
    }

    function error( msg ) {
        console.error( '[Motion] ' + msg );
    }
    function warn( msg ) {
        console.warn( '[Motion] ' + msg );
    }

    // 转换为小驼峰
    function camelCase( target ) {
        return target.replace(/[-_][^-_]/g, function( m ) {
            return m.charAt(1).toUpperCase();
        }).replace(/^./, function( m ) {
            return m.toLowerCase();
        });
    }

    // 转换为连字符
    function kebabCase( target ) {
        return target.replace(/^./, function( m ) {
            return m.toLowerCase();
        }).replace(/[A-Z]/g, function( m ) {
            return '-' + m.toLowerCase();
        });
    }

    function isPlainObject( target ) {
        return target && typeof target === 'object' && !Array.isArray( target );
    }

    // 获取元素现对于页面顶部/左边的偏移量
    function offset( el ) {
        var top, left;

        top = el.offsetTop;
        left = el.offsetLeft;
        while ( (el = el.offsetParent) ) {
            top += el.offsetTop;
            left += el.offsetLeft;
        }
        return  { left: left, top: top };
    }

    function getWindowScrollY() {
        return Math.max( ( window.pageYOffset || 0 ), ( window.scrollY || 0 ) );
    }

    function addEventListener( el, type, handler ) {
        el.addEventListener( type, handler );
    }

    function removeEventListener( el, type, handler ) {
        el.removeEventListener( type, handler );
    }

    function domDataToJSObject( el ) {
        var obj = {}, Func = Function;

        // 转换为javascript对象
        if ( el.hasAttribute( ATTR_DATA_MOTION ) ) {
            obj = el.getAttribute( ATTR_DATA_MOTION );

            try {
                obj = (new Func('return ' + obj + ';'))();
            } catch ( err ) {
                error('The value of the ' + ATTR_DATA_MOTION + ' feature must be an array or object that conforms to JavaScript syntax, and what you assign is:\n' + obj);
            }

        } else {
            oneAttrs.forEach(function( key ) {
                var attr;
                if ( el.hasAttribute( (attr = ATTR_DATA_MOTION + '-' + key) ) ) {
                    obj[ key ] = el.getAttribute( attr );
                }
            });
        }
        return obj;
    }

    function makeAnimationQueues( obj ) {
        var key, value, queues = {};

        // 统一格式
        if ( Array.isArray( obj ) ) {
            queues[ defaultQueueName ] = obj;
        } else if ( isPlainObject( obj ) ) {
            for ( key in obj ) {
                value = obj[key];
                if ( isPlainObject( value ) ) {
                    queues[key] = [value];
                } else if ( Array.isArray( value ) ) {
                    queues[key] = value;
                } else {
                    queues[ defaultQueueName ] = [obj];
                    break;
                }
            }
        }
        return queues;
    }


    var WeakMap = WeakMap || (function() {
        function WeakMap() {
            this.keys = [];
            this.values = [];
        }
        WeakMap.prototype = {
            constructor: WeakMap,
            set: function(key, value) {
                var i;
                if ( (i = this.keys.indexOf(key)) === -1 ) {
                    this.keys.push( key );
                    return this.values.push( value );
                }
                this.values[i] = value;
            },
            get: function(key) {
                return this.values[ this.keys.indexOf(key) ];
            },
            has: function(key) {
                return this.keys.indexOf(key) === -1 ? false : true;
            },
            'delete': function(key) {
                var i;
                if ( (i = this.keys.indexOf( key )) !== -1 ) {
                    this.keys.splice(i, 1);
                    this.values.splice(i, 1);
                    return true;
                }
                return false;
            }
        };
        return WeakMap;
    })();

    // 实例化motion对象的默认配置选项
    var defaultOptions = {
        selector: '.motion',  // 要应用motion动画的元素的选择器
        expandTop: 0,  // 扩张可视区域的顶部，此参数可以让元素更早或更晚进行动画
        expandBottom: 0,  // 扩张可视区域的底部，此参数可以让元素更早或更晚进行动画
        mobile: true,  // 在移动端是否执行动画
        scrollContainer: window, // 注册滚动事件的主体，默认为window
        throttle: 150,  // 滚动事件的处理函数节流的阈值
        queue: 'default',  // 滚动队列名
        scroll: true,  // 是否添加滚动队列
        'class': '',  // 开始动画时添加到元素上的类名，多个类名使用空格分割，例如：'delay-1s faster'

        start: null,  // 回调函数，每次动画开始都执行的函数。
        end: null,  // 回调函数，每次动画结束都执行的函数。
        finish: null,  // 回调函数，元素完成一个队列的所有动画后执行。

        name: 'fadeIn',  // 默认的动画名称
        duration: null,  // 默认的动画持续时间
        timingFunction: null,  // 默认的动画缓动公式
        delay: null,  // 默认的动画延迟时间
        iterationCount: null,  // 默认的动画播放次数
        direction: null, // 默认的动画运动方向
        fillMode: null,  // 默认的动画填充模式

        // 动画执行的不同阶段会给元素发送事件，通过绑定不同的事件来实现对元素的控制
        startType: 'motionstart',  // 动画开始
        endType: 'motionend',  // 一个动画的结束
        finishType: 'motionfinish'  // 整个队列动画结束
    };

    // animation动画属性
    var aniAttrs = ['duration', 'timing-function', 'delay', 'iteration-count', 'direction', 'fill-mode'];
    var oneAttrs = [PROP_CLASS, 'name'].concat( aniAttrs );

    var defaultQueueName = 'default';


    function motion( options ) {
        var instance = {},
            scrollBoxes = [],
            weakMap = new WeakMap(),
            elems,
            disabled,
            throttledScrollHandler;


        function getValueFromDataOrOptions( el, prop, isNumber ) {
            var attr = ATTR_DATA_MOTION + '-' + kebabCase( prop );
            var val = el.hasAttribute( attr ) ? el.getAttribute( attr ) : options[ camelCase( prop ) ];
            return isNumber ? Number( val ) : val;
        }

        function createQueues( el ) {
            var queues, name, queue,
                i, j, k, value, obj, attr;

            queues = makeAnimationQueues( domDataToJSObject( el ) );

            // 把元素添加到滚动监听的名单里
            if ( options.scroll && queues.hasOwnProperty( options.queue ) ) {
                scrollBoxes.push( el );
            }

            for ( name in queues ) {
                queue = queues[name];

                for ( i = 0; ( obj = queue[i++] ); ) {
                    // 将属性名全部转换为连字符格式
                    for ( k in obj ) {
                        value = obj[k];
                        delete obj[k];
                        obj[ kebabCase( k ) ] = value;
                    }

                    for ( j = 0; ( attr = oneAttrs[j++] ); ) {
                        if ( !obj.hasOwnProperty( attr ) ) {
                            obj[ attr ] = options[ attr ];
                        }
                    }

                    obj[ PROP_CLASS] = ['animated', obj.name].concat( obj[ PROP_CLASS ].trim().split(/ +/).filter(function(el) {
                        return el !== '';
                    }));
                }

                queues[ name ] = queue;
            }

            return queues;
        }

        // 判断当前元素是否处于可见区域
        function isVisible( el ) {
            var viewTop, viewBottom, top, bottom, expandTop, expandBottom;

            expandTop = weakMap.get( el ).expandTop;
            expandBottom = weakMap.get( el ).expandBottom;
            viewTop = options.scrollContainer && options.scrollContainer.scrollTop || getWindowScrollY();
            viewBottom = viewTop + Math.min( document.documentElement.clientHeight, window.innerHeight );
            top = offset( el ).top;
            bottom = top + el.offsetHeight;
            return bottom >= viewTop - expandTop && top <= viewBottom + expandBottom;
        }

        function unbindEvent() {
            removeEventListener( options.scrollContainer, EVENT_SCROLL, throttledScrollHandler );
            removeEventListener( window, EVENT_RESIZE, throttledScrollHandler );
        }

        // window 滚动事件的处理程序
        function scrollHandler() {
            var i, el;

            for ( i = 0; ( el = scrollBoxes[i++] ); ) {
                if ( isVisible( el ) ) {
                    execute( el );
                    removeScrollBox( el );
                    i--;
                    if ( scrollBoxes.length === 0 ) {
                        unbindEvent();
                    }
                }
            }
        }

        // 滚动到能看见元素，便将其从队列移除
        function removeScrollBox( el ) {
            var index;
            if ( (index = scrollBoxes.indexOf( el )) !== -1 ) {
                scrollBoxes.splice( index, 1 );
            }
        }

        function isDisabled() {
            return !options.mobile && isMobile();
        }

        // 实现动画的具体步骤
        // 通过给元素添加animation系列内联样式属性来给元素添加动画效果
        function setStyle( el, obj, data, newQueue ) {
            // 重新执行队列动画
            if ( newQueue ) {
                emit( el, animationend, {
                    motionOver: true
                } );
            }

            setTimeout(function() {
                var key, val, l;
                el.style.visibility = 'visible';
                data.playing = true;


                for ( l = aniAttrs.length; ( key = aniAttrs[--l] ); ) {
                    val = obj[ key ];
                    if ( ( key === 'duration' || key === 'delay' ) && /\d$/i.test( val ) ) {
                        val += 'ms';
                    }
                    el.style[ animation + '-' + key ] = val;
                }

                obj[ PROP_CLASS ].forEach(function( cls ) {
                    el.classList.add( cls );
                });
            });
        }

        function execute( el, queueName ) {
            var data, obj, i, l, fn, queue;

            data = weakMap.get( el );
            queueName = queueName || defaultQueueName;

            if ( !data || !( queue = data.queues[ queueName ] ) || (l = queue.length) <= 0) {
                return;
            }

            obj = queue[i = 0];

            setStyle( el, obj, data, true );

            // 发送动画开始事件
            emit( el, options.startType, { queue: queueName } );

            if ( options.start ) {
                options.start( el, queueName );
            }

            // 按照队列顺序，逐个执行动画，直到队列结束
            addEventListener( el, animationend, fn = (function( ev ) {
                ev.stopPropagation();
                data.playing = false;

                el.style.removeProperty( animation );

                // 移除类名
                obj[ PROP_CLASS ].forEach(function( cls ) {
                    el.classList.remove( cls );
                });

                // 发送动画结束事件
                emit( el, options.endType, { queue: queueName } );
                if ( options.end ) {
                    options.end( el, queueName );
                }

                // 执行下一个动画
                if ( !ev.motionOver && ++i < l ) {
                    setStyle( el, queue[i], data );

                // 完成一个队列的动画
                } else {
                    removeEventListener( el, animationend, fn );

                    // 发送动画完成事件（一个队列所有动画）
                    emit( el, options.finishType, { queue: queueName } );
                    if ( options.finish ) {
                        options.finish( el, queueName );
                    }
                }
            }));
        }

        if ( !isSupported() ) {
            warn('Animation is not supported by the current browser.');
            disabled = true;
        } else if ( isDisabled() ) {
            warn('You have set the mobile terminal not to animate.');
            disabled = true;
        }
        if ( disabled ) {
            return {
                execute: function() {}
            };
        }

        // 配置参数
        options = extend( {}, defaultOptions, options || {} );

        unifyAnimation();

        elems = (function() {
            return Array.prototype.slice.call( document.querySelectorAll( options.selector ) ).map(function( elem ) {
                elem.style.visibility = 'hidden';
                weakMap.set( elem, {
                    playing: false,
                    queues: createQueues( elem ),
                    expandTop: getValueFromDataOrOptions( elem, 'expandTop', true ),
                    expandBottom: getValueFromDataOrOptions( elem, 'expandBottom', true )
                } );
                return elem;
            });
        })();

        // 注册 window scroll/resize 事件处理程序（做函数节流处理）
        if  ( scrollBoxes.length > 0 ) {
            throttledScrollHandler = throttle( scrollHandler, options.throttle );
            addEventListener( options.scrollContainer, EVENT_SCROLL, throttledScrollHandler );
            addEventListener( window, EVENT_RESIZE, throttledScrollHandler );
            throttledScrollHandler();
        }

        instance.destroy = function() {
            unbindEvent();
        };

        instance.execute = execute;

        return instance;
    }

    return motion;

})));
