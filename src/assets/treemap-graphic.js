var anioSelected = "2016";
var moraSelected = "TODOS";

loadData();

  /*year change*/
  $( ".years" ).change(function() {
    var e = document.getElementById("yearElem");
    anioSelected = e.options[e.selectedIndex].text;
    loadData();
  });

  /*mora change*/
  $( ".mora" ).change(function() {
    var e = document.getElementById("moraElem");
    moraSelected = e.options[e.selectedIndex].value;
    loadData();
  });

  async function loadData(){
    console.log("-----------------------------------------","loading Data from service. year " + anioSelected )
    url = "http://10.2.32.68:10083/analitica/creditoRotativo/NestedTreemap/?anio=" + anioSelected + "&mora=" + moraSelected
    console.log("making request --------  ", new Date().toISOString() + " (" + url + ")")
    
    comprasCreditoRotativo = (await d3.json(url))
    console.log("received response -----  ", new Date().toISOString())
    drawGraphic();
  }

  function drawGraphic(){
    console.log(" draw graphic ---------  ", new Date().toISOString())
  
    var data = createTree(comprasCreditoRotativo)[0]

    console.log(data)

    let format = d3.format(",d")
    let color = d3.scaleSequential([0, 9], d3.interpolateYlGn)
    let width = 1500
    let height = 800

    var treemap = data => d3.treemap()
      .size([width, height])
      .paddingOuter(3)
      .paddingTop(19)
      .paddingInner(1)
      .round(true)
    (d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value))

    var root = treemap(data);
    
    var svg = d3.select("#svg")
        .attr("viewBox", [0, 0, width, height])
        .style("font", "10px sans-serif");

    var shadow = {id: "O-shadow-552", href: "http://localhost:4200/treemap#O-shadow-552"};

    svg.append("filter")
        .attr("id", shadow.id)
      .append("feDropShadow")
        .attr("flood-opacity", 0.8)
        .attr("dx", 0)
        .attr("stdDeviation", 6);

    var cells = svg.selectAll("g")
      .data(root);
    cells.exit().remove();


    var node = svg.selectAll("g")
      .data(d3.nest().key(d => d.height).entries(root.descendants()))
      .join("g")
      .attr("filter", shadow)
      .selectAll("g")
      .data(d => d.values)
      .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    node.append("title")
        .text(d => `${d.ancestors().reverse().map(d => d.data.name).join("/")}\n${format(d.value)}`);

    var customIDCntr = 0;

    function getNextID(customIDprefix) {
      var id = customIDprefix + customIDCntr++;
      return {id : id, href: "http://localhost:4200/#"+id};
    }

    node.append("rect")
        .attr("id", d => (d.nodeUid = getNextID("node")).id)
        .attr("fill", d => color(d.depth))
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0);

    node.append("clipPath")
        .attr("id", d => (d.clipUid = getNextID("clip")).id)
      .append("use")
        .attr("xlink:href", d => d.nodeUid.href);

    node.append("text")
        .attr("clip-path", d => d.clipUid)
      .selectAll("tspan")
      .data(d => {
        if(d.x1 - d.x0 < 100)
          return ""; 
        return d.data.name.match(/\b[\w']+(?:[^\w\n]+[\w']+){0,2}\b/g).concat(format(d.value));})
      .join("tspan")
        .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.8 : null)
        .text(d => d);

    node.filter(d => d.children).selectAll("tspan")
        .attr("dx", 3)
        .attr("y", 13);

    node.filter(d => !d.children).selectAll("tspan")
        .attr("x", 3)
        .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`);

    console.log(" draw graphic ended.  -- ", new Date().toISOString())    
  }

  //Create the total victims variable for each age range.
  var createTree = (data) => {
    let dataAhnosFilter = d3.entries(data).filter(_ => _.value != null).map(d => {
          return {
          code: d.value.code,
          parent: d.value.parent,
          name: d.value.name,
          year: d.value.year,
          value: d.value.value,
        }
    });

    var dataMap = dataAhnosFilter.reduce((map, node) => {
        map[node.code] = node;
      return map;
    }, {});

    var treeData = [];

    dataAhnosFilter.forEach((node) => {
        var parent = dataMap[node.parent];
        if (parent) {
          (parent.children || (parent.children = [])).push(node);
        } else {
          treeData.push(node);
        }
    });

    dataAhnosFilter.forEach((node) => {
      if(node.children)
        delete node['value'];
    });

    return treeData;
  }