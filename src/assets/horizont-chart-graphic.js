	
	var numHorizons = 9;
	var seccion = "ALIMENTOS";
	var seccionCode = "2"
	var year = "2016"
	loadGraphic();

	/*seccion change*/
	$( ".seccionhorizontchart" ).change(function() {
		var e = document.getElementById("seccionhorizontchartElem");
		seccion = e.options[e.selectedIndex].text;
		seccionCode = e.options[e.selectedIndex].value;
		d3.select('#svg').selectAll("g").remove();
		loadGraphic();
	});

	/*year change*/
	$( ".years" ).change(function() {
		var e = document.getElementById("yearElem");
		year = e.options[e.selectedIndex].text;
		d3.select('#svg').selectAll("g").remove();
		loadGraphic();
  	});
	  
	function loadGraphic(){
		var margin = { top: 10, right: 10, bottom: 30, left: 100 },
			width = 1200 - margin.left - margin.right,
			height = 700 - margin.top - margin.bottom;

		var formatTime = d3.timeFormat('%B %Y');

		var svg = d3.select('#svg')
						.attr('width', width + margin.left + margin.right)
						.attr('height', height + margin.top + margin.bottom)
		var svgg = svg.append('g')
						.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		var x = function(d) { return d.time; },
				xScale = d3.scaleTime().range([0, width]),
				xValue = function(d) { return xScale(x(d)); },
				xAxis = d3.axisBottom(xScale).tickFormat(formatTime);

		var y = function(d) { return d.value; },
				yScale = d3.scaleLinear().clamp(true),
				y0Value = function(d) { return yScale(0); },
				y1Value = function(d) { return yScale(y(d)); };

		var activity = function(d) { return d.key; },
				activityScale = d3.scaleBand().range([0, height]).padding(0.05),
				activityValue = function(d) { return activityScale(activity(d)); },
				activityAxis = d3.axisLeft(activityScale);

		var horizonScale = d3.scaleQuantize()
				.range(d3.range(numHorizons));

		var area = d3.area()
				.x(xValue)
				.y0(y0Value)
				.y1(y1Value);

		var url = "http://10.2.32.68:10083/analitica/comprasConCreditoRotativoPorTiendas/HorizontChart/?anio=" + year + "&seccion=" + seccionCode
		console.log("cargando datos " + url)
		d3.json(url).then((result) => {
			
			dataFlat = result.filter(d => d != null).map(d => {
				var lastDay = getDateRangeOfWeek(d.week,d.anio)[1];
				return {
					name: d.puntoDeVenta,
					costo: d.centroDeCosto,
					descripcion_seccion : d.descripcionSeccion.replace(/\s+$/, ''),
					time : lastDay,
					timestamp : lastDay.getTime(),
					value : d.total
				};
			})

			// Sort by time
			dataFlat.sort(function(a, b) { return a.timestamp - b.timestamp; });

			var data = d3.nest()
					.key(function(d) { return d.name; })
					.entries(dataFlat);


			// Sort activities by peak activity time
			function peakTime(d) {
				var i = d3.scan(d.values, function(a, b) { return y(b) - y(a); });
				return d.values[i].time;
			};
			data.sort(function(a, b) { return peakTime(b) - peakTime(a); });

			xScale.domain(d3.extent(dataFlat, x));

			activityScale.domain(data.map(function(d) { return d.key; }));

			yScale.range([activityScale.bandwidth(), 0]);
			var extent = d3.extent(dataFlat, y)
			var fill = function(d) {return d.yExtent[0]/(extent[1]); },
			fillScale = d3.scaleLinear().range(['lavender', 'purple']).interpolate(d3.interpolateHcl),
			fillValue = function(d) { return fillScale(fill(d)); };

			horizonScale.domain(d3.extent(dataFlat, y));

			svgg.append('g').attr('class', 'axis axis--x')
					.attr('transform', 'translate(0,' + height + ')')
					.call(xAxis);

			svgg.append('g').attr('class', 'axis axis--activity')
					.call(activityAxis);

			var gActivity = svgg.append('g').attr('class', 'activities')
							.selectAll('.activity').data(data)
					.enter().append('g')
							.attr('class', function(d) { return 'activity activity--' + d.key; })
							.attr('transform', function(d) {
									var ty = activityValue(d);
									return 'translate(0,' + ty + ')';
							});

			function horizonData(d) {
					return horizonScale.range()
							.map(function(i) {
									return {
											yExtent: horizonScale.invertExtent(i),
											key: d.key,
											values: d.values
									};
							});
			}

			var gHorizon = gActivity.selectAll('.horizon').data(horizonData)
					.enter().append('path')
							.attr('class', 'horizon')
							.each(function(d) {
									// TODO: create separate y-scales using d3.local()
									yScale.domain(d.yExtent);
									d3.select(this)
											.attr('d', area(d.values));
							})
							.style('fill', fillValue);
		});

	}

	function ISO8601_week_no(dt) {
		var tdt = new Date(dt.valueOf());
		var dayn = (dt.getDay() + 6) % 7;
		tdt.setDate(tdt.getDate() - dayn + 3);
		var firstThursday = tdt.valueOf();
		tdt.setMonth(0, 1);
		if (tdt.getDay() !== 4) {
				tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
		}
		return 1 + Math.ceil((firstThursday - tdt) / 604800000);
	}

	function addDays(date, days) {
		var result = new Date(date);
		result.setDate(result.getDate() + days);
		return result;
	}

	function getLastDayOfWeek(date){
		var dayNo = date.getDay();
		var year = date.getYear();
		if(dayNo == 0)//Sunday
			return date;
		else{
			var newDate = addDays(date,7-dayNo);
			if(year != newDate.getYear()){
				return new Date(year+1900, 12-1, 31);
			}
			else
				return newDate;
		}
	}

	function getDateRangeOfWeek(weekNo,year){
			var d1 = new Date(year,1,1);
			var numOfdaysPastSinceLastMonday = eval(d1.getDay()- 1);
			d1.setDate(d1.getDate() - numOfdaysPastSinceLastMonday);
			var weekNoToday = ISO8601_week_no(d1)
			var weeksInTheFuture = eval( weekNo - weekNoToday );
			var fromDate = new Date(d1.getTime());
			fromDate.setDate(d1.getDate() + eval( 7 * weeksInTheFuture ));
			
			var toDate = new Date(fromDate.getTime());
			toDate.setDate(fromDate.getDate() + 6);
			
			return [fromDate,toDate];
	};

