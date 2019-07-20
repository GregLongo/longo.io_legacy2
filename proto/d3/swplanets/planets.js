// Set the dimensions of the canvas
var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var barwidth =26;

// Set the ranges
var x = d3.scalePow().exponent(0.4).range([0, width]);
var y = d3.scalePow().exponent(0.1).range([height, 0]);

// Define the axes
var xAxis = d3.axisBottom(x);

var yAxis = d3.axisLeft(y);

// Define the line
var valueline = d3.line()
    .x(function(d) { return x(d.diameter); })
    .y(function(d) { return y(d.population); });
    
// Adds the svg canvas
var svg = d3.select("#graph")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

//add bg
svg.append("rect")                                     
    .attr("width", width)                              
    .attr("height", height)
    .style("fill", "none")
    .style("z-index", "-1");

// Get the data


d3.queue()
.defer(d3.json, "https://swapi.co/api/planets/?format=json&page=7")
.defer(d3.json, "https://swapi.co/api/planets/?format=json&page=6")
.defer(d3.json, "https://swapi.co/api/planets/?format=json&page=5")
.defer(d3.json, "https://swapi.co/api/planets/?format=json&page=4")
.defer(d3.json, "https://swapi.co/api/planets/?format=json&page=3")
.defer(d3.json, "https://swapi.co/api/planets/?format=json&page=2")
.defer(d3.json, "https://swapi.co/api/planets/?format=json&page=1")
.await(function(error, data, data2, data3, data4, data5, data6, data7){


    planets = data.results
        .concat(data2.results)
        .concat(data3.results)
        .concat(data4.results)
        .concat(data5.results)
        .concat(data6.results)
        .concat(data7.results);

console.log(planets);

    planets.forEach(function(d) {

                if(d.diameter > 0){
                    
                    d.diameter = +d.diameter;

                }
                else{
                    d.diameter = -100000000;

                }

                if(d.population > 0){
                    
                    d.population = +d.population;

                }
                else{

                    d.population = -10000000000000000;

                }            

        });

// Scale the range of the data
x.domain([0, d3.max(planets, function(d) { return d.diameter; })]);
y.domain([0, d3.max(planets, function(d) { return d.population; })]);


// Add the X Axis
svg.append("g")
    .attr("class", "axis xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis.ticks(5));

// Add the Y Axis
svg.append("g")
    .attr("class", "axis yaxis")
    .call(yAxis.ticks(5));

//add axis labels
svg.append("text")
    .attr("class", "label xlabel")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y",   -56)
    .text("Population Density for Galactic Planets");

svg.append("text")
    .attr("class", "label xlabel")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y",   height + 56)
    .text("Planetary Diameter");

svg.append("text")
    .attr("class", "label ylabel")
    .attr("text-anchor", "middle")
    .attr("y", 0)
    .attr("x", -height/2)
    .attr("dy", "-7em")
    .attr("transform", "rotate(-90)")
    .text("Planet Population");

var dot = svg.selectAll(".dot")
    .data(planets)
    .enter()
    .append("g")
    .on("mouseenter" , function(d) { 
        d3.select(this).selectAll(".label")
            .style("display" , "block") ;
    })
    .on("mouseleave" , function(d) { 
        d3.select(this).selectAll(".label")
            .style("display" , "none") ;
    })
    .on("click" ,function(d) {
        console.log(d); 
    });

dot.append('circle')
    .attr("class", "dot")
    .attr("cx", function(d) { return x(d.diameter); })
    .attr("cy", function(d) { return y(d.population); })
    .attr("r", 3);

    dot.append("text")
    .text(function(d) { return d.name; })
    .attr("x", function(d) { return x(d.diameter); })
    .attr("y", function(d) { return y(d.population); })
    .attr("class", "label")
    .attr("transform" , "translate( 0 , -10)")
    .style("display" , "none");
           
});



