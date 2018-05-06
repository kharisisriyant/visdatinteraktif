$(document).ready(function() {
  $('.js-example-basic-single').select2();
  $('.not-search-selectbox').select2({
    minimumResultsForSearch: Infinity
  });
  data1 =
        [{
          "key": "",
          "values": [
            { 
              "label" : "Prodi A Univ X" ,
              "value" : 25645
            }, 
            { 
              "label" : "Prodi B Univ Y" ,
              "value" : 20765
            },
            { 
              "label" : "Prodi C Univ Z" ,
              "value" : 15678
            }
          ]
        }]
  updateKelompokPilihanUjianChart($('#statistik-kelompok-pilihan-ujian-select').val());
  initialMainTab('top-prodi');
})
  
function wrapLabelText() {
  d3.selectAll(".nv-x.nv-axis .tick text").each(function(i, e) {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word, line = [], lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y") - 10,
      dy = parseFloat(text.attr("dy")),
      tspan = text.text(null).append("tspan").attr("x", -10).attr("y", y).attr("dy", dy + "em");

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      // TDOD : Make 80 a dynamic value based on the bar width/height
      if (tspan.node().getComputedTextLength() > 130) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", -10).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

/************************************************************************************************/
/*                                          FOR top-prodi                                       */
/************************************************************************************************/
var updateTopProdiChart = function(data){
  var data = data;
  var chart;
  nv.addGraph(function() {
    chart = nv.models.multiBarHorizontalChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .margin({top: 0, right: 14, bottom: 14, left: 150})
        .showValues(true)           //Show bar value next to each bar.
        .barColor(function (d, i) {
              var colors = d3v3.scale.category20().range().slice(3);
              return colors[i % colors.length-1];
          })
        .showControls(false)
        .stacked(true)
        .showLegend(false)
    ;        //Allow user to switch between "Grouped" and "Stacked" mode.
    chart.tooltip.enabled();
    chart.yAxis
        .tickFormat(d3v3.format('d'));

    d3v3.select('#top-prodi-chart svg')
        .datum(data)
        .call(chart);

    nv.utils.windowResize(function() {
      chart.update();
      wrapLabelText();
    });

    wrapLabelText();
    return chart;
  });
}

/************************************************************************************************/
/*                            FOR statistik-kelompok-pilihan-ujian                              */
/************************************************************************************************/
var updateKelompokPilihanUjianChart = function(kelompok){
  var data;
  if(kelompok==1){
    data = [
      {
        "key": "Saintek",
        "color": "#3399ff",
        "values": [
          { 
            "label" : "Reguler/Non Bidikmisi" ,
            "value" : 256452
          } , 
          { 
            "label" : "Bidikmisi" ,
            "value" : 55126
          } 
        ]
      },
      {
        "key": "Soshum",
        "color": "#ffcc00",
        "values": [
          { 
            "label" : "Reguler/Non Bidikmisi" ,
            "value" : 260780
          } , 
          { 
            "label" : "Bidikmisi" ,
            "value" : 66897
          } 
        ]
      },
      {
        "key": "Campuran",
        "color": "#00ff00",
        "values": [
          { 
            "label" : "Reguler/Non Bidikmisi" ,
            "value" : 121817
          } , 
          { 
            "label" : "Bidikmisi" ,
            "value" : 35951
          } 
        ]
      }
    ]
  }
  else if(kelompok==2){
    data = [
      {
        "key": "Saintek",
        "color": "#3399ff",
        "values": [
          { 
            "label" : "Paper-Based Test" ,
            "value" : 303667
          } , 
          { 
            "label" : "Computer-Based Test" ,
            "value" : 7913
          } 
        ]
      },
      {
        "key": "Soshum",
        "color": "#ffcc00",
        "values": [
          { 
            "label" : "Paper-Based Test" ,
            "value" : 318824
          } , 
          { 
            "label" : "Computer-Based Test" ,
            "value" : 8855
          } 
        ]
      },
      {
        "key": "Campuran",
        "color": "#00ff00",
        "values": [
          { 
            "label" : "Paper-Based Test" ,
            "value" : 153672
          } , 
          { 
            "label" : "Computer-Based Test" ,
            "value" : 4092
          } 
        ]
      }
    ]
  }

  var chart;
  nv.addGraph(function() {
      chart = nv.models.multiBarChart()
          .x(function(d) { return d.label })
          .y(function(d) { return d.value })
          .duration(300)
          // .margin({bottom: 100, left: 70})
          .groupSpacing(0.1)
          // .width(100)
          // .height(300)
          .showYAxis(true)
          .showXAxis(true)
          .reduceXTicks(true)
          .staggerLabels(true)
      ;

      chart.yAxis
        .tickFormat(d3v3.format('d'))
        .axisLabel('JUMLAH PENDAFTAR')
      ;

      d3v3.select('#statistik-kelompok-pilihan-ujian-chart svg')
          .datum(data)
          .call(chart);

      nv.utils.windowResize(chart.update);

      return chart;
  });
}

$('#statistik-kelompok-pilihan-ujian-select').on('change', function() {
  updateKelompokPilihanUjianChart(this.value);
})

/************************************************************************************************/
/*                         FOR statistik-nilai-rataan-diterima-tertinggi                        */
/************************************************************************************************/
function openList(evt, listName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(listName).style.display = "block";
    evt.currentTarget.className += " active";
}

function openMainTab(evt, listName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("main-tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("main-tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" is-active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(listName).style.display = "block";
    evt.currentTarget.className += " is-active";
}

function initialMainTab(listName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("main-tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("main-tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" is-active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(listName).style.display = "block";

    // var classname = $($('.box > .tabs .main-tab-link')[0]).attr("class");
    $($('.box > .tabs .main-tab-link')[0]).addClass("is-active");

    if (listName == "top-prodi") {
      reloadStatistikProdi();
    } else if (listName == "statistik-kelompok-pilihan-ujian") {
      updateKelompokPilihanUjianChart($('#statistik-kelompok-pilihan-ujian-select').val());
    }

}
