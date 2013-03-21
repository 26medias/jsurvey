/**
	photofeed
	@version:		1.0.0
	@author:		Julien Loutre <julien.loutre@gmail.com>
*/
(function($){
 	$.fn.extend({
 		jsurvey: function() {
			var plugin_namespace = "jsurvey";
			
			var pluginClass = function() {};
			
			pluginClass.prototype.init = function (options) {
				try {
					
					var scope = this;
					
					this.options = $.extend({
						survey:		[]
					},options);
					
					this.stack = [];
					
					this.render(this.options.survey);
					
					$("input[data-placeholder]").jplaceholder();
					$(".droplist").droplist();
					
					this.options.submit.click(function() {
						scope.element.formapi({
							success: function(response) {
								console.info("response",response);
							}
						});
					});
					
				} catch (err) {
					this.error(err);
				}
			};
			pluginClass.prototype.render = function () {
				try {
					
					var scope = this;
					var i;
					
					this.container		= $.create("div", this.element);
					this.container.addClass("form");
					
					for (i=0;i<this.options.survey.length;i++) {
						this.parseItem(this.options.survey[i]);
					}
					
					for (i=0;i<this.stack.length;i++) {
						this.renderItem(this.stack[i]);
					}
					
				} catch (err) {
					this.error(err);
				}
			};
			pluginClass.prototype.parseItem = function (item) {
				try {
					
					
					var scope = this;
					var i;
					var j;
					var name;
					var data;
					var el;
					
					for (name in item) {
						data = item[name];
					}
					switch (data.type) {
						default:
						case "varchar":
							el 			= $.create("input",$(),true);
							el.type 	= "text";
							el 			= $(el);
						break;
						case "text":
							el 			= $.create("textarea",$());
						break;
						case "list":
							el 			= $.create("div",$());
							el.addClass("droplist");
							for (i=0;i<data.list.length;i++) {
								(function(i){
									var listitem	= $.create("div", el);
										listitem.attr("data-value", data.list[i].value);
										listitem.html(data.list[i].label);
								})(i);
							}
						break;
					}
					
					if (data.regex) {
						el.attr("data-regex", data.regex);
					}
					
					if (data.placeholder) {
						el.attr("data-placeholder", data.placeholder);
					}
					if (data.required) {
						el.attr("data-require", true);
					}
					
					el.attr("data-name", name);
					el.attr("data-include", true);
					
					this.stack.push({
						label:		data.label,
						el:			el
					});
					
				} catch (err) {
					this.error(err);
				}
			};
			pluginClass.prototype.renderItem = function (item) {
				try {
					
					var scope = this;
					
					var row = $.create("div", this.container);
						row.addClass("row");
					
					if (item.label) {
						var label = $.create("div", row);
							label.addClass("label");
							label.html(item.label);
					} else {
						row.addClass("nolabel");
					}
					var field = $.create("div", row);
						field.addClass("field");
					
					field.append(item.el);
					
				} catch (err) {
					this.error(err);
				}
			};
			
			
			
			
			
			pluginClass.prototype.__init = function (element) {
				try {
					this.element = element;
				} catch (err) {
					this.error(err);
				}
			};
			// centralized error handler
			pluginClass.prototype.error = function (e) {
				if (console && console.info) {
					console.info("error on "+plugin_namespace+":",e);
				}
			};
			// Centralized routing function
			pluginClass.prototype.execute = function (fn, options) {
				try {
					if (typeof(this[fn]) == "function") {
						var output = this[fn].apply(this, [options]);
					} else {
						this.error("'"+fn.toString()+"()' is not a function");
					}
				} catch (err) {
					this.error(err);
				}
			};
			
			// process
			var fn;
			var options;
			if (arguments.length == 0) {
				fn = "init";
				options = {};
			} else if (arguments.length == 1 && typeof(arguments[0]) == 'object') {
				fn = "init";
				options = $.extend({},arguments[0]);
			} else {
				fn = arguments[0];
				options = arguments[1];
			}
			$.each(this, function(idx, item) {
				// if the plugin does not yet exist, let's create it.
				if ($(item).data(plugin_namespace) == null) {
					$(item).data(plugin_namespace, new pluginClass());
					$(item).data(plugin_namespace).__init($(item));
				}
				$(item).data(plugin_namespace).execute(fn, options);
			});
			return this;
    	}
	});
	
})(jQuery);

