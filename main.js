var bands = [];
var spData = null;
var localStoragedReatings = [];

//https://gist.github.com/terrywbrady/a03b25fe42959b304b1e
const events = [
    {
        eventId: 0,
        eventName: "Roskilde",
        eventColor: "#BADA55",
        event_db_url: "https://spreadsheets.google.com/feeds/cells/1g74O7oBzVSO_0rKN178agKng0AvSVf0MUKmK6iadSuE/1/public/values?alt=json-in-script&callback=doData"
    },
    {
        eventId: 1,
        eventName: "Copenhell",
        event_db_url: "https://spreadsheets.google.com/feeds/cells/1g74O7oBzVSO_0rKN178agKng0AvSVf0MUKmK6iadSuE/2/public/values?alt=json-in-script&callback=doData"
    }
];

//document.documentElement.style.setProperty('--your-variable', '#YOURCOLOR');

window.onload = function(){
    getSettingsFromLS();
    makeEventSelector();
    makeSortmenu();
    getDB(events[appSettings[0].eventSelected].event_db_url);
}

function makeEventSelector() {
    const SelectorHTML = `
    <select onchange="changeEvent(this);" class="custom-select custom-select-lg px-4">
        ${events.map(event => `
        <option value="${event.eventId}" ${event.eventId == appSettings[0].eventSelected ? 'selected' : ''}>${event.eventName}</option>
        `).join('')}
    </select>`;
    document.getElementById('eventSelectorWrapper').innerHTML = SelectorHTML;
}  

function getDB(db_url){
    document.getElementById("bandlist").innerHTML = "henter bands...";
    var script = document.createElement('script');
    script.src = db_url;
    document.head.appendChild(script);
}

function doData(json) {
    spData = json.feed.entry;
    makeBands();
}

function changeEvent(_this){
    let eventId = _this.value;
    appSettings[0].eventSelected = eventId; 
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
    this.document.getElementById('eventSelectedName').innerHTML = events[eventId].eventName;
    getDB(events[eventId].event_db_url);
}


// Lav om sådan at key ikke = id ( så man kan soter array )
function makeBands() {
    document.getElementById("bandlist").innerHTML = "henter data...";
    var data = spData;
    var key = 0;
    bands = [];
    for(var r=0; r<data.length; r++) {
        var cell = data[r]["gs$cell"];
        var val = cell["$t"];
        if (cell.row > 1) {
            if(cell.col == "1"){
                key = val;
                bands[key] = {id: parseInt(val)};
            }
            if(cell.col == "2"){
                bands[key].name = val;
            } 
            if(cell.col == "3"){
                bands[key].HeadlineScore = parseInt(val);
            }
            if(cell.col == "4"){
                bands[key].date = val;
            }
            if(cell.col == "5"){
                bands[key].time = val;
            }
            if(cell.col == "6"){
                bands[key].duration = parseInt(val);
            }
            if(cell.col == "7"){
                bands[key].stage = val.split("_")[0];
            }
            if(cell.col == "8"){
                bands[key].iframe = val;
            }
        }
    }
    pushReatingToBands();
    SortBands();
    makeBandlistHTML();
}

function pushReatingToBands(){
    if( localStorage.getItem("localStoragedReatings") ){
        localStoragedReatings = JSON.parse(localStorage.getItem("localStoragedReatings"));
      } else {
          for (let index = 0; index < events.length; index++) {
            localStoragedReatings.push([]);

          }
        localStorage.setItem('localStoragedReatings', JSON.stringify(localStoragedReatings));
      }
      for (let index = 0; index < bands.length; index++) {
        var band = bands.find(function(element) {
            return element.id == index;
        });
        band.rating = localStoragedReatings[appSettings[0].eventSelected][index] ? localStoragedReatings[appSettings[0].eventSelected][index] : 0;          
      }
}

function setRating(_this, id, rating){
    _this.classList.add("activeRating");
    for (let sibling of _this.parentNode.children) {
        if (sibling !== _this) sibling.classList.remove('activeRating');
    }
    localStoragedReatings[appSettings[0].eventSelected][id] = rating;
    localStorage.setItem('localStoragedReatings', JSON.stringify(localStoragedReatings));
    
    var activeband = bands.find(band => band.id == id );
    activeband.rating = rating;
    
    var band_card = document.querySelector('.band[data-id="'+id+'"]');
    band_card.style.display = 'block';   
    band_card.dataset.filterratingid = rating.toString();
    removeClassByPrefix(band_card.querySelector(".band-card"),"bg-")
    band_card.querySelector(".band-card").className += " " + getColor(rating);
    band_card.classList.remove()
    band_card.querySelector(".em-svg").className = 'em-svg ' + getIconName(rating);
    if(appSettings[1].filterRatings[rating] == 0){
        band_card.style.display = 'none';
    }
    const bandDetail_Child = document.querySelector('.detail.active .col-12');
    removeClassByPrefix(bandDetail_Child,"bg-");
    bandDetail_Child.className += " " + getColor(rating);

    return false;
}
function removeClassByPrefix(el, prefix) {
    var regx = new RegExp('\\b' + prefix + '(.*)?\\b', 'g');
    el.className = el.className.replace(regx, '');
    return el;
}

function makeBandlistHTML(){
    const bandCard_Small = 
    `${bands.map(band => `
        <div class="band row mb-2 " data-id="${band.id}" data-filterRatingId="${(band.rating)}" style="${appSettings[1].filterRatings[band.rating] == 1 ? `` : `display: none`}">
            <div class="band-card col-12 p-3 d-flex align-items-center rounded ${getColor(band.rating)}">
                <div class="mr-3 bg-em p-2 rounded-circle">
                        <i class="em-svg ${getIconName(band.rating)}"></i>      
                </div>
                <div>
                    <h4 class="m-0">${band.name}</h4>
                    <h5 class="m-0" >${getStage(band.stage)} : Tirsdag d. 29 kl 19:00</h5>
                </div>
            </div>
        </div>   
    `).join('')}`;
    document.getElementById("bandlist").innerHTML = bandCard_Small;
    clickOpenDetils();
}

function clickOpenDetils(){
    const allbandElements = document.querySelectorAll('.band');
    const bandDetail = document.querySelector('.detailWrapper');
    bandDetail.style.display = 'none';
    
    allbandElements.forEach((bandElem) => {
        bandElem.addEventListener('click', () => {
        var band = bands.find(x => x.id == bandElem.getAttribute('data-id'));

        //bandDetail.querySelector('.detail').className = "detail row p-3 " + getColor(b.rating);

        const band_card = bandElem.querySelector('.band-card');
        
        bandDetail.setAttribute('data-id', band.id);
        bandDetail.style.display = 'block';
        
        makeDetailView();

        var wh = bandDetail.offsetHeight;
        var dwh = bandDetail.scrollHeight
        bandDetail.scroll({top:(dwh-wh)/2 + 16 });
        
        
        let firstRect = band_card .getBoundingClientRect();
        let lastRect = bandDetail.getBoundingClientRect();
        
        var openDetail = bandDetail.animate([
          {
            transform: `
              translateX(${firstRect.left - lastRect.left}px)
              translateY(${firstRect.top - lastRect.top}px)
              scaleX(${firstRect.width / lastRect.width})
              scaleY(${firstRect.height / lastRect.height})
            `
          }
         ,
          {
            transform: `
              translateX(0)
              translateY(0)
              scaleX(1)
              scaleY(1)
             `
          }
         ], {
          duration: 200,
          easing: 'cubic-bezier(0.2, 0, 0.2, 1)'
        });

        openDetail.onfinish = function(){
             makeDetailViewActiveElm();
         };
      });
    });
}

function makeDetailView(){
    var activeBandKey;
    var band = bands.find(function(band,key){
        activeBandKey = key;
        return band.id == document.querySelector('.detailWrapper').getAttribute('data-id')
    });

    document.querySelector('.detail.active').innerHTML = makeBandDetailsHTML(band);
    
    var next_band = bands.find(function(band,key){
        return key > activeBandKey  && appSettings[1].filterRatings[band.rating] != 0
    });
    
    var reverceBand = Array.from(bands).reverse();
    var prev_band = reverceBand.find(function(band,key){
        return key > bands.length - 1 - activeBandKey  && appSettings[1].filterRatings[band.rating] != 0
    });

    if(next_band){
        document.querySelector('.detail.next').innerHTML = makeBandDetailsHTML(next_band);  
    }
    if(prev_band){
        document.querySelector('.detail.prev').innerHTML = makeBandDetailsHTML(prev_band);
    }


}

function makeDetailViewActiveElm(){

    // MAKE CLOSE IFREAM VOTEBTN - SLET DE ANDRE

}

function clickCloseDetils(){
    const bandDetail = document.querySelector('.detailWrapper');
    const activeDetails = document.querySelector('.detail.active');
    const band_card = document.querySelector(`[data-id="${bandDetail.getAttribute('data-id')}"]`);
    
    let band_cardRect = band_card.getBoundingClientRect();
    let activeDetailsRect = activeDetails.getBoundingClientRect();
  
    bandDetail.style.display = 'none';

    var closeDetail = band_card.animate([
        {
          zIndex: 20,
          transform: `
            translateX(${activeDetailsRect.left - band_cardRect.left}px)
            translateY(${activeDetailsRect.top/2}px)
            scaleX(${activeDetailsRect.width / band_cardRect.width})
            scaleY(${activeDetailsRect.height / band_cardRect.height})
          `
        },
        {
          zIndex: 2,
          transform: `
            translateX(0)
            translateY(0)
            scaleX(1)
            scaleY(1)
           `
        }
      ], {
        duration: 300,
        easing: 'cubic-bezier(0.2, 0, 0.2, 1)'
      });

      closeDetail.onfinish = function(){
        bandDetail.querySelectorAll('.detail').innerHTML = '';
      };
      return false;
}

function makeBandDetailsHTML(activeBand){
    return`
    <div class="col-12 p-3 d-flex flex-column ${getColor(activeBand.rating)}">
        <div class="d-flex justify-content-between">
            <h1>${activeBand.name}</h1>
            <a class="close-details" onclick="return clickCloseDetils();" href=""><i class="em em-x"></i></a>
        </div>
        
        <div class="ratebar mt-auto d-flex justify-content-around py-3">
            <a href="" onclick="return setRating(this, ${activeBand.id},1);" class="${activeBand.rating == 1 ? `active` : ``}""><i class="em-svg ${getIconName(1)}"></i></a>
            <a href="" onclick="return setRating(this, ${activeBand.id},2);" class="${activeBand.rating == 2 ? `active` : ``}""><i class="em-svg ${getIconName(2)}"></i></a>
            <a href="" onclick="return setRating(this, ${activeBand.id},3);" class="${activeBand.rating == 3 ? `active` : ``}""><i class="em-svg ${getIconName(3)}"></i></a>
            <a href="" onclick="return setRating(this, ${activeBand.id},4);" class="${activeBand.rating == 4 ? `active` : ``}""><i class="em-svg ${getIconName(4)}"></i></a>
        </div>
    </div>
    `
}

//<div class="iframeContainer bg-loading">${activeBand.iframe}</div>
//<div class="text-center my-3"><a href="https://open.spotify.com/search/artists/${encodeURI(activeBand.name)}" target='_blank'>Find i spotify</a></div>








// KUN NEXT/PREV PÅ BANDS/RATINGS DER IKKE ER SKJULT

// window.addEventListener('load', function(){

//     var touchsurface = document.getElementById("detail");

//     var ts;
//     touchsurface.addEventListener('touchstart', function(e){
//         ts = e.touches[0].clientY;
//     }, false)

//     touchsurface.addEventListener('touchend', function(e){
//         bandId = this.dataset.id
//         var te = e.changedTouches[0].clientY;
//         if(ts > te+5){
//             //console.log('UP');
//             nextBand(parseInt(bandId));
//         }else if(ts < te-5){
//             //console.log('NED');
//             prevBand(parseInt(bandId));
//         }
//     }, false)

// }, false) // end window.onload

// function nextBand(bandId){
//     const bandDetail = document.querySelector('.detail');
//     var b = bands.find(x => x.id == bandId+1);
//     bandDetail.className = "detail row p-3 " + getColor(b.rating);
//     var slideOut = bandDetail.animate([
//         {
//           zIndex: 2,
//           transform: `
//             translateY(0)
//           `
//         },
//         {
//           zIndex: 2,
//           transform: `
//             translateY(-100%)
//            `
//         }
//       ], {
//         duration: 300,
//         easing: 'cubic-bezier(0.2, 0, 0.2, 1)',
//       });

//       slideOut.onfinish = function(){
//         const itemImage = document.querySelector(`[data-id="${bandDetail.getAttribute('data-id')}"]`);
//         itemImage.style.opacity = 1;
//         bandDetail.innerHTML = '';
//         bandDetail.style.display = 'none';
          
//         var activeBand_index = bands.findIndex(band => band.id == bandId);
//         bandDetail.setAttribute('data-id', bands[activeBand_index + 1].id);
//         makeDetailView();
//         showNextDetailView();
//       };
//     return false;
// }
// function showNextDetailView(){
//     const bandDetail = document.querySelector('.detail');
//     bandDetail.style.display = 'block';
//     var slideIn = bandDetail.animate([
//         {
//           zIndex: 2,
//           transform: `
//             translateY(100%)
//           `
//         },
//         {
//           zIndex: 2,
//           transform: `
//             translateY(0)
//            `
//         }
//       ], {
//         duration: 300,
//         easing: 'cubic-bezier(0.2, 0, 0.2, 1)',
//       });

//       slideIn.onfinish = function(){

//       };
//     return false;
// }

// function prevBand(bandId){
//     const bandDetail = document.querySelector('.detail');
//     var b = bands.find(x => x.id == bandId-1);
//     bandDetail.className = "detail row p-3 " + getColor(b.rating);
//     var slideOut = bandDetail.animate([
//         {
//           zIndex: 2,
//           transform: `
//             translateY(0)
//           `
//         },
//         {
//           zIndex: 2,
//           transform: `
//             translateY(100%)
//            `
//         }
//       ], {
//         duration: 300,
//         easing: 'cubic-bezier(0.2, 0, 0.2, 1)',
//       });

//       slideOut.onfinish = function(){
//         const itemImage = document.querySelector(`[data-id="${bandDetail.getAttribute('data-id')}"]`);
//         itemImage.style.opacity = 1;
//         bandDetail.innerHTML = '';
//         bandDetail.style.display = 'none';
//         var activeBand_index = bands.findIndex(band => band.id == bandId);
//         bandDetail.setAttribute('data-id', bands[activeBand_index - 1 ].id);
//         makeDetailView();
//         showPrevDetailView();
//       };
//     return false;
// }
// function showPrevDetailView(){
//     const bandDetail = document.querySelector('.detail');
//     bandDetail.style.display = 'block';
//     var slideIn = bandDetail.animate([
//         {
//           zIndex: 2,
//           transform: `
//             translateY(-100%)
//           `
//         },
//         {
//           zIndex: 2,
//           transform: `
//             translateY(0)
//            `
//         }
//       ], {
//         duration: 300,
//         easing: 'cubic-bezier(0.2, 0, 0.2, 1)',
//       });

//       slideIn.onfinish = function(){

//       };
//     return false;
// }



//localStorage.clear();

