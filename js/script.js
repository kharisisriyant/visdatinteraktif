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

var mapContainerWidth = $('#idnMap').width();
var mapContainerHeight = mapContainerWidth *0.4;
if (mapContainerWidth < 600) {
  mapContainerHeight += 50;
  mapContainerWidth += 30;
}
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
            .attr("width", mapContainerWidth)
            .attr("height", mapContainerHeight)
            .attr("class", "map");
var g = svg.append("g");
var d3legend;
var legend = svg.append("g")
  .attr("class", "legendQuant")
  .attr("transform", "translate(20,"+(mapContainerHeight * 0.9)+")");
// Color
var populationColorScale = d3.scaleLinear()
                        .domain(populationDomain)
                        .range(colorRange);


// Projection and path
var projection = d3.geoMercator()
                    .center([115 + mapContainerWidth*0.005, -5])
                    .scale(mapContainerWidth)
                    .translate([mapContainerWidth * 0.55, mapContainerHeight * 0.5]);

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
var peminatProdi;
var logoURL = {};
var lazyload;

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
      if (d["Website Universitas"] != "") {
        var urlToken = d["Website Universitas"].replace(/(^\w+:|^)\/\//, '').replace(/\//, '').split(".");
        for (var i = 0; i < urlToken.length; i++) {
          if (urlToken[i] != "http" &&
            urlToken[i] != "www" &&
            urlToken[i] != "pmb" &&
            urlToken[i] != "ac" &&
            urlToken[i] != "id" &&
            urlToken[i] != "edu" &&
            urlToken[i] != "spmb") {
            var pushedToken = urlToken[i].split("-");
            for (var j = pushedToken.length - 1; j >= 0; j--) {
              this[d["Kode Universitas"]].searchKeyword.push(pushedToken[j]);
            }
            this[d["Kode Universitas"]].searchKeyword.push(urlToken[i].replace(/-/, ' '));
          }
          
        }
      }
      
      
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
  peminatProdi = kodeProdiResult;
  kodeProdi = new KodeProdi(kodeProdiResult);

  // Population data
  var populationData = {};
  sbmptnData = sbmptnDataResult;
  sbmptnData.removeIf(function(d) {
    return kodeProdi.dataByKodeProdi[d.Prodi] == null;
  })
  var maxPop = 0;
  var totalTerima = 0;
  var totalPeminat = 0;
  var prodiSet = [];
  sbmptnData.forEach(function(d) { 
    if (populationData[d.Provinsi] == null) {
      populationData[d.Provinsi] = 0
    }
    populationData[d.Provinsi] += parseInt(d.Jumlah);
    totalTerima += parseInt(d.Jumlah);
    maxPop = maxPop < populationData[d.Provinsi] ? populationData[d.Provinsi] : maxPop;
    if (prodiSet[d.Prodi] == null && kodeProdi.dataByKodeProdi[d.Prodi].jumlahPeminat != null) {
      prodiSet[d.Prodi] = true;
      totalPeminat += parseInt(kodeProdi.dataByKodeProdi[d.Prodi].jumlahPeminat)
    }
  });
  populationColorScale = populationColorScale.domain([0, 1 * maxPop/2, maxPop])
  createLegend();

  var animationCounter = 0;

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
    .on('end', function() {
      animationCounter++;
      if (animationCounter != 34) {
        return;
      }
      lazyload.update();
    })

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
      return d.properties.province + " : " + populationData[d.properties.province] + " mahasiswa";
    });

  initSly();
  registerSemuaUnivButton();
  registerSearchBar();
  registerSelectProdiDropdown();
  registerStatistikFilter();

  reloadStatistikProdi();
  drawPictos("Semua Universitas", "Semua Prodi", totalTerima, totalPeminat);
}

d3.select(window).on("resize", resize);

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  mapContainerWidth = $('#idnMap').width();
  mapContainerHeight = mapContainerWidth *0.4;
  if (mapContainerWidth < 600) {
    mapContainerHeight += 50;
    mapContainerWidth += 30;
  }

  projection.center([115 + mapContainerWidth*0.005, -5])
  .scale(mapContainerWidth)
    .translate([mapContainerWidth * 0.55, mapContainerHeight * 0.5]);

  d3.select("svg")
    .attr("width", mapContainerWidth)
    .attr("height", mapContainerHeight);
  legend.attr("transform", "translate(20,"+(mapContainerHeight * 0.9)+")");

  d3.selectAll("path")
    .attr("d", path);
  slyelement.obj.reload();
  lazyload.update();
}

function createLegend() {
   //Append a defs (for definition) element to your SVG

  var labelGenerator = function({
    i,
    genLength,
    generatedLabels,
    labelDelimiter
  }) {
    if (i === 0) {
      return generatedLabels[i]
    } else if (i === genLength - 1) {
      return generatedLabels[i]
    }
    return ""
  }
      
  d3legend = d3.legendColor()
    .labelFormat(d3.format(".0f"))
    .shape("rect")
    .shapeHeight(5)
    .shapeWidth(5)
    .shapePadding(0)
    .cells(30)
    .orient('horizontal')
    .labels(labelGenerator)
    // .cellFilter(function(d){ return d.label !== "0" })
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
  
  lazyload = new LazyLoad({
    elements_selector: ".lazyload",
    class_loading: "spinner"
  });
  slyelement.obj.on('moveEnd', function() {
    lazyload.update()
  })

  filterSly("")
}

function selectUniv(eventName, itemIndex) {
  $('#allUniv').addClass('is-outlined')
  var selectedUniv = $(slyelement.obj.items[itemIndex].el).find("p").text();
  $('#statsUniv').text(selectedUniv)
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
    $('#statsUniv').text("Semua Universitas")
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
    searchTimeoutHandle = window.setTimeout(function(searchString) {
      filterSly(searchString)
      lazyload.update()
    }, 500, $("#searchUniv").val());
  });
}


function filterSly(searchString) {
  slyelement.obj.rel.activeItem = null;
  while (slyelement.obj.items.length != 0) {
    slyelement.obj.remove(0);
  }
  fuzzySearch(searchString)
}

function fuzzySearch(searchString) {
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
        $('<img>', {class: 'lazyload', style: "width: auto; height: 100%; display: block; margin: 0 auto;", "data-src": "img/logo-univ/" + logoURL[d.name]})
      ),
      $('<p>', {class: 'content has-text-centered is-size-6', html: d.name})
    )
    el.on('click', function(e) {
      if (el.hasClass('active') || slyelement.obj.rel.activeItem == null) {
        return;
      }
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
  var prodiSet = [];
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
      currentUniv = kodeProdi.dataByKodeProdi[d.Prodi].univ;
    } else {
      if (currentUniv != "Semua Universitas" && currentUniv.name != kodeProdi.dataByKodeProdi[d.Prodi].univ.name) {
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
    if (prodiSet[d.Prodi] == null && kodeProdi.dataByKodeProdi[d.Prodi].jumlahPeminat != null) {
      totalPeminat += parseInt(kodeProdi.dataByKodeProdi[d.Prodi].jumlahPeminat)
      prodiSet[d.Prodi] = true;
    }
  });
  populationColorScale = populationColorScale.domain([0, 1 * maxPop/2, maxPop])
  if (currentUniv == "Semua Universitas") {
    drawPictos(currentUniv, currentProdi, totalTerima, totalPeminat);
  } else {
    drawPictos(currentUniv.name, currentProdi, totalTerima, totalPeminat, currentUniv.website);
  }
  reloadStatistikProdi();
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
      return d.properties.province + " : " + populationData[d.properties.province] + " mahasiswa";
    });

}

function buildStatistikProdiData(num, fromTop, sbmptnDataCondition, univName, method) {
  var prodiSet = [];
  var prodiData = [];
  sbmptnData.forEach(function(d, i) {
    if (kodeProdi.dataByKodeProdi[d.Prodi] == null) {
      return;
    }
    if (univName != "Semua Universitas" && univName != kodeProdi.dataByKodeProdi[d.Prodi].univ.name) {
      return;
    }
    var repeatedProdi = true;
    if (prodiSet[d.Prodi] == null) {
      prodiSet[d.Prodi] = true;
      repeatedProdi = false
    }
    if (prodiData[d.Prodi] == null) {
      prodiData[d.Prodi] = 0
    }
    prodiData[d.Prodi] = sbmptnDataCondition(i, repeatedProdi, prodiData[d.Prodi])
  })
  var sortedProdiArray = [];
  var isRatio = false;
  prodiData.forEach(function(val, key) {
    if (val.ratio != null) {
      isRatio = true;
      sortedProdiArray.push({val: (val.lolos/val.peminat), key: key})
      return;
    }
    sortedProdiArray.push({val: val, key: key})
  })
  var sortFunction;
  if (fromTop) {
    sortFunction = function(a, b) {
      return b.val - a.val;
    }
    if (isRatio) {
      sortFunction = function(a, b) {
        return a.val - b.val;
      } 
    }
  } else {
    sortFunction = function(a, b) {
      return a.val - b.val;
    }
    if (isRatio) {
      sortFunction = function(a, b) {
        return b.val - a.val;
      } 
    }
  }
  sortedProdiArray.sort(sortFunction);
  resultData = [{"key": method, "values": []}]
  num = num < sortedProdiArray.length ? num : sortedProdiArray.length;
  for (var i = 0; i < num; i++) {
    var sortedKey = sortedProdiArray[i].key
    if (univName == "Semua Universitas") {
      resultData[0].values.push({label: kodeProdi.dataByKodeProdi[sortedKey].name + " (" + kodeProdi.dataByKodeProdi[sortedKey].univ.name + ")", value: sortedProdiArray[i].val})
    } else {
      resultData[0].values.push({label: kodeProdi.dataByKodeProdi[sortedKey].name, value: sortedProdiArray[i].val})
    }
  }
  return resultData;
}

function reloadStatistikProdi() {
  var num = $('#top-prodi-amount').val();
  var fromTop = $('#top-prodi-select').val() == 1;
  var base = $('#top-prodi-base').val();
  var sbmptnDataCondition;
  var method = ""
  var isCancel;
  switch(base) {
    case "1":
        sbmptnDataCondition = function (i, repeatedProdi, prevData) {
          return prevData + parseInt(sbmptnData[i].Jumlah);
        }
        method = "Jumlah Peserta yang Diterima"
        break;
    case "2":
        sbmptnDataCondition = function (i, repeatedProdi, prevData) {
          if (repeatedProdi) {
            return prevData;
          }
          return parseInt(kodeProdi.dataByKodeProdi[sbmptnData[i].Prodi].jumlahPeminat);
        }
        method = "Jumlah Peminat"
        break;
    case "3":
        sbmptnDataCondition = function (i, repeatedProdi, prevData) {
          if (repeatedProdi) {
            prevData.lolos += parseInt(sbmptnData[i].Jumlah);
            return prevData;
          }
          return {
            peminat: parseInt(kodeProdi.dataByKodeProdi[sbmptnData[i].Prodi].jumlahPeminat), 
            lolos: parseInt(sbmptnData[i].Jumlah),
            ratio: true
          }
        }
        method = "Persentase Jumlah Peserta yang Diterima / Jumlah Peminat"
        break;
    default:
      isCancel = true;
      console.log("error: no base condition found");
  }
  var selectedUniv;
  if (!$('#allUniv').hasClass('is-outlined')) {
    selectedUniv = "Semua Universitas"
  } else {
    var activeItemIndex = slyelement.obj.rel.activeItem;
    selectedUniv = $(slyelement.obj.items[activeItemIndex].el).find("p").text()
  }
  if (isCancel) {
    return;
  }
  var inputData = buildStatistikProdiData(num, fromTop, sbmptnDataCondition, selectedUniv, method);
  updateTopProdiChart(inputData)
}

function registerStatistikFilter() {
  $('#top-prodi-amount').change(reloadStatistikProdi);
  $('#top-prodi-select').change(reloadStatistikProdi);
  $('#top-prodi-base').change(reloadStatistikProdi);

}