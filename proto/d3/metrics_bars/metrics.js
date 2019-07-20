// Set the dimensions of the canvas
var margin = {top: 30, right: 120, bottom: 30, left: 120},
width = 1300 - margin.left - margin.right,
height = 290 - margin.top - margin.bottom,
width2 = 1300- margin.left - margin.right,
height2 = 140 - margin.top - margin.bottom;

var barwidth =30;
var selectedbar;
var barclicked = false;

var parseTime = d3.timeParse("%d-%b-%y");
var formatTime = d3.timeFormat("%B %d, %Y ");

// Set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var x2 = d3.scaleTime().range([0, width2]);
var y2 = d3.scaleLinear().range([height2, 0]);

// Define the axes
var xAxis = d3.axisBottom(x);
var xAxis2 = d3.axisBottom(x2);
var yAxis = d3.axisLeft(y);

// Define the line
var valueline = d3.line()
.x(function(d) { return x(d.date); })
.y(function(d) { return y(d.value); });

// Adds the svg canvas
var svg = d3.select("#graph")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", 
    "translate(" + margin.left + "," + margin.top + ")");

var svg2 = d3.select("#graph2")
.append("svg")
.attr("width", width2 )
.attr("height", height2 + margin.top + margin.bottom)
.attr("transform", 
    "translate(" + margin.left + "," + margin.top + ")");

//add bg
svg.append("rect")                                     
.attr("width", width)                              
.attr("height", height)
.style("fill", "none")
.style("z-index", "-1");

svg2.append("rect")                                     
.attr("width", width2)                              
.attr("height", height2)
.style("fill", "none")
.style("z-index", "-1");

// Get the data
d3.csv("xyz.csv", function(error, data) {

    data.forEach(function(d) {
        d.day = +d.day;
        d.date= parseTime(d.date);
        d.value = +d.average;
    });

// Scale the range of the data
x.domain([data[46].date , data[78].date]);
y.domain([0, 100]);

// Scale the range of the data
x2.domain(d3.extent(data, function(d) { return d.date; }));
y2.domain([0, d3.max(data, function(d) { return d.value; })]);

var graphs = svg.append("g");

var brushgraph = svg2.append("g");

//gridlines 

function make_y_gridlines() {       
    return d3.axisLeft(y)
    .ticks(6)
}

// add the Y gridlines
svg.append("g")           
.attr("class", "grid")
.call(make_y_gridlines()
    .tickSize(-width)
    .tickFormat("")
    );

//add main bar graph

graphs.selectAll(".bar")
.data(data)
.enter()
.append("rect")
.attr("class",  function(d, i) { return "bar bar" + d.day ; })
.attr("x", function(d) { return x(d.date); })
.attr("y", height)
.attr("width", barwidth)
.attr("height", 1)
.attr("transform", "translate( "+ barwidth/-2 +", 0)")
.style("opacity" ,".8")
.style("cursor" , "pointer")
.on("click" , function(d){

    barclicked = true;
    //opacity gradient around clicked bar 
    //(broken out into this crazy recursion to
    // address bars individually)

    d3.selectAll(".bar").style("opacity" ,".06");    
    d3.select(this).style("opacity" ,"1");

    d3.select(this.previousSibling).style("opacity" ,".8");
    d3.select((this.previousSibling).previousSibling).style("opacity" ,".7");
    d3.select(((this.previousSibling).previousSibling).previousSibling).style("opacity" ,".6");
    d3.select((((this.previousSibling).previousSibling).previousSibling).previousSibling).style("opacity" ,".5");
    d3.select(((((this.previousSibling).previousSibling).previousSibling).previousSibling).previousSibling).style("opacity" ,".4");
    d3.select((((((this.previousSibling).previousSibling).previousSibling).previousSibling).previousSibling).previousSibling).style("opacity" ,".3");
    d3.select(((((((this.previousSibling).previousSibling).previousSibling).previousSibling).previousSibling).previousSibling).previousSibling).style("opacity" ,".2");
    d3.select((((((((this.previousSibling).previousSibling).previousSibling).previousSibling).previousSibling).previousSibling).previousSibling).previousSibling).style("opacity" ,".1");

    d3.select(this.nextSibling).style("opacity" ,".8");
    d3.select((this.nextSibling).nextSibling).style("opacity" ,".7");
    d3.select(((this.nextSibling).nextSibling).nextSibling).style("opacity" ,".6");
    d3.select((((this.nextSibling).nextSibling).nextSibling).nextSibling).style("opacity" ,".5");
    d3.select(((((this.nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).style("opacity" ,".4");
    d3.select((((((this.nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).style("opacity" ,".3");
    d3.select(((((((this.nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).style("opacity" ,".2");
    d3.select((((((((this.nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).nextSibling).style("opacity" ,".1");

    focus.style("display", "block");
    focus.selectAll(".selected-value")
    .text(d.value);
    focus.selectAll(".selected-date")
    .text(formatTime(d.date));
    focus.attr("transform",
        "translate(" + (x(d.date) - 41) + "," + (y(d.value)-80) + ")");

    selectedbar = d.day;

    goBoing();

});

//animate bars on page load

graphs.selectAll(".bar")
.transition()
.duration(600)
.attr("y", function(d) { return y(d.value); })
.attr("height", function(d) { return height - y(d.value); });


// popup flag

var focus = svg.selectAll(".g")
.data(data)
.enter()
.append("g")
.style("display", "none");                             

focus.append("rect")
.attr("class", "popup")
.attr("width", 120)                              
.attr("height", 60) 
.attr("ry", 6);

focus.append("text")
.attr("class", "selected-value")
.attr("x" , 52)
.attr("y" , 24)
.attr("text-anchor", "end");

focus.append("text")
.attr("class", "selected-closed")
.text(" closed")
.attr("x" , 56)
.attr("y" , 24)
.attr("text-anchor", "start");

focus.append("text")
.attr("class", "selected-date")
.attr("x" , 56)
.attr("y" , 44)
.attr("text-anchor", "middle");

focus.append('path')
.attr("class", "triangle")
.attr("d", "M 50,5 95,97.5 5,97.5 z")
.attr("transform",
    "translate(64,70) rotate(180) scale(.1)");

//button clicks

d3.select("#average")
.on("click" , function(){
    var stuff = "average";
    redraw(stuff);
    d3.select(".chosen").classed("chosen" , false);
    d3.select(this).classed("chosen" , true);
});

d3.select("#total")
.on("click" , function(){
    var stuff = "total";
    redraw(stuff);
    d3.select(".chosen").classed("chosen" , false);
    d3.select(this).classed("chosen" , true);
});

d3.select("#trend")
.on("click" , function(){
    var stuff = "trend";
    redraw(stuff);
    d3.select(".chosen").classed("chosen" , false);
    d3.select(this).classed("chosen" , true);
});

//function for redrawing on dataset selection
function redraw(dataset){

    var animationspeed = 800;

    graphs.selectAll(".bar")
    .transition()
    .duration(animationspeed)
    .attr("y", function(d) { return y(d[dataset]); })
    .attr("height", function(d) { return height - y(d[dataset]); });

    brushgraph.selectAll(".brushbar")
    .transition()
    .duration(animationspeed)
    .attr("y", function(d) { return y2(d[dataset]); })
    .attr("height", function(d) { return height2 - y2(d[dataset]); });

    var nuvalueline = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d[dataset]); });

    graphs.select(".line")
    .transition()
    .duration(animationspeed)
    .attr("d", nuvalueline(data));

    graphs.selectAll(".dot")
    .transition()
    .duration(animationspeed)
    .attr("cy", function(d) { return y(d[dataset]); });
    
    if(barclicked == true){   
            focus.selectAll(".selected-value")
            .transition()
            .duration(animationspeed)
            .text(data[selectedbar-1][dataset]);
    
            focus.transition()
            .duration(animationspeed)
            .attr("transform",
                "translate(" + (x(data[selectedbar-1].date) - 41) + "," + (y(data[selectedbar-1][dataset])-80) + ")");
     }

    data.forEach(function(d) {
        d.day = +d.day;
        d.value = +d[dataset];
    });

}

//draw short lower graph
brushgraph.selectAll(".brushbar")
.data(data)
.enter()
.append("rect")
.attr("class",  "brushbar")
.attr("x", function(d) { return x2(d.date); })
.attr("width", 9)
.attr("y" , height2)
.attr("height" , 1)
.attr("transform", "translate( "+ barwidth/-2 +", 0)")
.filter(function(d){return (d.day>46 && d.day <83)})
.classed("selected-range" , true);

brushgraph.selectAll(".brushbar")
.attr("transform" , "translate(0 , 0)")
.transition()
.duration(600)
.attr("height", function(d) { return height2 - y2(d.value); })
.attr("y", function(d) { return y2(d.value); });

// Add the valueline path
graphs.append("path")
.attr("class", "line")
.attr("d", valueline(data))
.style("stroke-opacity", 0)
.transition()
.delay(400)
.duration(200)
.style("stroke-opacity", .3);

// Add circle markers
graphs.selectAll(".dot")
.data(data)
.enter()
.append('circle')
.attr("class", "dot")
.attr("cx", function(d) { return x(d.date); })
.attr("cy", function(d) { return y(d.value); })
.attr("r", 4)
.style("opacity", 0)
.transition()
.delay(400)
.duration(200)
.style("opacity", 1);


//////Static Elements////////

// Add the X Axis
graphs.append("g")
.attr("class", "xaxis")
.attr("transform", "translate(0," + height + ")")
.call(xAxis.ticks(30).tickFormat(d3.timeFormat("%d")));

svg.append("g")
.attr("class", "xaxis2")
.attr("transform", "translate(0," + (height+16) + ")")
.call(xAxis.ticks(10).tickFormat(d3.timeFormat("%B")));

svg2.append("g")
.attr("class", "x2axis2")
.attr("transform", "translate(0, 80)")
.call(xAxis2.ticks(100).tickFormat(d3.timeFormat("%B")));

// Add the Y Axis
svg.append("g")
.attr("class", "yaxis")
.call(yAxis.ticks(5));

svg.append("defs").append("clipPath")
.attr("id", "clip")
.append("rect")
.attr("width", width )
.attr("height", 100000)
.attr("x", -18);

graphs.attr("clip-path", "url(#clip)").attr("transform" , "translate(18 , 0)");

}); //<---- end of data fetch 


////// Bottom Cards ////////

var cards = d3.select("#cards")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height",300)
.append("g")
.attr("transform", 
    "translate(0 , 16)");

cards.append("rect")
.attr("class" , "cardmat")        
.attr("width", width + margin.left + margin.right)
.attr("height", 200);

var cardwidth1 = 200;
var cardwidth2 = (1300-cardwidth1)/3;

var card2 = cards.append("g")
.classed("piecard piecard1" , true)
.append("rect")
.attr("width", cardwidth2)
.attr("height",200)
.attr("x" , cardwidth1 + 2);

cards.append("g")
.classed("piecard piecard2" , true)
.append("rect")
.attr("width", cardwidth2)
.attr("height",200)
.attr("x" , (cardwidth1 + cardwidth2 + 4));

cards.append("g")
.classed("piecard piecard3" , true)
.append("rect")
.attr("width", cardwidth2)
.attr("height",200)
.attr("x" , (cardwidth1 + 2 * cardwidth2 + 6));

//add text

d3.selectAll(".piecard").each(function(d, i){

    d3.select(this).append("text").text("EXAMPLE DATA METRIC").attr("class" , "avgsmall")
    .attr("transform","translate("+ (cardwidth2 * i + cardwidth1 + 42) +" ,36)");

    d3.select(this).append("text").text("20.4").attr("class" , "closebig")
    .attr("transform","translate("+ (cardwidth2 * i + cardwidth1 + 42) +" ,92)");

    d3.select(this).append("text").text("days").attr("class" , "closedays")
    .attr("transform","translate("+ (cardwidth2 * i + cardwidth1 + 110) +" ,92)");

    d3.select(this).append("text").text("2k").attr("class" , "closemedium")
    .attr("transform","translate("+ (cardwidth2 * i + cardwidth1 + cardwidth2/1.37) +" 115)");

    d3.select(this).append("line")
    .attr("class" , "guagebg")
    .attr("x" , 0)
    .attr("x2" , 140)
    .attr("transform","translate("+ (cardwidth2 * i + cardwidth1 + 42) +" 112)");

    d3.select(this).append("line")
    .attr("class" , "guagefg")
    .attr("x" , 0)
    .attr("x2" , 80)
    .attr("transform","translate("+ (cardwidth2 * i + cardwidth1 + 42) +" 112)");
    
    //d3 has no real concept of "columns-width" like css, so:
    d3.select(this).append("text")
    .text("This is a short").attr("class" , "closetiny")
    .attr("max-width" , 50)
    .attr("transform","translate("+ (cardwidth2 * i + cardwidth1 + 42) +" ,140)");

    d3.select(this).append("text")
    .text("blurb to explain").attr("class" , "closetiny")
    .attr("max-width" , 50)
    .attr("transform","translate("+ (cardwidth2 * i + cardwidth1 + 42) +" ,154)");

    d3.select(this).append("text")
    .text("this data metric").attr("class" , "closetiny")
    .attr("max-width" , 50)
    .attr("transform","translate("+ (cardwidth2 * i + cardwidth1 + 42) +" ,170)");
});


d3.select(".piecard3").on("mouseenter" , function() {

    d3.select(this)
    .attr("transform" , "scale(1.2) translate(-222 , -16)");

    d3.select(".piecard2")
    .attr("transform" , "translate(-70 , 0)");

    d3.select(".piecard1")
    .attr("transform" , "translate(-70 , 0)");

})
.on("mouseleave" , function() {


    d3.select(this)
    .attr("transform" , "translate(0 , 0)");

    d3.select(".piecard2")
    .attr("transform" , "translate(0 , 0)");

    d3.select(".piecard1")
    .attr("transform" , "translate(0 , 0)");

});

var card1 = cards.append("g")
.attr("class" , "card1");

card1.append("rect")
.attr("width", cardwidth1)
.attr("height",200);

card1.append("circle")
.attr("cx" , cardwidth1/2)
.attr("cy" , 110)
.attr("r" , 46);

card1.append("text").text("AVERAGE").attr("class" , "avgsmall")
.attr("x" , cardwidth1/2.6)
.attr("y" , 36);

card1.append("text").text("8.1").attr("class" , "avgbig")
.attr("x" , cardwidth1/5)
.attr("y" , 130);


//pie charts

var tau = 2 * Math.PI; 

var piearc = d3.arc()
.innerRadius(36)
.outerRadius(50)
.startAngle(0);

var piewidth = cardwidth2;
var pieheight = 200;

var pieg = d3.selectAll(".piecard").append("g");

pieg.each(function(d,i){
    d3.select(this).attr("transform","translate("+ (cardwidth2 * ( i + 1.3)) +" ,110)");
});

var piebackground = pieg.append("path")
.datum({endAngle: tau})
.attr("class" , "pieback")
.attr("d", piearc);

var pieforeground = pieg.append("path")
.datum({endAngle: 0.027 * tau})
.attr("class" , "piefront")
.attr("d", piearc);

function goBoing() {
    pieforeground.each(function(){
        d3.select(this).transition()
        .duration(750)
        .attrTween("d", arcTween(Math.random() * tau));
    });
}

function arcTween(newAngle) {
    return function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        return function(t) {
            d.endAngle = interpolate(t);
            console.log((newAngle/6)*100)
            return piearc(d);
        };
    };
}

