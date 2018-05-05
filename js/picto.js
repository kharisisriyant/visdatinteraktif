var $main         = $('#main');
var $exp          = $('#expected-content');
var $unexp        = $('#unexpected-content');
var expected      = 1325;
var participated  = 1755;
var $univ = $('.univ')[0];
var $prodi = $('.prodi')[0];
var $successRate = $('.success-rate')[0];
var $picto = $($('#templates .picto')[0]);

function getPct (acceptedNum, registeredNum) {
  return Math.round((participated / expected) * 100);
}

// function getMod(num) {
  
//   if (num <= 5) {
//     return 5;
//   } else if (num < 10) {
//     if (num % 2 == 0) {
//       return num/2;
//     } else {
//       return num/2 + 0.5;
//     }
//   } else {
//     return Math.round(num/3);
//   }
// }

function displayPictogram(num) {
  var cloneArr = [];
  // var mod = getMod(num);
  // console.log("mod: " + mod);
  for (var i = 0; i < num; ++i) {
    // if (i % mod == 0 && i != 0){
    //   $unexp.append("<br>");
    // }
    var clone = $picto.clone();
    $unexp.append(clone);

    clone.delay(100 * (i/10)).fadeIn();
  }
}

function drawPictos (univName, prodiName, acceptedNum, registeredNum) {
  $exp.empty();
  $unexp.empty();

  var pct     = getPct();
    // Draw the # that participated
  var numParticipated = 1;
  for (var i = 0; i < numParticipated; ++i) {
    clone = $picto.clone()
    $exp.append(clone);
    clone.fadeIn();
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

  displayPictogram(numPictoOver);

  var penjelasan = "<b>" + acceptedNum + "</b> <span>dari <b>" + registeredNum + "</b><br>lolos";
  console.log(penjelasan);
  $successRate.innerHTML = penjelasan;
  
  // $('#numRepr').html(' = ' + numPerPicto + ' participants');
  $exp.attr("title", acceptedNum + " orang diterima");
  $unexp.attr("title", registeredNum + " orang mendaftar");
  var rate =  "" + (acceptedNum/registeredNum);
  console.log(rate);
}

function degToRad (deg) {
  return deg * Math.PI / 180;
}

$(document).ready(function() {
  drawPictos("Institut Teknologi Bandung", "Sekolah Teknik Elektro dan Informatika", 200, 4000);
  setTimeout(function(){
    drawPictos("Universitas Indonesia", "Computer Science", 100, 3500);
  }, 10000);
  
});
