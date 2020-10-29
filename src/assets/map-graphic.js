var map = L.map('map').setView([4.64, -74.24], 6);//Create the map and set the location at Colombia and zoom level
var markerclusters;
var anioSelected = "2016";
var moraSelected = "TODOS";

/*year change*/
$( ".years" ).change(function() {
  var e = document.getElementById("yearElem");
  anioSelected = e.options[e.selectedIndex].text;
  setClusterData();
});

/*mora change*/
$( ".mora" ).change(function() {
  var e = document.getElementById("moraElem");
  moraSelected = e.options[e.selectedIndex].value;
  setClusterData();
});


setClusterData()

async function setClusterData(){ 

  if(markerclusters){
    map.removeLayer(markerclusters); // remove the last layer to build the new one based on the selected year.
    d3.select("#legend").remove();   // remove las legends
  }

  var geojson,
      metadata,
      categoryField = 'seccion',
      popupFields = ['seccion','anio','centroDeCosto','totalUnidades'],
      tileServer = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      tileAttribution = 'Map data: <a href="http://openstreetmap.org">OSM</a>',
      rmax = 30;

  markerclusters = L.markerClusterGroup({
        maxClusterRadius: 2*rmax,
        iconCreateFunction: defineClusterIcon //Function that define the cluster icon and the cluster elements incons
      })

  L.tileLayer(tileServer, {attribution: tileAttribution,  maxZoom: 15}).addTo(map); //Add the openstreet maps tile mayer
  map.addLayer(markerclusters);//Add the markercluster layer to the leaflet map
  
  var url = "http://10.2.32.68:10083/analitica/comprasConCreditoRotativoPorTiendas/Geojson/?anio=" + anioSelected + "&mora=" + moraSelected
  console.log("cargando datos "+ url)
  d3.json(url).then((data) => {
    geojson = data;
    metadata = data.properties; //The name of the mine event type and the other properties inside the geojson (Año, departamento, municipio, etc).
    var markers = L.geoJson(geojson, { //Create the layer with the geojson data and add to the markercluster
      pointToLayer: defineFeature,
      onEachFeature: defineFeaturePopup
    });
    markerclusters.addLayer(markers);// Add the layer
    map.fitBounds(markers.getBounds());//Adjust the view to the data point´s bounds
    map.attributionControl.addAttribution(metadata.attribution);
    renderLegend();
  });

  function defineFeature(feature, latlng) {
    var categoryVal = feature.properties[categoryField];
    var myClass = 'marker category-'+categoryVal;
    var myIcon = L.divIcon({
      className: myClass,
      iconSize:null
    });
    return L.marker(latlng, {icon: myIcon});
  }

  function defineFeaturePopup(feature, layer) {
    var props = feature.properties,
        fields = metadata.fields,
        popupContent = '';

    popupFields.map( (key) => {
      if (props[key]) {
        var val = props[key],
            label = fields[key].name;
        if (fields[key].lookup) {
          val = fields[key].lookup[val];
        }
        popupContent += '<span class="attribute"><span class="label">'+label+':</span> '+val+'</span>';
      }
    });
    popupContent = '<div class="map-popup">'+popupContent+'</div>';
    layer.bindPopup(popupContent,{offset: L.point(1,-2)});
  }

  function defineClusterIcon(cluster) {
    var children = cluster.getAllChildMarkers(),
        n = children.length,
        strokeWidth = 1,
        r = rmax-2*strokeWidth-(n<10?12:n<100?8:n<1000?4:0),
        iconDim = (r+strokeWidth)*2,
        data = d3.nest()
    .key((d) => { return d.feature.properties[categoryField]; })
    .entries(children, d3.map),
        html = bakeThePie({data: data,
                           valueFunc: (d) => {
                             var total = d3.sum(d.values, (d) => {return d.feature.properties.totalUnidades;});
                             return total;
                             //d.values.length;
                           },
                           strokeWidth: 1,
                           outerRadius: r,
                           innerRadius: r-10,
                           pieClass: 'cluster-pie',
                           //pieLabel: n,
                           pieLabelClass: 'marker-cluster-pie-label',
                           pathClassFunc: (d) => {return "category-"+d.data.key;},
                           pathTitleFunc: (d) => {
                             var total = d3.sum(d.data.values, (d) => {return d.feature.properties.totalUnidades;});
                             return metadata.fields[categoryField].lookup[d.data.key]+' ('+total+' articulo'+(total!=1?'s':'')+')';}
                          }),
        myIcon = new L.DivIcon({
          html: html,
          className: 'marker-cluster',
          iconSize: new L.Point(iconDim, iconDim)
        });
    return myIcon;
  }

  function bakeThePie(options) {
    if (!options.data || !options.valueFunc) {
      return '';
    }
    var data = options.data;
    var valueFunc = options.valueFunc;

    var r = options.outerRadius?options.outerRadius:28,
        rInner = options.innerRadius?options.innerRadius:r-10,
        strokeWidth = options.strokeWidth?options.strokeWidth:1,
        pathClassFunc = options.pathClassFunc?options.pathClassFunc:() => {return '';},
        pathTitleFunc = options.pathTitleFunc?options.pathTitleFunc:() => {return '';},
        pieClass = options.pieClass?options.pieClass:'marker-cluster-pie',
        pieLabel = options.pieLabel?options.pieLabel:d3.sum(data,valueFunc),
        pieLabelClass = options.pieLabelClass?options.pieLabelClass:'marker-cluster-pie-label',

        origo = (r+strokeWidth),
        w = origo*2,
        h = w,
        donut = d3.pie(),
        arc = d3.arc().innerRadius(rInner).outerRadius(r);

    var svg = document.createElementNS(d3.namespaces.svg, 'svg');
    var vis = d3.select(svg)
    .data([data])
    .attr('class', pieClass)
    .attr('width', w)
    .attr('height', h);

    var arcs = vis.selectAll('g.arc')
    .data(donut.value(valueFunc))
    .enter().append('svg:g')
    .attr('class', 'arc')
    .attr('transform', 'translate(' + origo + ',' + origo + ')');

    arcs.append('svg:path')
      .attr('class', pathClassFunc)
      .attr('stroke-width', strokeWidth)
      .attr('d', arc)
      .append('svg:title')
      .text(pathTitleFunc);

    vis.append('text')
      .attr('x',origo)
      .attr('y',origo)
      .attr('class', pieLabelClass)
      .attr('text-anchor', 'middle')
      .attr('dy','.3em')
      .text(pieLabel);
    return serializeXmlNode(svg);
  }

  function renderLegend() {
    var data = d3.entries(metadata.fields[categoryField].lookup)
    var legenddiv = d3.select('#divlegend').append('div')
    .attr('id','legend');

    var heading = legenddiv.append('div')
    .classed('legendheading', true)
    .text(metadata.fields[categoryField].name);

    var legenditems = legenddiv.selectAll('.legenditem')
    .data(data);

    legenditems
      .enter()
      .append('div')
      .attr('class',(d) => {return 'category-'+d.key;})
      .text((d) => {return d.value;})//For each mine event type category set it´s value.
      .classed({'legenditem': true});
  }

  function serializeXmlNode(xmlNode) {
    if (typeof window.XMLSerializer != "undefined") {
      return (new window.XMLSerializer()).serializeToString(xmlNode);
    } else if (typeof xmlNode.xml != "undefined") {
      return xmlNode.xml;
    }
    return "";
  }
}
