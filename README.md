# motion

基于animate.css的css3入场、强调、退场动画。

# 兼容性
只在支持css3 animation动画的浏览器有效果。不支持的浏览器则静默失效。

# 使用
1. 引入文件。

``` html
<link rel="stylesheet" href="animate.min.css">
<script src="motion.min.js"></script>
```

2. 编写HTML代码

``` html
<div class="motion"
    data-motion-name="slideInDown"
    data-motion-duration="1s"
    data-motion-delay="1s">
</div>
```

3. 创建Motion实例

``` js
var motionInstance = motion({
    selector: ".motion"
});
```

# 复杂的参数配置方式

除了在HTML中通过`data-motion-*`属性单独给元素配置参数外，还可以在实例化`motion`对象时，
在第一个参数的配置对象中进行全局的配置。

每个元素可以拥有多个动画队列，每个队列可以有多个动画。可以通过`data-motion`属性配置复杂的动画。

1. 默认队列单个动画

``` html
<div class="motion" data-motion="{
    name: 'fadeIn',
    duration: '2s'
}"></div>
```

2. 默认队列多个动画

``` html
<div class="motion" data-motion="[
    {
        name: 'fadeIn',
        duration: '2s'
    }, {
        name: 'swing',
        duration: '2s',
        iterationCount: 2
    }
]"></div>
```

3. 多个队列

``` html
<div class="motion" data-motion="{
    in: {
            name: 'swing',
            duration: '2s',
            iterationCount: 2
        }
    ],
    out: {
        name: 'fadeOut',
        duration: 1500
    }
}"></div>
```

4. 多个队列多个动画

``` html
<div class="motion" data-motion="{
    in: [
        {
            name: 'fadeIn',
            duration: '1s'
        }, {
            name: 'swing',
            duration: '2s',
            iterationCount: 'infinite'
        }
    ],
    out: {
        name: 'fadeOut',
        duration: 1500
    }
}"></div>
```


# 执行过程

创建`motion`实例时，会到页面上寻找与`selector`匹配的元素，将其添加到待执行动画的元素队列中。
然后监听给定对象的滚动事件，在滚动过程中，如果有事先存储的元素出现在浏览器窗口可视局域内，
则添加`animated`等类名，设置CSS样式使其开始`animation`动画，在动画完成后，会将添加的类名和`animation`属性去掉。
并将其元素从元素队列中删掉，待所有元素都移出队列时移除滚动事件的监听。


# 配置参数

<table class="table">
    <thead>
        <tr>
            <th>配置选项</th>
            <th>数据类型</th>
            <th>默认值</th>
            <th>说明</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>selector</td>
            <td>String</td>
            <td>'.motion'</td>
            <td>要应用motion动画的元素的选择器。</td>
        </tr>
        <tr>
            <td>expandTop</td>
            <td>Number</td>
            <td>0</td>
            <td>扩张可视区域的顶部，可以让处于可视区域顶部以上未显示的元素提前显示。</td>
        </tr>
        <tr>
            <td>expandBottom</td>
            <td>Number</td>
            <td>0</td>
            <td>扩张可视区域的底部，可以让处于可视区域底部以下未显示的元素提前显示。</td>
        </tr>
        <tr>
            <td>mobile</td>
            <td>Boolean</td>
            <td>true</td>
            <td>在移动端是否执行motion动画。</td>
        </tr>
        <tr>
            <td>scrollContainer</td>
            <td>Object</td>
            <td>window</td>
            <td>注册滚动事件的对象。</td>
        </tr>
        <tr>
            <td>throttle</td>
            <td>Number</td>
            <td>150</td>
            <td>滚动事件处理函数节流的阈值。</td>
        </tr>
        <tr>
            <td>queue</td>
            <td>String</td>
            <td>'scroll'</td>
            <td>滚动队列名。</td>
        </tr>
        <tr>
            <td>scroll</td>
            <td>Boolean</td>
            <td>true</td>
            <td>是否把元素添加到滚动队列。</td>
        </tr>
        <tr>
            <td>class</td>
            <td>String</td>
            <td>''</td>
            <td>开始动画时添加到元素上的类名，多个类名使用空格分割，例如：'delay-1s faster'</td>
        </tr>
        <tr>
            <td colspan="4">生命周期函数：</td>
        </tr>
        <tr>
            <td>start</td>
            <td>Function( el, queue )</td>
            <td>null</td>
            <td>动画开始会被调用。el: 当前动画的元素，queue: 当前动画的队列名。</td>
        </tr>
        <tr>
            <td>end</td>
            <td>Function( el, queue )</td>
            <td>null</td>
            <td>动画结束会被调用。el: 当前动画的元素，queue: 当前动画的队列名。</td>
        </tr>
        <tr>
            <td>start</td>
            <td>Function( el, queue )</td>
            <td>null</td>
            <td>一个队列的所有动画结束后执行。el: 当前动画的元素，queue: 当前动画的队列名。</td>
        </tr>
        <tr>
            <td colspan="4">事件名，在动画执行的不同阶段会给元素发送事件，可以通过绑定不同的事件来实现对元素的控制。</td>
        </tr>
        <tr>
            <td>startType</td>
            <td>String</td>
            <td>'motionstart'</td>
            <td>动画开始。</td>
        </tr>
        <tr>
            <td>endType</td>
            <td>String</td>
            <td>'motionend'</td>
            <td>动画结束。</td>
        </tr>
        <tr>
            <td>finishType</td>
            <td>String</td>
            <td>'motionfinish'</td>
            <td>整个队列动画结束。</td>
        </tr>
            <tr><td colspan="4">基础的animation动画属性，可以通过在元素上定义对应属性进行覆盖。</td>
        </tr><tr>
            <td>name</td>
            <td>String</td>
            <td>'fadeIn'</td>
            <td>动画名称。</td>
        </tr>
        <tr>
            <td>duration</td>
            <td>String|Number</td>
            <td>null</td>
            <td>动画持续时间。传入数字时，单位为毫秒。</td>
        </tr>
        <tr>
            <td>timingFunction</td>
            <td>String</td>
            <td>null</td>
            <td>动画缓动公式。</td>
        </tr>
        <tr>
            <td>delay</td>
            <td>String|Number</td>
            <td>null</td>
            <td>动画延迟时间。传入数字时，单位为毫秒。</td>
        </tr>
        <tr>
            <td>iterationCount</td>
            <td>Number</td>
            <td>null</td>
            <td>动画播放次数。</td>
        </tr>
        <tr>
            <td>direction</td>
            <td>String</td>
            <td>null</td>
            <td>动画运动方向。</td>
        </tr>
        <tr>
            <td>fillMode</td>
            <td>String</td>
            <td>null</td>
            <td>动画填充模式。</td>
        </tr>
    </tbody>
</table>


# `data-motion`系列属性

配置参数中的选项一般都不能满足所有的业务要求，需要分别对不同的元素进行指定的设置。下面提供了一些元素的特性来实现此需求。

<table class="table">
    <thead>
        <tr>
            <th>特性名</th>
            <th>说明</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>data-motion-name</td>
            <td>对应着配置选项中的 'name'</td>
        </tr>
        <tr>
            <td>data-motion-duration</td>
            <td>对应着配置选项中的 'duration'</td>
        </tr>
        <tr>
            <td>data-motion-timing-function</td>
            <td>对应着配置选项中的 'timingFunction'</td>
        </tr>
        <tr>
            <td>data-motion-delay</td>
            <td>对应着配置选项中的 'delay'</td>
        </tr>
        <tr>
            <td>data-motion-iteration-count</td>
            <td>对应着配置选项中的 'iterationCount'</td>
        </tr>
        <tr>
            <td>data-motion-direction</td>
            <td>对应着配置选项中的 'direction'</td>
        </tr>
        <tr>
            <td>data-motion-fill-mode</td>
            <td>对应着配置选项中的 'fillMode'</td>
        </tr>
        <tr>
            <td>data-motion-expand-top</td>
            <td>对应着配置选项中的 'expandTop'</td>
        </tr>
        <tr>
            <td>data-motion-expand-bottom</td>
            <td>对应着配置选项中的 'expandBottom'</td>
        </tr>
    </tbody>
</table>


# 原型方法
<table class="table">
    <thead>
        <tr>
            <th>方法名</th>
            <th>说明</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>execute( Element [, queueName] )</td>
            <td>对所传元素执行指定队列的动画，默认队列名为default。</td>
        </tr>
        <tr>
            <td>inspect()</td>
            <td>正常情况下，在实例化motion和窗口滚动、大小改变时才会检查元素是否符合出场要求。但极个别情况下需要手动进行检查。</td>
        </tr>
        <tr>
            <td>inspectThrottle()</td>
            <td>和inspect()方法类似，和inspect()方法是同步立即检查；inspectThrottle()方法有一个节流的特性。</td>
        </tr>
        <tr>
            <td>destroy()</td>
            <td>销毁motion实例，常用于单页应用。</td>
        </tr>
    </tbody>
</table>


# 在轮播图中使用`motion`

一般在滑动到下一个滑块时将此滑块里指定的元素按照预先的配置播放出场动画。
此时通过Motion按照以下的方式也可以实现要求。

```
var selector = '.motion';
var swiperMotion = motion({
    selector: selector,
    scroll: false
});

var mySwiper = new Swiper('.swiper-container',{
    on: {
        slideChangeTransitionStart: function(){
            $( selector, this.slides[ this.activeIndex ] ).each(function() {
                swiperMotion.execute( this, 'motionIn' );
            });
        },
        slideChangeTransitionEnd: function(){
            $( selector, this.slides[ this.previousIndex ] ).each(function() {
                swiperMotion.execute( this, 'motionOut' );
            });
        },
    },
})
```

在上面的例子中，涉及到一个`scroll`配置项和`execute`实例方法。
`scroll`需设置为假，然后在指定的回调函数里，调用`execute`方法执行指定元素的指定队列的动画。

# 在线演示
[打开演示](https://sutras.github.io/motoin/)


# 更新日志
## 2021-01-26
- 添加 inspect、inspectThrottle 方法，用于手动检查元素是否符合出场要求。

## 2021-01-25
- 添加 destroy 方法，用于在单页应用中卸载事件。

## 2019-10-29
- 简化 data-motion 属性的值。
- 重新执行队列动画时结束之前的队列动画。
- 可以配置基础animation属性。
- 可以自定义滚动事件名。
- 可以通过指定选择器来选择要应用动画的元素。

## 2019-11-01
- 添加scroll配置选项，用于在轮播图中忽略滚动事件的监听

## 2019-11-23
- 修改了事件名

## 2019-12-01
- 修复移动端是否执行动画的bug

## 2020-04-20
- 尊重animate.css原来的animation值。
- 添加了class配置选项。

## 2020-11-16
- 重写了motion代码结构
- 修复个别bug
- 修改了接口