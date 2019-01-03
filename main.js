var bands = [];
var spData = null;
var localStoragedReatings = [];

//https://gist.github.com/terrywbrady/a03b25fe42959b304b1e
const events = [
    {
        eventId: 0,
        eventName: "Roskilde",
        event_db_url: "https://spreadsheets.google.com/feeds/cells/1g74O7oBzVSO_0rKN178agKng0AvSVf0MUKmK6iadSuE/1/public/values?alt=json-in-script&callback=doData"
    },
    {
        eventId: 1,
        eventName: "Copenhell",
        event_db_url: "https://spreadsheets.google.com/feeds/cells/1g74O7oBzVSO_0rKN178agKng0AvSVf0MUKmK6iadSuE/2/public/values?alt=json-in-script&callback=doData"
    }
];

window.onload = function(){
    getSettingsFromLS();
    makeEventSelector();
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
                bands[key] = {id: val};
            }
            if(cell.col == "2"){
                bands[key].name = val;
            }
            if(cell.col == "3"){
                bands[key].date = val;
            }
            if(cell.col == "4"){
                bands[key].time = val;
            }
            if(cell.col == "5"){
                bands[key].duration = val;
            }
            if(cell.col == "6"){
                bands[key].stage = val;
            }
            if(cell.col == "7"){
                bands[key].iframe = val;
            }
        }
    }
    pushReatingToBands();
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
      // CL document.getElementById("cl").innerHTML = localStoragedReatings[0] +"::"+ localStoragedReatings[1] 
}
function setRating(_this, id, rating){
    _this.classList.add("active");
    for (let sibling of _this.parentNode.children) {
        if (sibling !== _this) sibling.classList.remove('active');
    }
    localStoragedReatings[appSettings[0].eventSelected][id] = rating;
    localStorage.setItem('localStoragedReatings', JSON.stringify(localStoragedReatings));
    var activeband = bands.find(band => band.id == id );
    activeband.rating = rating;
    if(appSettings[1].filterRatings[rating] == 1){
        document.querySelector('.band[data-id="'+id+'"]').querySelector(".em-svg").className = 'em-svg ' + getIconName(rating);
    } else {
        var element = document.querySelector('.band[data-id="'+id+'"]')
        element.parentNode.removeChild(element);
    }


    return false;
}

function makeBandlistHTML(){
    const bandCard_Small = 
    `${bands.map(band => `
        ${appSettings[1].filterRatings[band.rating] == 1 ? `
        <div class="band row mb-3 duration-${band.duration}" data-id="${band.id}">
            <div class="band-card col-12 bg-primary p-3 d-flex align-items-center">
                <div class="mr-3">
                        <i class="em-svg ${getIconName(band.rating)}"></i>      
                </div>
                <div>
                    <h4 class="m-0">${band.name}</h4>
                </div>
            </div>
        </div>
    `: ``}    
    `).join('')}`;
    document.getElementById("bandlist").innerHTML = bandCard_Small;
    clickOpenDetils();
}

function getIconName(rate){
    switch (rate) {
        case 0:
            return "em-white_circle";
            break;
        case 1:
            return "em-face_vomiting";
            break;
        case 2:
            return "em-shrug";
            break;
        case 3:
            return "em-slightly_smiling_face";
            break;
        case 4:
            return "em-heart_eyes";
            break;
        default:
            break;
    }
}

function clickOpenDetils(){
    const allbands = document.querySelectorAll('.band');
    const bandDetail = document.querySelector('.detail');
    
    bandDetail.style.display = 'none';
    
    allbands.forEach((band) => {
      band.addEventListener('click', () => {
        const itemImage = band.querySelector('.band-card');
        bandDetail.setAttribute('data-id', band.getAttribute('data-id'));
        bandDetail.style.display = 'block';
        band.style.opacity = 0;
        
        let firstRect = itemImage.getBoundingClientRect();
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
          duration: 300,
          easing: 'cubic-bezier(0.2, 0, 0.2, 1)'
        });

        openDetail.onfinish = function(){
            makeDetailView();
        };
      });
    });
}

function clickCloseDetils(){
        const bandDetail = document.querySelector('.detail');
        const itemImage = document.querySelector(`[data-id="${bandDetail.getAttribute('data-id')}"]`);
        
        let itemImageRect = itemImage.getBoundingClientRect();
        let detailItemRect = bandDetail.getBoundingClientRect();
      
        bandDetail.style.display = 'none';
        itemImage.style.opacity = 1;
        
        var closeDetail = itemImage.animate([
            {
              zIndex: 2,
              transform: `
                translateX(${detailItemRect.left - itemImageRect.left}px)
                translateY(${detailItemRect.top - itemImageRect.top}px)
                scaleX(${detailItemRect.width / itemImageRect.width})
                scaleY(${detailItemRect.height / itemImageRect.height})
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
            bandDetail.innerHTML = '';
          };
     
}

function makeDetailView(){
    var band = bands.find(band => band.id == document.querySelector('.detail').getAttribute('data-id'));
    document.querySelector('.detail').innerHTML = makeBandCardBig(band);
    document.querySelector('.close-details').addEventListener('click', (e) => {
        e.preventDefault();
        clickCloseDetils();
    });
}

function makeBandCardBig(activeBand){
    return`
    <div class="col-12 d-flex flex-column h-100">
        <div class="d-flex justify-content-between">
            <h1>${activeBand.name}</h1>
            <a class="close-details" href=""><i class="em em-x"></i></a>
        </div>
        <div class="iframeContainer bg-loading">${activeBand.iframe}</div>
        <div class="text-center my-3"><a href="https://open.spotify.com/search/artists/${encodeURI(activeBand.name)}" target='_blank'>Find i spotify</a></div>
        <div class="ratebar mt-auto d-flex justify-content-around py-3">
            <a href="" onclick="return setRating(this, ${activeBand.id},1);" class="${activeBand.rating == 1 ? `active` : ``}""><i class="em-svg ${getIconName(1)}"></i></a>
            <a href="" onclick="return setRating(this, ${activeBand.id},2);" class="${activeBand.rating == 2 ? `active` : ``}""><i class="em-svg ${getIconName(2)}"></i></a>
            <a href="" onclick="return setRating(this, ${activeBand.id},3);" class="${activeBand.rating == 3 ? `active` : ``}""><i class="em-svg ${getIconName(3)}"></i></a>
            <a href="" onclick="return setRating(this, ${activeBand.id},4);" class="${activeBand.rating == 4 ? `active` : ``}""><i class="em-svg ${getIconName(4)}"></i></a>
        </div>
        <div class="d-flex mt-3 px-5">
        ${activeBand.id == parseInt(bands[0].id) ? ``: `<a href="" onclick="return prevBand(${activeBand.id})"><i class="em em-arrow_up"></i> Forige Band</a>`}
        ${activeBand.id == parseInt(bands[bands.length-1].id) ? ``: `<a href="" onclick="return nextBand(${activeBand.id})" class="ml-auto">Næste Band <i class="em em-arrow_down"></i></i></a>`}
        </div>
    </div>
    `
}


// NEXT AND PREV NOT ON BANDS WIDT NOT SHOW RATING  OG NEXT/PREV EFTER RÆKKEFØLGE I BANDS

function nextBand(bandId){
    const bandDetail = document.querySelector('.detail');
    var slideOut = bandDetail.animate([
        {
          zIndex: 2,
          transform: `
            translateY(0)
          `
        },
        {
          zIndex: 2,
          transform: `
            translateY(-100%)
           `
        }
      ], {
        duration: 300,
        easing: 'cubic-bezier(0.2, 0, 0.2, 1)',
      });

      slideOut.onfinish = function(){
        const itemImage = document.querySelector(`[data-id="${bandDetail.getAttribute('data-id')}"]`);
        itemImage.style.opacity = 1;
        bandDetail.innerHTML = '';
        bandDetail.style.display = 'none';
          
        var activeBand_index = bands.findIndex(band => band.id == bandId);
        bandDetail.setAttribute('data-id', bands[activeBand_index + 1].id);
        makeDetailView();
        showNextDetailView();
      };
    return false;
}
function showNextDetailView(){
    const bandDetail = document.querySelector('.detail');
    bandDetail.style.display = 'block';
    var slideIn = bandDetail.animate([
        {
          zIndex: 2,
          transform: `
            translateY(100%)
          `
        },
        {
          zIndex: 2,
          transform: `
            translateY(0)
           `
        }
      ], {
        duration: 300,
        easing: 'cubic-bezier(0.2, 0, 0.2, 1)',
      });

      slideIn.onfinish = function(){

      };
    return false;
}

function prevBand(bandId){
    const bandDetail = document.querySelector('.detail');
    var slideOut = bandDetail.animate([
        {
          zIndex: 2,
          transform: `
            translateY(0)
          `
        },
        {
          zIndex: 2,
          transform: `
            translateY(100%)
           `
        }
      ], {
        duration: 300,
        easing: 'cubic-bezier(0.2, 0, 0.2, 1)',
      });

      slideOut.onfinish = function(){
        const itemImage = document.querySelector(`[data-id="${bandDetail.getAttribute('data-id')}"]`);
        itemImage.style.opacity = 1;
        bandDetail.innerHTML = '';
        bandDetail.style.display = 'none';
        var activeBand_index = bands.findIndex(band => band.id == bandId);
        bandDetail.setAttribute('data-id', bands[activeBand_index - 1 ].id);
        makeDetailView();
        showPrevDetailView();
      };
    return false;
}
function showPrevDetailView(){
    const bandDetail = document.querySelector('.detail');
    bandDetail.style.display = 'block';
    var slideIn = bandDetail.animate([
        {
          zIndex: 2,
          transform: `
            translateY(-100%)
          `
        },
        {
          zIndex: 2,
          transform: `
            translateY(0)
           `
        }
      ], {
        duration: 300,
        easing: 'cubic-bezier(0.2, 0, 0.2, 1)',
      });

      slideIn.onfinish = function(){

      };
    return false;
}
/*
        <div class="d-flex mt-3">
            <i class="em-svg em-memo mr-2"></i>
            <a href="">${bands[id].note != "" ? bands[id].note : "Tilføj en note"}</a>
        </div>
*/

function arraySort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

//localStorage.clear();
