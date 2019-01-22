var bands = [];
var spData = null;
var localStoragedReatings = [];
var eventUpdateLog = [];
var bandDetailSlider;

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
    checkDbNeedUpdate(events[appSettings[0].eventSelected].eventId, events[appSettings[0].eventSelected].event_db_url);
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

function updateDbNow(){
    getDB(events[appSettings[0].eventSelected].event_db_url);
    var now = new Date();
    // now.setDate(now.getDate() - 1);
    // now.setHours(now.getHours() - 1);
    var y = now.getFullYear();
    var m = now.getMonth() +1;
    var d = now.getDate();
    var h = now.getHours();
    var nowArray = [d,m,y,h];
    eventUpdateLog.find(b=>b.eventId == events[appSettings[0].eventSelected].eventId).lastUpdate = nowArray;
    localStorage.setItem('eventUpdateLog', JSON.stringify(eventUpdateLog));
}

function checkDbNeedUpdate(db_id, db_url){
    var now = new Date();
    // now.setDate(now.getDate() - 1);
    // now.setHours(now.getHours() - 1);
    var y = now.getFullYear();
    var m = now.getMonth() +1;
    var d = now.getDate();
    var h = now.getHours();
    var nowArray = [d,m,y,h];

    if( localStorage.getItem("eventUpdateLog") ){
        eventUpdateLog = JSON.parse(localStorage.getItem("eventUpdateLog"));
    } 
    else {
        for (let index = 0; index < events.length; index++) {
        eventUpdateLog.push({eventId: events[index].eventId, lastUpdate: nowArray});
        }
        localStorage.setItem('eventUpdateLog', JSON.stringify(eventUpdateLog));
    }
    var eventLastUpdate = eventUpdateLog.find(b=>b.eventId == db_id).lastUpdate;
    var moreThan24h = nowArray[0] > eventLastUpdate[0] && nowArray[1] >= eventLastUpdate[1] && nowArray[2] >= eventLastUpdate[2] && nowArray[3] > eventLastUpdate[3];
    
    if(moreThan24h){
        console.log("time for update bands[]");
        getDB(db_url);
        eventUpdateLog.find(b=>b.eventId == db_id).lastUpdate = nowArray;
        localStorage.setItem('eventUpdateLog', JSON.stringify(eventUpdateLog));
    }
    else{
        if( localStorage.getItem("bandsFromStorrage") ){
            bands = JSON.parse(localStorage.getItem("bandsFromStorrage"))[db_id];  
            SortBands();
            pushReatingToBands();
            makeBandlistHTML();
        }
        else{
            getDB(db_url);
        }
    }
}

function getDB(db_url){
    console.log("getting bands[] from db");
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
    
    checkDbNeedUpdate(eventId, events[eventId].event_db_url);
}

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

    var bandsFromStorrage = JSON.parse(localStorage.getItem("bandsFromStorrage")) || [];

    bandsFromStorrage[events[appSettings[0].eventSelected].eventId] = bands;
    localStorage.setItem('bandsFromStorrage', JSON.stringify(bandsFromStorrage));
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
    
    let lastUpdateArray = eventUpdateLog[events[appSettings[0].eventSelected].eventId].lastUpdate;
    const bandLastUpdateHTML = `<h6><small>Band liste sidst opdateret: ${lastUpdateArray[0]}/${lastUpdateArray[1]}/${lastUpdateArray[2]} kl ${lastUpdateArray[3]}:00</small><a onclick="return updateDbNow();" class="ml-2"><i class="fas fa-sync-alt"></i></a></h6>`;
    
    document.getElementById("bandUpdate").innerHTML = bandLastUpdateHTML;
    clickOpenDetils();
}


function clickOpenDetils(){
    const allbandElements = document.querySelectorAll('.band');
    const bandDetail = document.querySelector('.detailWrapper');
    const swiperContainer  = document.querySelector('.swiper-container');
    bandDetail.style.display = 'none';
    
    allbandElements.forEach((bandElem) => {
        bandElem.addEventListener('click', () => {
        var band = bands.find(x => x.id == bandElem.getAttribute('data-id'));
        bandDetail.setAttribute('data-id', band.id);
        bandDetail.style.display = 'flex';
        
        makeDetailView(); 
        var firstload = false;
        bandDetailSlider = new Swiper('.swiper-container', {
            initialSlide: 1,
            width: window.innerWidth,
            on: {
                init: function () {
                    swiperContainer.animate([
                        {
                          transform: `
                            translateY(100vh)
                          `
                        }
                       ,
                        {
                          transform: `
                            translateY(0)
                           `
                        }
                       ], {
                        duration: 400,
                        easing: 'cubic-bezier(0.2, 0, 0.2, 1)'
                      });
                },
                slideChange: function () {
                    if(firstload){
                        updateSlids();
                    }
                    firstload = true
                },
            }
        });
      });
    });
}

function updateSlids(){
    const bandDetail = document.querySelector('.detailWrapper');
    var slidesInTotal = bandDetailSlider.slides.length;
    var currentSlide = bandDetailSlider.activeIndex;
    var currentBandId = bandDetailSlider.slides[currentSlide].querySelector(".col-12").getAttribute('data-bandId')
    var newElement = '';

    if(currentSlide == slidesInTotal-1){
        var activeBandKey;
        bands.find(function(band,key){
            activeBandKey = key;
            return band.id == currentBandId;
        });
        var nextBand = bands.find(function(band,key){
            return key > activeBandKey  && appSettings[1].filterRatings[band.rating] != 0
        });
        
        if(!nextBand){
            nextBand= {
                "id": -1,
                "name": "SIDSTE BAND",
                "HeadlineScore": -1,
                "date": "-",
                "time": "-",
                "duration": -1,
                "stage": "-",
                "iframe": "-",
                "rating": -1
            }
        }
        newElement = makeBandDetailsHTML(nextBand)
        bandDetailSlider.appendSlide(newElement);
        console.log("next Made ID=", nextBand.id)
    }
    if (currentSlide == 0) {
        var activeBandKey;
        bands.find(function(band,key){
            activeBandKey = key;
            return band.id == currentBandId
        });
        var reverceBand = Array.from(bands).reverse();
        var prevBand = reverceBand.find(function(band,key){
            return key > bands.length - 1 - activeBandKey  && appSettings[1].filterRatings[band.rating] != 0
        });

        //CHECK ON UNDEFIED
        if(!prevBand){
            prevBand= {
                "id": -2,
                "name": "Førsteband BAND",
                "HeadlineScore": -1,
                "date": "-",
                "time": "-",
                "duration": -1,
                "stage": "-",
                "iframe": "-",
                "rating": -1
              }
        }
        newElement = makeBandDetailsHTML(prevBand);
        bandDetailSlider.prependSlide(newElement);
        console.log("prev Made",prevBand.name)
    }
    if(currentBandId < 0){
        bandDetail.style.display = 'none';
        bandDetail.innerHTML = '';
    }

    bandDetail.setAttribute('data-id', currentBandId);

}

function makeDetailView(){
    const bandDetail = document.querySelector('.detailWrapper');
    var activeBandKey;
    var band = bands.find(function(band,key){
        activeBandKey = key;
        return band.id == document.querySelector('.detailWrapper').getAttribute('data-id')
    });

    var next_band = bands.find(function(band,key){
        return key > activeBandKey  && appSettings[1].filterRatings[band.rating] != 0
    });
    
    var reverceBand = Array.from(bands).reverse();
    var prev_band = reverceBand.find(function(band,key){
        return key > bands.length - 1 - activeBandKey  && appSettings[1].filterRatings[band.rating] != 0
    });

    if(!next_band){
        next_band = {
            "id": -1,
            "name": "SIDSTE BAND",
            "HeadlineScore": -1,
            "date": "-",
            "time": "-",
            "duration": -1,
            "stage": "-",
            "iframe": "-",
            "rating": -1
          }
    }
    if(!prev_band){
        prev_band = {
            "id": -2,
            "name": "Førsteband BAND",
            "HeadlineScore": -1,
            "date": "-",
            "time": "-",
            "duration": -1,
            "stage": "-",
            "iframe": "-",
            "rating": -1
          }
    }

    bandDetail.innerHTML = makeBandDetailsHTML(prev_band) + makeBandDetailsHTML(band) + makeBandDetailsHTML(next_band);
}

function clickCloseDetils(){
    const bandDetail = document.querySelector('.detailWrapper');
    const swiperContainer = document.querySelector('.swiper-container');
     band_card = document.querySelector(`[data-id="${bandDetail.getAttribute('data-id')}"]`);
    
    var closeDetail = swiperContainer.animate([
        {
          zIndex: 20,
          transform: `
            translateY(0)
          `
        },
        {
          zIndex: 2,
          transform: `
            translateY(100vh)
           `
        }
      ], {
        duration: 400,
        easing: 'cubic-bezier(0.2, 0, 0.2, 1)'
      });

      closeDetail.onfinish = function(){
        bandDetail.style.display = 'none';
        bandDetail.innerHTML = '';
      };
      return false;
}

function makeBandDetailsHTML(activeBand){
    return`
    <div class="swiper-slide detail row p-0 m-0" data-id="">
        <div class="col-12 p-3 d-flex flex-column ${getColor(activeBand.rating)} ${activeBand.id < 0 ? `hidden` : ``}" data-bandid="${activeBand.id}">
            <div class="d-flex justify-content-between mb-3">
                <h1>${activeBand.name}</h1>
                <a class="close-details p-2" onclick="return clickCloseDetils();" href=""><i class="fas fa-times"></i></a>
            </div>
            <div class="details_body d-flex flex-column h-100">
                <div class="iframeContainer bg-loading">${activeBand.iframe}</div>
                <div class="text-center my-3"><a href="https://open.spotify.com/search/artists/${encodeURI(activeBand.name)}" target='_blank'>Find i spotify</a></div>
                <div class="ratebar mt-auto d-flex justify-content-around py-3">
                    <a href="" onclick="return setRating(this, ${activeBand.id},1);" class="${activeBand.rating == 1 ? `activeRating` : ``}""><i class="em-svg ${getIconName(1)}"></i></a>
                    <a href="" onclick="return setRating(this, ${activeBand.id},2);" class="${activeBand.rating == 2 ? `activeRating` : ``}""><i class="em-svg ${getIconName(2)}"></i></a>
                    <a href="" onclick="return setRating(this, ${activeBand.id},3);" class="${activeBand.rating == 3 ? `activeRating` : ``}""><i class="em-svg ${getIconName(3)}"></i></a>
                    <a href="" onclick="return setRating(this, ${activeBand.id},4);" class="${activeBand.rating == 4 ? `activeRating` : ``}""><i class="em-svg ${getIconName(4)}"></i></a>
                </div> 
            </div>
        </div>
    </div>
    `
}