var treewidth = 300;
var treeheight = 200;

var treesvg = d3.select("#graph")
            .append("svg")
            .attr("width" , treewidth)
            .attr("height" , treeheight);

var treefader = function(treecolor) { return d3.interpolateRgb(treecolor, "#fff")(0.2); },
    treecolor = d3.scaleOrdinal(d3.schemeCategory20.map(treefader)),
    format = d3.format(",d");

var treemap = d3.treemap()
    .tile(d3.treemapResquarify)
    .size([treewidth, treeheight])
    .round(true)
    .paddingInner(1);

var data = {
   "children": [
    {"name": "Influence1", "size": 1616},
    {"name": "Influence2", "size": 1027},
    {"name": "Influence3", "size": 3891},
    {"name": "Influence4", "size": 891},
    {"name": "Influence5", "size": 2893},
    {"name": "Influence6", "size": 5103},
    {"name": "Influence7", "size": 3677},
    ]
  };

  var root = d3.hierarchy(data)
      .eachBefore(function(d) { d.data.id = d.data.name; })
      .sum(function(d){return d.size})
      .sort(function(a, b) { return b.height - a.height || b.value - a.value; });

  treemap(root);

  var cell = treesvg.selectAll("g")
      .data(root.leaves())
      .enter().append("g")
      .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });

  cell.append("rect")
      .attr("id", function(d) { return d.data.id; })
      .attr("width", function(d) { return d.x1 - d.x0; })
      .attr("height", function(d) { return d.y1 - d.y0; })
      .attr("fill", function(d) { return treecolor(d.data.id); })
      .attr("opacity" , 0)
      .transition()
      .delay(function(d, i) { return i * 50; })
      .attr("opacity" , 1);

  cell.append("clipPath")
      .attr("id", function(d) { return "clip-" + d.data.id; })
      .append("use")
      .attr("xlink:href", function(d) { return "#" + d.data.id; });

  cell.append("text")
      .attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
      .selectAll("tspan")
      .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
      .enter().append("tspan")
      .attr("x", 4)
      .attr("y", function(d, i) { return 13 + i * 10; })
      .text(function(d) { return d; })
      .attr("opacity" , 0)
      .transition()
      .delay(function(d, i) { return d.length * 50; })
      .attr("opacity" , 1);


