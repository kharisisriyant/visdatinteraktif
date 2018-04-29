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
var svg = d3.select("body").insert("svg", "p")
            .attr("width", width)
            .attr("height", height * 0.8)
            .attr("class", "map");

// Projection and path
var projection = d3.geoMercator()
                    .center([118.25, -5])
                    .scale(width * 0.5)
                    .translate([width / 3, height / 3]);

var path = d3.geoPath().projection(projection);

// Asynchronous tasks, load topojson map and data
d3.queue()
  .defer(d3.json, "data/IDN.json")
  .defer(d3.csv, "data/IDN.csv")
  .await(ready);

// Callback function
function ready(error, data, population) {
  if (error) throw error;

  // Population data
  var populationData = {};

  population.forEach(function(d) { populationData[d.id] = +d.population; });

  // Color
  var populationColor = d3.scaleThreshold()
                          .domain(populationDomain)
                          .range(colorRange);

  var g = svg.append("g");

  // Draw the map
  g.selectAll("path")
    .attr("class", "city")
    .data(topojson.feature(data, data.objects.IDN).features)
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
      return d.properties.NAME_1 + " : " + populationData[d.properties.ID_2];
    });
}

d3.select(window).on("resize", resize);

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;

  projection.scale(width * 0.5)
            .translate([width / 3, height / 3]);

  d3.select("svg")
    .attr("width", width)
    .attr("height", height * 0.8);

  d3.selectAll("path")
    .attr("d", path);
}