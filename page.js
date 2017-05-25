/****************************
 研报数据调用方法
 ReportRankList ： 调用个股研报
 ReportYlycList ： 调用盈利预测

 LastUpdate ：2011-06-11
 ****************************/
var Class = {
	create: function () {
		return function () {
			this.initialize.apply(this, arguments) }
	}
}
Object.extend = function (destination, source) {
	for (property in source) { destination[property] = source[property] }
	return destination; };
var ReportRankList = Class.create();

if (!location.origin)//解决ie不支持location.origin
	location.origin = location.protocol + "//" + location.hostname + (location.port ? ':' + location.port : '');

Object.extend(
	ReportRankList.prototype, {
		// 初始化
		initialize: function (opt) {
			var _t = this;
			var urlHeader = "";
			var defaultUrl = "http://datainterface.eastmoney.com";
			if (opt != null && opt.DataUrl != null) {
				urlHeader = opt.DataUrl;
				_t.options.dateurl = urlHeader + _t.options.dateurl;
			}
			else {
				_t.options.dateurl = defaultUrl + _t.options.dateurl;
			}
			var _t = this;
			Object.extend(_t.options, opt || {});
			var _table = document.getElementById(_t.options.id);
			if (!_table) {
				alert("数据显示容器未找到");
				return;
			}
			_t.cache.tbody = _table.getElementsByTagName("tbody")[0];
			_t.cache.thead = _table.getElementsByTagName("thead")[0];
			_t.cache.catecont = document.getElementById(_t.options.catecont);

			_t.cache.slt = {
				tp: "0", // 评级类型
				cg: "0", // 评级变动
				dt: "4", // 评级日期
				jg: "",  // 评级机构
				hy: ""   //行业
			}

			_t.initUserUpdate();
			if (_t.cache.page != 1 || location.href.indexOf("#") > 0) {
				_t.parseUrl();
			}
		},

		// 配置
		options: {
			id: "dt_1",
			catecont: "cate_1",
			pagenav: "PageCont",
			miniPageNav: "miniPageNav",
			cate: "all",
			sort: { type: "G", row: 9, desc: -1 }, //-1,0,1 0-不排序
			cells: 8,
			dateurl: '/EM_DataCenter/js.aspx?type=SR&sty=HYSR&mkt={tp}&stat={cg}&cmd={dt}&code={jg}&sc={hy}&ps={pageSize}&p={page}&js=var%20{jsname}={"data":[(x)],"pages":"(pc)","update":"(ud)","count":"(count)"}',
			pagesize: 50
		},

		//缓存
		cache: {
			data: null,
			sort: { type: "G", row: 9, desc: -1 },
			page: 1,
			pages: 1,
			upated: false,
			dataArr: null,
			tbody: null,
			thead: null
		},

		//随机码
		getCode: function (num) {
			var str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
			var codes = str.split('');
			num = num || 6;
			var code = "";
			for (var i = 0; i < num; i++) {
				code += codes[Math.floor(Math.random() * 52)];
			}
			return code;
		},

		parseUrl: function () {
			var _this = this;
			var url = location.href;
			if (url.indexOf("#") == -1) {
				_this.update(true);
				return false;
			}

			var index = (url.indexOf("#") == -1) ? url.length : url.indexOf("#") + 1;
			var param = url.substring(index, url.length);

			var b = new Base64();
			param = b.decode(param);


			var tp = (param.match(/tp=(.*?)($|&)/i) != null) ? param.match(/tp=(.*?)($|&)/i)[1] : "";
			var cg = (param.match(/cg=(.*?)($|&)/i) != null) ? param.match(/cg=(.*?)($|&)/i)[1] : "";
			var dt = (param.match(/dt=(.*?)($|&)/i) != null) ? param.match(/dt=(.*?)($|&)/i)[1] : "";
			var jg = (param.match(/jg=(.*?)($|&)/i) != null) ? param.match(/jg=(.*?)($|&)/i)[1] : "";
			var hy = (param.match(/hy=(.*?)($|&)/i) != null) ? param.match(/hy=(.*?)($|&)/i)[1] : "";
			var page = (param.match(/page=(.*?)($|&)/i) != null) ? param.match(/page=(.*?)($|&)/i)[1] : "";
			var objReg = /\d{6,10}/;
			if (!objReg.test(jg) && jg != "") {
				var dindex = url.indexOf("/report") + 7;
				window.location.href = "http://data.eastmoney.com/reportold" + url.substring(dindex);
			}
			//alert("tp:"+tp+"\ncg:"+cg+"\ndt:"+dt+"\njg:"+jg);
			_this.cache.slt.tp = tp == "" ? "0" : tp;
			_this.cache.slt.cg = cg == "" ? "0" : cg;
			_this.cache.slt.dt = dt == "" ? "2" : dt;
			_this.cache.slt.jg = jg == "" ? "" : jg;
			_this.cache.slt.hy = hy == "" ? "" : hy;
			_this.cache.page = page;

			_this.resetAll();

		},

		parperUrl: function () {
			var _t = this,
				_url = _t.options.dateurl;

			_t.cache.slt.jg = _t.cache.slt.jg == "all" ? "" : _t.cache.slt.jg;
			_t.cache.slt.hy = _t.cache.slt.hy == "all" ? "" : _t.cache.slt.hy;
			_url = _url.replace("{tp}", _t.cache.slt.tp);
			_url = _url.replace("{cg}", _t.cache.slt.cg);
			_url = _url.replace("{dt}", _t.cache.slt.dt);
			_url = _url.replace("{jg}", _t.cache.slt.jg);
			_url = _url.replace("{hy}", _t.cache.slt.hy);
			//_url = _url.replace("{style}", "ggyb");
			_url = _url.replace("{pageSize}", _t.options.pagesize);
			_url = _url.replace("{page}", _t.cache.page);

			return _url;
		},

		firstInit: function (jsonData) {
			if (location.href.indexOf("#") < 0) {
				var _t = this;
				_t.cache.data = jsonData.data;
				_t.cache.page = 1;
				var pages = 100;
				if (jsonData != null && jsonData.pages != null) {
					pages = jsonData.pages;
				}
				_t.cache.pages = pages;
				_t.cache.update = "2014-7-25";
				_t.cache.count = jsonData.count;
				_t.cache.updated = true;

				setTimeout(function () { _t.display(); SetWidth("dt_1"); }, 0)
			}
		},
		update: function (state) {
			var _t = this,
				jsname = _t.getCode(8),
				_url = _t.parperUrl();
			state = (state == "undefined") ? false : state;
			state = (state == true) ? true : false;
			_t.cache.code = jsname;

			_url = _url.replace("{jsname}", jsname);
			_url += (_url.indexOf('?') > -1) ? "&rt=" : "?rt=";
			_url += parseInt(parseInt(new Date().getTime()) / 30000); //最少30秒更新一次

			if (state == false) {
				_t.showLoading();
			}

			//alert(_url);
			_t.tools.loadJs(_url, "utf-8", function () {
				if (!(eval("typeof " + jsname) == "undefined") || eval("typeof " + jsname == null)) {
					var _xgdata = eval(jsname);

					//alert(_xgdata.data)
					// 数据滞后
					if (jsname != _t.cache.code) {
						return;
					}

					_t.cache.data = _xgdata.data;
					_t.cache.pages = _xgdata.pages;
					//_t.cache.update = _xgdata.update;
					_t.cache.count = _xgdata.count;
					_t.cache.updated = true;

					setTimeout(function () { _t.display(); SetWidth("dt_1"); }, 0)
				} else {
					alert("数据加载失败，请刷新页面重新尝试！");
				}
			});
		},

		// 显示加载
		showLoading: function () {
			var _t = this,
				_c = _t.options.cells,
				_body = _t.cache.tbody;
			var _h = _body.offsetHeight;
			_h = (_h < 200) ? 200 : _h;

			var trs = _body.getElementsByTagName("tr");
			for (var i = trs.length - 1; i >= 0; i--) {
				_body.removeChild(trs[i]);
			}
			var rowTp = _body.insertRow(-1);
			var cell = rowTp.insertCell(0);
			cell.setAttribute("colSpan", _c);
			cell.innerHTML = "<div style=\"color:#666;height:" + _h + "px;line-height:200px;\">数据加载中...</div>";

			_body.appendChild(rowTp);
		},

		// 显示加载
		showNoData: function () {
			var _t = this,
				_c = _t.options.cells,
				_body = _t.cache.tbody;
			var _h = _body.offsetHeight;
			_h = (_h < 200) ? 200 : _h;

			var trs = _body.getElementsByTagName("tr");
			//for(var i = trs.length -1; i>=0;i--){
			//    _body.removeChild(trs[i]);
			//}
			var rowTp = _body.insertRow(-1);
			var cell = rowTp.insertCell(0);
			cell.setAttribute("colSpan", _c);
			cell.innerHTML = "<div style=\"color:#666;height:" + _h + "px;line-height:200px;\">没有相关数据...</div>";
			_body.appendChild(rowTp);
		},

		// 触发用户刷新
		initUserUpdate: function () {
			var updateBtn = this.options.id + "_update", _t = this;
			//alert()
			if (document.getElementById(updateBtn)) {
				document.getElementById(updateBtn).onclick = function () {
					_t.userUpdate();
				}
			}
		},

		userUpdate: function () {
			// 清除数据
			var _t = this,
				_c = _t.options.cells,
				_body = _t.cache.tbody,
				_head = _t.cache.thead;

			var trs = _body.getElementsByTagName("tr");
			try { document.getElementById(_t.options.pagenav).innerHTML = ""; } catch (e) { };
			for (var i = trs.length - 1; i >= 0; i--) {
				_body.removeChild(trs[i]);
			}

			var rowTp = _body.insertRow(-1),
				cell = rowTp.insertCell(0);
			_body.appendChild(rowTp);

			cell.setAttribute("colSpan", _c);
			cell.className = "loading";
			cell.innerHTML = "正在加载数据...";
			setTimeout(function () { _t.updateUrl(); }, 100);
		},

		//初始化排序
		initSort: function () {
			var _t = this,
				__t = _t.options.cate,
				_body = _t.cache.tbody,
				_head = _t.cache.thead;
			var ths = _head.getElementsByTagName("th");

			if (__t == "all") {
				Object.extend(_t.cache.sort, { type: "G", row: 9, desc: -1 } || {});
			} else if (__t == "dx") {
				Object.extend(_t.cache.sort, { type: "G", row: 7, desc: -1 } || {});
			} else if (__t == "gk") {
				Object.extend(_t.cache.sort, { type: "G", row: 9, desc: -1 } || {});
			}
			ths = document.getElementById("th_" + __t).getElementsByTagName("th");

			//alert(_t.cache.sort.row);
			for (var i = 0, j = ths.length; i < j; i++) {
				var _th = ths[i], _sort = _th.getAttribute("sort");
				if (_sort != null && _sort != "" && _sort.indexOf("_") > -1) {
					var _row = _sort.split("_")[0];
					var _id = _sort.split("_")[1];
					if (isNaN(_row)) {
						//
					} else {
						var _a = document.createElement("a"),
							val = _th.innerHTML.replace(/<a.*?>/ig, "").replace(/<img.*?>/ig, "");

						_th.innerHTML = "";
						_th.appendChild(_a);

						_a.innerHTML = val;
						_a.setAttribute("href", "javascript:void(0);");
						_a.setAttribute("target", "_self");
						_a.onclick = function (n, r, v) { _t.sortit(n, r, v, this); return false; }.bind(this, _id, _row, _a);
						_a.onfocus = function () { this.blur() };

						if (_t.cache.sort.type == _id && _t.cache.sort.desc != 0) {

							var _img = document.createElement("img");
							_a.appendChild(_img);
							_img.style.height = "10px";
							_img.style.width = "11px";
							_img.src = (_t.cache.sort.desc == -1) ? "/images/down.gif" : "/images/up.gif"
							_t.cache.sort.th = _a;
						}
					}
				}
			}
		},

		//初始化分类
		initCate: function () {
			var _t = this,
				_ul = _t.cache.catecont;
			var _cate = 0;
			if (_ul == null) {
				return;
			}

			//获取切换类型
			var url = location.href;
			var type = url.match(/.html#([^#$]*?)(?=#|$)/i);
			var _type = (type == null || type.length < 1) ? _t.options.cate : type[1].toLowerCase();
			if (!(_type == "all" || _type == "dx" || _type == "gk")) {
				_type == "all";
			}
			_t.options.cate = _type;
			var lis = _ul.getElementsByTagName("li");
			var _totle = lis.length;
			for (var i = 0; i < _totle; i++) {
				var _li = lis[i], _cate = _li.getAttribute("cate");
				_cate = (_cate == null && _cate == "") ? "all" : _cate;

				//附加事件
				if (_cate == _t.options.cate) {
					_li.className = "at";
					_t.cache.cateli = _li;
				} else {
					_li.className = "";
				}

				_li.onclick = function (o, c) {
					if (o == _t.cache.cateli) return;
					var _lis = _ul.getElementsByTagName("li");
					for (var j = 0; j < _totle; j++) {
						var __c = _lis[j].getAttribute("cate");
						var __th = document.getElementById("th_" + __c);
						if (__th) __th.style.display = "none";
					}
					var __cache = null;
					for (var j = 0; j < _totle; j++) {
						var __c = _lis[j].getAttribute("cate");
						var __th = document.getElementById("th_" + __c);
						if (_lis[j] == o) {
							_lis[j].className = "at";
							_t.cache.cateli = o;
							_t.options.cate = c;
							__cache = __th;
						} else {
							_lis[j].className = "";
							if (__th) __th.style.display = "none";
						}
					}
					if (__cache) __cache.style.display = "";
					_t.cache.upated = true;
					_t.cache.page = 1;
					_t.initSort();

					setTimeout(function () {
						_t.scorllTop();
						_t.updateUrl();
					}, 0);
					return false;
				}.bind(this, _li, _cate)
			}
		},

		// 排序切换
		sortit: function (id, row, th, t) {
			var _t = this;

			if (id == _t.cache.sort.type) {
				var _ht = th.innerHTML;

				_ht = _ht.replace(/<img.*?>/ig, "");
				if (_t.cache.sort.desc == -1) {
					_t.cache.sort.desc = 1;
					th.innerHTML = _ht + "<img src=\"/images/up.gif\" width=\"11\" height=\"10\">";
				} else {
					_t.cache.sort.desc = -1;
					th.innerHTML = _ht + "<img src=\"/images/down.gif\" width=\"11\" height=\"10\">";
				}
			} else {
				var _ht = _t.cache.sort.th.innerHTML;
				_ht = _ht.replace(/<img.*?>/ig, "");
				_t.cache.sort.th.innerHTML = _ht;
				_t.cache.sort.type = id;
				_t.cache.sort.row = row;
				_t.cache.sort.desc = -1;
				_t.cache.sort.th = th;
				th.innerHTML = th.innerHTML + "<img src=\"/images/down.gif\" width=\"11\" height=\"10\">";
			};
			setTimeout(function () { _t.updateUrl() }, 0);
		},

		// 分页
		pageit: function () {
			var _t = this,
				p = _t.cache.page || 1,
				pages = _t.cache.pages || 1;

			var _pn = _t.options.pagenav;

			if (_pn == null) {
				return;
			}

			p = isNaN(p) ? 1 : parseInt(p);
			//miniPageNav
			var _minipn = _t.options.miniPageNav;
			if (document.getElementById(_minipn)) {
				document.getElementById(_minipn).style.display = "block";
				var mini_bs = document.getElementById(_minipn).getElementsByTagName("b");
				if (mini_bs.length > 3) {
					mini_bs[3].innerHTML = "共<span class=\"red\">" + pages + "</span>页";

					mini_bs[1].innerHTML = "上一页";
					mini_bs[2].innerHTML = "下一页";
					if (p <= 1) {
						mini_bs[1].className = "n1";
						mini_bs[1].onclick = null;
						mini_bs[1].setAttribute("title", "");
					} else {
						mini_bs[1].className = "n2";
						mini_bs[1].setAttribute("title", "转到第" + (p - 1) + "页");
						mini_bs[1].onclick = function (n) { _t.go(p - 1) };
					}
					if (p >= pages) {
						mini_bs[2].className = "n1";
						mini_bs[2].setAttribute("title", "");
						mini_bs[2].onclick = null;
					} else {
						mini_bs[2].className = "n2";
						mini_bs[2].setAttribute("title", "转到第" + (p + 1) + "页");
						mini_bs[2].onclick = function (n) { _t.go(p + 1) };
					}
					mini_bs[0].innerHTML = "当前第<span class=\"red\">" + p + "</span>页";
				}
			}

			_pn = document.getElementById(_pn);

			// 性能待优化 IE6
			// 方法 移除每个元素的事件，优化内存
			_pn.innerHTML = "";

			if (pages == 0 || p == pages && pages == 1) {
				_pn.parentNode.style.display = "none";
				return;
			} else {
				_pn.parentNode.style.display = "";
			}

			var _a = document.createElement("a");

			_pn.appendChild(_a);

			_a.setAttribute("href", "javascript:void(0);");
			_a.setAttribute("target", "_self");
			_a.innerHTML = "上一页";
			if (p == 1) {
				_a.className = "nolink";
				_a.onclick = function () { return false; };
			} else {
				_a.className = "";
				_a.setAttribute("href", "javascript:void(0);");
				_a.setAttribute("target", "_self");
				_a.setAttribute("title", "转到第" + (p - 1) + "页");
				_a.onclick = function () { _t.go(p - 1) };
			}

			var start = (p > 3) ? p - 2 : 1;
			start = (p > pages - 3 && pages > 4) ? pages - 4 : start;
			var end = (start == 1) ? 5 : start + 4;

			end = (end > pages) ? pages : end;
			if (start > 1) {
				var pre = ((start - 3) < 1) ? 1 : (start - 3);
				var _pre = ((start - 3) > pages) ? pages : (next + 3);

				_a = document.createElement("a");
				_pn.appendChild(_a);
				_a.setAttribute("href", "javascript:void(0);");
				_a.setAttribute("target", "_self");
				_a.setAttribute("title", "转到第一页");
				_a.onclick = function () { _t.go(1) };
				_a.innerHTML = 1;

				if (pre > 1) {
					_a = document.createElement("a");
					_pn.appendChild(_a);
					_a.setAttribute("href", "javascript:void(0);");
					_a.setAttribute("target", "_self");
					_a.setAttribute("title", "转到上一组");
					_a.onclick = function () { _t.go(pre) };
					_a.className = "next";
					_a.innerHTML = "...";
				}
			}
			for (var i = start; i <= end; i++) {
				if (p == i) {
					_a = document.createElement("span");
					_pn.appendChild(_a);
					_a.className = "at";
					_a.innerHTML = i;
				} else {
					_a = document.createElement("a");
					_pn.appendChild(_a);
					_a.setAttribute("href", "javascript:void(0);");
					_a.setAttribute("target", "_self");
					_a.setAttribute("title", "转到第" + i + "页");
					_a.onclick = function (n) { _t.go(n) }.bind(this, i);
					_a.innerHTML = i;
				}
			}
			if (pages > end) {
				var next = ((end + 3) > pages) ? pages : (end + 3);
				var _nex = ((next + 3) > pages) ? pages : (next + 3);
				_a = document.createElement("a");
				_pn.appendChild(_a);
				_a.setAttribute("href", "javascript:void(0);");
				_a.setAttribute("target", "_self");
				_a.setAttribute("title", "转到下一组");
				_a.onclick = function () { _t.go(next) };
				_a.className = "next";
				_a.innerHTML = "...";

				if (next < pages) {
					_a = document.createElement("a");
					_pn.appendChild(_a);
					_a.setAttribute("href", "javascript:void(0);");
					_a.setAttribute("target", "_self");
					_a.setAttribute("title", "转到最后一页");
					_a.onclick = function () { _t.go(pages) };
					_a.innerHTML = pages;
				}
			}

			_a = document.createElement("a");
			_pn.appendChild(_a);
			_a.setAttribute("href", "javascript:void(0);");
			_a.setAttribute("target", "_self");

			if (p == pages) {
				_a.className = "nolink";
				_a.innerHTML = "下一页";
				_a.onclick = function () { return false; };
			} else {
				_a.innerHTML = "下一页";
				_a.onclick = function () { _t.go(p + 1); };
				_a.setAttribute("title", "转到" + (p + 1) + "页");
			}

			_a = document.createElement("span");
			_pn.appendChild(_a);
			_a.className = "txt";
			_a.innerHTML = "&nbsp;&nbsp;转到";

			_a = document.createElement("input");
			_pn.appendChild(_a);
			_a.className = "txt";
			_a.id = "gopage";
			_a.value = p;

			_a = document.createElement("a");
			_pn.appendChild(_a);
			_a.className = "btn_link";
			_a.onclick = function () {
				if (document.getElementById("gopage")) {
					var p = document.getElementById("gopage").value;
					if (isNaN(p) || parseInt(p) < 0) {
						p = 1;
					}
					_t.go(p);
				}
			};
			_a.innerHTML = "Go";
		},

		// 转到第N页
		go: function (p) {
			var _t = this;
			p = (parseInt(p) > parseInt(_t.cache.pages)) ? _t.cache.pages : p;
			p = (p < 1) ? 1 : p;
			_t.cache.page = p;
			setTimeout(function () {
				_t.scorllTop();
				_t.updateUrl();
			}, 0);

		},

		// 滚动到首屏
		scorllTop: function () {
			var next = true, _this = this,
				_topnode = document.getElementById("datatitle") || document.body;;
			_rect = this.tools.rect(_topnode),
				_top = _rect.top,
				tmp_top = this.tools.getScrollTop();


			// 锁定
			wheel(function () { next = false; });

			var s = function (b, e) {
				var _t = this;
				_t.b = b;
				_t.e = e;
				_t.c = _t.e - _t.b;
				_t.d = ('\v' == 'v') ? 30 : 60;
				_t.t = 1;
				_t.w = function (t, b, c, d) {
					//return c*(t/=d)*t + b;
					return -c * (t /= d) * (t - 2) + b;
				}
				function run() {
					_tmp = _t.w(_t.t, _t.b, _t.c, _t.d);
					window.scrollTo(0, _tmp);
					if (_t.t < _t.d) {
						_t.t++; setTimeout(run, 10);
					} else {
						wheel(function () { next = true });
					}
				}
				run();
			}
			new s(tmp_top, _top);
		},
		getYingXiangLi: function (count) {
			if (count == 1) {
				return "★";
			}
			else if (count == 2) {
				return "★★";
			}
			else if (count == 3) {
				return "★★★";
			}
			else if (count == 4) {
				return "★★★★";
			}
			else if (count == 5) {
				return "★★★★★";
			}
			else { return ""; }
		},
		// 显示到页面
		display: function (x) {
			x = (x != true) ? false : true;
			var _t = this,
				_d = _t.cache.data,
				_c = _t.options.cells,
				__t = _t.options.cate,
				_p = _t.cache.page || 1,
				_ps = _t.options.pagesize || 50,
				_body = _t.cache.tbody,
				_head = _t.cache.thead;
			// clear data

			var trs = _body.getElementsByTagName("tr");
			for (var i = trs.length - 1; i >= 0; i--) {
				_body.removeChild(trs[i]);
			}
			var rowTp = _body.insertRow(-1);
			for (var i = 0; i < _c; i++) {
				var cell = rowTp.insertCell(i);
			}

			var _totle = _d.length;

			document.getElementById("list_num").innerHTML = _t.cache.count;
			// bind data
			if (_totle == 0 || _d[0].stats != null) {
				_t.showNoData();
			}
			if (_t.cache.count > 0) {
				for (var i = 0; i < _totle; i++) {
					var data = _d[i].split(",");
					var row = rowTp.cloneNode(true);
					_body.appendChild(row);
					var _class = (i % 2 == 0) ? "" : "odd";
					var _arr = ["上调", "下调", "首次", "维持", "无"],
						_industryID = data[6],
						_industryName = data[10],
						//等修改111
						//涨跌
						_percent = data[11].replace("%", ""),
						_urldate = data[1],
						//报告日期
						_date = data[1],
						_grade = data[7],
						_change = data[0],
						_jg = data[4],
						_jgID = data[3],


						_id = data[2],
						_title = data[9],
						//机构影响力
						//需求 #71610
						//_influence = _t.getYingXiangLi(data[5]),
						_tit = _t.tools.subString(_title, 45, true);
					_date = _date.replace("T", "-").replace(/\//g, "-");
					//_influence = _t.tools.showStar(_influence);
					_percent = _t.tools.getColorStr(((_percent == "" || isNaN(_percent))
						? "-" : parseFloat(_percent).toFixed(2) + "%"), _percent, 0);
					_date = _date.replace("T", "");
					_date = (/\d{4}-\d{1,2}-\d{1,2}/i).test(_date) ? "<span title=\"" + _date + "\" class=\"txt\">"
						+ new Date(Date.parse(_date.replace(/-/ig, "/"))).format("yyyy-MM-dd") + "</span>" : "-";

					_urldate = _urldate.replace("T", "").replace(/\//g, "-");
					_urldate = (/\d{4}-\d{1,2}-\d{1,2}/i).test(_urldate) ? new Date(Date.parse(_urldate.replace(/-/ig, "/"))).format("yyyyMMdd") : "-";

					var _qs_link = (_t.options.isSoft ? "/soft/reportNew/" : "/report/") + _jgID + "_0.html",
						_hy_link = "/report/" + _industryID + ".html",
						_xx_link = "/report/" + _industryID + "yb_1.html",
						_hq_link = "http://quote.eastmoney.com/center/list.html#28002" + _industryID + "_0_2",
						_gb_link = "http://guba.eastmoney.com/list,bk" + ("0000" + _industryID).substring(_industryID.toString().length) + ".html",
						_zq_link = "http://stock.eastmoney.com/hangye/hy" + _industryID + ".html",
						_zx_link = "http://so.eastmoney.com/Search.htm?q=" + escape(_industryName) + "&m=0&t=2&s=1&p=1"; //资讯
					_zjl_link = "http://data.eastmoney.com/bkzj/" + _industryID + ".html",
						_yb_link = _urldate + "/hy," + _id + ".html";

					row.className = _class;
					row.onmouseover = function () {
						this.className = "over";
					}

					row.onmouseout = function (o, _c) {
						o.className = _c;
					}.bind(this, row, _class)

					row.cells[0].innerHTML = _date;
					if (!_t.options.isSoft) {
						row.cells[1].innerHTML = "<a href=\"" + _hq_link + "\">" + _industryName + "</a>";
						row.cells[3].innerHTML = "<a href=\"" + _xx_link + "\" class=\"red\">详细</a> <a href=\"" + _zjl_link + "\" >资金流</a> <a href=\"" + _gb_link + "\">股吧</a> <a href=\"" + _zq_link + "\">专区</a> ";
						row.cells[4].innerHTML = "<div class=\"report_tit\"><a href=\"/report/" + _yb_link + "\" title=\"" + _title + "\">" + _tit + "</a></div>";
					} else {
						row.cells[1].innerHTML = '<a hidefocus="true" href="javascript:;" onclick="external.OnClickEvent(this.rel);" rel="return(false &amp;&amp; [].push(\'skip.html#type=CC&amp;code=020' + _industryID + '\'))">' + _industryName + "</a>";
						row.cells[3].style.display = "none";
						row.cells[4].innerHTML = '<div class="report_tit"><a hidefocus="true" href="javascript:;" onclick="external.OnClickEvent(this.rel);" rel="return(false &amp;&amp; [].push(\'#type=03&amp;title=' + _industryName + '研报正文&amp;size=1024x650&amp;url=' + location.origin + "/soft/reportNew/" + _yb_link + '\'))" title="' + _title + '">' + _tit + '</a></div>';//研报
					}
					row.cells[2].innerHTML = "" + _percent + "";
					row.cells[4].className = "tleft";
					row.cells[5].innerHTML = "" + _grade == "" ? "-" : _grade + "";
					row.cells[6].innerHTML = "" + _change + "";
					row.cells[7].innerHTML = "<a href=\"" + _qs_link + "\" >" + _jg + "</a>";
					//需求 #71610
					//row.cells[8].innerHTML = "<span class=\"wjx\">" + _influence + "</span>";
				}
			}
			_body.removeChild(rowTp);
			_t.pageit();
		},

		// 标记选项及选择历史
		resetSlt: function (t) {
			var _t = this,
				_cont = document.getElementById("slt-" + t + "-cont"),
				_hiscont = document.getElementById("slt-list-cont"),
				_reset = document.getElementById("resetAll"),
				_l, _att, _h2, _o, _l2, _ul;
			if (_cont) {
				if (t == "dt") {
					if (_cont.tagName.toLowerCase() != "select") return;
					_l = _cont.options;
					for (var i = 0, j = _l.length; i < j; i++) {
						_att = _l[i].value;
						if (_t.cache.slt[t] == _att) {
							_l[i].selected = true;
							if (_t.cache.slt[t] == "2") {
								_h2 = document.getElementById("slt-his-cont-" + t);
								if (_h2) {
									_h2.parentNode.removeChild(_h2);
								}
							} else {
								_t.setHis(t, _l[i].text);
							}
						} else {
							_l[i].selected = false;
						}
					}
				} else {
					_l = _cont.getElementsByTagName("li");
					for (var i = 0, j = _l.length; i < j; i++) {
						_att = _l[i].getAttribute("val");
						if (_t.cache.slt[t] == _att) {
							//jg要特别处理
							if (t == "jg" || t == "hy") {
								_l2 = document.getElementById("slt-" + t + "-his");
								_ul = _t.tools.getParentNode(_l[i], "ul");
								if (_ul && _t.tools.hasClass(_ul, "more-jg-list")) {
									_l2.innerHTML = _l[i].innerHTML;
									_l2.setAttribute("val", _att);
									_t.tools.addClass(_l2, "at");
								} else {
									_t.tools.addClass(_l[i], "at");
								}
							} else {
								_t.tools.addClass(_l[i], "at");
							}
							if (_t.cache.slt[t] == "0" || _t.cache.slt[t] == "") {
								_h2 = document.getElementById("slt-his-cont-" + t);
								if (_h2) {
									_h2.parentNode.removeChild(_h2);
								}
							} else {
								_o = _l[i].getElementsByTagName("a");
								if (_o.length > 0) {
									_t.setHis(t, _o[0].innerHTML);
								}
							}
						} else {
							_t.tools.removeClass(_l[i], "at");
						}
					}
				}
			}

			if (_hiscont.innerHTML == "") {
				_reset.style.display = "none";
			} else {
				_reset.style.display = "block";
			}
		},

		// 选择评级类别
		selectType: function (o, t, z) {
			var _t = this,
				_o = _t.tools.getParentNode(o, "li"),
				t = _o.getAttribute("val");
			if (this.cache.slt.tp == t) { return; }
			_t.cache.slt.tp = (t == null) ? "all" : t;
			_t.resetSlt("tp");
			_t.updateUrl();
		},

		// 选择评级变动
		selectChange: function (o, t, z) {
			var _t = this,
				_o = _t.tools.getParentNode(o, "li"),
				t = _o.getAttribute("val");
			if (_t.cache.slt.cg == t) { return; }
			_t.cache.slt.cg = (t == null) ? "all" : t;
			_t.resetSlt("cg");
			_t.updateUrl();
		},

		// 选择评级机构
		selectJg: function (o, t, z) {
			var _t = this,
				_o = _t.tools.getParentNode(o, "li"),
				t = _o.getAttribute("val");
			if (_t.cache.slt.jg == t) { return; }
			_t.cache.slt.jg = (t == null) ? "all" : t;
			_t.resetSlt("jg");
			_t.hiddenAllJgList();
			_t.updateUrl();
		},

		// 选择行业
		selectHy: function (o, t, z) {
			var _t = this,
				_o = _t.tools.getParentNode(o, "li"),
				t = _o.getAttribute("val");
			if (_t.cache.slt.hy == t) { return; }
			_t.cache.slt.hy = (t == null) ? "all" : t;
			//alert(_t.cache.slt.hy);
			_t.resetSlt("hy");
			_t.hiddenAllHyList();
			_t.updateUrl();
		},

		// 选择评级日期
		selectDate: function (o, t, z) {
			var _t = this,
				_o = o.options[o.selectedIndex];
			if (_o.value == this.cache.slt.dt) { return; }
			_t.cache.slt.dt = _o.value;
			_t.setHis("dt", _o.text);
			_t.updateUrl();
		},

		setHis: function (t, v) {
			var _t = this,
				_v = { "dt": "报告日期", "tp": "评级类别", "cg": "评级变动", "jg": "评级机构", "hy": "行业" }
			_h1 = document.getElementById("slt-list-cont"),
				_h2 = document.getElementById("slt-his-cont-" + t);
			if (_h2) {
				_h2.innerHTML = (t in _v) ? _v[t] : "";
				_h2.innerHTML += "-" + v + " <img height=\"14\" width=\"14\" src=\"/images/ico_close.gif\" onclick=\"sltRemove('" + t + "')\">";
			} else {
				_h2 = document.createElement("span");
				_h2.className = "his";
				_h2.id = "slt-his-cont-" + t;
				_h2.innerHTML = (t in _v) ? _v[t] : "";
				_h2.innerHTML += "-" + v + " <img height=\"14\" width=\"14\" src=\"/images/ico_close.gif\" onclick=\"sltRemove('" + t + "')\">";

				if (_h1.childNodes.length > 0) {
					_h1.insertBefore(_h2, _h1.childNodes[0]);
				} else {
					_h1.appendChild(_h2);
				}
			}
		},



		// 删除选择历史
		deleteSlt: function (t) {
			if (t == "dt") {
				this.cache.slt[t] = "2";
			}
			else if (t == "jg" || t == "hy") {
				this.cache.slt[t] = "";
			}
			else {
				this.cache.slt[t] = "0";
			}
			//this.cache.slt[t] = t == "dt" ? "2" : "0";
			this.resetSlt(t);
			this.updateUrl();
		},

		// 重新选择
		deleteAll: function (t) {
			this.cache.slt.tp = "0";
			this.cache.slt.cg = "0";
			this.cache.slt.dt = "2";
			this.cache.slt.jg = "";
			this.cache.slt.hy = "";

			this.resetSlt("tp");
			this.resetSlt("cg");
			this.resetSlt("dt")
			this.resetSlt("jg");
			this.resetSlt("hy");

			document.getElementById("resetAll").style.display = "none";
			this.updateUrl();
		},

		// 重新选择
		resetAll: function (t) {
			this.resetSlt("tp");
			this.resetSlt("cg");
			this.resetSlt("dt")
			this.resetSlt("jg");
			this.resetSlt("hy");

			this.update(true);
		},

		showAllJgList: function (obj) {
			var _list_obj = document.getElementById("all-jg-list"),
				_link_obj = obj;
			if (_link_obj.getAttribute("mv") != "y") {
				_list_obj.onmouseout = _link_obj.onmouseout = function () {
					_list_obj.style.display = "none";
				}
				_list_obj.onmouseover = function () {
					_list_obj.style.display = "block";
				}
				_link_obj.setAttribute("mv", "y");
			}
			_list_obj.style.display = "block";
		},

		hiddenAllJgList: function (obj) {
			var _list_obj = document.getElementById("all-jg-list")
			_list_obj.style.display = "none";
		},

		showAllHyList: function (obj) {
			//alert('a');


			//document.getElementById("slt-dt-cont").style.display = "none";
			var _list_obj = document.getElementById("all-hy-list"),
				_link_obj = obj;

			var _maskIfarme = document.getElementById("maskIframe");
			if (_maskIfarme && _maskIfarme != "undefined") {
				_maskIfarme.style.display = "block";
			} else {
				_maskIfarme = document.createElement("iframe");
				_maskIfarme.id = "maskIframe";
				_maskIfarme.frameBorder = "0";
				//_maskIfarme.scrolling = "auto";
				_maskIfarme.marginWidth = "0";
				_maskIfarme.marginHeight = "0";

				_maskIfarme.style.position = "absolute";
				_maskIfarme.style.right = "0px";
				_maskIfarme.style.top = "14px";
				_maskIfarme.style.zIndex = "998";
				_list_obj.parentNode.insertBefore(_maskIfarme, _list_obj);
			}

			if (_link_obj.getAttribute("mv") != "y") {
				_list_obj.onmouseout = _link_obj.onmouseout = function () {
					_list_obj.style.display = "none";
					_maskIfarme.style.display = "none";
				}
				_list_obj.onmouseover = function () {
					_list_obj.style.display = "block";
					_maskIfarme.style.display = "block";
				}
				_link_obj.setAttribute("mv", "y");
			}
			_list_obj.style.display = "block";

		},

		hiddenAllHyList: function (obj) {

			var _list_obj = document.getElementById("all-hy-list")
			_list_obj.style.display = "none";
			var _maskIfarme = document.getElementById("maskIframe");
			if (_maskIfarme && _maskIfarme != "undefined") {
				_maskIfarme.style.display = "none";
			}
		},


		//
		updateUrl: function (s) {
			var _t = this;
			//alert(_t.cache.slt.hy);
			s = s || 0;
			var url = location.href;
			var index = (url.indexOf("#") == -1) ? url.length : url.indexOf("#");
			var def = url.substring(0, index);
			var str = (_t.cache.slt.tp == "" || _t.cache.slt.tp == "all") ? "" : "tp=" + _t.cache.slt.tp + "";
			str += (_t.cache.slt.cg == "" || _t.cache.slt.cg == "all") ? "" : "&cg=" + _t.cache.slt.cg + "";
			str += (_t.cache.slt.dt == "" || _t.cache.slt.dt == "all") ? "" : "&dt=" + _t.cache.slt.dt + "";
			str += (_t.cache.slt.jg == "" || _t.cache.slt.jg == "all") ? "" : "&jg=" + _t.cache.slt.jg + "";
			str += (_t.cache.slt.hy == "" || _t.cache.slt.hy == "all") ? "" : "&hy=" + _t.cache.slt.hy + "";
			str += "&page=" + _t.cache.page + "";
			if (_t.cache.slt.tp != "" || _t.cache.slt.cg != "" || _t.cache.slt.dt != "" || _t.cache.slt.jg != "" || _t.cache.slt.hy != "") {
				var b = new Base64();
				document.location.href = def + "#" + b.encode(str);
			} else {
				document.location.href = def + "#def";
			}
			setTimeout(function () { _t.update() }, 0);
		},

		showTips: function (o) {
			var _rect = this.tools.rect(o);
			var _o = document.getElementById("report-tip-cont");
			var _c = document.getElementById("report-tip-cont-close");
			_o.style.top = (_rect.top + 12) + "px";
			_o.style.left = (_rect.left - 20) + "px";
			_c.style.cursor = "pointer";
			_c.style.textDecoration = "underline";
			_o.style.display = "block";
			if (_c.getAttribute("a") != true) {
				_c.onclick = function () {
					_o.style.display = "none";
				}
				_c.getAttribute("a", true);
			}
		},

		tools: {
			loadJs: function (url, charset, callback) {
				var _js = document.createElement('script');
				var _this = this;
				if (!(charset == null || charset == '')) { _js.setAttribute('charset', charset); }
				_js.setAttribute('type', 'text/javascript');
				_js.setAttribute('src', url);
				document.getElementsByTagName('head')[0].appendChild(_js);
				_js.onload = _js.onreadystatechange = function () {
					if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
						callback(_js);
						_this.removeJs(_js);
					}
				}
			},
			removeJs: function (o) {
				var _js = (typeof o == "string") ? document.getElementById(o) : o;
				_js.onload = _js.onreadystatechange = null;
				try {
					_js.parentNode.removeChild(_js);
				} catch (e) { }
			},

			browser: (function () {
				var ua = window.navigator.userAgent.toLowerCase();
				var b = {
					msie: /msie/.test(ua) && !/opera/.test(ua),
					opera: /opera/.test(ua),
					safari: /webkit/.test(ua) && !/chrome/.test(ua),
					firefox: /firefox/.test(ua),
					chrome: /chrome/.test(ua)
				};
				var vMark = "";
				for (var i in b) {
					if (b[i]) {
						vMark = "safari" == i ? "version" : i;
						break
					}
				}
				b.version = vMark && RegExp("(?:" + vMark + ")[\\/: ]([\\d.]+)").test(ua) ? RegExp.$1 : "0";
				b.ie = b.msie;
				b.ie6 = b.msie && parseInt(b.version, 10) == 6;
				b.ie7 = b.msie && parseInt(b.version, 10) == 7;
				b.ie8 = b.msie && parseInt(b.version, 10) == 8;
				return b
			})(),

			getScrollTop: function (node) {
				var doc = node ? node.ownerDocument : document;
				return doc.documentElement.scrollTop || doc.body.scrollTop;
			},

			getScrollLeft: function (node) {
				var doc = node ? node.ownerDocument : document;
				return doc.documentElement.scrollLeft || doc.body.scrollLeft;
			},

			contains: document.defaultView
				? function (a, b) { return !!(a.compareDocumentPosition(b) & 16); }
				: function (a, b) { return a != b && a.contains(b); },

			// 当前页面
			rect: function (node) {
				var left = 0, top = 0, right = 0, bottom = 0, B = this.browser, D = this;
				//ie8的getBoundingClientRect获取不准确
				if (!node.getBoundingClientRect || B.ie8) {
					var n = node;
					while (n) { left += n.offsetLeft, top += n.offsetTop; n = n.offsetParent; };
					right = left + node.offsetWidth; bottom = top + node.offsetHeight;
				} else {
					var rect = node.getBoundingClientRect();
					left = right = D.getScrollLeft(node); top = bottom = D.getScrollTop(node);
					left += rect.left; right += rect.right;
					top += rect.top; bottom += rect.bottom;
				};
				return { "left": left, "top": top, "right": right, "bottom": bottom };
			},

			// 获取指定类型的父节点
			getParentNode: function (o, t) {
				while (o = o.parentNode) {
					if (o.nodeType == 1) {
						if (o.tagName.toLowerCase() == t.toLowerCase()) break;
					}
				}
				return o;
			}
			,
			// 获取同级的所有指定类型的节点
			getSiblings: function (o, t) {
				o = o.parentNode.childNodes;
				_a = new Array();
				for (var i = 0, j = o.length; i < j; i++) {
					if (o[i].nodeType == 1 && o[i].tagName.toLowerCase() == t.toLowerCase()) {
						_a.push(o[i]);
					}
				}
				return _a;
			},

			//样式处理
			hasClass: function (element, className) {
				var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
				return element.className == null ? false : element.className.match(reg);
			},

			addClass: function (element, className) {
				if (!this.hasClass(element, className)) {
					element.className += " " + className;
				}
			},

			removeClass: function (element, className) {
				if (this.hasClass(element, className)) {
					var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
					element.className = element.className.replace(reg, ' ');
				}
			},
			subString: function (str, len, hasDot) {
				var newLength = 0;
				var newStr = "";
				var chineseRegex = /[^\x00-\xff]/g;
				var singleChar = "";
				str = str.replace(/&sbquo;/g, ",");
				str = str.replace(/&quot;/g, "\"");
				var strLength = str.replace(chineseRegex, "**").length;
				for (var i = 0; i < strLength; i++) {
					singleChar = str.charAt(i).toString();
					if (singleChar.match(chineseRegex) != null) {
						newLength += 2;
					}
					else {
						newLength++;
					}
					if (newLength > len) {
						break;
					}
					newStr += singleChar;
				}
				if (hasDot && strLength > len) {
					newStr += "...";
				}
				return newStr;
			},
			showStar: function (level) {
				var stars = '';
				for (var i = 0; i < level; i++) {
					stars += '★';
				}
				return stars;
			},
			getColorStr: function GetColorStr(dis, str, comp, f) {
				if (isNaN(str) || isNaN(comp)) {
					return "<span>" + dis + "</span>";
				} else {
					dis = (f === undefined || isNaN(f)) ? dis : parseFloat(dis).toFixed(f);
					return (parseFloat(str) > parseFloat(comp))
						? "<span class=\"red\">" + dis + "</span>"
						: ((parseFloat(str) < parseFloat(comp))
							? "<span class=\"green\">" + dis + "</span>"
							: "<span>" + dis + "</span>");
				}
			}
		}
	});

Function.prototype.bind = function () {
	var __m = this, object = arguments[0], args = new Array();
	for (var i = 1; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	return function () {
		return __m.apply(object, args);
	}
};

// 日期格式化
Date.prototype.format = function (part) {
	var date = this, redate;
	part = (part == null) ? "yyyy-MM-dd HH:mm:ss" : part;
	var y = date.getFullYear(),
		M = date.getMonth() + 1,
		d = date.getDate(),
		H = date.getHours(),
		m = date.getMinutes(),
		s = date.getSeconds(),
		ms = date.getMilliseconds(),
		CW = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()],
		MM = (M > 9) ? M : "0" + M,
		dd = (d > 9) ? d : "0" + d,
		HH = (H > 9) ? H : "0" + H,
		mm = (m > 9) ? m : "0" + m,
		ss = (s > 9) ? s : "0" + s;
	ms = (ms > 9) ? (ms > 99) ? ms : "0" + ms : "00" + ms,
		redate = part.replace("yyyy", y).replace("MM", MM).replace("dd", dd)
			.replace("HH", HH).replace("mm", mm)
			.replace("ms", ms).replace("ss", ss)
			.replace("M", M).replace("d", d)
			.replace("CW", CW).replace("H", H)
			.replace("m", m).replace("s", s);
	return redate;
}

//编码
function Base64() {
	// private property
	_keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	// public method for encoding
	this.encode = function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		input = _utf8_encode(input);
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output +
				_keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
				_keyStr.charAt(enc3) + _keyStr.charAt(enc4);
		}
		return output;
	}
	// public method for decoding
	this.decode = function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {
			enc1 = _keyStr.indexOf(input.charAt(i++));
			enc2 = _keyStr.indexOf(input.charAt(i++));
			enc3 = _keyStr.indexOf(input.charAt(i++));
			enc4 = _keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}
		output = _utf8_decode(output);
		return output;
	}

	// private method for UTF-8 encoding
	_utf8_encode = function (string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	}

	// private method for UTF-8 decoding
	_utf8_decode = function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
		while (i < utftext.length) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if ((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
}

// 滚动事件
// 在滚动时禁止用户中键滚动页面
function wheel(callback) {
	if (window.addEventListener) {
		window.addEventListener('DOMMouseScroll', callback, false);
	} else {
		window.onmousewheel = document.onmousewheel = callback;
	}
}