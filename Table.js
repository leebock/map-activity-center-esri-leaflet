function Table(ul)
{
	var _self = this;
	this.load = function(pairs/*{record, html}*/)
	{
        $.each(
          pairs,
          function(index, value) {  
            $("<li>")
                .data(value.record)
                .append($("<button>").html(value.html))
                .append($("<button>")
					.addClass("hide")
					.attr("title", "Remove city from map and table.")
                )                    
              .appendTo(ul);
          }
        );
		
		$("li button:nth-of-type(1)", ul).click(
			function() {
				if ($(this).parent().hasClass("selected")) {
					$(this).parent().removeClass("selected");
					$("li", ul).removeClass("ghosted");
				} else {
					$("li", ul).removeClass("selected").addClass("ghosted");
					$(this).parent().addClass("selected").removeClass("ghosted");
				}
				$(_self).trigger("itemActivate", [$(this).parent().data(), $("li.selected", ul).length === 0]);
			}
		);
		
		$("li button.hide", ul).click(
			function() {
				$(this).parent().addClass("hidden");
				$("li", ul).removeClass("selected").removeClass("ghosted");
				if ($("li", ul).not(".hidden").length === 0) {
				  $("li", ul).removeClass("hidden");
			  } else if ($("li", ul).not(".hidden").length === 1) {
				  $("li", ul).not(".hidden").addClass("selected");
			  } else {
				  // nuttin...
			  }
			  $(_self).trigger("itemHide", []);                          
			}
		);
		
	};
    
    this.getVisibleRecords = function()
    {
        return $.map($("li", ul).not(".hidden"), function(value) {return $(value).data();});        
    };
	
	this.getActive = function()
	{
		return $("li.selected", ul).data();
	};
	
	this.clearActive = function()
	{
		$("li", ul).removeClass("selected").removeClass("ghosted");
	};
	
	this.activate = function(record)
	{
		$("li", ul).removeClass("selected").removeClass("ghosted");
		$($.grep($("li", ul), function(value){return $(value).data() === record;})).addClass("selected");
		$("li", ul).not(".selected").addClass("ghosted");
	};

}

Table.prototype = {};