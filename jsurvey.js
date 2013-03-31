/**
	jSurvey
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
					var i;
					var j;
					
					this.options = $.extend({
						survey:		[],
						onSubmit:	function() {}
					},options);
					
					this.stack = [];
					
					this.fields		= {};
					
					this.render(this.options.survey);
					
					$("input[data-placeholder]").jplaceholder();
					$(".droplist").droplist();
					
					if (!this.options.quiz) {
						this.validator = function(el, errorOnly){
							return true
						};
					} else {
						this.validator = function(el, errorOnly) {
							return scope.quizValidate(el, errorOnly);
						};
					}
					
					this.options.submit.click(function() {
						scope.element.formapi({
							validator:	scope.validator,
							success: 	function(response) {
								console.info("response",response);
								scope.options.onSubmit(response);
							}
						});
					});
					
					
					// Manage Grouping
					if (this.options.group) {
						// find groups
						this.groups = {};
						var rows = this.element.find("[data-group]");
						console.log("rows",rows, this.element);
						var min = 1000;
						var max = 0;
						for (i=0;i<rows.length;i++) {
							var groupid = $(rows[i]).data("group");
							if (!this.groups[groupid]) {
								this.groups[groupid] = $();
							}
							this.groups[groupid] = this.groups[groupid].add($(rows[i]));
							//$(rows[i]).hide();
							this.groups[groupid].hide();
							if (groupid < min) {
								min = groupid;
							}
							if (groupid > max) {
								max = groupid;
							}
						}
						console.log("this.groups",this.groups);
						// Show the default group #1
						this.currentgroup = 1;
						this.groups[this.currentgroup].show();
						
						// count number of groups
						var groupcount = 0;
						for (j in this.groups) {
							groupcount++;
						}
						
						// hide previous and submit
						this.options.previous.hide();
						this.options.submit.hide();
						
						if (groupcount <= 1) {
							this.options.previous.hide();
							this.options.next.hide();
							this.options.submit.show();
						}
						
						// next & previous event handlers
						this.options.next.click(function() {
							scope.element.formapi({
								validator:	scope.validator,
								filter:	'[data-group="'+scope.currentgroup+'"]',
								success: function(response) {
									console.info("response",response);
									if (scope.currentgroup+1 == max) {
										console.log("max");
										scope.options.next.hide();
										scope.options.submit.show();
									} else {
										scope.options.next.show();
									}
									scope.options.previous.show();
									if (scope.groups[scope.currentgroup+1]) {
										scope.groups[scope.currentgroup].slideUp();
										scope.currentgroup++;
										scope.groups[scope.currentgroup].slideDown();
									}
								}
							});
						});
						this.options.previous.click(function() {
							if (scope.currentgroup-1 == min) {
								console.log("max");
								scope.options.previous.hide();
							} else {
								scope.options.previous.show();
							}
							scope.options.next.show();
							if (scope.groups[scope.currentgroup-1]) {
								scope.groups[scope.currentgroup].slideUp();
								scope.currentgroup--;
								scope.groups[scope.currentgroup].slideDown();
							}
						});
					} else {
						scope.options.previous.hide();
						scope.options.next.hide();
					}
					
					
					
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
					if (this.options.quiz || this.options.block) {
						this.container.addClass("block");
					}
					
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
							this.fields[name] 			= $.create("input",$(),true);
							this.fields[name].type 		= "text";
							this.fields[name] 			= $(this.fields[name]);
						break;
						case "text":
							this.fields[name] 			= $.create("textarea",$());
						break;
						case "list":
							this.fields[name] 			= $.create("div",$());
							this.fields[name].addClass("droplist");
							this.fields[name].attr("data-isdroplist",true);
							for (i=0;i<data.list.length;i++) {
								(function(i){
									var listitem	= $.create("div", scope.fields[name]);
										listitem.attr("data-value", data.list[i].value);
										listitem.html(data.list[i].label);
								})(i);
							}
						break;
					}
					
					if (data.regex) {
						this.fields[name].attr("data-regex", data.regex);
					}
					
					if (data.placeholder) {
						this.fields[name].attr("data-placeholder", data.placeholder);
					}
					if (data.required) {
						this.fields[name].attr("data-require", true);
					}
					if (data.answer != undefined) {
						if (!this.answers) {
							this.answers = {};
						}
						this.answers[name] = data.answer;
					}
					
					this.fields[name].attr("data-name", name);
					this.fields[name].attr("data-include", true);
					
					this.stack.push({
						label:		data.label,
						el:			this.fields[name],
						attr:		data.attr,
						helper:		data.clue?data.clue:false
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
					
					if (item.attr) {
						row.attr(item.attr);
					}
					
					field.append(item.el);
					
					if (item.helper) {
						var helper = $.create("div", field)
						helper.addClass("helper");
						helper.html(item.helper);
					}
					
				} catch (err) {
					this.error(err);
				}
			};
			pluginClass.prototype.fill = function (data) {
				try {
					var scope = this;
					var j;
					
					console.log("fill",data);
					
					for (j in data) {
						
						var el = this.fields[j];
						if (el.hasClass("droplist")) {
							window.Arbiter.inform("droplist."+j+".val", {
								val:				data[j],
								stopPropagation:	true
							});
						} else {
							el.val(data[j]);
						}
					}
					
				} catch (err) {
					this.error(err);
				}
			};
			pluginClass.prototype.quizValidate = function (el, errorOnly) {
				try {
					var scope = this;
					var j;
					
					var elName = $(el).data("name");
					console.log("this.answers",this.answers);
					console.log("elName",elName);
					if (this.answers[elName] != $(el).val()) {
						return false;
					}
					return true;
					
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

