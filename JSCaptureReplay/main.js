var width = 1200;
		var height = 1000;
		
		// var scatterPlotCanvasWidth = 1200;
		// var scattorPlotCanvasHeight = 600;
		
		var scatterPlotStartPosX = 100;
		var scatterPlotStartPosY = 300;
		
		var scatterPlotStopPosX = 1100;
		var scatterPlotStopPosY = 700;
		
		// var timelineCanvasWidth = 1200;
		// var timelineCanvasHeight = 100;
		
		var timelineView;
		var timelineController;
		
		var p;
		
		var scatterXMap;
		var scatterYMap;
		
		var currentTracks = [];
		var prevTracks = [];
		
		var years, weeks;
		
		var currentTime;
		
		var domCurrentTime;
		
		var intervalId;
		
		var pastelColorPalette = {
			"RISING": 	"#9c9ede",
			"FALLING": 	"#e7969c",
			"STAGNANT": "#e7cb94",
			"NEW": 		"#cedb9c"
		};
		
		var vibrantColorPalette = {
			"RISING": 	"#d62728",
			"FALLING": 	"#1f77b4",
			"STAGNANT": "#8c564b",
			"NEW": 		"#2ca02c"
		};
		
		var mediumColorPalette = {
			"RISING": 	"#ff7f0e",
			"FALLING": 	"#1f77b4",
			"STAGNANT": "#8c564b",
			"NEW": 		"#98df8a"
		};
		
		var lstColors = [
			"#9c9ede",
			"#e7969c",
			"#e7cb94",
			"#cedb9c",
			"#d62728",
			"#1f77b4",
			"#8c564b",
			"#2ca02c",
			"#ff7f0e",
			"#1f77b4",
			"#8c564b",
			"#98df8a"
		];
		
		var colorScheme;
		
		var genres = [
			"Rock",
			"Vocal",
			"Country",
			"Rap",
			"R&B",
			"Jazz",
			"Pop",
			"Easy",
			"Electronic",
			"Hip Hop",
			"Funk / Soul",
			"Folk",
			"Blues",
			"Electronica",
			"Comedy",
			"Reggae",
			"Latin",
			"Gospel",
			"Dance",
			"Soundtrack",
			"Alternative",
			"Others"
		];
		
		function range(start, stop, step)
		{
			var arr = [];
			if (!step) step = 1;
			if (step < 0)
			{
				for (var i = start; i > stop; i+=step)
				{
					arr.push(i)
				}
			}
			else
			{
				for (var i = start; i < stop; i+=step)
				{
					arr.push(i);
				}
			}
			
			return arr;
		}
		
		function AxisMapper(startDomain, stopDomain, startVal, stopVal, shifted)
		{
			this.startDomain = startDomain;
			this.stopDomain = stopDomain;
			this.startVal = startVal;
			this.stopVal = stopVal;
			this.shifted = shifted
			this.categorical = false;
			
			if (typeof(startDomain) == "number")
			{
				this.mult = (this.stopVal - this.startVal)/(this.stopDomain - this.startDomain);
			}
			else if (typeof(startDomain) == "object")
			{
				this.categories = this.startDomain;
				this.defaultVal = this.stopDomain;
				this.startDomain = 0;
				
				if (shifted)
					this.stopDomain = this.categories.length;
				else
					this.stopDomain = this.categories.length - 1;
					
				this.categorical = true;
				
				this.mult = (this.stopVal - this.startVal)/(this.stopDomain - this.startDomain);
				// console.log(this.stopVal, this.startVal, this.stopDomain, this.startDomain);
			}
		}
		
		AxisMapper.prototype.val = function(domainVal, domainStep) 
		{
			if (domainStep == null)
				domainStep = 1;
				
			if (!this.categorical)
			{
				return this.startVal + (domainVal - this.startDomain)*this.mult;
			}
			else
			{
				if (this.categories.indexOf(domainVal) == -1)
					domainVal = this.defaultVal;
					
				if (this.shifted)
					return this.startVal + (this.categories.indexOf(domainVal) + domainStep)*this.mult;
				else
					return this.startVal + (this.categories.indexOf(domainVal))*this.mult;
			}
		}
		
		AxisMapper.prototype.ticks = function()
		{
			var arrTicks = [];
			
			// var valDiff = Math.abs(this.stopVal - this.startVal);
			// 			var numOfPoints = Math.round(valDiff/10);
			// 			var domainStep = Math.round((this.stopDomain - this.startDomain)/numOfPoints);
			
			// console.log("valDiff ", valDiff, numOfPoints, domainStep);
			
			// var maxDomain = this.categorical ? this.stopDomain-1 : this.stopDomain;
			// console.log("max:",maxDomain);
			
			for (var i = this.startDomain; i <= this.stopDomain; i++)
			{
				if (this.categorical)
					arrTicks.push([this.val(this.categories[i]), this.categories[i]]);
				else
					arrTicks.push([this.val(i), i]);
			}
 
			return arrTicks;
		}
		
		function TimelineController(view)
		{
			this.paused = true;
			
			this.view = view;
			
			var self = this;
			this.view.OnYearClick = function(year) { self.OnYearClick(year); };
			this.view.OnWeekClick = function(week) { self.OnWeekClick(week); };
			
			this.view.OnPlayClick = function() { self.play(); };
			this.view.OnPauseClick = function() { self.pause(); };
			this.view.OnNextWeekClick = function() { self.incrementWeek(); };
			this.view.OnNextYearClick = function() { self.incrementYear(); };
			this.view.OnPrevWeekClick = function() { self.decrementWeek(); };
			this.view.OnPrevYearClick = function() { self.decrementYear(); };
			
			// this.view.setCurrentTime(this.currentTime);
			this.currentTime = null;
			this.setTime(1957, 1);
		}
		
		TimelineController.prototype.OnYearClick = function(year)
		{
			// currentTime = {"year": year, "week": week};
			this.setTime(year, this.currentTime["week"]);
			this.view.clearSongCharts();
		}
		
		TimelineController.prototype.OnWeekClick = function(week)
		{
			this.setTime(this.currentTime["year"], week);
		}
		
		TimelineController.prototype.setTime = function(year, week)
		{
			this.currentTime = {"year": year, "week": week};
			this.view.setCurrentTime(this.currentTime);
			
			this.updateView();
		}
		
		TimelineController.prototype.incrementWeek = function()
		{
			var newYear = this.currentTime["year"];
			var newWeek = this.currentTime["week"];
			
			newWeek++;
			if (dictDates[newYear] != null && dictDates[newYear][newWeek-1] != null)
				this.setTime(newYear, newWeek);
			else
			{
				newYear++;
				newWeek = 1;
				if (dictDates[newYear] != null && dictDates[newYear][newWeek-1] != null)
				{
					this.setTime(newYear, newWeek);
					this.view.clearSongCharts();
				}
				else
					return;
			}
		}
		
		TimelineController.prototype.incrementYear = function()
		{
			var newYear = this.currentTime["year"];
			newYear++;
			if (dictDates[newYear] != null && dictDates[newYear][1] != null)
			{
				this.setTime(newYear, 1);
				this.view.clearSongCharts();
			}
		}
		
		TimelineController.prototype.decrementWeek = function()
		{
			var newYear = this.currentTime["year"];
			var newWeek = this.currentTime["week"];
			
			newWeek--;
			// console.log(newWeek);
			if (dictDates[newYear] != null && dictDates[newYear][newWeek] != null)
				this.setTime(newYear, newWeek);
			else
			{
				newYear--;
				if (dictDates[newYear] != null)
				{
					if (dictDates[newYear][53] != null)
						newWeek = 53;
					else
						newWeek = 52;
					
					if (dictDates[newYear] != null && dictDates[newYear][newWeek] != null)
					{
						this.view.clearSongCharts();
						this.setTime(newYear, newWeek);
					}
					else
						return;
				}
				else
					return;
			}
		}
		
		TimelineController.prototype.decrementYear = function()
		{
			var newYear = this.currentTime["year"];
			newYear--;
			if (dictDates[newYear] != null && dictDates[newYear][1] != null)
			{
				this.setTime(newYear, 1);
				this.view.clearSongCharts();
			}
		}
		
		TimelineController.prototype.updateView = function()
		{
			this.view.setCurrentTime(this.currentTime);
			
			var tracks = dictYears[this.currentTime["year"]][this.currentTime["week"]];
			plotData(tracks);
		}
		
		TimelineController.prototype.displayGenreChart = function(genre)
		{
			var genreData = {};
			for (var i = 1957; i < 2009; i++)
			{
				var yearScore = 0;
				for (var j = 1; j < 54; j++)
				{
					if (dictYears[i] != null && dictYears[i][j] != null)
					{
						var lst = dictYears[i][j];
						lst = lst.filter(function(itm) { return strTracks[itm["track"]]["genre"].toLowerCase() == genre.toLowerCase() });
						// for (var k = 0; k < lst.length; k++)
						// {
						// 	var chartPos = lst[k]["pos"];
						// 	
						// }
						yearScore += lst.length;
					}
				}
				genreData[i] = yearScore;
			}
			
			// console.log(genreData);
			
			this.view.drawGenreChart(genre, genreData);
		}
		
		TimelineController.prototype.displaySongChart = function(songPrefix)
		{
			var songData = {};
			var i = this.currentTime["year"];
			
			for (var j = 1; j < 54; j++)
			{
				if (dictYears[i] != null && dictYears[i][j] != null)
				{
					var lst = dictYears[i][j];
					var trackInfo = findTrack(songPrefix, lst);
					if (trackInfo != null)
						songData[j] = trackInfo["pos"];
				}
			}
			// return songData;
			
			this.view.drawSongChart(songPrefix, songData);
		}
		
		TimelineController.prototype.play = function()
		{
			// console.log("playing...");
			intervalId = setInterval("timelineController.incrementWeek()", 2000);
		}
		
		TimelineController.prototype.pause = function()
		{
			// console.log("pausing...");
			clearInterval(intervalId);
		}
		
		function TimelineView()
		{
			this.yearTimelineStartPosX = 100;
			this.yearTimelineStartPosY = 50;
 
			this.yearTimelineStopPosX = 1100;
			this.yearTimelineStopPosY = 125;
			
			this.weekTimelineStartPosX = 100;
			this.weekTimelineStartPosY = 175;
			
			this.weekTimelineStopPosX = 1100;
			this.weekTimelineStopPosY = 250;
			
			this.yearTimelineXMap;
			this.yearTimelineYMap;
			
			this.weekTimelineXMap;
			this.weekTimelineYMap;
			
			this.yearSliderThingy;
			this.weekSliderThingy;
			
			this.OnYearClick;
			this.OnWeekClick;
			
			this.OnPlayClick;
			this.OnPauseClick;
			this.OnNextWeekClick;
			this.OnPrevWeekClick;
			
			this.genreCharts = {};
			this.songCharts = {};
			
			this.yearTimelineXMap = new AxisMapper(range(1957, 2009), "", this.yearTimelineStartPosX, this.yearTimelineStopPosX);
			this.yearTimelineYMap = new AxisMapper(range(1, 51), "", this.yearTimelineStopPosY, this.yearTimelineStartPosY);
			
			this.weekTimelineXMap = new AxisMapper(1, 53, this.weekTimelineStartPosX, this.weekTimelineStopPosX);
			this.weekTimelineYMap = new AxisMapper(range(51, 0, -1), "", this.weekTimelineStopPosY, this.weekTimelineStartPosY);
			
			this.drawTimelineAxis(this.yearTimelineStartPosX, this.yearTimelineStopPosY, this.yearTimelineStopPosX, this.yearTimelineStopPosY, this.yearTimelineXMap.ticks(), true);
			this.drawTimelineAxis(this.weekTimelineStartPosX, this.weekTimelineStopPosY, this.weekTimelineStopPosX, this.weekTimelineStopPosY, this.weekTimelineXMap.ticks(), false);
			
			var tYear = p.text(	this.yearTimelineStartPosX + (this.yearTimelineStopPosX - this.yearTimelineStartPosX)/2, 
							this.yearTimelineStartPosY - 20 + (this.yearTimelineStopPosY - this.yearTimelineStartPosY)/2,
							"YEAR").attr("fill", "#222").attr("font", "helvetica").attr("font-size", 80);
 
			var tWeek = p.text(	this.weekTimelineStartPosX + (this.weekTimelineStopPosX - this.weekTimelineStartPosX)/2, 
							this.weekTimelineStartPosY - 10 + (this.weekTimelineStopPosY - this.weekTimelineStartPosY)/2,
							"WEEK").attr("fill", "#222").attr("font", "helvetica").attr("font-size", 70);
							
			var self = this;
			this.playBtn = p.path("M 20 20 L 20 40 L 30 30 Z").attr("stroke", "white").attr("fill", "red").attr("stroke-width", 0);
			this.playBtn.translate(5, 15).scale(2.8);
			this.playBtn.node.style.cursor = "hand";
			this.playBtn.click(function() {
				self.OnPlayClick();
				self.playBtn.hide();
				self.pauseBtn.show();
			});
			this.playBtn.hover(function(event){
				this.attr("stroke-width", 2);
			},
			function(event){
				this.attr("stroke-width", 0);
			});
			
			this.pauseBtn = p.path("M 20 20 L 20 40 L 25 40 L 25 20 L 20 20 M 30 20 L 30 40 L 35 40 L 35 20 Z").attr("stroke-width", "0").attr("stroke", "white").attr("fill", "red").attr("stroke-width", 0).hide();
			this.pauseBtn.translate(5, 15).scale(2.5);
			this.pauseBtn.node.style.cursor = "hand";
			this.pauseBtn.click(function() {
				self.OnPauseClick();
				self.pauseBtn.hide();
				self.playBtn.show();
			});
			this.pauseBtn.hover(function(event){
				this.attr("stroke-width", 2);
			},
			function(event){
				this.attr("stroke-width", 0);
			});
			
			this.nextWeekBtn = p.path("M 50 20 L 50 40 L 60 30 L 50 20 M 60 20 L 60 40 L 70 30 Z ").attr("stroke-width", "0").attr("fill", "#98df8a").attr("stroke", "white").attr("stroke-width", 0);
			this.nextWeekBtn.translate(this.weekTimelineStopPosX - 20, this.weekTimelineStopPosY - 70).scale(2);
			this.nextWeekBtn.node.style.cursor = "hand";
			this.nextWeekBtn.click(function() {
				self.OnNextWeekClick();
			});
			this.nextWeekBtn.hover(function(event){
				this.attr("stroke-width", 2);
			},
			function(event){
				this.attr("stroke-width", 0);
			});
			
			this.prevWeekBtn = p.path("M 50 20 L 50 40 L 60 30 L 50 20 M 60 20 L 60 40 L 70 30 Z ").attr("stroke-width", "0").attr("fill", "#98df8a").attr("stroke", "white").attr("stroke-width", 0);
			this.prevWeekBtn.translate(this.weekTimelineStartPosX - 100, this.weekTimelineStopPosY - 70).scale(2).rotate(180);
			this.prevWeekBtn.node.style.cursor = "hand";
			this.prevWeekBtn.click(function() {
				self.OnPrevWeekClick();
			});
			this.prevWeekBtn.hover(function(event){
				this.attr("stroke-width", 2);
			},
			function(event){
				this.attr("stroke-width", 0);
			});
			
			this.nextYearBtn = p.path("M 50 20 L 50 40 L 60 30 L 50 20 M 60 20 L 60 40 L 70 30 Z ").attr("stroke-width", "0").attr("fill", "#98df8a").attr("stroke", "white").attr("stroke-width", 0);
			this.nextYearBtn.translate(this.yearTimelineStopPosX - 20, this.yearTimelineStopPosY - 70).scale(2);
			this.nextYearBtn.node.style.cursor = "hand";
			this.nextYearBtn.click(function() {
				self.OnNextYearClick();
			});
			this.nextYearBtn.hover(function(event){
				this.attr("stroke-width", 2);
			},
			function(event){
				this.attr("stroke-width", 0);
			});
			
			this.prevYearBtn = p.path("M 50 20 L 50 40 L 60 30 L 50 20 M 60 20 L 60 40 L 70 30 Z ").attr("stroke-width", "0").attr("fill", "#98df8a").attr("stroke", "white").attr("stroke-width", 0);
			this.prevYearBtn.translate(this.yearTimelineStartPosX - 100, this.yearTimelineStopPosY - 70).scale(2).rotate(180);
			this.prevYearBtn.node.style.cursor = "hand";
			this.prevYearBtn.click(function() {
				self.OnPrevYearClick();
			});
			this.prevYearBtn.hover(function(event){
				this.attr("stroke-width", 2);
			},
			function(event){
				this.attr("stroke-width", 0);
			});
			
			// var playBtn = p.path("M 20 20 L 20 40 L 30 30 Z").attr("stroke-width", "0").attr("fill", "red");
			
			// console.log("y:");
			// this.drawTimelineAxis(this.timelineStartPosX, this.timelineStopPosY, this.timelineStartPosX, this.timelineStartPosY, this.timelineYMap.ticks());
			
			// for (var i = 1957; i < 2009; i++)
			// 			{
			// 				console.log(i + "=>" + this.yearTimelineXMap.val(i));
			// 			}
			// for (var i = 1; i < 51; i++)
			// 			{
			// 				console.log(i + "=>" + this.weekTimelineYMap.val(i));
			// 			}
			// for (var i = 1; i < 54; i++)
			// 			{
			// 				console.log(i + "=>" + this.weekTimelineXMap.val(i));
			// 			}
			// console.log("1957_1=>" + timelineXMap.val("1957_1"));
			// console.log("2007_1=>" + timelineXMap.val("2007_1"));
			// console.log("2008_53=>" + timelineXMap.val("2008_53"));
			// console.log(range(50, 0, -1));
			
			// console.log(timelineXMap.ticks());
		}
		
		TimelineView.prototype.clearSongCharts = function()
		{
			var lines = this.songCharts;
			for (key in lines)
			{
				this.songCharts[key].remove();
			}
		}
		
		TimelineView.prototype.drawTimelineAxis = function(startX, startY, endX, endY, ticks, rotate)
		{
			var axis = p.path("M" + startX + " " + startY + " L" + endX + " " + endY).attr("stroke", "white");
			for (var i = 0; i < ticks.length; i++)
			{
				if (startY == endY) // xaxis
				{
					p.path("M" + ticks[i][0] + " " + startY + " L" + ticks[i][0] + " " + (startY + 5)).attr("stroke", "white");
 
					// p.path("M" + ticks[i][0] + " " + startY + " L" + ticks[i][0] + " " + (scatterPlotStartPosY)).attr("stroke", "#222");
					var t = p.text(ticks[i][0], startY + 20, ticks[i][1]).attr("fill", "lightGrey");
					if (rotate)
						t.attr("rotation", "-90");
						
					var r = p.rect(ticks[i][0] - 7.5, startY + 5, 15, 30).attr("fill", "white").attr("fill-opacity", "0.01");
					r.node["data"] = ticks[i][1];
					r.node["text"] = t;
					r.node.style.cursor = "hand";
					r.toFront();
					var self = this;
					r.click(function(event) {
						if (rotate)
							self.OnYearClick(this.node["data"]);
						else
							self.OnWeekClick(this.node["data"]);
					});
					
					r.hover(function(event) {
						this.node["text"].attr("fill", "#1f77b4");
					},
					function(event) {
						this.node["text"].attr("fill", "lightGrey");
					});
					
				}
				else
				{
					
				}
			}
		}
		
		TimelineView.prototype.setCurrentTime = function(currentTime)
		{
			var year = currentTime["year"];
			var week = currentTime["week"];
			
			// console.log(currentTime["year"], currentTime["week"]);
			
			var yearPos = this.yearTimelineXMap.val(year);
			var weekPos = this.weekTimelineXMap.val(week);
			
			if (this.yearSliderThingy == null)
				this.yearSliderThingy = p.rect(this.yearTimelineStartPosX, this.yearTimelineStopPosY - 12, 5, 10).attr("fill", "#1f77b4");
				// this.yearSliderThingy = p.circle(100, this.yearTimelineStopPosY, 5).attr("fill", "red");
			
			if (this.weekSliderThingy == null)
				this.weekSliderThingy = p.rect(this.weekTimelineStartPosX, this.weekTimelineStopPosY - 12, 5, 10).attr("fill", "#1f77b4");
				// this.weekSliderThingy = p.circle(100, this.weekTimelineStopPosY, 5).attr("fill", "red");
 
			var newYearWidth = (yearPos - this.yearTimelineStartPosX) < 2 ? 5 : (yearPos - this.yearTimelineStartPosX);
			var newWeekWidth = (weekPos - this.weekTimelineStartPosX) < 2 ? 5 : (weekPos - this.weekTimelineStartPosX);
			this.yearSliderThingy.animate({"width": newYearWidth}, 300, ">");
			this.weekSliderThingy.animate({"width": newWeekWidth}, 300, ">");
		}
		
		TimelineView.prototype.drawGenreChart = function(genre, data)
		{
			if (this.genreCharts[genre] != null)
			{
				var l = this.genreCharts[genre];
				l.remove();
				this.genreCharts[genre] = null;
				return;
			}
			
			var maxVal = 0;
			for (var i = 1957; i < 2009; i++)
			{
				if (data[i] > maxVal)
					maxVal = data[i];
			}
			
			this.yearTimelineYMap = new AxisMapper(0, maxVal, this.yearTimelineStopPosY, this.yearTimelineStartPosY);
			
			var pathString = "";
			for (var i = 1957; i < 2009; i++)
			{
				var x = this.yearTimelineXMap.val(i);
				var y = this.yearTimelineYMap.val(data[i]) - 20;
				// var e = p.circle(x, y, 5, 5).attr("fill", "blue");
				if (i == 1957)
					pathString += "M " + x + " " + y;
				else
					pathString += " L " + x + " " + y;
			}
			
			var l = p.path(pathString).attr("stroke", lstColors[Math.floor(Math.random()*12)]).attr("stroke-width", 2);
			var t = p.text(0, 0, genre).attr("fill", "white").hide();
			l.node["text"] = t;
			l.node["genre"] = genre;
			l.hover(function(event) {
				this.attr("stroke-width", 4);
				var t = this.node["text"];
				t.attr("x", event.offsetX).attr("y", event.offsetY - 20).show();
			}, 
			function (event) {
				this.attr("stroke-width", 2);
				this.node["text"].hide();
			});
			
			this.genreCharts[genre] = l;
		}
		
		TimelineView.prototype.drawSongChart = function(songPrefix, data)
		{
			if (this.songCharts[songPrefix] != null)
			{
				var l = this.songCharts[songPrefix];
				l.remove();
				this.songCharts[songPrefix] = null;
				return;
			}
			
			var trackName = strTracks[songPrefix]["artist"] + " " + strTracks[songPrefix]["name"];
			
			var pathString = "";
			for (var i = 1; i < 54; i++)
			{
				if (data[i] != null)
				{
					var x = (Math.round(this.weekTimelineXMap.val(i)*100)/100);
					var y = (Math.round(this.weekTimelineYMap.val(data[i])*100)/100) - 20;
					// var y = this.weekTimelineYMap.val(data[i]) - 20;
					// console.log(x, y);
					// var e = p.circle(x, y, 5, 5).attr("fill", "blue");
					if (pathString.length == 0)
						pathString += "M " + x + " " + y;
					else
						pathString += " L " + x + " " + y;
				}
			}
			
			var l = p.path(pathString).attr("stroke", lstColors[Math.floor(Math.random()*12)]).attr("stroke-width", 2);
			
			var t = p.text(0, 0, trackName).attr("fill", "white").hide();
			l.node["text"] = t;
			l.node["trackName"] = trackName;
			l.node["prefix"] = songPrefix;
			l.hover(function(event) {
				this.attr("stroke-width", 4);
				var t = this.node["text"];
				t.attr("x", event.offsetX).attr("y", event.offsetY - 20).show();
				var track = findTrack(this.node["prefix"], currentTracks);
				if (track != null && track["point"].attr("stroke-width") != 3)
					track["point"].attr("stroke-width", 2);
			}, 
			function (event) {
				this.attr("stroke-width", 2);
				this.node["text"].hide();
				var track = findTrack(this.node["prefix"], currentTracks);
				if (track != null && track["point"].attr("stroke-width") != 3)
					track["point"].attr("stroke-width", 0);
			});
			
			
			this.songCharts[songPrefix] = l;
		}
			
		function drawAxis(startX, startY, endX, endY, ticks)
		{
			// console.log("M" + startX + " " + startY + " L" + endX + " " + endY);
			
			var axis = p.path("M" + startX + " " + startY + " L" + endX + " " + endY).attr("stroke", "white");
			
			for (var i = 0; i < ticks.length; i++)
			{
				if (startY == endY) // xaxis
				{
					p.path("M" + ticks[i][0] + " " + startY + " L" + ticks[i][0] + " " + (startY + 5)).attr("stroke", "white");
					p.path("M" + ticks[i][0] + " " + startY + " L" + ticks[i][0] + " " + (scatterPlotStartPosY)).attr("stroke", "#222");
					p.text(ticks[i][0], startY + 15, ticks[i][1]).attr("fill", "white");
				}
				else
				{
					p.path("M" + startX  + " " + ticks[i][0] + " L" + (startX - 5) + " " + ticks[i][0]).attr("stroke", "white");
					p.path("M" + startX  + " " + ticks[i][0] + " L" + (scatterPlotStopPosX) + " " + ticks[i][0]).attr("stroke", "#222");
					var t = p.text(startX - 50, ticks[i][0], ticks[i][1]).attr("fill", "lightGrey");
					var r = p.rect(startX - 80, ticks[i][0] - 7, 70, 15).attr("fill", "red").attr("fill-opacity", "0.01");
					r.node["data"] = ticks[i][1];
					r.node["text"] = t;
					r.node.style.cursor = "hand";
					
					r.click(function(event) {
						timelineController.displayGenreChart(this.node["data"]);
					});
					
					r.hover(function(event) {
						this.node["text"].attr("fill", "#1f77b4");
					},
					function(event) {
						this.node["text"].attr("fill", "lightGrey");
					});
				}
			}
		}
		
		function setupScatterPlotAxes()
		{
			// var scatterXMap = new AxisMapper(1, 50, 100, width - 100);
			scatterXMap = new AxisMapper(range(1, 51), "", scatterPlotStartPosX, scatterPlotStopPosX, true);
			scatterYMap = new AxisMapper(genres, "Others", scatterPlotStopPosY, scatterPlotStartPosY, true);
 
			drawAxis(scatterPlotStartPosX, scatterPlotStopPosY, scatterPlotStopPosX, scatterPlotStopPosY, scatterXMap.ticks());
			drawAxis(scatterPlotStartPosX, scatterPlotStopPosY, scatterPlotStartPosX, scatterPlotStartPosY, scatterYMap.ticks());
			
			// console.log(scatterYMap.ticks());
			
			// drawLabels(scatterXMap.ticks());
			// drawLabels(scatterYMap.ticks());
			
			// for (var i = 1; i <= 50; i++)
			// 			{
			// 				console.log(i + "=>" + scatterXMap.val(i));
			// 			}
			// 			
			// 			for (var i = 0; i < genres.length; i++)
			// 			{
			// 				console.log(genres[i] + "=>" + scatterYMap.val(genres[i]));
			// 			}
			// console.log(typeof(genres) == "object");
			// console.log(typeof(1));
		}
		
		
		function findTrack(prefix, data)
		{
			if (data)
			{
				for (var i = 0; i < data.length; i++)
				{
					if (data[i]["track"] == prefix)
						return data[i];
				}
			}
			
			return null;
		}
		
		function constrain(val, low, high)
		{
			if (val < low)
				return low;
			else if (val > high)
				return high;
			else
				return val;
		}
		
		function getClickFunc(track)
		{
			var name = track["artist"] + " - " + track["name"];
			return function(event) {
				// console.log(this.attr("r") + " " + name);
				// this.attr("stroke-width", 3);
				// console.log(track["prefix"]);
				timelineController.displaySongChart(track["prefix"]);
			}
		}
		
		function plotData(tracks)
		{
			for (var i = 0; i < currentTracks.length; i++)
			{
				currentTracks[i]["used"] = false;
				// console.log(currentTracks[i]["track"]);
			}
			
			// for (var i = 0; i < tracks.length; i++)
			// {
			// 	console.log(tracks[i]["track"]);
			// }
				
			for (var i = 0; i < tracks.length; i++)
			{
				var pos = tracks[i]["pos"];
				var prefix = tracks[i]["track"];
				
				var track = strTracks[prefix];
				var genre  = track["genre"];
				
				if (pos <= 50)
				{
					var xPos = scatterXMap.val(pos);
					var yPos = scatterYMap.val(genre);
				
					// console.log(pos + "=>" + xPos + " " + genre + "=>" + yPos);
					// console.log(currentTracks);
					var prevTrack = findTrack(prefix, currentTracks);
					if (prevTrack != null)
					{
						prevTrack["used"] = true;
						prevTrack["weeksOnChart"]++;
						
						var c = prevTrack["point"];
						
						var newColor = "";
						if (prevTrack["pos"] < pos) // falling
							newColor = colorScheme["FALLING"];
						else if (prevTrack["pos"] > pos) // rising
							newColor = colorScheme["RISING"];
						else // stagnant
							newColor = colorScheme["STAGNANT"];
							
						prevTrack["pos"] = pos;
						
						var radius = prevTrack["weeksOnChart"];
						
						c.animate({"cx": xPos, "cy": yPos, "fill": newColor, "r": constrain(radius, 5, 14)}, 1000, "<>");
						
					}
					else
					{
						var c = p.circle(xPos, -100, 5).attr("stroke-width", 0);
						
						
						c.click(getClickFunc(track));
						
						c.dblclick(function(event) {
							this.attr("stroke-width", "3").attr("stroke", "white");
						});
						
						var t = p.text(0, 0, track["artist"] + " " + track["name"]).attr("fill", "white").hide();
						c.node["prefix"] = prefix;
						c.node["text"] = t;
						
						c.hover(function (event) {
							if (this.attr("stroke-width") != 3)
							    this.attr({"stroke-width": 2, "stroke": "white"});
							
							var t = this.node["text"];
							t.attr("x", event.offsetX).attr("y", event.offsetY - 20).show();
							
							if (timelineView.songCharts[this.node["prefix"]] != null)
								timelineView.songCharts[this.node["prefix"]].attr("stroke-width", "4");
							
						}, function (event) {
							if (this.attr("stroke-width") == 2)
							    this.attr({"stroke-width": 0});
							this.node["text"].hide();
							
							if (timelineView.songCharts[this.node["prefix"]])
								timelineView.songCharts[this.node["prefix"]].attr("stroke-width", "2");
						});
						
						c.animate({"cx": xPos, "cy": yPos, "fill": colorScheme["NEW"], "r": 5}, 1000, "<>");
						// setTimeout(function() { c.animate({"cx": xPos, "cy": yPos}, 1000, "<>"); }, 500);
						
						currentTracks.push({"pos": pos, "track": prefix, "genre": genre, "point": c, "used": true, "weeksOnChart": 1})
					}
				}
			}
			
			for (var i = prevTracks.length - 1; i >= 0; i--)
			{
				var c = prevTracks[i];
				c.remove();
				prevTracks.splice(i, 1);
			}
			
			for (var i = currentTracks.length - 1; i >= 0; i--)
			{
				// if (currentTracks[i]["track"] == "1957_206")
					// console.log(currentTracks[i]["track"] + "," + currentTracks[i]["used"]);
				// console.log(currentTracks[i]["track"] + "," + currentTracks[i]["used"]);
				if (!currentTracks[i]["used"])
				{
					// console.log("asd");
					var c = currentTracks[i]["point"];
					c.animate({"cx": c.attr("cx"), "cy": 1000, "fill-opacity": 0.5}, 1000, "<>");
					// currentTracks[i]["point"].remove();
					currentTracks.splice(i, 1);
					prevTracks.push(c);
					// c.remove();
				}	
			}
			
			// if (domCurrentTime) domCurrentTime.remove();
			// domCurrentTime = p.text(width/2, 75, currentTime["year"] + ", " + currentTime["week"]).attr("fill", "#222").attr("font", "helvetica").attr("font-size", 100);
		}
		
		function btnNext_OnClick()
		{
			timelineController.incrementWeek();
			// nextWeek();
		}
		
		function body_OnLoad()
		{
			// alert(dictYears[2008][1]);
			// alert(strTracks);
			
			p = Raphael("canvas", width, height);
			// var b = p.rect(0, 0, width - 1, height - 1, 0);
			
			colorScheme = mediumColorPalette;
			
			years = range(1957, 2009);
			weeks = range(1, 54);
			
			// currentTime = null;
			
			var bg = p.rect(0, 0, width - 1, height - 1).attr("fill", "black");
			
			setupScatterPlotAxes();
			
			// setupTimelineAxes();
			timelineView = new TimelineView();
			timelineController = new TimelineController(timelineView);
			
			// plotData(testTracks);
			// setTimeout("plotData(testTracks2);", 5000);
			// for (var i = 0; i < )
			
			// setInterval(function() {nextWeek()}, 3000);
		}