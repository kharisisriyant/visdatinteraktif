var $main         = $('#main');
var $exp          = $('#expected-content');
var $unexp        = $('#unexpected-content');
var expected      = 1325;
var participated  = 1755;
var $univ = $('.univ')[0];
var $prodi = $('.prodi')[0];

function getPct (acceptedNum, registeredNum) {
  return Math.round((participated / expected) * 100);
}

function drawPictos (univName, prodiName, acceptedNum, registeredNum) {
  var pct     = getPct();
    // Draw the # that participated
  var numParticipated = 1;
  var $picto = $($('#templates .picto')[0]);
  for (var i = 0; i < numParticipated; ++i) {
    $exp.append($picto.clone());
  }
  
  var numPerPicto = acceptedNum;
  console.log("acceptedNum, registeredNum: " + acceptedNum + ", " + registeredNum);
  var numPictoOver = Math.round(registeredNum / acceptedNum);

  $univ.innerHTML = univName;
  if (prodiName == null) {
    $prodi.innerHTML = "";
  } else {
    $prodi.innerHTML = prodiName;
  }

  for (var i = 0; i < numPictoOver; ++i) {
    if (numPictoOver/i == 2){
      $unexp.append("<br>");
    }
    var clone = $picto.clone();
    $unexp.append(clone);
  }
  
  // $('#numRepr').html(' = ' + numPerPicto + ' participants');
  $exp.attr("title", acceptedNum + " orang diterima");
  $unexp.attr("title", registeredNum + " orang mendaftar");
  var rate =  "" + (acceptedNum/registeredNum);
  console.log(rate);
  $('#success-rate').innerHTML = "" + rate;
}

function degToRad (deg) {
  return deg * Math.PI / 180;
}

$(document).ready(function() {
  drawPictos("Institut Teknologi Bandung", "Sekolah Teknik Elektro dan Informatika", 200, 1900);
});
