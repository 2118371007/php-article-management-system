$(document).ready(function () {
    let currentIndex = 0;
    const slides = $('.slide');
    const totalSlides = slides.length;

    // 初始化第一张幻灯片和指示器
    slides.first().addClass('active');
    $('.indicator').first().addClass('active');

    // 显示指定索引的幻灯片
    function showSlide(index) {
        // 移除所有幻灯片的 active 类
        slides.removeClass('active');
        $('.indicator').removeClass('active');
        
        // 处理索引范围
        if (index >= totalSlides) {
            currentIndex = 0;
        } else if (index < 0) {
            currentIndex = totalSlides - 1;
        } else {
            currentIndex = index;
        }
        
        // 添加 active 类到当前幻灯片和指示器
        slides.eq(currentIndex).addClass('active');
        $('.indicator').eq(currentIndex).addClass('active');
    }

    // 下一张幻灯片
    $('.next').click(function () {
        showSlide(currentIndex + 1);
    });

    // 上一张幻灯片
    $('.prev').click(function () {
        showSlide(currentIndex - 1);
    });

    // 指示器点击事件
    $('.indicator').click(function () {
        const index = $(this).index();
        showSlide(index);
    });

    // 自动播放
    let autoPlay = setInterval(function () {
        showSlide(currentIndex + 1);
    }, 5000);

    // 鼠标悬停时暂停自动播放
    $('.slider-container').hover(
        function () {
            clearInterval(autoPlay);
        },
        function () {
            autoPlay = setInterval(function () {
                showSlide(currentIndex + 1);
            }, 5000);
        }
    );

    // 触摸滑动支持
    let touchStartX = 0;
    let touchEndX = 0;

    $('.slider-container').on('touchstart', function (e) {
        touchStartX = e.originalEvent.touches[0].clientX;
    });

    $('.slider-container').on('touchend', function (e) {
        touchEndX = e.originalEvent.changedTouches[0].clientX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // 向左滑动，显示下一张
                showSlide(currentIndex + 1);
            } else {
                // 向右滑动，显示上一张
                showSlide(currentIndex - 1);
            }
        }
    }
});
