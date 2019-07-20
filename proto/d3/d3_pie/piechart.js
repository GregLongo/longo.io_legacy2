//data
var dataset = [
  { label: 'thing1', count: 30 },
  { label: 'thing2', count: 10 },
  { label: 'thing3', count: 60 },
];

var bg = [
  { label: 'total', count: 100 },
];

//dims
var width = 750;
var height = 750;
var radius = Math.min(width, height) / 2;

//color scale
var color = d3.scaleOrdinal().range(['#54C99A', '#A289C9', 'rgba(0,0,0,0)']); 

//inititalize bg
var bg_svg = d3.select("#chart")   
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');

//initialize chart
var svg = d3.select("#chart")   
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');

//create arcs and pie
var arc = d3.arc()
  .innerRadius(0)
  .outerRadius(radius);


var pie = d3.pie()
  .value(function(d) { return d.count; })
  .sort(null);

//draw bg
var bg_path = bg_svg.selectAll('path')
  .data(pie(bg))
  .enter()
  .append('path')
  .attr('fill', "#00739D")
  .transition()
  .duration(300)
  .attrTween('d', function(d) {
   var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
   return function(t) {
       d.endAngle = i(t);
     return arc(d);
   }
});

//draw arcs
var path = svg.selectAll('path')
  .data(pie(dataset))
  .enter()
  .append('path')
  .attr('fill', function(d, i) {
    return color(d.data.label);
  })
  .on("mouseover", handleMouseOver)
  .on("mouseleave", handleMouseLeave)
  .transition()
  .duration(function(d, i) {
      return (d.value * 10);
    })
  .delay(function(d, i) {
      return (i * 260) + 280;
    })
  .attrTween('d', function(d) {
   var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
   return function(t) {
       d.endAngle = i(t);
     return arc(d);
   }

});

// Add interactivity

function handleMouseOver(d, i) {  
    d3.select(this).classed("hovered", true);
}

function handleMouseLeave(d, i) {  
    d3.select(this).classed("hovered", false);
}
