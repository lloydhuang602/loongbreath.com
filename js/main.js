// ======================================================
// Loong Breath International Ltd. | main.js (2025.10 Final Version)
// ======================================================

var orientate = window.innerWidth / window.innerHeight > 1 ? 'landscape' : 'portrait';
var autostereoscopyTween = null;
var xrTween = null;

var app = new Vue({
	
	el: '#app',
	data: {
        cases: {},
		isActive: false,
        isPlaying: false,
        isShowNav: false,
        type: typeof type !== 'undefined' ? type : 0,
        index: typeof index !== 'undefined' ? index : 0,
		lang: lang,
		langData: {}
	},

	// ======================================================
	// 初始化加载
	// ======================================================
	created: function () {
        var that = this;

        // 1️⃣ 加载案例数据
        $.get('./cases_multilang_all.json?v=' + version, function(data){
            that.cases = data;
            // ✅ 自动 decode 中文路径
            for (const type in that.cases) {
                if (!Array.isArray(that.cases[type])) continue;
                that.cases[type] = that.cases[type].map(function(item) {
                    if (item.video && item.video.src) {
                        item.video.src = decodeURI(item.video.src);
                    }
                    if (Array.isArray(item.pictures)) {
                        item.pictures = item.pictures.map(function(pic, idx){
                            if (typeof pic === "string") return {src: decodeURI(pic), alt: ""};
                            pic.src = decodeURI(pic.src);
                            return pic;
                        });
                    }
                    return item;
                });
            }
        });

        // 2️⃣ 加载多语言文本
		$.get('./lang.json?v=' + version, function(data){
            that.langData = data;
			document.querySelectorAll('[data-i18n]').forEach(function(element) {
				var key = element.getAttribute('data-i18n');
				if (that.langData[key] && that.langData[key][that.lang]) {
					element.textContent = that.langData[key][that.lang];
				}
			});
        });
	},

	// ======================================================
	// 页面挂载
	// ======================================================
	mounted: function () {
	    this.isActive = true;
	    setTimeout(function(){ new WOW().init(); }, 1000);

	    var video = document.querySelector("#caseVideo");
	    if (video) {
	        video.addEventListener("play", () => this.isPlaying = true);
	        video.addEventListener("pause", () => this.isPlaying = false);
	    }

	    // ✅ 动态生成结构化数据
	    this.$nextTick(() => {
	        const params = URI().search(true);
	        const t = params['type'];
	        const i = params['index'];

	        if (this.cases && this.cases[t] && this.cases[t][i]) {
	            const item = this.cases[t][i];
	            const data = {
	                "@context": "https://schema.org",
	                "@type": "VideoObject",
	                "name": (item.title.en || "Case Video") + " | Loong Breath International Ltd.",
	                "description": item.desc.en || "",
	                "thumbnailUrl": location.origin + "/" + (item.poster || ""),
	                "uploadDate": "2025-01-01",
	                "publisher": {
	                    "@type": "Organization",
	                    "name": "Loong Breath International Ltd.",
	                    "logo": {
	                        "@type": "ImageObject",
	                        "url": location.origin + "/favicon.ico"
	                    }
	                },
	                "contentUrl": location.origin + "/" + (item.video.src || item.video)
	            };
	            const tag = document.getElementById("structured-data");
	            if (tag) tag.textContent = JSON.stringify(data, null, 2);
	        }
	    });
	},

	// ======================================================
	// 页面方法集
	// ======================================================
	methods: {
	    // ▶️ 点击视频本身：切换播放/暂停
	    onClickVideo: function(evt) {
	        if (evt && evt.target && evt.target.classList.contains("play-btn")) return;
	        var video = evt.srcElement || evt.target;
	        if (video.paused) {
	            video.play().then(() => { this.isPlaying = true; });
	        } else {
	            video.pause();
	            this.isPlaying = false;
	        }
	    },

	    // ▶️ 点击自定义播放按钮：只播放
	    onClickPlayButton: function() {
	        var video = document.querySelector("#caseVideo");
	        if (video && video.paused) {
	            video.play()
	                .then(() => { this.isPlaying = true; })
	                .catch(err => console.warn("⚠️ 视频播放失败：", err));
	        }
	    },

        // 📂 打开导航
        showNav: function() { this.isShowNav = true; },

        // 📁 关闭导航
        hideNav: function() { this.isShowNav = false; },

        // 🌐 切换语言
		langChange: function () {
			var that = this;
			localStorage.setItem('lang', that.lang);
			document.querySelectorAll('[data-i18n]').forEach(function(element) {
				var key = element.getAttribute('data-i18n');
				if (that.langData[key] && that.langData[key][that.lang]) {
					element.textContent = that.langData[key][that.lang];
				}
			});
		},

		// 🧭 平滑滚动
		scrollTo: function(selector) {
		    const element = document.querySelector(selector);
		    if (!element) return;
		    this.isShowNav = false;
		    try {
		        element.scrollIntoView({
		            behavior: "smooth",
		            block: "start"
		        });
		    } catch (e) {
		        const top = element.getBoundingClientRect().top + window.pageYOffset;
		        window.scrollTo(0, top);
		    }
		}
    }

});

// ======================================================
// 背景滚动与缩放效果（方案 B，按元素相对视窗位置计算）
// ======================================================
$(window).on("load scroll", function () {
  var scrollTop = $(window).scrollTop();
  var windowHeight = $(window).height();

  $(".bgscroll").each(function () {
    var $el = $(this);
    var elementTop = $el.offset().top;
    var elementHeight = $el.outerHeight();

    // 计算当前元素出现在视口中的比例（0~1）
    var progress = (scrollTop + windowHeight - elementTop) / (windowHeight + elementHeight);
    progress = Math.min(Math.max(progress, 0), 1);

    // 背景垂直偏移：数值越大移动越明显
    var yOffset = (progress - 0.5) * 300; // 200 可以调大或调小
    $el.css("background-position", "center " + yOffset + "px");

    // 背景轻微缩放（可选），100是初始大小
    var scale = 100 + progress * 20;
    $el.css("background-size", scale + "% auto");
  });
});

