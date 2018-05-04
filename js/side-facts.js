$(document).ready(function() { 
  /************************************************************************************************/
  /*                                          FOR top-univ                                        */
  /************************************************************************************************/

  /************************************************************************************************/
  /*                            FOR statistik-kelompok-pilihan-ujian                              */
  /************************************************************************************************/
  var chart
  nv.addGraph(function() {
    chart = nv.models.multiBarChart()
        .margin({top: 20, right: 20, bottom: 100, left: 100})
        .tooltips(true)
        .transitionDuration(350)
        .reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
        .rotateLabels(0)      //Angle to rotate x-axis labels.
        .showControls(true)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
        .groupSpacing(0.1)    //Distance between each group of bars.
        .showYAxis(true)
        .showXAxis(true)
        .width(800)
        .height(500)
      ;

      chart.xAxis
          .tickFormat(d3.format(',f'));

      chart.yAxis
          .tickFormat(d3.format(',.1f'));

      d3.select('#statistik-kelompok-pilihan-ujian-chart svg')
          .datum(kelompokPilihanUjianData())
          .transition().duration(350)
          .call(chart);

      nv.utils.windowResize(chart.update);

      return chart;
  });

  function kelompokPilihanUjianData() {
    return  [
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
})