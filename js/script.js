var width = window.innerWidth,
    height = window.innerHeight,
    populationDomain;

var colorRange = ["#1a9850", "#66bd63", "#a6d96a", "#d9ef8b", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d73027"];
var populationDomain = [0, 100000, 200000, 300000, 500000, 750000, 1000000, 1500000, 2500000, 5000000];  

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

d3.selection.prototype.moveToBack = function() { return this.each(function() { var firstChild = this.parentNode.firstChild; if (firstChild) { this.parentNode.insertBefore(this, firstChild); } }); };

// Create SVG element
var svg = d3.select("#idnMap").insert("svg", "p")
            .attr("width", width)
            .attr("height", height * 0.5)
            .attr("class", "map");
var g = svg.append("g");
// Color
var populationColor = d3.scaleThreshold()
                        .domain(populationDomain)
                        .range(colorRange);


// Projection and path
var projection = d3.geoMercator()
                    .center([118.25, -5])
                    .scale(width * 0.5)
                    .translate([width / 3, height / 4]);

var path = d3.geoPath().projection(projection);

// Asynchronous tasks, load topojson map and data
d3.queue()
  .defer(d3.json, "data/IDN.json")
  .defer(d3.json, "data/DatabaseSBMPTN2017.json")
  .await(ready);
var sbmptnData;
// Callback function
function ready(error, idnSpatialData, sbmptnDataResult) {
  if (error) throw error;

  // Population data
  var populationData = {};
  console.log("ASDASD")
  sbmptnData = sbmptnDataResult;
  sbmptnData.forEach(function(d) { 
    if (populationData[d.Provinsi] == null) {
      populationData[d.Provinsi] = 0
    }
    populationData[d.Provinsi] += parseInt(d.Jumlah);
  });

  // Draw the map
  g.selectAll("path")
    .attr("class", "city")
    .data(topojson.feature(idnSpatialData, idnSpatialData.objects.IDN).features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("stroke", "black")
    .attr("stroke-width", "0")
    .attr("fill", "white")
    .transition().duration(1000)
    .delay(function(d, i) { return Math.random() * 250  +100; })
    .ease(d3.easePolyInOut, 4)
    .attr("fill", function(d) {
      return populationColor(Math.random() * 5000000);
    })
    .attr("transform", "translate(-100,0)scale(1.2)")
    .attr("stroke-width", "0.2")

  g.selectAll("path")
    .on('mouseover', function(d, i) {
      var currentState = this;
      d3.select(this).style('stroke-width', 1);
    })
    .on('mouseout', function(d, i) {
      var currentState = this;
      d3.select(this).style('stroke-width', 0.2);
    })
  g.selectAll("path")
    .append("title")
    .text(function(d) {
      return d.properties.NAME_1 + " : " + populationData[d.properties.NAME_1];
    });
}

d3.select(window).on("resize", resize);

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;

  projection.scale(width * 0.5)
            .translate([width / 3, height / 4]);

  d3.select("svg")
    .attr("width", width)
    .attr("height", height * 0.5);

  d3.selectAll("path")
    .attr("d", path);
}
var slyelement = {
  obj: {},
  el: '.frame',
  options: {
    horizontal: 1,
    itemNav: 'forceCentered',
    smart: 1,
    activateMiddle: 1,
    activateOn: 'click',
    mouseDragging: 1,
    touchDragging: 1,
    releaseSwing: 1,
    startAt: 0,
    scrollBy: 1,
    speed: 300,
    elasticBounds: 1,
    easing: 'swing', // easeInOutElastic, easeOutBounce
    scrollBar: $('.scrollbar')
  }
};


$(function(){
  slyelement.obj = new Sly($(slyelement.el), slyelement.options);
  
  slyelement.obj.init();
});

$(window).resize(function(e) {
  slyelement.obj.reload();
});
