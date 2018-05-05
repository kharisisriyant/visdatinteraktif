Array.prototype.removeIf = function(callback) {
    var i = this.length;
    while (i--) {
        if (callback(this[i], i)) {
            this.splice(i, 1);
        }
    }
};

$('.js-example-basic-single').select2();

var width = window.innerWidth,
    height = window.innerHeight,
    populationDomain;

var colorRange = ['#eee','#43a2ca'];
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
var populationColorScale = d3.scaleLinear()
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
  .defer(d3.json, "data/KodeProdiPeminat.json")
  .defer(d3.tsv, "data/logo.tsv")
  .await(ready);
var sbmptnData;
var kodeProdi;
var logoURL = {};

function KodeProdi(kodeProdiResult) {
  this.dataByKodePTN = [];
  kodeProdiResult.forEach(function(d) {
    if (this[d["Kode Universitas"]] == null) {
      this[d["Kode Universitas"]] = {
        name: d["Nama Universitas"],
        website: d["Website Universitas"],
        prodi: [],
        searchKeyword: []
      }
      var matches = d["Nama Universitas"].match(/\b(\w)/g);              // ['J','S','O','N']
      var acronym = matches.join('');                  // JSON
      this[d["Kode Universitas"]].searchKeyword.push(acronym);
    }
    this[d["Kode Universitas"]].prodi.push({
      kode: d["Kode Prodi"],
      name: d["Nama Prodi"],
      jumlahPeminat: d["Data Peminat"]
    })
  }, this.dataByKodePTN);
  this.dataByKodePTN.removeIf(function(d) {
    return d == null;
  })
  this.dataByKodeProdi = [];
  kodeProdiResult.forEach(function(d) {
    this[d["Kode Prodi"]] = {
      univ: {
        name: d["Nama Universitas"],
        kode: d["Kode Universitas"],
        website: d["Website Universitas"]
      },
      name: d["Nama Prodi"],
      jumlahPeminat: d["Data Peminat"]
    }
  }, this.dataByKodeProdi);
}

// Callback function
function ready(error, idnSpatialData, sbmptnDataResult, kodeProdiResult, logoURLResult) {
  if (error) {
    console.log(error);
    throw error;
  }

  logoURLResult.forEach(function(d) {
    logoURL[d.NamaUniv] = d.ImgURL;
  })

  kodeProdi = new KodeProdi(kodeProdiResult);

  // Population data
  var populationData = {};
  console.log("ASDASD")
  sbmptnData = sbmptnDataResult;
  sbmptnData.removeIf(function(d) {
    return kodeProdi.dataByKodeProdi[d.Prodi] == null;
  })
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
  registerSearchBar();
  registerSelectProdiDropdown();
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
  
  filterSly("")
}

function selectUniv(eventName, itemIndex) {
  $('#allUniv').addClass('is-outlined')
  console.log($(slyelement.obj.items[itemIndex].el).find("p").text());
  var selectedUniv = $(slyelement.obj.items[itemIndex].el).find("p").text();
  var kodeUniv;
  kodeProdi.dataByKodePTN.forEach(function(d, kode) {
    if (d.name == selectedUniv) {
      kodeUniv = kode;
    }
  });

  recolorMapWithCondition(function(k) { return kodeProdi.dataByKodeProdi[k].univ.name == selectedUniv; })

  $('#prodSelect').empty();
  $('<option />', {val: "all", text: "Semua Prodi"}).appendTo($('#prodSelect'));
  for (var i = kodeProdi.dataByKodePTN[kodeUniv].prodi.length - 1; i >= 0; i--) {
    var val = kodeProdi.dataByKodePTN[kodeUniv].prodi[i];
    $('<option />', {value: val.kode, text: val.name}).appendTo($('#prodSelect'));
  }
}

function registerSemuaUnivButton() {
  $('#allUniv').on('click', function(e) {
    $('#allUniv').removeClass('is-outlined')
    console.log($(slyelement.el).find('.active'))
    console.log(slyelement.obj.rel.activeItem)
    $(slyelement.el).find('.active').removeClass('active')
    slyelement.obj.reload()

    $('#prodSelect').empty();
    $('<option />', {val: "all", text: "Semua Prodi"}).appendTo($('#prodSelect'));
    recolorMapWithCondition(function() { return true; })
  })
}


var searchTimeoutHandle;
var onSearch;

function registerSearchBar() {
  $("#searchUniv").on('input', function(e) {
    $("#searchUniv").parent().addClass('is-loading')
    if (onSearch) {
      window.clearTimeout(searchTimeoutHandle);
    }
    onSearch = true;
    searchTimeoutHandle = window.setTimeout(filterSly, 500, $("#searchUniv").val());
  });
}


function filterSly(searchString) {
  console.log(slyelement.obj.items.length);
  slyelement.obj.rel.activeItem = null;
  while (slyelement.obj.items.length != 0) {
    slyelement.obj.remove(0);
  }
  fuzzySearch(searchString)
}

function fuzzySearch(searchString) {
  console.log("SEARCH")

  var fuseOptions = {
    shouldSort: true,
    threshold: 0,
    tokenize: true,
    // location: 0,
    distance: 2,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      "name",
      "searchKeyword"
  ]
  };
  var fuse = new Fuse(kodeProdi.dataByKodePTN, fuseOptions); // "list" is the item array
  var result = fuse.search(searchString);
  var mappedResult = [];
  for (var i = result.length - 1; i >= 0; i--) {
    mappedResult[result[i].name] = true;
  }

  kodeProdi.dataByKodePTN.forEach(function(d) {
    if (mappedResult[d.name] == null && searchString != "") {
      return;
    }
    var el = $('<li>').append(
      $('<figure>', { class: 'image is-128x128 is-vertical-center'}).append(
        $('<img>').attr("style","width: auto; height: 100%;").attr("src","img/logo-univ/" + logoURL[d.name])
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
  // slyelement.obj.reload()
  $("#searchUniv").parent().removeClass('is-loading')
  onSearch = false;
}

function registerSelectProdiDropdown() {
  $('#prodSelect').change(function(){
    var itemIndex = slyelement.obj.rel.activeItem;
    var selectedUniv = $(slyelement.obj.items[itemIndex].el).find("p").text();
    var selectedProdi = $(this).val();
    if (selectedProdi == "all"){
      recolorMapWithCondition(function(k) { return kodeProdi.dataByKodeProdi[k].univ.name == selectedUniv; })
    } else {
      recolorMapWithCondition(function(k) { return k == selectedProdi; })
    }
  });
}

function recolorMapWithCondition(condition) {
  var populationData = {};
  var maxPop = 0;
  var currentUniv = null;
  var currentProdi = null;
  var totalTerima = 0;
  var totalPeminat = 0;
  sbmptnData.forEach(function(d) { 
    if (populationData[d.Provinsi] == null) {
      populationData[d.Provinsi] = 0
    }
    if (kodeProdi.dataByKodeProdi[d.Prodi] == null) {
      return;
    }
    if (!condition(d.Prodi)) {
      return;
    }
    if (currentUniv == null) {
      currentUniv = kodeProdi.dataByKodeProdi[d.Prodi].univ.name;
    } else {
      if (currentUniv != "Semua Universitas" && currentUniv != kodeProdi.dataByKodeProdi[d.Prodi].univ.name) {
        currentUniv = "Semua Universitas"
      }
    }

    if (currentProdi == null) {
      currentProdi = kodeProdi.dataByKodeProdi[d.Prodi].name;
    } else {
      if (currentProdi != "Semua Prodi" && currentProdi != kodeProdi.dataByKodeProdi[d.Prodi].name) {
        currentProdi = "Semua Prodi"
      }
    }
    populationData[d.Provinsi] += parseInt(d.Jumlah);
    maxPop = maxPop < populationData[d.Provinsi] ? populationData[d.Provinsi] : maxPop;
    totalTerima += parseInt(d.Jumlah);
    totalPeminat += parseInt(kodeProdi.dataByKodeProdi[d.Prodi].jumlahPeminat)
  });
  populationColorScale = populationColorScale.domain([0, 1 * maxPop/2, maxPop])
  drawPictos(currentUniv, currentProdi, totalTerima, totalPeminat);

  g.selectAll("path")
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

  g.selectAll("path")
    .select("title")
    .text(function(d) {
      return d.properties.province + " : " + populationData[d.properties.province];
    });

}