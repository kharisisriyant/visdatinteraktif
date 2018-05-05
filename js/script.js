var width = window.innerWidth,
    height = window.innerHeight,
    populationDomain;

var colorRange = ['#e0f3db','#a8ddb5','#43a2ca'];
var populationDomain = [0, 1500, 3000];  

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
var d3legend;
var legend = svg.append("g")
  .attr("class", "legendQuant")
  .attr("transform", "translate(20,"+(height / 4 + 50)+")");
// Color
var populationColorScale = d3.scaleQuantile()
                        .domain(populationDomain)
                        .range(colorRange);


// Projection and path
var projection = d3.geoMercator()
                    .center([118.25, -5])
                    .scale(width * 0.5)
                    .translate([width / 3 - 20, height / 4]);

var path = d3.geoPath().projection(projection);

// Asynchronous tasks, load topojson map and data
d3.queue()
  .defer(d3.json, "data/IDN.json")
  .defer(d3.json, "data/DatabaseSBMPTN2017.json")
  .defer(d3.json, "data/kodeProdi.json")
  .await(ready);
var sbmptnData;
var kodeProdi;
function KodeProdi(kodeProdiResult){
  this.dataByKodePTN = [];
  kodeProdiResult.forEach(function(d) {
    if (this[d["Kode Universitas"]] == null) {
      this[d["Kode Universitas"]] = {
        name: d["Nama Universitas"],
        website: d["Website Universitas"],
        prodi: []
      }
    }
    this[d["Kode Universitas"]].prodi.push({
      kode: d["Kode Prodi"],
      name: "Nama Prodi"
    })
  }, this.dataByKodePTN);
  this.dataByKodeProdi = [];
  kodeProdiResult.forEach(function(d) {
    this[d["Kode Prodi"]] = {
      univ: {
        name: d["Nama Universitas"],
        kode: d["Kode Universitas"],
        website: d["Website Universitas"]
      },
      name: d["Nama Prodi"]
    }
  }, this.dataByKodeProdi);
}

// Callback function
function ready(error, idnSpatialData, sbmptnDataResult, kodeProdiResult) {
  if (error) throw error;

  kodeProdi = new KodeProdi(kodeProdiResult);

  // Population data
  var populationData = {};
  console.log("ASDASD")
  sbmptnData = sbmptnDataResult;
  var maxPop = 0;
  sbmptnData.forEach(function(d) { 
    if (populationData[d.Provinsi] == null) {
      populationData[d.Provinsi] = 0
    }
    populationData[d.Provinsi] += parseInt(d.Jumlah);
    maxPop = maxPop < populationData[d.Provinsi] ? populationData[d.Provinsi] : maxPop;
  });
  populationColorScale = populationColorScale.domain([0, 1 * maxPop/2, maxPop])
  createLegend();

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
      if (populationData[d.properties.province] == null) {
        populationData[d.properties.province] = 0;
      }
      return populationColorScale(populationData[d.properties.province]);
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
      return d.properties.province + " : " + populationData[d.properties.province];
    });

  initSly();
  registerSemuaUnivButton();
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
  legend.attr("transform", "translate(20,"+(height / 4 + 50)+")");

  d3.selectAll("path")
    .attr("d", path);
  slyelement.obj.reload();
}

function createLegend() {
   //Append a defs (for definition) element to your SVG
  
d3legend = d3.legendColor()
  .labelFormat(d3.format(".0f"))
  .scale(populationColorScale);

svg.select(".legendQuant")
  .call(d3legend);
}

var slyelement = {
  obj: {},
  el: '.frame',
  options: {
    horizontal: 1,
    itemNav: 'centered',
    smart: 1,
    activateOn: 'click',
    mouseDragging: 1,
    touchDragging: 1,
    releaseSwing: 1,
    // startAt: 0,
    scrollBy: 1,
    speed: 300,
    elasticBounds: 1,
    dragHandle:    true,
    easing: 'swing', // easeInOutElastic, easeOutBounce
    scrollBar: $('.scrollbar')
  }
};

function initSly() {
  slyelement.obj = new Sly($(slyelement.el), slyelement.options);
  
  slyelement.obj.init();
  console.log(kodeProdi.dataByKodePTN)
  kodeProdi.dataByKodePTN.forEach(function(d, i) {
    var el = $('<li>').append(
      $('<figure>', { class: 'image is-128x128 is-vertical-center'}).append(
        $('<img>').attr("src","img/logo-univ/itb.png")
      ),
      $('<p>', {class: 'content has-text-centered', html: d.name})
    )
    el.on('click', function(e) {
      el.addClass('active')
      selectUniv('active', slyelement.obj.getIndex(el))
    })
    slyelement.obj.add(el);
  })
  slyelement.obj.on('active', selectUniv);
  
}

function selectUniv(eventName, itemIndex) {
    $('#allUniv').addClass('is-outlined')
    console.log($(slyelement.obj.items[itemIndex].el).find("p").text());
    var selectedUniv = $(slyelement.obj.items[itemIndex].el).find("p").text();

    var populationData = {};
    var maxPop = 0;
    sbmptnData.forEach(function(d) { 
      if (populationData[d.Provinsi] == null) {
        populationData[d.Provinsi] = 0
      }
      if (kodeProdi.dataByKodeProdi[d.Prodi] == null) {
        // console.log(d.Prodi);
        return;
      }
      if (kodeProdi.dataByKodeProdi[d.Prodi].univ.name != selectedUniv) {
        return;
      }
      populationData[d.Provinsi] += parseInt(d.Jumlah);
      maxPop = maxPop < populationData[d.Provinsi] ? populationData[d.Provinsi] : maxPop;
    });
    console.log(maxPop)
    populationColorScale = populationColorScale.domain([0, 1 * maxPop/2, maxPop])


    g.selectAll("path")
    // .data(topojson.feature(idnSpatialData, idnSpatialData.objects.IDN).features)
    // .enter()
      .transition().duration(500)
      .ease(d3.easePolyInOut, 4)
      .attr("fill", function(d) {
        if (populationData[d.properties.province] == null) {
          populationData[d.properties.province] = 0;
        }
        return populationColorScale(populationData[d.properties.province]);
      });
    svg.select(".legendQuant")
    .call(d3legend);
}

function registerSemuaUnivButton() {
  $('#allUniv').on('click', function(e) {
    $('#allUniv').removeClass('is-outlined')
    console.log($(slyelement.el).find('.active'))
    console.log(slyelement.obj.rel.activeItem)
    $(slyelement.el).find('.active').removeClass('active')
    slyelement.obj.reload()
    // slyelement.obj = slyelement.obj.destroy().init()

    var populationData = {};
    var maxPop = 0;
    sbmptnData.forEach(function(d) { 
      if (populationData[d.Provinsi] == null) {
        populationData[d.Provinsi] = 0
      }
      if (kodeProdi.dataByKodeProdi[d.Prodi] == null) {
        // console.log(d.Prodi);
        return;
      }
      populationData[d.Provinsi] += parseInt(d.Jumlah);
      maxPop = maxPop < populationData[d.Provinsi] ? populationData[d.Provinsi] : maxPop;
    });
    console.log(maxPop)
    populationColorScale = populationColorScale.domain([0, 1 * maxPop/2, maxPop])


    g.selectAll("path")
    // .data(topojson.feature(idnSpatialData, idnSpatialData.objects.IDN).features)
    // .enter()
      .transition().duration(500)
      .ease(d3.easePolyInOut, 4)
      .attr("fill", function(d) {
        if (populationData[d.properties.province] == null) {
          populationData[d.properties.province] = 0;
        }
        return populationColorScale(populationData[d.properties.province]);
      });
    svg.select(".legendQuant")
    .call(d3legend);
  })
}